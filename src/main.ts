import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Memory Game API')
    .setDescription('API do jogo de memória 1v1')
    .setVersion('1.0')
    .addBearerAuth() // Caso use autenticação JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

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
