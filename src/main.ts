import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
  .setTitle("CENTRAL DE ONG'S - API")
  .setDescription('Bem-vindo à API da Rede Social de ONGs, uma plataforma dedicada a conectar organizações não governamentais (ONGs) e facilitar a colaboração em causas sociais.<br> Nossa API oferece uma variedade de endpoints para gerenciar informações sobre as ONGs, suas postagens e promover interações significativas.')
  .setVersion('1.0')
  .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  app.enableCors()
  await app.listen(3000);
}
bootstrap();
