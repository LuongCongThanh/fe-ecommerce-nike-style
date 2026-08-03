import { z } from 'zod';

export { ErrorEnvelopeSchema as AuthErrorSchema } from '../errors/envelope';
export type { ErrorEnvelope as AuthError } from '../errors/envelope';

export const LoginRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  user: z.object({
    id: z.string(),
    email: z.email(),
  }),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
