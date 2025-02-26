import { ApiProperty } from '@nestjs/swagger';
import { UserDataResponseDto } from 'src/common/dto/userDataResponseDto';

export class GetRoomUsersResponseDto {
  @ApiProperty({
    example: '1',
    description: 'ID da sala',
  })
  roomId: number;

  @ApiProperty({
    type: [UserDataResponseDto],
    description: 'Lista de usuários na sala',
  })
  users: UserDataResponseDto[];
}
