import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;

  // Configuração de validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades não declaradas no DTO automaticamente
      forbidNonWhitelisted: true, // Retorna erro se propriedades desconhecidas forem enviadas
      transform: true, // Transforma os dados recebidos nos tipos declarados no DTO
    }),
  );

  // Configuração de CORS para a API REST
  app.enableCors({
    origin: 'https://memory-game-ten-coral.vercel.app', // Permitir apenas esta origem
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos permitidos
    credentials: true, // Permitir envio de cookies e credenciais
    allowedHeaders: 'Content-Type, Authorization', // Cabeçalhos permitidos
  });

  // Configuração do adaptador de WebSocket para usar o Socket.IO
  app.useWebSocketAdapter(new IoAdapter(app));

  // Inicia o servidor na porta 3000
  await app.listen(port, '0.0.0.0', () => {});
}

bootstrap();
