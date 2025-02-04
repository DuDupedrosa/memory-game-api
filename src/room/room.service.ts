import { HttpStatus, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/prisma.service';
import { CreateNewRoomDto } from './dto/createNewRoomDto';
import * as bcrypt from 'bcrypt';
import { SignInRoomDto } from './dto/signInRoomDto';
import { RoomDataType } from 'src/types/room';
import { UserService } from 'src/user/user.service';
import { UserDataType } from 'src/types/user';
import { GameGateway } from 'src/game/game.gateway';

@Injectable()
export class RoomService {
  private readonly saltRounds = 10;
  constructor(
    private prismaService: PrismaService,
    private userService: UserService,
    private gameGateway: GameGateway,
  ) {}

  async createNewAsync(
    res: Response,
    createNewRoomDto: CreateNewRoomDto,
    ownerId: string,
  ) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: ownerId },
      });

      if (!user) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'not_found_user' });
      }

      const hashPassword = await bcrypt.hash(
        createNewRoomDto.password,
        this.saltRounds,
      );

      let data = {
        password: hashPassword,
        ownerId: user.id,
        players: [ownerId],
      };

      const newRoom = await this.prismaService.room.create({ data });

      let response: { createdAt: Date; id: number } = {
        createdAt: newRoom.createdAt,
        id: newRoom.id,
      };

      return res.status(HttpStatus.CREATED).json({ content: response });
    } catch (err) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: `InternalServerErro|createNew|Erro:${err}` });
    }
  }

  // validar quando a sala estiver cheia!! outro usuário tentando entrar como visitante
  async signInAsync(res: Response, singInDto: SignInRoomDto, userId: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'not_found_user' });
      }

      const room = await this.prismaService.room.findUnique({
        where: { id: singInDto.id },
      });

      if (!room) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'not_found_room' });
      }

      const matchPassword = await bcrypt.compare(
        singInDto.password,
        room.password,
      );

      if (!matchPassword) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'invalid_password' });
      }

      let response: { createdAt: Date; id: number } = {
        createdAt: room.createdAt,
        id: room.id,
      };

      // coloco o visitante para ter acesso, caso não tenha nenhum visitante.
      // criar validação para quando a sala enxer! outro usuário tentando entrar
      // aqui que manda o acesso! só tem acesso a sala se tiver o id nessa coluna
      if (userId !== room.ownerId && !room.guestId) {
        let players =
          room.players.length > 0 ? [room.players[0], userId] : [userId];

        await this.prismaService.room.update({
          where: { id: room.id },
          data: { guestId: userId, players: players },
        });
      }

      // sempre limpa a array score associada a sala.
      const clearScore = await this.clearScoreTableOnSing(room.id);

      if (!clearScore) {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'InternalServerErro|signIn|clearScoreTableOnSing' });
      }

      return res.status(HttpStatus.OK).json({ content: response });
    } catch (err) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: `InternalServerErro|signIn|Erro:${err}` });
    }
  }

  async getByIdAsync(res: Response, roomId: number) {
    try {
      const room = await this.prismaService.room.findUnique({
        where: { id: roomId },
      });

      if (!room) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'not_found_room' });
      }
      const { password, ...rest } = room;
      let response: RoomDataType = { ...rest };

      return res.status(HttpStatus.OK).json({ content: response });
    } catch (err) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: `InternalServerErro|getByIdAsync|Erro:${err}` });
    }
  }

  async getRoomUsersAsync(res: Response, roomId: number) {
    try {
      const room = await this.prismaService.room.findUnique({
        where: { id: roomId },
      });

      if (!room) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'not_found_room' });
      }

      if (room.players.length <= 0) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'room_without_users' });
      }

      // Assuming room.players is an array of user IDs
      const users = await this.userService.getUsersByListIds(room.players);

      let response: { roomId: number; users: UserDataType[] } = {
        roomId,
        users,
      };

      return res.status(HttpStatus.OK).json({ content: response });
    } catch (err) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: `InternalServerErro|getRoomUsersAsync|Erro:${err}` });
    }
  }

  async getPlayerReleasedToPlayAsync(
    res: Response,
    roomId: number,
    playerId: string,
  ) {
    try {
      const room = await this.prismaService.room.findUnique({
        where: { id: roomId },
      });

      const user = await this.prismaService.user.findUnique({
        where: { id: playerId },
      });

      if (!room) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'not_found_room' });
      }

      if (!user) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'user_found_room' });
      }

      let response: { playerIsAllowed: boolean } = {
        playerIsAllowed: room.playerReleasedToPlay === user.id,
      };

      return res.status(HttpStatus.OK).json({ content: response });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `InternalServerErro|getPlayerReleasedToPlayAsync|Erro:${err}`,
      });
    }
  }

  async clearScoreTableOnSing(roomId: number) {
    try {
      const score = await this.prismaService.score.findFirst({
        where: { roomId },
      });

      if (score) {
        await this.prismaService.score.deleteMany({
          where: { id: score.roomId },
        });
      }

      return true;
    } catch (err) {
      return false;
    }
  }
}
