import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { PrismaService } from 'src/prisma.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RoomModule } from './room/room.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true, // Isso garante que o ConfigModule seja acessível globalmente
    }),
    AuthModule,
    RoomModule,
    GameModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
