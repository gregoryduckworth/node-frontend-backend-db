interface JwtAuthPayload {
  userId: string;
  userEmail: string;
  userName: string;
  [key: string]: any;
}

declare global {
  namespace Express {
    interface Request {
      auth?: JwtAuthPayload;
      user?: any;
    }
  }
}

export {};
