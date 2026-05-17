import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import cardRoutes from "./routes/cardRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { requestLogger, errorHandler } from "./middleware/index.js";
import { logger } from "./utils/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const version = fs
  .readFileSync(path.join(__dirname, "../../VERSION"), "utf-8")
  .trim();

const envFromArgv = process.argv.find((arg) => arg.startsWith("NODE_ENV="));
const envFromEnv = process.env.NODE_ENV;

let env = envFromArgv ? envFromArgv.split("=")[1] : envFromEnv || "production";

const envPath = path.join(
  __dirname,
  "../",
  `.env${env === "production" ? "" : `.${env}`}`,
);

dotenv.config({ path: envPath });

process.env.NODE_ENV = env;

export const app = express();
const PORT = process.env.PORT || 3000;

let server: ReturnType<typeof app.listen> | null = null;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

const staticPath = path.join(__dirname, "../", "dist", "public");

app.use(express.static(staticPath));

app.get("/api", (req, res) => {
  res.json({ message: "Kanban API is running" });
});

app.get("/api/version", (req, res) => {
  res.json({
    version: version,
    environment: process.env.NODE_ENV,
  });
});

app.use("/api/cards", cardRoutes);
app.use("/api/users", userRoutes);

app.get("*", (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

app.use(errorHandler);

const startServer = async () => {
  try {
    logger.info("PROCESS_START", "Starting Kanban backend", {
      version,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    });

    logger.info("DB_CONNECT", "Connecting to database", {
      sqlitePath: process.env.SQLITE_PATH
    });

    await connectDB();
    logger.info("DB_CONNECT_SUCCESS", "Database connection established");

    server = app.listen(PORT, () => {
      logger.info("SERVER_LISTENING", `Server running on http://localhost:${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV
      });
    });

    const gracefulShutdown = (signal: string) => {
      logger.info('GRACEFUL_SHUTDOWN', `Received ${signal}, starting graceful shutdown`, { signal });

      if (server) {
        server.close((err) => {
          if (err) {
            logger.error('SERVER_CLOSE_ERROR', 'Error during server shutdown', { error: err.message });
            process.exit(1);
          } else {
            logger.info('SERVER_CLOSED', 'Server closed successfully');
            process.exit(0);
          }
        });

        setTimeout(() => {
          logger.warn('SHUTDOWN_TIMEOUT', 'Forcing shutdown after timeout');
          process.exit(1);
        }, 10000);
      } else {
        process.exit(0);
      }
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  } catch (error) {
    logger.error("STARTUP_ERROR", "Failed to start server", {
      error: (error as Error).message,
      stack: (error as Error).stack
    });
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}