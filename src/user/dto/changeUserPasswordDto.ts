import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangeUserPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'min_length_6' })
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'min_length_6' })
  newPassword: string;
}
