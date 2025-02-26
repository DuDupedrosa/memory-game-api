import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty } from 'class-validator';
import { LevelEnum } from 'src/helpers/enum/levelEnum';

export class UpdateRoomLevelDto {
  @ApiProperty({ example: '1', description: 'Sala ID' })
  @IsInt()
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    example: LevelEnum.EASY,
    description: 'Nível da sala (1 - EASY, 2 - MEDIUM, 3 - HARD)',
    enum: LevelEnum,
  })
  @IsInt()
  @IsNotEmpty()
  @IsIn([LevelEnum.EASY, LevelEnum.MEDIUM, LevelEnum.HARD], {
    message: 'incorrect_level_enum',
  })
  level: number;
}
