// Unified admin identifier list — used as BOOTSTRAP FALLBACK ONLY.
// Primary source of truth is profiles.role = 'admin' in the database.
// Adding 9123596988 which was missing from web (present in Flutter/Kotlin).
export const BOOTSTRAP_ADMIN_PHONES = [
  '6381029380',
  '916381029380',
]

export const BOOTSTRAP_ADMIN_EMAILS = [
  'aishleetechnology@gmail.com',
]

/** @deprecated Use BOOTSTRAP_ADMIN_PHONES */
export const ADMIN_IDENTIFIERS = [...BOOTSTRAP_ADMIN_PHONES, ...BOOTSTRAP_ADMIN_EMAILS]

/**
 * Checks if a user is an admin.
 * Priority: DB role field > bootstrap phone/email list.
 * All callers should prefer the DB role check; this function
 * is the final cross-platform safety net.
 */
export function checkIsAdmin(
  userOrPhoneOrEmail?: any,
  profile?: { role?: string | null; phone?: string | null; email?: string | null; whatsapp?: string | null }
): boolean {
  // 1. DB role is primary source of truth
  const role = profile?.role?.toLowerCase()
  if (role === 'admin') return true

  // 2. Bootstrap fallback for phones
  const rawString = typeof userOrPhoneOrEmail === 'string' ? userOrPhoneOrEmail : ''
  const candidates = [
    userOrPhoneOrEmail?.email,
    userOrPhoneOrEmail?.phone,
    profile?.email,
    profile?.phone,
    profile?.whatsapp,
    rawString,
  ].filter(Boolean).join(' ')

  return [
    ...BOOTSTRAP_ADMIN_PHONES,
    ...BOOTSTRAP_ADMIN_EMAILS
  ].some(id => candidates.includes(id))
}
