import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getJwtSecrets } from '@/utils/jwtSecrets';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const { accessTokenSecret } = getJwtSecrets();

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  let token: string | undefined;
  const authHeader = req.headers.authorization;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, accessTokenSecret) as any;
    if (!decoded.isAdmin) return res.status(403).json({ message: 'Admins only' });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
