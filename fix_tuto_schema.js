const fs = require('fs');
let text = fs.readFileSync('D:/Supro/backend/schema_tuto_lms.sql', 'utf8');

// Remove all lines referencing Supabase-specific roles and RLS policies
const lines = text.split('\n');
const cleaned = lines.filter(line => {
  const lower = line.toLowerCase();
  if (lower.includes('enable row level security')) return false;
  if (lower.includes('create policy')) return false;
  if (lower.includes('drop policy')) return false;
  if (lower.includes('to anon')) return false;
  if (lower.includes('to authenticated')) return false;
  if (lower.includes('auth.uid()')) return false;
  if (lower.includes('auth.role()')) return false;
  return true;
});

// Also remove BEGIN/COMMIT transaction wrappers (OCI runs each schema file in auto-commit)
let result = cleaned.join('\n');
result = result.replace(/^BEGIN;\s*$/gm, '');
result = result.replace(/^COMMIT;\s*$/gm, '');

// Remove uuid-ossp extension (we use gen_random_uuid which is built-in to PG15)
result = result.replace(/CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\s*/g, '');
// pg_trgm is fine to keep

fs.writeFileSync('D:/Supro/backend/schema_tuto_lms.sql', result);
console.log('Cleaned Tuto schema - removed RLS, anon roles, BEGIN/COMMIT');
