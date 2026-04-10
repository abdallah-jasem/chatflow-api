import { IsString, IsUUID, Length } from 'class-validator';

export class SendSocketMessageDto {
  @IsUUID()
  roomId: string;

  @IsString()
  @Length(1, 5000)
  content: string;
}
