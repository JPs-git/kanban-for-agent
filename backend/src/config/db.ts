import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// 根据环境选择数据库
const NODE_ENV = process.env.NODE_ENV || "development";
const MONGODB_URI =
  NODE_ENV === "test"
    ? process.env.MONGODB_TEST_URI || "mongodb://localhost:27017/kanban-test"
    : process.env.MONGODB_URI || "mongodb://localhost:27017/kanban";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB connected successfully to ${MONGODB_URI}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
