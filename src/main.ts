/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { SwaggerDoc } from './utils/loaders/swagger';
import { ApiKeyGuard } from './guards/apiKey.guard';
import { ExceptionsFilter } from './filters/exceptions.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalGuards(new ApiKeyGuard());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new ExceptionsFilter());
  app.use(helmet());
  SwaggerDoc.setup(app);
  await app.listen(3005);
}
bootstrap();
