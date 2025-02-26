import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'visitante123', description: 'Nome de usuário' })
  @IsNotEmpty()
  @IsString()
  nickName: string;

  @ApiProperty({ example: 'email@example.com', description: 'Email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
