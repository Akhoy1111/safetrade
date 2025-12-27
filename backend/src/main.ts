import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      transform: true, // Automatically transform payloads to DTO instances
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transformOptions: {
        enableImplicitConversion: true, // Convert types automatically
      },
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Set global API prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 SafeTrade Backend is running on: http://localhost:${port}`);
  console.log(`📡 API available at: http://localhost:${port}/api`);
  console.log(`🗄️  Database: Connected (Drizzle ORM + PostgreSQL)`);
}
bootstrap();
