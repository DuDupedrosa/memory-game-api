import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  @IsString()
  nickName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
