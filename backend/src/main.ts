import { createApp } from "./app";
import { loadEnv } from "./config/env";
import { createApiRouter } from "./modules";
import { requireAuth } from "./shared/middleware/require-auth";

const env = loadEnv();

const app = createApp({
  router: createApiRouter(requireAuth),
});
const port = env.port;

app.listen(port, () => {
  console.log(`COGNITIA backend listening on http://localhost:${port}`);
});
