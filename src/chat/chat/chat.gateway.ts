import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Logger, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { AuthenticatedSocket } from '../interfaces/authenticated-socket.interface';
import { RoomsService } from '../../rooms/rooms.service';
import { MessagesService } from '../../messages/messages.service';
import { JoinRoomDto } from '../dto/join-room.dto';
import { LeaveRoomDto } from '../dto/leave-room.dto';
import { SendSocketMessageDto } from '../dto/send-socket-message.dto';
import { TypingDto } from '../dto/typing.dto';
import { JwtPayload } from '../../auth/interface/jwt-payload.interface';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly validationPipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });

  constructor(
    private readonly jwtService: JwtService,
    private readonly roomsService: RoomsService,
    private readonly messagesService: MessagesService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = this.extractToken(client);
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      client.data.user = payload;
    } catch (error) {
      this.logger.warn(
        `Socket connection rejected for id=${client.id}: ${error instanceof Error ? error.message : 'invalid token'}`,
      );
      client.disconnect(true);
      throw new WsException('Invalid or expired token');
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomDto,
  ) {
    const authenticatedClient = client as AuthenticatedSocket;
    const { roomId } = await this.validatePayload(JoinRoomDto, payload);

    await this.roomsService.ensureUserIsMember(
      roomId,
      authenticatedClient.data.user.sub,
    );
    await authenticatedClient.join(roomId);

    return {
      event: 'room_joined',
      data: {
        roomId,
      },
    };
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: LeaveRoomDto,
  ) {
    const authenticatedClient = client as AuthenticatedSocket;
    const { roomId } = await this.validatePayload(LeaveRoomDto, payload);

    await authenticatedClient.leave(roomId);

    return {
      event: 'room_left',
      data: {
        roomId,
      },
    };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendSocketMessageDto,
  ) {
    const authenticatedClient = client as AuthenticatedSocket;
    const dto = await this.validatePayload(SendSocketMessageDto, payload);

    await this.roomsService.ensureUserIsMember(
      dto.roomId,
      authenticatedClient.data.user.sub,
    );
    const message = await this.messagesService.createFromSocket(
      authenticatedClient.data.user.sub,
      dto,
    );

    this.server.to(dto.roomId).emit('receive_message', message);

    return {
      event: 'message_sent',
      data: message,
    };
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: TypingDto,
  ) {
    const authenticatedClient = client as AuthenticatedSocket;
    const { roomId } = await this.validatePayload(TypingDto, payload);

    await this.roomsService.ensureUserIsMember(
      roomId,
      authenticatedClient.data.user.sub,
    );

    authenticatedClient.to(roomId).emit('typing', {
      roomId,
      userId: authenticatedClient.data.user.sub,
      username: authenticatedClient.data.user.username,
    });

    return {
      event: 'typing_ack',
      data: {
        roomId,
      },
    };
  }

  @SubscribeMessage('stop_typing')
  async handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: TypingDto,
  ) {
    const authenticatedClient = client as AuthenticatedSocket;
    const { roomId } = await this.validatePayload(TypingDto, payload);

    await this.roomsService.ensureUserIsMember(
      roomId,
      authenticatedClient.data.user.sub,
    );

    authenticatedClient.to(roomId).emit('stop_typing', {
      roomId,
      userId: authenticatedClient.data.user.sub,
      username: authenticatedClient.data.user.username,
    });

    return {
      event: 'stop_typing_ack',
      data: {
        roomId,
      },
    };
  }

  private extractToken(client: AuthenticatedSocket) {
    const authHeader = client.handshake.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new WsException('Authorization token is required');
    }

    return authHeader.replace('Bearer ', '');
  }

  private async validatePayload<T extends object>(
    metatype: new () => T,
    payload: unknown,
  ) {
    try {
      return await this.validationPipe.transform(payload, {
        type: 'body',
        metatype,
      });
    } catch {
      throw new WsException('Invalid socket payload');
    }
  }
}
