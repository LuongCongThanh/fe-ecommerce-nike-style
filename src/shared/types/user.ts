import type { AuthUser } from '@/lib/api/endpoints/auth';

/** Shared account contract used by session and profile; form validation belongs to the feature. */
export type User = AuthUser;
