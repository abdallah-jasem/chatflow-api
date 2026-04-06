import { ForbiddenException } from '@nestjs/common';
import { RoomMemberRole } from '../enum/room-member-role.enum';

export class RoomPermissionsHelper {
  static isOwner(role: RoomMemberRole): boolean {
    return role === RoomMemberRole.OWNER;
  }

  static isAdmin(role: RoomMemberRole): boolean {
    return role === RoomMemberRole.ADMIN;
  }

  static isMember(role: RoomMemberRole): boolean {
    return role === RoomMemberRole.MEMBER;
  }

  static isAdminOrOwner(role: RoomMemberRole): boolean {
    return role === RoomMemberRole.OWNER || role === RoomMemberRole.ADMIN;
  }

  static canManageRoom(role: RoomMemberRole): boolean {
    return this.isAdminOrOwner(role);
  }

  static canAddMembers(role: RoomMemberRole): boolean {
    return this.isAdminOrOwner(role);
  }

  static canRemoveMember(
    requesterRole: RoomMemberRole,
    targetRole: RoomMemberRole,
  ) {
    if (this.isOwner(requesterRole)) {
      return targetRole !== RoomMemberRole.OWNER;
    }

    if (this.isAdmin(requesterRole)) {
      return targetRole === RoomMemberRole.MEMBER;
    }

    return false;
  }

  static canUpdateMemberRole(role: RoomMemberRole): boolean {
    return this.isOwner(role);
  }

  static canDeleteRoom(role: RoomMemberRole): boolean {
    return this.isOwner(role);
  }

  static ensureCanManageRoom(role: RoomMemberRole): void {
    if (!this.canManageRoom(role)) {
      throw new ForbiddenException(
        'You do not have permission to manage this room',
      );
    }
  }

  static ensureCanAddMembers(role: RoomMemberRole): void {
    if (!this.canAddMembers(role)) {
      throw new ForbiddenException(
        'You do not have permission to add members to this room',
      );
    }
  }

  static ensureCanRemoveMember(
    requesterRole: RoomMemberRole,
    targetRole: RoomMemberRole,
  ) {
    if (!this.canRemoveMember(requesterRole, targetRole)) {
      throw new ForbiddenException(
        'You do not have permission to remove this member',
      );
    }
  }

  static ensureCanUpdateMemberRole(role: RoomMemberRole): void {
    if (!this.canUpdateMemberRole(role)) {
      throw new ForbiddenException(
        'You do not have permission to update member roles in this room',
      );
    }
  }

  static ensureCanDeleteRoom(role: RoomMemberRole): void {
    if (!this.canDeleteRoom(role)) {
      throw new ForbiddenException(
        'You do not have permission to delete this room',
      );
    }
  }
}
