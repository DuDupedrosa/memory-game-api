import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserDataResponseDto {
  @ApiProperty({
    example: 'player123',
    description: 'Nome de usuário (nickname)',
  })
  @Expose()
  nickName: string;

  @ApiProperty({ example: 'a1b2c3d4', description: 'ID único do usuário' })
  @Expose()
  id: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Endereço de e-mail do usuário',
  })
  @Expose()
  email: string;

  @ApiProperty({
    example: '2025-02-24T12:00:00Z',
    description: 'Data de criação da conta',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2025-02-24T12:30:00Z',
    description: 'Última atualização do perfil',
  })
  @Expose()
  updatedAt: Date;

  @ApiProperty({
    example: '2025-02-23T18:45:00Z',
    description: 'Último login do usuário',
    nullable: true,
  })
  @Expose()
  lastLogin?: Date;
}
