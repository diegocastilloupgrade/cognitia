import { AuthService } from "./auth.service";
import type { ForgotPasswordInput, LoginInput, ResetPasswordInput } from "./auth.types";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login(input: LoginInput) {
    return this.authService.login(input);
  }

  forgotPassword(input: ForgotPasswordInput) {
    return this.authService.requestPasswordReset(input);
  }

  resetPassword(input: ResetPasswordInput) {
    return this.authService.resetPassword(input);
  }

  me() {
    return this.authService.me();
  }
}
