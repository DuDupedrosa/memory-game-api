import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class ChangedPlayerAllowedToPlayDto {
  @ApiProperty({ example: '1', description: 'Sala ID' })
  @IsNotEmpty()
  @IsInt()
  roomId: number;
}
