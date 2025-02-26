import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { Response } from 'express';
import { CreateNewRoomDto } from './dto/createNewRoomDto';
import { RequestWithUser } from 'src/types/request';
import { SignInRoomDto } from './dto/signInRoomDto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { ChangedPlayerAllowedToPlayDto } from './dto/changedPlayerAllowedToPlayDto';
import { UpdateRoomPasswordDto } from './dto/updateRoomPasswordDto';
import { UpdateRoomLevelDto } from './dto/updateRoomLevelDto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreatedRoomResponseDto } from './dto/createRoomResponseDto';
import { ErrorResponseDto } from 'src/common/dto/erroResponseDto';
import { SignInRoomResponseDto } from './dto/singnInRoomResponseDto';
import { RoomDataDto } from './dto/roomDataDto';
import { GetRoomUsersResponseDto } from './dto/getRoomUsersResponseDto';
import { GetAllRoomsResponseDto } from './dto/getAllRoomsResponseDto';

@Controller('room')
@ApiTags('Room') // Agrupa os endpoints no Swagger
export class RoomController {
  constructor(private roomService: RoomService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Criação de uma nova sala' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Sala criada com sucesso',
    type: CreatedRoomResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Limite de salas atingido ou erro na requisição',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado',
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
    @Res() response: Response,
    @Body() createNewRoomDto: CreateNewRoomDto,
    @Req() requestWithUser: RequestWithUser,
  ) {
    return await this.roomService.createNewAsync(
      response,
      createNewRoomDto,
      requestWithUser.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('sign-in')
  @ApiOperation({ summary: 'Entrar em uma sala existente' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Autenticação feita com sucesso',
    type: SignInRoomResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Possíveis erros: Sala não encontrada, Usuário não encontrado',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Erros de validação: Limite de jogadores atingido, Erro validação de senha',
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
  async signIn(
    @Res() response: Response,
    @Body() signInRoomDto: SignInRoomDto,
    @Req() requestWithUser: RequestWithUser,
  ) {
    return await this.roomService.signInAsync(
      response,
      signInRoomDto,
      requestWithUser.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('data/:id')
  @ApiOperation({ summary: 'Obter os detalhes de uma sala pelo ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Consulta feita com sucesso',
    type: RoomDataDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sala não encontrada',
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
  async getById(@Res() response: Response, @Param('id') id: number) {
    return await this.roomService.getByIdAsync(response, Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/users')
  @ApiOperation({
    summary: 'Obter todos os usuários atrelados a uma sala (ID)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Consulta feita com sucesso',
    type: GetRoomUsersResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sala não encontrada',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'A sala não possui jogadores',
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
  async getRoomUsers(@Res() response: Response, @Param('id') id: number) {
    return await this.roomService.getRoomUsersAsync(response, Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/player-allowed-to-play')
  @ApiOperation({
    summary: 'Consultar jogador com autorização para fazer a próxima jogada',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Possíveis erros: Sala não encontrada, Usuário não encontrado',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ID do jogador (autorizado)',
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
  async getPlayerReleasedToPlay(
    @Res() response: Response,
    @Param('id') id: number,
    @Req() requestWithUser: RequestWithUser,
  ) {
    return await this.roomService.getPlayerReleasedToPlayAsync(
      response,
      id,
      requestWithUser.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('changed-player-allowed-to-play')
  @ApiOperation({
    summary: 'Trocar jogador autorizado para jogar',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ID do jogador (autorizado)',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sala não encontrada (ID)',
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
  async changePlayerAllowedToPlay(
    @Res() response: Response,
    @Body() dto: ChangedPlayerAllowedToPlayDto,
    @Req() requestWithUser: RequestWithUser,
  ) {
    return await this.roomService.changePlayerAllowedToPlayAsync(
      response,
      dto.roomId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('owner-access-recent')
  @ApiOperation({
    summary: 'Salas criadas pelo usuário e acessadas mais recentemente.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Salas criadas pelo usuário (mais recentes acessos)',
    type: [GetRoomUsersResponseDto],
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
  async getRecentRoomsByOwnerId(
    @Res() response: Response,
    @Req() requestWithUser: RequestWithUser,
  ) {
    return await this.roomService.getRecentRoomsByOwnerIdAsync(
      response,
      requestWithUser.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-all')
  @ApiOperation({
    summary: 'Busca todas as salas criada por um usuário',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Salas criadas pelo usuário',
    type: [GetAllRoomsResponseDto],
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
  async getAllRoomsByOwnerIdAsync(
    @Res() response: Response,
    @Req() requestWithUser: RequestWithUser,
  ) {
    return await this.roomService.getAllRoomsByOwnerIdAsync(
      response,
      requestWithUser.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Deletar uma sala pelo ID',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sala não encontrada (ID)',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sala deleta com sucesso',
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
  async deleteById(@Res() response: Response, @Param('id') id: number) {
    return await this.roomService.deleteByIdAsync(response, Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  @ApiOperation({
    summary: 'Alterar senha da sala',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sala não encontrada (ID)',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'O usuário (que está realizando a ação) não é o dono dala',
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
  async updatePassword(
    @Res() response: Response,
    @Body() dto: UpdateRoomPasswordDto,
    @Req() requestWithUser: RequestWithUser,
  ) {
    return await this.roomService.updatePasswordAsync(
      response,
      dto,
      requestWithUser.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-level')
  @ApiOperation({
    summary: 'Trocar o nível da sala',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sala não encontrada',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'O usuário (que está realizando a ação) não é o dono dala',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Nível da sala alterado com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno do servidor',
    type: ErrorResponseDto,
  })
  async updateLevel(
    @Res() response: Response,
    @Body() dto: UpdateRoomLevelDto,
    @Req() requestWithUser: RequestWithUser,
  ) {
    return await this.roomService.updateLevelAsync(
      response,
      dto,
      requestWithUser.user.userId,
    );
  }
}
