import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw error if extra properties
      transform: true, // Auto-transform payloads to DTO instances
    }),
  );

  // Enable CORS (for frontend later)
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3000'], // Next.js default port
    credentials: true,
  });

  await app.listen(3001);
  console.log('🚀 OpsPulse Backend running on http://localhost:3001');
}
bootstrap();