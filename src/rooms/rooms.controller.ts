import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { AddRoomMemberDto } from './dto/add-room-member.dto';
import { UpdateRoomMemberRoleDto } from './dto/update-room-member-role.dto';
import { User } from 'src/auth/decorator/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@User() user: any, @Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(user.id, createRoomDto);
  }

  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

  @Get('me')
  findMyRooms(@User() user: any) {
    return this.roomsService.findMyRooms(user.id);
  }

  @Get(':roomId')
  findOne(@Param('roomId') roomId: string) {
    return this.roomsService.findOne(roomId);
  }

  @Patch(':roomId')
  update(
    @Param('roomId') roomId: string,
    @User() user: any,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomsService.update(roomId, user.id, updateRoomDto);
  }

  @Delete(':roomId')
  remove(@Param('roomId') roomId: string, @User() user: any) {
    return this.roomsService.remove(roomId, user.id);
  }

  @Post(':roomId/members')
  addMember(
    @Param('roomId') roomId: string,
    @User() user: any,
    @Body() addRoomMemberDto: AddRoomMemberDto,
  ) {
    return this.roomsService.addMember(roomId, user.id, addRoomMemberDto);
  }

  @Delete(':roomId/members/:targetUserId')
  removeMember(
    @Param('roomId') roomId: string,
    @Param('targetUserId') targetUserId: string,
    @User() user: any,
  ) {
    return this.roomsService.removeMember(roomId, user.id, targetUserId);
  }

  @Patch(':roomId/members/role')
  updateMemberRole(
    @Param('roomId') roomId: string,
    @User() user: any,
    @Body() updateRoomMemberRoleDto: UpdateRoomMemberRoleDto,
  ) {
    return this.roomsService.updateMemberRole(
      roomId,
      user.id,
      updateRoomMemberRoleDto,
    );
  }

  @Post(':roomId/join')
  joinRoom(@Param('roomId') roomId: string, @User() user: any) {
    return this.roomsService.joinRoom(roomId, user.id);
  }

  @Post(':roomId/leave')
  leaveRoom(@Param('roomId') roomId: string, @User() user: any) {
    return this.roomsService.leaveRoom(roomId, user.id);
  }
}
