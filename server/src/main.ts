import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    rawBody: true,
  });

  // Set max file size to 50MB
  app.use((req, res, next) => {
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      // Body parser limit for multipart/form-data
      req.setTimeout(300000); // 5 minutes timeout for large uploads
    }
    next();
  });

  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);
}
bootstrap();
