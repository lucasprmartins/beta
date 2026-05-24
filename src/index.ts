import { env } from "./config/env";
import { logger } from "./config/logger";
import { createServer } from "./server";

const app = createServer();

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "server started");
});

function shutdown(signal: NodeJS.Signals) {
  logger.info({ signal }, "shutting down server");

  server.close((err) => {
    if (err) {
      logger.error({ err }, "server shutdown failed");
      process.exit(1);
    }

    logger.info("server stopped");
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
