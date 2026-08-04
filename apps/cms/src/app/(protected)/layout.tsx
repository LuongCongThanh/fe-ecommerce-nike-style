/** Khung only — RBAC enforcement is a separate slice (see issue #24, "CMS: Auth/RBAC shell"). */
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
