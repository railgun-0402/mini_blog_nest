import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
