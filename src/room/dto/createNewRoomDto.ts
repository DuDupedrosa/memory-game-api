import { IsIn, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateNewRoomDto {
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsInt()
  @IsNotEmpty()
  @IsIn([1, 2, 3], {
    message: 'level_must_be 1_(EASY)_2_(MEDIUM)_or_3_(HARD)',
  })
  level: number;
}
