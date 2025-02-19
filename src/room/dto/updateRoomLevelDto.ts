import { IsIn, IsInt, IsNotEmpty } from 'class-validator';
import { LevelEnum } from 'src/helpers/enum/levelEnum';

export class UpdateRoomLevelDto {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsInt()
  @IsNotEmpty()
  @IsIn([LevelEnum.EASY, LevelEnum.MEDIUM, LevelEnum.HARD], {
    message: 'incorrect_level_enum',
  })
  level: number;
}
