import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { LevelEnum } from 'src/helpers/enum/levelEnum';

export class CreateNewRoomDto {
  @ApiProperty({ example: 'securepassword', description: 'Senha da sala' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'min_length_3' })
  password: string;

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
