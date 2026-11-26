import { z } from 'zod';

export const profileSchema = z.object({
  firstName: z.string().min(1, 'Vui lòng nhập tên'),
  lastName: z.string().min(1, 'Vui lòng nhập họ'),
  phone: z.string().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
