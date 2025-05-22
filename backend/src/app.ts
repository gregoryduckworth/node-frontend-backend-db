import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import UserRoute from '@routes/UserRoute';
import TestRoute from '@routes/TestRoute';
import AdminUserRoute from '@routes/AdminUserRoute';
import { requireAdmin } from './middlewares/requireAdmin';

dotenv.config();

const app = express();

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173'];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'OK' });
});
app.all('/health', (_req: Request, res: Response) => {
  res.status(405).json({ error: 'Method not allowed' });
});

app.use(UserRoute);
app.use('/admin', requireAdmin, AdminUserRoute);

if (process.env.NODE_ENV !== 'production') {
  app.use(TestRoute);
}

export default app;
