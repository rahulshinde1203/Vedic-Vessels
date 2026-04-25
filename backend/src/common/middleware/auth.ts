import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import type { JwtPayload } from '../../modules/auth/auth.types';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, data: null, message: 'Authentication required' });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = { id: payload.userId, phone: payload.phone, role: payload.role ?? 'USER' };
    next();
  } catch {
    res.status(401).json({ success: false, data: null, message: 'Invalid or expired token' });
  }
}
