import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import cardRoutes from './routes/cardRoutes.js';
import userRoutes from './routes/userRoutes.js';

export const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/api', (req, res) => {
  res.json({ message: 'Kanban API is running' });
});

// 卡片路由
app.use('/api/cards', cardRoutes);

// 用户路由
app.use('/api/users', userRoutes);

// 启动服务器
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

// 只在非测试环境下启动服务器
if (process.env.NODE_ENV !== 'test') {
  startServer();
}
