import {
  Body,
  Controller,
  Get,
  Param,
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

@Controller('room')
export class RoomController {
  constructor(private roomService: RoomService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
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
  @Get(':id')
  async getById(@Res() response: Response, @Param('id') id: number) {
    return await this.roomService.getByIdAsync(response, Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/users')
  async getRoomUsers(@Res() response: Response, @Param('id') id: number) {
    return await this.roomService.getRoomUsersAsync(response, Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/player-allowed-to-play')
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
}
