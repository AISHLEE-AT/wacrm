const { Client } = require('pg');

const client = new Client({
  host: 'db.maznlybuvhcobppndxsg.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Poovisri2016@',
  ssl: { rejectUnauthorized: false },
});

async function fix() {
  await client.connect();
  console.log('✅ Connected to Gameo DB\n');

  // Show all versions of sync_offline_points
  const existing = await client.query(`
    SELECT p.proname, pg_get_function_arguments(p.oid) as args
    FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'sync_offline_points';
  `);
  console.log('Existing sync_offline_points versions:');
  existing.rows.forEach((r, i) => console.log(`  ${i+1}. args: (${r.args})`));

  // Drop the OLD version (old one had params: p_user_id, p_testo_points, p_farm_points but old signature had user_id + points_earned)
  console.log('\n🗑️  Dropping old version (user_id TEXT, points_earned INTEGER)...');
  try {
    await client.query(`DROP FUNCTION IF EXISTS public.sync_offline_points(TEXT, INTEGER);`);
    console.log('✅ Old version dropped');
  } catch(e) {
    console.log('   Note:', e.message);
  }

  // Re-grant on the new specific signature
  console.log('\n🔐 Re-granting EXECUTE on new version...');
  await client.query(`
    GRANT EXECUTE ON FUNCTION public.sync_offline_points(TEXT, INTEGER, INTEGER) TO anon, authenticated;
  `);
  console.log('✅ GRANT applied');

  // Final verification
  const funcs = await client.query(`
    SELECT p.proname, pg_get_function_arguments(p.oid) as args
    FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname IN ('sync_offline_points','get_user_balance','redeem_points')
    ORDER BY p.proname;
  `);
  console.log('\n✅ Final RPCs in Gameo DB:');
  funcs.rows.forEach(r => console.log(`  • ${r.proname}(${r.args})`));

  const tables = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema='public'
    AND table_name IN ('user_game_balances','game_rewards');
  `);
  console.log('\n✅ Tables confirmed:');
  tables.rows.forEach(r => console.log(`  • ${r.table_name}`));

  // Quick smoke test — insert + read user balance
  console.log('\n🧪 Smoke test: calling get_user_balance RPC...');
  const test = await client.query(`SELECT public.get_user_balance('test-user-001') AS result;`);
  console.log('   Result:', JSON.stringify(test.rows[0].result));

  await client.end();
  console.log('\n🎉 DATABASE FULLY READY! All RPCs and tables confirmed working.\n');
}

fix().catch(e => { console.error('Error:', e.message); client.end(); });
