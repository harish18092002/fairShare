import { Controller, Get } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("auth/health")
  healthCheck() {
    return {
      status: "ok",
      service: "Authentication",
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern("AUTH_SIGNUP")
  signup(@Payload() data: { name: string; email: string; password: string }) {
    return this.appService.signup(data);
  }

  @MessagePattern("AUTH_LOGIN")
  login(@Payload() data: { email: string; password: string }) {
    return this.appService.login(data);
  }

  @MessagePattern("AUTH_LOGOUT")
  logout(@Payload() data: { userId: string }) {
    return this.appService.logout(data);
  }

  @MessagePattern("AUTH_PROFILE")
  getProfile(@Payload() data: { userId: string }) {
    return this.appService.getProfile(data);
  }
}
