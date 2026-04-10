import { Injectable } from "@nestjs/common";
@Injectable()
export class AppService {
  signup(data: { name: string; email: string; password: string }) {
    return { message: "AUTH_SIGNUP received", data };
  }

  login(data: { email: string; password: string }) {
    return { message: "AUTH_LOGIN received", data: { email: data.email } };
  }

  logout(data: { userId: string }) {
    return { message: "AUTH_LOGOUT received", data };
  }

  getProfile(data: { userId: string }) {
    return { message: "AUTH_PROFILE received", data };
  }
}
