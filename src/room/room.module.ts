import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { GameModule } from 'src/game/game.module';

@Module({
  imports: [AuthModule, GameModule],
  controllers: [RoomController],
  providers: [RoomService, PrismaService, AuthService, UserService],
})
export class RoomModule {}
