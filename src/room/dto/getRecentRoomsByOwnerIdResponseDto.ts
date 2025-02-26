import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class GetRecenterRoomsByOwnerIdResponseDto {
  @ApiProperty({ example: 1, description: 'ID da sala' })
  @Expose()
  id: number;

  @ApiProperty({ example: 2, description: 'Nível da sala' })
  @Expose()
  level: number;
}
