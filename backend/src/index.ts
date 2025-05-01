import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import UserRoute from "./routes/UserRoute";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : ["http://localhost:5173"];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware setup
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Health check endpoint
app.use("/health", (_req: Request, res: Response) => {
  res.sendStatus(200);
});

// Routes setup
app.use(UserRoute);

// Start server
app.listen(port, () => console.log(`Server is running on port ${port}...`));
