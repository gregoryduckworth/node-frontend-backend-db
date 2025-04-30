import { JwtAuthPayload } from "../middlewares/verifyToken";

declare global {
  namespace Express {
    interface Request {
      auth?: JwtAuthPayload;
    }
  }
}
