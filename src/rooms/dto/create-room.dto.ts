import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { RoomType } from '../enum/room-type.enum';

export class CreateRoomDto {
  @IsString()
  @Length(3, 50)
  name!: string;

  @IsEnum(RoomType)
  @IsOptional()
  type!: RoomType;

  @IsOptional()
  @IsString()
  description!: string;
}
