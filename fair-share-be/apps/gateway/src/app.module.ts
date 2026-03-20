import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ClientsModule, Transport } from "@nestjs/microservices";

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ClientsModule.register([
      {
        name: "AUTH_SERVICE",
        transport: Transport.TCP,
        options: { host: "localhost", port: 3001 },
      },
      {
        name: "BILL_SERVICE",
        transport: Transport.TCP,
        options: { host: "localhost", port: 3002 },
      },
      {
        name: "ANALYTICS_SERVICE",
        transport: Transport.TCP,
        options: { host: "localhost", port: 3003 },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
