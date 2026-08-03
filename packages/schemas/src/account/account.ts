import { z } from 'zod';

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
