import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import UserRoute from "./routes/UserRoute";
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
// Configure CORS to allow our frontend origin and credentials
const allowedOrigins = ["http://localhost:5173"];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Handle preflight requests for all routes
app.options(
  "*",
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

// health check endpoint
app.get("/health", (_req: Request, res: Response) => res.sendStatus(200));

// Routes
app.use(UserRoute);

app.listen(port, () => console.log(`Server is running on port ${port}...`));
