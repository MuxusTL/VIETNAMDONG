import { z } from 'zod';

export const createTokenSchema = z.object({
  label: z.string().trim().max(60).optional(),
});
