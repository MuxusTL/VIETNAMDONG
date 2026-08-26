import { Router } from 'express';
import crypto from 'node:crypto';
import { nanoid } from 'nanoid';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createTokenSchema } from '../validators/tokens.validators.js';
import { listTokensForUser, createToken, revokeToken } from '../repositories/tokenRepository.js';

export const tokensRouter = Router();

function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

tokensRouter.get('/', requireAuth, (req, res) => {
  res.json(listTokensForUser(req.user!.id));
});

tokensRouter.post('/', requireAuth, validateBody(createTokenSchema), (req, res) => {
  const raw = `lnk_${nanoid(40)}`;
  createToken(nanoid(), req.user!.id, hashToken(raw), req.body.label || 'Login Token');
  res.json({ token: raw });
});

tokensRouter.delete('/:id', requireAuth, (req, res) => {
  revokeToken(req.params.id, req.user!.id);
  res.json({ ok: true });
});
