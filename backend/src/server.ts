import express from "express";
import cors from "cors";
import path from "path";
import { connectDB } from "./config/db.js";
import cardRoutes from "./routes/cardRoutes.js";
import userRoutes from "./routes/userRoutes.js";

declare const __dirname: string;
const currentDir =
  typeof __dirname !== "undefined" ? __dirname : path.resolve();

export const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const staticPath = path.join(currentDir, "public");

app.use(express.static(staticPath));

app.get("/api", (req, res) => {
  res.json({ message: "Kanban API is running" });
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
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}
