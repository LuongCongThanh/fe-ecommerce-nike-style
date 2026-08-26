import { z } from 'zod';

import { ProfileSchema } from '../profile/profile';

/** What `POST /api/auth/login/` and `/register/` return — the account profile plus a fresh token pair. */
export const AuthSessionResponseSchema = z.object({
  user: ProfileSchema,
  access: z.string(),
  refresh: z.string(),
});

export const RefreshSessionResponseSchema = z.object({
  access: z.string(),
  refresh: z.string(),
});

export type AuthSessionResponse = z.infer<typeof AuthSessionResponseSchema>;
export type RefreshSessionResponse = z.infer<typeof RefreshSessionResponseSchema>;
