import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from "@nestjs/common";
import { GatewayService } from "./gateway.service";

@Controller("gateway")
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handle(
    @Headers("x-action") xAction: string,
    @Body() body: unknown,
  ): Promise<unknown> {
    return this.gatewayService.dispatch(xAction, body);
  }
}
