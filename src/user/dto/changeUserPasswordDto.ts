import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangeUserPasswordDto {
  @ApiProperty({ example: '123456', description: 'Senha atual' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'min_length_6' })
  currentPassword: string;

  @ApiProperty({ example: '123456789', description: 'Nova senha' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'min_length_6' })
  newPassword: string;
}
