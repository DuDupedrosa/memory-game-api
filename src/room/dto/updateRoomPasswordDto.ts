import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateRoomPasswordDto {
  @ApiProperty({ example: '1', description: 'Sala ID' })
  @IsNotEmpty()
  @IsInt()
  id: number;

  @ApiProperty({ example: 'securepassword', description: 'Nova senha' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3, { message: 'min_length_3' })
  newPassword: string;
}
