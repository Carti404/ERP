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
  const extraOrigins =
    process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()) ?? [];
  
  app.enableCors({
    origin: (origin, callback) => {
      // Permitir si no hay origen (como herramientas de test local) o si coincide con localhost/127.0.0.1
      if (!origin || /localhost|127\.0\.0\.1/.test(origin)) {
        return callback(null, true);
      }
      
      // Verificar contra orígenes permitidos en variables de entorno
      if (extraOrigins.some(allowed => origin === allowed)) {
        return callback(null, true);
      }
      
      callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  });
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api/v1`);
}
void bootstrap();
