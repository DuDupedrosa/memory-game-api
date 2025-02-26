import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class GetAllRoomsResponseDto {
  @ApiProperty({ example: 1, description: 'ID da sala' })
  @Expose()
  id: number;

  @ApiProperty({
    example: '2025-02-24T12:00:00Z',
    description: 'Data de criação da sala',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2025-02-24T12:00:00Z',
    description: 'Ultimo acesso a sala',
  })
  @Expose()
  lastAccess: Date;

  @ApiProperty({
    example: '1',
    description: 'Nível da sala (1 - EASY, 2 - MEDIUM, 3 - HARD)',
  })
  @Expose()
  level: number;

  @ApiProperty({
    example: 'securepassword',
    description: 'Senha da sala',
  })
  @Expose()
  password: string;
}
