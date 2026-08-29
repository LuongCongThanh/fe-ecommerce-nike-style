import { createBetterAuthModule } from '@repo/shared/better-auth';
import { useNavigate } from '@tanstack/react-router';

// `createAuthClient` requires an absolute URL (it does `new URL(baseURL)` internally) — a bare path
// like '/api/auth' throws "Invalid base URL". Same-origin default resolves against the page's own
// origin instead; set VITE_BETTER_AUTH_URL to a full URL for a backend on a different origin.
const BETTER_AUTH_URL = (import.meta.env.VITE_BETTER_AUTH_URL as string | undefined) ?? `${window.location.origin}/api/auth`;

/**
 * Staff session/auth — now backed by Better Auth (`@repo/shared/better-auth`), replacing Clerk
 * (which itself replaced the original cookie/JWT `@repo/shared/staff-auth` module). See that
 * module's own doc comment for the gaps this swap leaves open (roles field, backend server).
 *
 * Same export shape as before (`useStaffAuth`, `StaffAuthGuard`, `StaffAuthRuntimeProvider`) so
 * every existing consumer (AppShell, UserMenu, NavCommandMenu, routes/login.tsx) keeps working
 * unchanged — this file is still the only place admin declares "which router, which auth server URL".
 */
export const { useStaffAuth, StaffAuthGuard, StaffAuthRuntimeProvider } = createBetterAuthModule({
  baseURL: BETTER_AUTH_URL,
  useRouter: () => {
    const navigate = useNavigate();
    return { push: (href: string) => void navigate({ to: href }) };
  },
});
