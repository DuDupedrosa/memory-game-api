import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'email@example.com', description: 'Email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'visitante123', description: 'Nome de usuário' })
  @IsString()
  @IsNotEmpty()
  nickName: string;

  @ApiProperty({ example: '123456', description: 'Senha' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'min_length_6' })
  password: string;
}
