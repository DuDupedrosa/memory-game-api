import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class SignInRoomDto {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  password: string;
}
