import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: "0.0.0.0",
      port: Number(process.env.AUTH_SERVICE_TCP_PORT ?? 3011),
    },
  });

  await app.startAllMicroservices();
  await app.listen(Number(process.env.PORT ?? 3001));

  console.log("Authentication service HTTP  → http://localhost:3001");
  console.log("Authentication service TCP   → localhost:3011");
}
bootstrap();
