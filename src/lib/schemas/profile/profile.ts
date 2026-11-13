import { z } from 'zod';

/** The signed-in Customer's own account profile. Login/Register/Reset-Password *input* schemas stay
 * storefront-local (they're form shapes, not something the API returns) — this is the DTO the backend
 * actually sends back for `GET /api/auth/me/`. */
export const ProfileSchema = z.object({
  id: z.number(),
  email: z.email(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().optional(),
  avatar: z.string().nullable(),
  role: z.enum(['customer', 'admin', 'staff']),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
});

export const ProfileUpdateInputSchema = ProfileSchema.partial();

export type Profile = z.infer<typeof ProfileSchema>;
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateInputSchema>;
