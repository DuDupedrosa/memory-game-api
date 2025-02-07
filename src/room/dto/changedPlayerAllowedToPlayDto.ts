import { IsInt, IsNotEmpty } from 'class-validator';

export class ChangedPlayerAllowedToPlayDto {
  @IsNotEmpty()
  @IsInt()
  roomId: number;
}
