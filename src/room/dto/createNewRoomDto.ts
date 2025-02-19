import { IsIn, IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { LevelEnum } from 'src/helpers/enum/levelEnum';

export class CreateNewRoomDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'min_length_3' })
  password: string;

  @IsInt()
  @IsNotEmpty()
  @IsIn([LevelEnum.EASY, LevelEnum.MEDIUM, LevelEnum.HARD], {
    message: 'incorrect_level_enum',
  })
  level: number;
}
