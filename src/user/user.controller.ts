import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUserDto';
import { Response } from 'express';
import { SignInUserDto } from './dto/signInUserDto';
import { RequestWithUser } from 'src/types/request';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { UpdateUserDto } from './dto/updateUserDto';
import { ChangeUserPasswordDto } from './dto/changeUserPasswordDto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorResponseDto } from 'src/common/dto/erroResponseDto';
import { UserWithTokenResponseDto } from './dto/userWithTokenResponseDto';
import { UserDataResponseDto } from 'src/common/dto/userDataResponseDto';

@Controller('user')
@ApiTags('User') // Agrupa os endpoints no Swagger
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Criação de um novo usuário' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuário criado com sucesso',
    type: UserWithTokenResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Erro de validação: Email existente, nome de usuário existente',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno do servidor',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Não autorizado. Token inválido ou ausente.',
    type: ErrorResponseDto,
  })
  async createNew(
    @Body() createUserDto: CreateUserDto,
    @Res() response: Response,
  ) {
    return await this.userService.createNewAsync(response, createUserDto);
  }

  @Post('sign-in')
  @ApiOperation({ summary: 'Iniciar sessão' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Senha inválida',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login com sucesso',
    type: UserWithTokenResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno do servidor',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Não autorizado. Token inválido ou ausente.',
    type: ErrorResponseDto,
  })
  async signIn(
    @Body() singInUserDto: SignInUserDto,
    @Res() response: Response,
  ) {
    return await this.userService.signInUserAsync(response, singInUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Consultar informações de um usuário' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dados do usuário',
    type: UserDataResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno do servidor',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Não autorizado. Token inválido ou ausente.',
    type: ErrorResponseDto,
  })
  async getData(
    @Res() response: Response,
    @Req() requestWithUser: RequestWithUser,
  ) {
    return this.userService.getDataAsync(response, requestWithUser.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  @ApiOperation({ summary: 'Editar usuário' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Erro de validação: Email existente, nome de usuário existente',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuário editado',
    type: UserDataResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno do servidor',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Não autorizado. Token inválido ou ausente.',
    type: ErrorResponseDto,
  })
  async updateUserProfile(
    @Body() updateUserDto: UpdateUserDto,
    @Res() response: Response,
    @Req() requestWithUser: RequestWithUser,
  ) {
    return await this.userService.updateUserProfileAsync(
      response,
      updateUserDto,
      requestWithUser.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  @ApiOperation({ summary: 'Alterar senha' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Erros de validação: Senha atual inválida, nova senha igual a senha atual',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Senha alterada com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno do servidor',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Não autorizado. Token inválido ou ausente.',
    type: ErrorResponseDto,
  })
  async changePassword(
    @Body() changeUserPasswordDto: ChangeUserPasswordDto,
    @Res() response: Response,
    @Req() requestWithUser: RequestWithUser,
  ) {
    return await this.userService.changePasswordAsync(
      response,
      changeUserPasswordDto,
      requestWithUser.user.userId,
    );
  }
}
