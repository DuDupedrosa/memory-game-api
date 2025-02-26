import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class RoomDataDto {
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

  @ApiProperty({ example: 'user123', description: 'ID do dono da sala' })
  @Expose()
  ownerId: string;

  @ApiProperty({
    example: 'user456',
    description: 'ID do convidado da sala (opcional)',
    nullable: true,
  })
  @Expose()
  guestId?: string;

  @ApiProperty({
    example: ['user123', 'user456'],
    description: 'Lista de jogadores na sala',
  })
  @Expose()
  players: string[];

  @ApiProperty({
    example: '1',
    description: 'Nível da sala (1 - EASY, 2 - MEDIUM, 3 - HARD)',
  })
  @Expose()
  level: number;

  @ApiProperty({
    example: '1',
    description: 'Número da sala para embaralhar o board',
  })
  @Expose()
  matchRandomNumber: number;

  @ApiProperty({
    example: 'playerId',
    description: 'Id do jogador que está autorizado a jogar',
  })
  @Expose()
  playerReleasedToPlay: string;

  @ApiProperty({
    example: 'true',
    description: 'Jogador confirmou que está pronto para jogar',
  })
  @Expose()
  playerTwoIsReadyToPlay: boolean;
}
