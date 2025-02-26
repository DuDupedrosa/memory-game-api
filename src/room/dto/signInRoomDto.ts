import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class SignInRoomDto {
  @ApiProperty({ example: '1', description: 'Sala ID' })
  @IsInt()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ example: 'securepassword', description: 'Senha da sala' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
