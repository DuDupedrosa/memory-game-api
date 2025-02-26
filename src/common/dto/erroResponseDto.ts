import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 'erro_key', description: 'Código do erro' })
  message: string;
}
