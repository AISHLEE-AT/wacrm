// @wacrm/shared core module
// This file exports types, utilities, and constants shared between Web and Mobile.

export const SHARED_VERSION = "1.0.3-beta";

// Example shared type
export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  role: 'admin' | 'user';
}

// More shared logic (Supabase client, queries) will be migrated here.
