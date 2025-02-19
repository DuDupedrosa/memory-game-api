import { IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateRoomPasswordDto {
  @IsNotEmpty()
  @IsInt()
  id: number;

  @IsNotEmpty()
  @IsString()
  @MinLength(3, { message: 'min_length_3' })
  newPassword: string;
}
