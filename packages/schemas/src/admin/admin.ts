import { z } from 'zod';

import { PaginationMetaSchema, PaginationQuerySchema } from '../common/pagination';

export const StaffSchema = z.object({
  id: z.string(),
  email: z.email(),
  role: z.string(),
});

export const StaffListRequestSchema = PaginationQuerySchema;

export const StaffListResponseSchema = z.object({
  data: z.array(StaffSchema),
  meta: PaginationMetaSchema,
});

export type Staff = z.infer<typeof StaffSchema>;
export type StaffListRequest = z.infer<typeof StaffListRequestSchema>;
export type StaffListResponse = z.infer<typeof StaffListResponseSchema>;
