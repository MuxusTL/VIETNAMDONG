import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { verifySession } from '../utils/jwt.js';
import { getUserById } from '../repositories/userRepository.js';
import { findActiveTokenByHash, touchTokenLastUsed } from '../repositories/tokenRepository.js';

function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const cookieToken = req.cookies?.linknet_session;
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer lnk_')) {
    const raw = authHeader.slice('Bearer '.length);
    const row = findActiveTokenByHash(hashToken(raw));
    if (!row) {
      res.status(401).json({ error: 'Token không hợp lệ hoặc đã bị thu hồi' });
      return;
    }
    const user = getUserById(row.user_id);
    if (!user) {
      res.status(401).json({ error: 'Tài khoản không tồn tại' });
      return;
    }
    touchTokenLastUsed(row.id);
    req.user = user;
    next();
    return;
  }

  const payload = cookieToken && verifySession(cookieToken);
  if (!payload) {
    res.status(401).json({ error: 'Chưa đăng nhập' });
    return;
  }

  const user = getUserById(payload.uid);
  if (!user) {
    res.status(401).json({ error: 'Tài khoản không tồn tại' });
    return;
  }

  req.user = user;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Không có quyền truy cập' });
    return;
  }
  next();
}
