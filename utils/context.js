// context.ts
import jwt from 'jsonwebtoken';
import { BlacklistedToken } from './../src/models/BlackListedToken.js';

export const context = async ({ req }) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return { userId: null };

  // check blacklist
  const blacklisted = await BlacklistedToken.findOne({ token });
  if (blacklisted) return { userId: null };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return { userId: decoded.userId, token };
  } catch {
    return { userId: null };
  }
};
