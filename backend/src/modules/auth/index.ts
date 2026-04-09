import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

export function createAuthModule() {
  const service = new AuthService();
  const controller = new AuthController(service);

  return {
    name: "auth",
    service,
    controller,
  };
}

export type AuthModule = ReturnType<typeof createAuthModule>;
