import { ApiProperty } from '@nestjs/swagger';

export class SignInRoomResponseDto {
  @ApiProperty({ example: 1, description: 'ID da sala' })
  id: number;

  @ApiProperty({
    example: '2025-02-24T12:00:00Z',
    description: 'Data de criação',
  })
  createdAt: Date;
}
