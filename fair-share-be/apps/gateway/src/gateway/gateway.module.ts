import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { GatewayController } from "./gateway.controller";
import { GatewayService } from "./gateway.service";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "AUTH_SERVICE",
        transport: Transport.TCP,
        options: {
          host: process.env.AUTH_SERVICE_HOST ?? "localhost",
          port: Number(process.env.AUTH_SERVICE_TCP_PORT ?? 3011),
        },
      },
      {
        name: "BILL_SERVICE",
        transport: Transport.TCP,
        options: {
          host: process.env.BILL_SERVICE_HOST ?? "localhost",
          port: Number(process.env.BILL_SERVICE_TCP_PORT ?? 3012),
        },
      },
      {
        name: "ANALYTICS_SERVICE",
        transport: Transport.TCP,
        options: {
          host: process.env.ANALYTICS_SERVICE_HOST ?? "localhost",
          port: Number(process.env.ANALYTICS_SERVICE_TCP_PORT ?? 3013),
        },
      },
    ]),
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
