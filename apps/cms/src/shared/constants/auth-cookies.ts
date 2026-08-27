/** Mirrors apps/admin's ADMIN_ACCESS_TOKEN_COOKIE — a separate cookie so the two staff sessions
 * (admin vs cms) don't collide when both apps run under the same origin/dev host. */
export const CMS_ACCESS_TOKEN_COOKIE = 'cms_access_token';
