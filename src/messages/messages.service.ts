import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { SendSocketMessageDto } from '../chat/dto/send-socket-message.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class MessagesService {
  create(createMessageDto: CreateMessageDto) {
    return 'This action adds a new message';
  }

  findAll() {
    return `This action returns all messages`;
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }

  async createFromSocket(
    userId: string,
    sendSocketMessageDto: SendSocketMessageDto,
  ) {
    return {
      id: randomUUID(),
      roomId: sendSocketMessageDto.roomId,
      senderId: userId,
      content: sendSocketMessageDto.content,
      createdAt: new Date().toISOString(),
    };
  }
}
