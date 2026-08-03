import { z } from 'zod';

export { ErrorEnvelopeSchema as CmsErrorSchema } from '../errors/envelope';
export type { ErrorEnvelope as CmsError } from '../errors/envelope';

export const CmsPageRequestSchema = z.object({
  slug: z.string(),
});

export const CmsPageResponseSchema = z.object({
  slug: z.string(),
  title: z.string(),
  blocks: z.array(z.record(z.string(), z.unknown())),
});

export type CmsPageRequest = z.infer<typeof CmsPageRequestSchema>;
export type CmsPageResponse = z.infer<typeof CmsPageResponseSchema>;
