import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Room } from './entities/room.entity';
import { RoomMember } from './entities/room-member.entity';
import { User } from '../users/entities/user.entity';

import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { AddRoomMemberDto } from './dto/add-room-member.dto';
import { RoomMemberRole } from './enum/room-member-role.enum';
import { UpdateRoomMemberRoleDto } from './dto/update-room-member-role.dto';
import { RoomPermissionsHelper } from './helper/room-permissions.helper';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,

    @InjectRepository(RoomMember)
    private readonly roomMemberRepository: Repository<RoomMember>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(ownerId: string, createRoomDto: CreateRoomDto) {
    const owner = await this.findUser(ownerId);

    const room = this.roomRepository.create({
      ...createRoomDto,
      owner,
    });

    const savedRoom = await this.roomRepository.save(room);

    const ownerMembership = this.roomMemberRepository.create({
      room: savedRoom,
      user: owner,
      role: RoomMemberRole.OWNER,
    });

    await this.roomMemberRepository.save(ownerMembership);

    return this.findOne(savedRoom.id);
  }

  async findAll() {
    return this.roomRepository.find({
      relations: {
        owner: true,
        members: {
          user: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(roomId: string) {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: {
        owner: true,
        members: {
          user: true,
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async update(roomId: string, userId: string, updateRoomDto: UpdateRoomDto) {
    const room = await this.findRoom(roomId);

    //
    const requesterMembership = await this.findRoomMember(roomId, userId);

    RoomPermissionsHelper.ensureCanManageRoom(requesterMembership.role);

    // Object.assign(room, updateRoomDto);

    if (updateRoomDto.name !== undefined) {
      room.name = updateRoomDto.name;
    }

    if (updateRoomDto.description !== undefined) {
      room.description = updateRoomDto.description;
    }

    await this.roomRepository.save(room);

    return this.findOne(room.id);
  }

  async remove(roomId: string, userId: string) {
    await this.findRoom(roomId);
    const requesterMembership = await this.findRoomMember(roomId, userId);

    RoomPermissionsHelper.ensureCanDeleteRoom(requesterMembership.role);

    await this.roomRepository.delete(roomId);

    return {
      message: 'Room deleted successfully',
    };
  }

  async addMember(
    roomId: string,
    requesterId: string,
    addRoomMemberDto: AddRoomMemberDto,
  ) {
    await this.findRoom(roomId);

    const requesterMembership = await this.findRoomMember(roomId, requesterId);

    RoomPermissionsHelper.ensureCanAddMembers(requesterMembership.role);

    const targetUser = await this.findUser(addRoomMemberDto.userId);

    const existingMembership = await this.roomMemberRepository.findOne({
      where: {
        room: { id: roomId },
        user: { id: targetUser.id },
      },
      relations: {
        room: true,
        user: true,
      },
    });

    if (existingMembership) {
      throw new ConflictException('User is already a member of this room');
    }

    if (
      addRoomMemberDto.role === RoomMemberRole.OWNER &&
      requesterMembership.role !== RoomMemberRole.OWNER
    ) {
      throw new ForbiddenException('Only owner can assign owner role');
    }

    const membership = this.roomMemberRepository.create({
      room: { id: roomId } as Room,
      user: targetUser,
      role: addRoomMemberDto.role,
    });

    await this.roomMemberRepository.save(membership);

    return {
      message: 'Member added successfully',
    };
  }

  async removeMember(
    roomId: string,
    requesterId: string,
    targetUserId: string,
  ) {
    await this.findRoom(roomId);

    const requesterMembership = await this.findRoomMember(roomId, requesterId);

    const targetMembership = await this.findRoomMember(roomId, targetUserId);

    if (requesterId === targetUserId) {
      throw new ForbiddenException(
        'Use leave room instead of removing yourself',
      );
    }

    RoomPermissionsHelper.ensureCanRemoveMember(
      requesterMembership.role,
      targetMembership.role,
    );

    await this.roomMemberRepository.delete(targetMembership.id);

    return {
      message: 'Member removed successfully',
    };
  }

  async updateMemberRole(
    roomId: string,
    requesterId: string,
    updateRoomMemberRoleDto: UpdateRoomMemberRoleDto,
  ) {
    await this.findRoom(roomId);

    const requesterMembership = await this.findRoomMember(roomId, requesterId);

    const targetMembership = await this.findRoomMember(
      roomId,
      updateRoomMemberRoleDto.userId,
    );

    RoomPermissionsHelper.ensureCanUpdateMemberRole(requesterMembership.role);

    if (targetMembership.role === RoomMemberRole.OWNER) {
      throw new ForbiddenException('Owner role cannot be changed');
    }

    if (updateRoomMemberRoleDto.role === RoomMemberRole.OWNER) {
      throw new ForbiddenException(
        'Assigning owner role is not allowed from this endpoint',
      );
    }

    targetMembership.role = updateRoomMemberRoleDto.role;
    await this.roomMemberRepository.save(targetMembership);

    return {
      message: 'Member role updated successfully',
    };
  }

  async joinRoom(roomId: string, userId: string) {
    await this.findRoom(roomId);
    const user = await this.findUser(userId);

    const existingMembership = await this.roomMemberRepository.findOne({
      where: {
        room: { id: roomId },
        user: { id: userId },
      },
    });

    if (existingMembership) {
      throw new ConflictException('You are already a member of this room');
    }

    const membership = this.roomMemberRepository.create({
      room: { id: roomId } as Room,
      user,
      role: RoomMemberRole.MEMBER,
    });

    await this.roomMemberRepository.save(membership);

    return {
      message: 'Joined room successfully',
    };
  }

  async leaveRoom(roomId: string, userId: string) {
    const membership = await this.findRoomMember(roomId, userId);

    if (membership.role === RoomMemberRole.OWNER) {
      throw new ForbiddenException(
        'Owner cannot leave the room before transferring ownership or deleting the room',
      );
    }

    await this.roomMemberRepository.delete(membership.id);

    return {
      message: 'Left room successfully',
    };
  }

  async findMyRooms(userId: string) {
    const memberships = await this.roomMemberRepository.find({
      where: {
        user: { id: userId },
      },
      relations: {
        room: {
          owner: true,
          members: {
            user: true,
          },
        },
      },
      order: {
        joinedAt: 'DESC',
      },
    });

    return memberships.map((membership) => membership.room);
  }

  async ensureUserIsMember(roomId: string, userId: string) {
    await this.findRoom(roomId);
    return this.findRoomMember(roomId, userId);
  }

  private async findRoom(roomId: string) {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  private async findUser(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private async findRoomMember(roomId: string, userId: string) {
    const membership = await this.roomMemberRepository.findOne({
      where: {
        room: { id: roomId },
        user: { id: userId },
      },
      relations: {
        room: true,
        user: true,
      },
    });

    if (!membership) {
      throw new NotFoundException('Room membership not found');
    }

    return membership;
  }
}
