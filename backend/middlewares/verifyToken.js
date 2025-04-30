import { expressjwt } from "express-jwt";

export const verifyToken = expressjwt({
  secret: process.env.ACCESS_TOKEN_SECRET,
  algorithms: ["HS256"],
  getToken: (req) => {
    const authHeader = req.headers.authorization;
    const match = authHeader?.match(/^Bearer\s+(.+)$/i);
    return match?.[1] ?? null;
  },
  requestProperty: "auth",
});
