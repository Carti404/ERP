import './bootstrap-env';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const corsOrigins = process.env.CORS_ORIGIN?.split(',').map((s) =>
    s.trim(),
  ) ?? ['http://localhost:4200'];
  app.enableCors({ origin: corsOrigins, credentials: true });
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
