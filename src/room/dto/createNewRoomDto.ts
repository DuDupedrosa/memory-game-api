import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNewRoomDto {
  @IsString()
  @IsNotEmpty()
  password: string;
}
