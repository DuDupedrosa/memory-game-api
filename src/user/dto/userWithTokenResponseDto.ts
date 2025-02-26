import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { UserDataResponseDto } from 'src/common/dto/userDataResponseDto';

export class UserWithTokenResponseDto {
  @ApiProperty({
    example: 'jwttoken',
    description: 'Token de autenticação do usuário',
  })
  @Expose()
  token: string;

  @ApiProperty({
    type: UserDataResponseDto,
    description: 'Usuário',
  })
  @Expose()
  user: UserDataResponseDto;
}
