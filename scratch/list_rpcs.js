require('dotenv').config({ path: 'apps/web/.env.local' });

async function check() {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/?apikey=${process.env.SUPABASE_SERVICE_ROLE_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const rpcs = Object.keys(data.paths || {}).filter(k => k.startsWith('/rpc/'));
  console.log('Available RPCs in Supabase:', rpcs);
}

check();
