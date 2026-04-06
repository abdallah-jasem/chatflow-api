import { IsEnum, IsUUID } from 'class-validator';
import { RoomMemberRole } from '../enum/room-member-role.enum';

export class UpdateRoomMemberRoleDto {
  @IsUUID()
  userId!: string;

  @IsEnum(RoomMemberRole)
  role!: RoomMemberRole;
}
