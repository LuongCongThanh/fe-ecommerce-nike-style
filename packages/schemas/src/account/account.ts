import { z } from 'zod';

export { ErrorEnvelopeSchema as AccountErrorSchema } from '../errors/envelope';
export type { ErrorEnvelope as AccountError } from '../errors/envelope';

export const ProfileResponseSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string(),
});

export const UpdateProfileRequestSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
});

export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;
