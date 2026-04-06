import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Room } from './room.entity';
import { RoomMemberRole } from '../enum/room-member-role.enum';

@Entity('room_members')
export class RoomMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column()
  roomId!: string;

  @Column({
    type: 'enum',
    enum: RoomMemberRole,
    default: RoomMemberRole.MEMBER,
  })
  role!: RoomMemberRole;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Room, (room) => room.members)
  @JoinColumn({ name: 'roomId' })
  room!: Room;

  @CreateDateColumn()
  joinedAt!: Date;
}
