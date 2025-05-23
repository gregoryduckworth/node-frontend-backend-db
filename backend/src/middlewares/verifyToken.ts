import { expressjwt } from 'express-jwt';
import { Request } from 'express';
import { getJwtSecrets } from '../utils/jwtSecrets';

const { accessTokenSecret } = getJwtSecrets();

export const verifyToken = expressjwt({
  secret: accessTokenSecret,
  algorithms: ['HS256'],
  getToken: (req: Request) => {
    const authHeader = req.headers.authorization;
    const match = authHeader?.match(/^Bearer\s+(.+)$/i);
    return match?.[1] ?? undefined;
  },
  requestProperty: 'auth',
});
