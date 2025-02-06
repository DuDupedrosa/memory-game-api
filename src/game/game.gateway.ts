import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { randomInt } from 'crypto';
import { access } from 'fs';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma.service';

@WebSocketGateway()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private rooms: { [key: string]: { owner: string; players: string[] } } = {};
  constructor(private prismaService: PrismaService) {}

  handleConnection(client: Socket) {}

  handleDisconnect(client: Socket) {}

  @SubscribeMessage('createRoom')
  handleCreateRoom(
    client: Socket,
    roomData: { roomId: string; password: string; ownerId: string },
  ) {
    this.rooms[roomData.roomId] = {
      owner: roomData.ownerId,
      players: [roomData.ownerId],
    };
    client.join(roomData.roomId);
    client.emit('roomCreated', { roomId: roomData.roomId });
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    client: Socket,
    joinData: { roomId: string; password: string; playerId: string },
  ) {
    const room = this.rooms[joinData.roomId];

    if (room) {
      // Associando o client.id ao ID do jogador
      //this.players[client.id] = joinData.playerId; // Armazena a relação client.id -> playerId
      let players = [room.owner];
      if (room.owner !== joinData.playerId) {
        players.push(joinData.playerId);
      }

      this.rooms[joinData.roomId] = {
        owner: room.owner,
        players: players,
      };
      //room.players.push(client.id);
      client.join(joinData.roomId);
    } else {
      const dbRoom = await this.prismaService.room.findFirst({
        where: { id: Number(joinData.roomId) },
      });

      this.rooms[joinData.roomId] = {
        owner: dbRoom.ownerId,
        players: [joinData.playerId],
      };
      client.join(joinData.roomId);
    }

    this.server.to(joinData.roomId).emit('playerJoined', {
      playerId: joinData.playerId,
      roomId: joinData.roomId,
    });
  }

  @SubscribeMessage('requestStartGame')
  async handleRequestStartGame(
    client: Socket,
    startGameData: { roomId: string; playerId: string },
  ) {
    const room = this.rooms[startGameData.roomId];

    if (room) {
      const dbRoom = await this.prismaService.room.findUnique({
        where: { id: Number(startGameData.roomId) },
      });

      if (!dbRoom) {
        this.server
          .to(startGameData.roomId)
          .emit('error', { message: 'Room not found' });
      }

      const randomNumber = randomInt(0, 1000000);

      await this.prismaService.room.update({
        where: { id: Number(startGameData.roomId) },
        data: {
          matchRandomNumber: randomNumber,
          playerReleasedToPlay: startGameData.playerId,
        },
      });

      this.server.to(startGameData.roomId).emit('startGame', {
        roomId: startGameData.roomId,
      });
    } else {
      this.server
        .to(startGameData.roomId)
        .emit('error', { message: 'Room not found' });
    }
  }

  @SubscribeMessage('requestFlipCard')
  async handleRequestFlipCard(
    client: Socket,
    requestFlipCardData: { roomId: string; id: number },
  ) {
    const room = this.rooms[requestFlipCardData.roomId];
    if (room) {
      this.server.to(requestFlipCardData.roomId).emit('flippedCard', {
        roomId: requestFlipCardData.roomId,
        id: requestFlipCardData.id,
      });
    } else {
      client.emit('error', { message: 'Room not found' });
    }
  }

  @SubscribeMessage('requestChangePlayerTurn')
  async handleRequestChangePlayerTurn(
    client: Socket,
    changePlayerData: { roomId: string },
  ) {
    const room = this.rooms[changePlayerData.roomId];
    if (room) {
      const roomIdToNumber = Number(changePlayerData.roomId);
      const dbRoom = await this.prismaService.room.findUnique({
        where: { id: roomIdToNumber },
      });

      if (!dbRoom)
        return client.emit('error', { message: 'Db room not found' });

      const otherPlayer = dbRoom.players.find(
        (player) => player !== dbRoom.playerReleasedToPlay,
      );

      if (!otherPlayer)
        return client.emit('error', { message: 'otherPlayer not found' });

      await this.prismaService.room.update({
        where: { id: roomIdToNumber },
        data: { playerReleasedToPlay: otherPlayer },
      });

      this.server.to(changePlayerData.roomId).emit('changedPlayerTurn', {
        roomId: changePlayerData.roomId,
        playerId: otherPlayer,
      });
    } else {
      client.emit('error', { message: 'Room not found' });
    }
  }

  @SubscribeMessage('requestMakePoint')
  async handleRequestMakePoint(
    client: Socket,
    requestMakePointData: { roomId: string; playerId: string },
  ) {
    const room = this.rooms[requestMakePointData.roomId];
    if (room) {
      const roomToNumber = Number(requestMakePointData.roomId);
      const dbScore = await this.prismaService.score.findFirst({
        where: {
          AND: [
            { playerId: requestMakePointData.playerId },
            { roomId: roomToNumber },
          ],
        },
      });

      if (!dbScore) {
        await this.prismaService.score.create({
          data: {
            playerId: requestMakePointData.playerId,
            roomId: roomToNumber,
            value: 1,
          },
        });

        this.server.to(requestMakePointData.roomId).emit('markedPoint', {
          roomId: requestMakePointData.roomId,
          playerId: requestMakePointData.playerId,
          value: 1,
        });
      } else {
        const updatedValue = dbScore.value + 1;
        const winGame = updatedValue === 3;

        // ganhou, vamos limpar a array score para não dar erro.
        if (winGame) {
          await this.prismaService.score.deleteMany({
            where: { roomId: roomToNumber },
          });
        }

        // se não, coloca o valor novo na tabela.
        if (!winGame) {
          await this.prismaService.score.update({
            where: { id: dbScore.id },
            data: { value: updatedValue },
          });
        }

        this.server.to(requestMakePointData.roomId).emit('markedPoint', {
          roomId: requestMakePointData.roomId,
          playerId: requestMakePointData.playerId,
          value: updatedValue,
        });
      }
    } else {
      client.emit('error', { message: 'Room not found' });
    }
  }

  // @SubscribeMessage('requestUserLoggedOutCleanData')
  // async handleRequestUserLoggedOutCleanData(
  //   client: Socket,
  //   data: { roomId: string; playerId: string },
  // ) {
  //   const room = this.rooms[data.roomId];
  //   if (room) {
  //     const roomIdToNumber = Number(data.roomId);
  //     const dbRoom = await this.prismaService.room.findUnique({
  //       where: { id: roomIdToNumber },
  //     });

  //     let removePlayerFromPlayers = [];
  //     // o dono sala sempre permanece na array players
  //     // forçando sempre o segundo jogador a entrar e voltando a tabela para o default
  //     // visitante
  //     if (dbRoom.ownerId !== data.playerId) {
  //       removePlayerFromPlayers = dbRoom.players.filter(
  //         (player) => player !== data.playerId,
  //       );
  //     } else {
  //       // dono da sala
  //       removePlayerFromPlayers = dbRoom.players.filter(
  //         (player) => player === data.playerId,
  //       );
  //     }

  //     await this.prismaService.room.update({
  //       where: { id: dbRoom.id },
  //       data: {
  //         guestId: null,
  //         players: removePlayerFromPlayers,
  //         playerReleasedToPlay: dbRoom.ownerId,
  //       },
  //     });

  //     const score = await this.prismaService.score.findFirst({
  //       where: { roomId: dbRoom.id },
  //     });

  //     if (score) {
  //       await this.prismaService.score.delete({ where: { id: score.id } });
  //     }
  //   } else {
  //     client.emit('error', { message: 'Room not found' });
  //   }
  // }

  @SubscribeMessage('requestUserLoggedOut')
  async handleRequestUserLoggedOut(
    client: Socket,
    data: { roomId: string; playerId: string },
  ) {
    const room = this.rooms[data.roomId];
    if (room) {
      const roomIdToNumber = Number(data.roomId);

      const triggerExitGame = await this.triggerUserExitGame(
        roomIdToNumber,
        data.playerId,
      );

      if (triggerExitGame) {
        this.server.to(data.roomId).emit('userLoggedOut', {
          roomId: data.roomId,
          playerId: data.playerId,
        });
      }
    } else {
      client.emit('error', { message: 'Room not found' });
    }
  }

  @SubscribeMessage('requestGameWin')
  async handleRequestGameWin(
    client: Socket,
    data: { roomId: string; winnerPlayerId: string },
  ) {
    const room = this.rooms[data.roomId];

    if (room) {
      const roomIdToNumber = Number(data.roomId);

      // garantir de limpar a tabela score.
      const trigger = await this.triggerWinGame(roomIdToNumber);

      if (trigger) {
        this.server.to(data.roomId).emit('gameWin', {
          roomId: data.roomId,
          winnerPlayerId: data.winnerPlayerId,
        });
      }
    } else {
      client.emit('error', { message: 'Room not found' });
    }
  }

  @SubscribeMessage('requestExitGame')
  async handleRequestExitGame(
    client: Socket,
    data: { roomId: string; playerId: string },
  ) {
    const room = this.rooms[data.roomId];

    if (room) {
      const roomIdToNumber = Number(data.roomId);

      const triggerExitGame = await this.triggerUserExitGame(
        roomIdToNumber,
        data.playerId,
      );

      if (triggerExitGame) {
        this.server.to(data.roomId).emit('exitGame', {
          roomId: data.roomId,
          playerId: data.playerId,
        });
      }
    } else {
      client.emit('error', { message: 'Room not found' });
    }
  }

  @SubscribeMessage('requestReadyToPlay')
  async handleReadyToPlay(client: Socket, data: { roomId: string }) {
    const room = this.rooms[data.roomId];

    if (room) {
      const roomIdToNumber = Number(data.roomId);
      const dbRoom = await this.prismaService.room.findUnique({
        where: { id: roomIdToNumber },
      });

      if (dbRoom) {
        await this.prismaService.room.update({
          where: { id: roomIdToNumber },
          data: { playerTwoIsReadyToPlay: true },
        });

        this.server.to(data.roomId).emit('readyToPlay', {
          ownerId: dbRoom.ownerId,
        });
      }
    } else {
      client.emit('error', { message: 'Room not found' });
    }
  }

  async triggerWinGame(roomId: number) {
    try {
      const dbRoom = await this.prismaService.room.findUnique({
        where: { id: roomId },
      });

      if (dbRoom) {
        await this.prismaService.room.update({
          where: { id: roomId },
          data: { playerTwoIsReadyToPlay: false },
        });
      }

      const score = await this.prismaService.score.findFirst({
        where: { roomId: dbRoom.id },
      });

      if (score) {
        await this.prismaService.score.deleteMany({
          where: { roomId: dbRoom.id },
        });
      }

      return true;
    } catch (err) {
      return false;
    }
  }

  // helpers
  async triggerUserExitGame(roomId: number, playerId: string) {
    try {
      const dbRoom = await this.prismaService.room.findUnique({
        where: { id: roomId },
      });

      // volta a sala para o default, permitindo qualquer adversário entrar novamente e o dono é claro.
      await this.prismaService.room.update({
        where: { id: dbRoom.id },
        data: {
          guestId: null,
          players: [dbRoom.ownerId],
          playerReleasedToPlay: dbRoom.ownerId,
          playerTwoIsReadyToPlay: false,
        },
      });

      const score = await this.prismaService.score.findFirst({
        where: { roomId: dbRoom.id },
      });

      if (score) {
        await this.prismaService.score.deleteMany({
          where: { roomId: dbRoom.id },
        });
      }

      return true;
    } catch (err) {
      return false;
    }
  }
}
