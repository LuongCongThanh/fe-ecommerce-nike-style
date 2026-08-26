import { z } from 'zod';

/**
 * RBAC baseline for `apps/admin`/`apps/cms` (issue #18/#24) — this file *is* the source of truth for
 * roles/permissions in this repo. The issue text references an `rbac-matrix.md` that doesn't exist
 * anywhere in the repo; the matrix below is inferred from the acceptance criteria of issues #18–#29
 * (each permission below is used to gate a specific screen described in one of those issues) and
 * should be reconciled with the real doc if/when it's written.
 */
export const StaffRoleSchema = z.enum(['SUPER_ADMIN', 'ADMIN_STAFF', 'CMS_EDITOR']);

export const PERMISSIONS = [
  // Admin — catalog (#19)
  'catalog:read',
  'catalog:write',
  // Admin — category (#20)
  'category:read',
  'category:write',
  // Admin — inventory (#21)
  'inventory:read',
  'inventory:update',
  // Admin — order (#22) — approve-return is deliberately its own permission, separate from order:update
  'order:read',
  'order:update',
  'order:approve-return',
  // Admin — staff/role management (#23) — assign-role is deliberately its own permission, separate from staff:update
  'staff:read',
  'staff:create',
  'staff:update',
  'staff:delete',
  'staff:assign-role',
  // CMS — content (#25–#29) — publish/unpublish deliberately separate from content:write
  'content:read',
  'content:write',
  'content:publish',
  'content:unpublish',
] as const;

export const PermissionSchema = z.enum(PERMISSIONS);

const ADMIN_STAFF_PERMISSIONS: readonly Permission[] = [
  'catalog:read',
  'catalog:write',
  'category:read',
  'category:write',
  'inventory:read',
  'inventory:update',
  'order:read',
  'order:update',
  'order:approve-return',
];

const CMS_EDITOR_PERMISSIONS: readonly Permission[] = ['content:read', 'content:write', 'content:publish', 'content:unpublish'];

const STAFF_MANAGEMENT_PERMISSIONS: readonly Permission[] = ['staff:read', 'staff:create', 'staff:update', 'staff:delete', 'staff:assign-role'];

/**
 * SUPER_ADMIN is listed with every permission below, not a separate "bypass-all" code path — issue
 * #23's acceptance criteria is explicit about this ("SUPER_ADMIN chỉ là một Role liệt kê đủ permission,
 * không phải nhánh code riêng").
 */
export const ROLE_PERMISSIONS: Record<StaffRole, readonly Permission[]> = {
  ADMIN_STAFF: ADMIN_STAFF_PERMISSIONS,
  CMS_EDITOR: CMS_EDITOR_PERMISSIONS,
  SUPER_ADMIN: Array.from(new Set([...ADMIN_STAFF_PERMISSIONS, ...CMS_EDITOR_PERMISSIONS, ...STAFF_MANAGEMENT_PERMISSIONS])),
};

/** The effective permission set for a Staff assigned multiple Roles is the union of each Role's permissions (issue #23). */
export function resolvePermissions(roles: readonly StaffRole[]): Permission[] {
  return Array.from(new Set(roles.flatMap((role) => ROLE_PERMISSIONS[role])));
}

export const StaffSchema = z.object({
  id: z.number(),
  email: z.email(),
  name: z.string(),
  roles: z.array(StaffRoleSchema).min(1),
  isActive: z.boolean(),
});

export const StaffMeResponseSchema = z.object({
  staff: StaffSchema,
  permissions: z.array(PermissionSchema),
});

export const StaffSessionResponseSchema = StaffMeResponseSchema.extend({
  access: z.string(),
  refresh: z.string(),
});

export type StaffRole = z.infer<typeof StaffRoleSchema>;
export type Permission = z.infer<typeof PermissionSchema>;
export type Staff = z.infer<typeof StaffSchema>;
export type StaffMeResponse = z.infer<typeof StaffMeResponseSchema>;
export type StaffSessionResponse = z.infer<typeof StaffSessionResponseSchema>;
