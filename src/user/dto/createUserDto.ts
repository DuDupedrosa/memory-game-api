import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  nickName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'min_length_6' })
  password: string;
}
