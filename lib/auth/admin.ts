/**
 * Single helper for "is this user an admin?". Reads ADMIN_USER_IDS
 * (comma-separated Supabase user IDs). Empty/unset => nobody is admin
 * (safe default until Rev signs in once and we capture his ID).
 */
export function isAdminUserId(userId: string | null | undefined): boolean {
  if (!userId) return false;
  const ids = (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return ids.includes(userId);
}
