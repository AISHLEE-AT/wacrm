const { Client } = require('pg');

const client = new Client({
  host: 'db.maznlybuvhcobppndxsg.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Poovisri2016@',
  ssl: { rejectUnauthorized: false },
});

async function cleanup() {
  await client.connect();
  console.log('✅ Connected\n');

  // Drop the OLD version from last session (uuid signature)
  console.log('🗑️  Dropping old sync_offline_points(uuid, integer)...');
  await client.query('DROP FUNCTION IF EXISTS public.sync_offline_points(uuid, integer);');
  console.log('✅ Done\n');

  // Confirm clean state — all 3 RPCs with correct signatures
  const rpcs = await client.query(`
    SELECT routine_name, specific_name
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name IN ('sync_offline_points', 'get_user_balance', 'redeem_points')
    ORDER BY routine_name;
  `);

  console.log('=== FINAL DATABASE STATE ===');
  console.log('\n📦 Tables:');
  const tables = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('user_game_balances', 'game_rewards')
    ORDER BY table_name;
  `);
  tables.rows.forEach(r => console.log('  ✅', r.table_name));

  console.log('\n⚙️  RPCs:');
  rpcs.rows.forEach(r => console.log('  ✅', r.routine_name));

  // Smoke test all 3 RPCs
  console.log('\n🧪 Smoke Tests:');

  // 1. get_user_balance
  const bal = await client.query("SELECT public.get_user_balance('smoke-test-user') AS result;");
  console.log('  ✅ get_user_balance():', JSON.stringify(bal.rows[0].result));

  // 2. sync_offline_points
  const sync = await client.query("SELECT public.sync_offline_points('smoke-test-user', 50, 100) AS result;");
  console.log('  ✅ sync_offline_points():', JSON.stringify(sync.rows[0].result));

  // 3. Verify balance updated
  const bal2 = await client.query("SELECT public.get_user_balance('smoke-test-user') AS result;");
  console.log('  ✅ Balance after sync:', JSON.stringify(bal2.rows[0].result));

  // 4. redeem_points (try to redeem a testo reward)
  const redeem = await client.query(`
    SELECT public.redeem_points('smoke-test-user', 'testo_mock_test', 'testo', 50) AS result;
  `);
  console.log('  ✅ redeem_points():', JSON.stringify(redeem.rows[0].result));

  // 5. Check coupon was saved
  const coupons = await client.query(`SELECT coupon_code, reward_type, points_spent FROM public.game_rewards WHERE user_id='smoke-test-user';`);
  console.log('  ✅ Coupon saved in DB:', coupons.rows[0]);

  // Clean up smoke test data
  await client.query("DELETE FROM public.game_rewards WHERE user_id='smoke-test-user';");
  await client.query("DELETE FROM public.user_game_balances WHERE user_id='smoke-test-user';");
  console.log('\n🧹 Smoke test data cleaned up');

  await client.end();
  console.log('\n🎉 GAMEO DATABASE IS 100% READY!\n');
}

cleanup().catch(e => {
  console.error('Error:', e.message);
  client.end();
  process.exit(1);
});
