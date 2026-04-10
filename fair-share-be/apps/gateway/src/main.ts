import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix('api');

  await app.listen(3000);

  console.log('API Gateway running on http://localhost:3000');
  console.log('');
  console.log('Usage:');
  console.log('  POST http://localhost:3000/api/gateway');
  console.log('  Header: x-action: GT_<ACTION_NAME>');
  console.log('  Body:   { ...payload }');
  console.log('');
  console.log('Example:');
  console.log('  x-action: GT_AUTH_LOGIN  →  AUTH_SERVICE TCP:3011');
  console.log('  x-action: GT_BILLS_CREATE →  BILL_SERVICE TCP:3012');
  console.log('  x-action: GT_ANALYTICS_SUMMARY → ANALYTICS_SERVICE TCP:3013');
}
bootstrap();
