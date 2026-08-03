import { z } from 'zod';

/** Shared error shape every domain response can fail with. Reused by `@repo/api-sdk` for response parsing. */
export const ErrorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;
