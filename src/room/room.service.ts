import { HttpStatus, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/prisma.service';
import { CreateNewRoomDto } from './dto/createNewRoomDto';
import { SignInRoomDto } from './dto/signInRoomDto';
import { RoomDataType } from 'src/types/room';
import { UserService } from 'src/user/user.service';
import { UserDataType } from 'src/types/user';
import { GameGateway } from 'src/game/game.gateway';
import { EncryptionService } from 'src/common/encryption.service';
import { UpdateRoomPasswordDto } from './dto/updateRoomPasswordDto';
import { UpdateRoomLevelDto } from './dto/updateRoomLevelDto';

@Injectable()
export class RoomService {
  constructor(
    private prismaService: PrismaService,
    private userService: UserService,
    private gameGateway: GameGateway,
    private encryptionService: EncryptionService,
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

      const rooms = await this.prismaService.room.findMany({
        where: { ownerId: user.id },
      });

      if (rooms.length === 3) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'limit_room_for_user' });
      }

      const encryptedPassword = this.encryptionService.encrypt(
        createNewRoomDto.password,
      );

      let data = {
        password: encryptedPassword,
        ownerId: user.id,
        players: [ownerId],
        level: createNewRoomDto.level,
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

      const matchPassword = this.encryptionService.compare(
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
          data: {
            guestId: userId,
            players: players,
            playerTwoIsReadyToPlay: false,
            lastAccess: new Date(),
          },
        });
      } else {
        await this.prismaService.room.update({
          where: { id: room.id },
          data: { lastAccess: new Date() },
        });
      }

      // sempre limpa a array score associada a sala.
      const clearScore = await this.clearScoreTableOnSignIn(room.id);

      if (!clearScore) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'InternalServerErro|signIn|clearScoreTableOnSignIn',
        });
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

  async clearScoreTableOnSignIn(roomId: number) {
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

  async changePlayerAllowedToPlayAsync(res: Response, roomId: number) {
    try {
      const room = await this.prismaService.room.findUnique({
        where: { id: roomId },
      });

      if (!room) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'not_found_room' });
      }

      const otherPlayer = room.players.find(
        (player) => player !== room.playerReleasedToPlay,
      );

      const updatedRoom = await this.prismaService.room.update({
        where: { id: room.id },
        data: { playerReleasedToPlay: otherPlayer },
      });

      return res
        .status(HttpStatus.OK)
        .json({ content: updatedRoom.playerReleasedToPlay });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `InternalServerErro|changePlayerAllowedToPlay|Erro:${err}`,
      });
    }
  }

  async getRecentRoomsIdByOwnerIdAsync(res: Response, ownerId: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: ownerId },
      });

      if (!user) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'not_found_user' });
      }

      const rooms = await this.prismaService.room.findMany({
        where: { ownerId: ownerId },
        orderBy: { createdAt: 'desc' },
        take: 3,
      });

      let response:
        | {
            id: number;
            level: number;
          }[]
        | [] = rooms.map((room) => {
        return {
          id: room.id,
          level: room.level,
        };
      });

      return res.status(HttpStatus.OK).json({ content: response });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `InternalServerErro|getRecentRoomsByUserIdAsync|Erro:${err}`,
      });
    }
  }

  async getAllRoomsByOwnerIdAsync(res: Response, ownerId: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: ownerId },
      });

      if (!user) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'not_found_user' });
      }

      const rooms = await this.prismaService.room.findMany({
        where: { ownerId },
        orderBy: { id: 'asc' },
      });

      let response: {
        id: number;
        createdAt: Date;
        lastAccess: Date;
        password: string;
        level: number;
      }[] =
        rooms.length > 0
          ? rooms.map((room) => {
              return {
                id: room.id,
                createdAt: room.createdAt,
                lastAccess: room.lastAccess,
                password: this.encryptionService.decrypt(room.password),
                level: room.level,
              };
            })
          : [];

      return res.status(HttpStatus.OK).json({ content: response });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `InternalServerErro|getAllRoomsByOwnerId|Erro:${err}`,
      });
    }
  }

  async deleteByIdAsync(res: Response, roomId: number) {
    try {
      const room = await this.prismaService.room.findUnique({
        where: { id: roomId },
      });

      if (!room) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'not_found_room' });
      }

      const scores = await this.prismaService.score.findMany({
        where: { roomId: room.id },
      });

      if (scores.length > 0) {
        await this.prismaService.score.deleteMany({ where: { roomId } });
      }

      await this.prismaService.room.delete({ where: { id: roomId } });

      return res.status(HttpStatus.OK).json({ content: null });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `InternalServerErro|deleteById|Erro:${err}`,
      });
    }
  }

  async updatePasswordAsync(
    res: Response,
    dto: UpdateRoomPasswordDto,
    userId: string,
  ) {
    try {
      const room = await this.prismaService.room.findUnique({
        where: { id: dto.id },
      });

      if (!room) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'not_found_room' });
      }

      // somente o dono da sala pode editar.
      if (!room.ownerId || room.ownerId !== userId) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: 'user_not_room_owner' });
      }

      const encryptedPassword = this.encryptionService.encrypt(dto.newPassword);

      await this.prismaService.room.update({
        where: { id: dto.id },
        data: {
          password: encryptedPassword,
        },
      });

      return res
        .status(HttpStatus.OK)
        .json({ content: 'room_password_changed_success' });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `InternalServerErro|updatePasswordAsync|Erro:${err}`,
      });
    }
  }

  async updateLevelAsync(
    res: Response,
    dto: UpdateRoomLevelDto,
    userId: string,
  ) {
    try {
      const room = await this.prismaService.room.findUnique({
        where: { id: dto.id },
      });

      if (!room) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'not_found_room' });
      }

      // somente o dono da sala pode editar.
      if (!room.ownerId || room.ownerId !== userId) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: 'user_not_room_owner' });
      }

      await this.prismaService.room.update({
        where: { id: room.id },
        data: {
          level: dto.level,
        },
      });

      return res
        .status(HttpStatus.OK)
        .json({ message: 'room_level_changed_success' });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `InternalServerErro|updateLevelAsync|Erro:${err}`,
      });
    }
  }
}
