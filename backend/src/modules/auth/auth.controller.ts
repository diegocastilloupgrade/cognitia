import { AuthService } from "./auth.service";
import type { LoginInput } from "./auth.types";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login(input: LoginInput) {
    return this.authService.login(input);
  }

  me() {
    return this.authService.me();
  }
}
