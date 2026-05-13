import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import cardRoutes from "./routes/cardRoutes.js";
import userRoutes from "./routes/userRoutes.js";

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

app.use(cors());
app.use(express.json());

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

const startServer = () => {
  try {
    connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}
