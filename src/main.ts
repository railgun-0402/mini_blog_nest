import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORSを許可
  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });
  // cookieを許可
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTOにないプロパティを除外
      forbidNonWhitelisted: true, // DTOにないプロパティが来たらエラー
      transform: true, // query paramsなどをDTOの型に変換しやすくする
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
