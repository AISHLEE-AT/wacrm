export const ADMIN_IDENTIFIERS = [
  "9486335870",
  "919486335870",
  "aishleetechnology@gmail.com",
];

export function checkIsAdmin(userOrPhoneOrEmail?: any, profile?: any): boolean {
  if (profile?.role === "admin" || profile?.role === "ADMIN") return true;

  const rawString = typeof userOrPhoneOrEmail === "string" ? userOrPhoneOrEmail : "";
  const text = [
    userOrPhoneOrEmail?.email,
    userOrPhoneOrEmail?.phone,
    profile?.email,
    profile?.phone,
    profile?.whatsapp,
    rawString,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return ADMIN_IDENTIFIERS.some((adminId) => text.includes(adminId.toLowerCase()));
}
