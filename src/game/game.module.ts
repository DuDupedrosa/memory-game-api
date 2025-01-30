import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service'; // Se você estiver utilizando o Prisma para acessar o banco de dados
import { GameGateway } from './game.gateway';

@Module({
  providers: [GameGateway, PrismaService], // Aqui você adiciona o GameGateway e qualquer serviço necessário
  exports: [GameGateway],
})
export class GameModule {}
