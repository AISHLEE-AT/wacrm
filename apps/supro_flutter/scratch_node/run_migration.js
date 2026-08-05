const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Gameo Supabase direct PostgreSQL connection
const client = new Client({
  host: 'db.maznlybuvhcobppndxsg.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Poovisri2016@',
  ssl: { rejectUnauthorized: false },
});

async function runMigration() {
  console.log('🔌 Connecting to Gameo Supabase DB...');
  await client.connect();
  console.log('✅ Connected!\n');

  const sqlFile = path.join(__dirname, '..', 'gameo_ecommerce_bridge.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  // Split into individual statements and run each
  // Split on semicolons but keep dollar-quoted blocks intact
  const statements = [];
  let current = '';
  let inDollarQuote = false;

  const lines = sql.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('--')) {
      continue; // skip comment-only lines
    }

    if (line.includes('$$')) {
      inDollarQuote = !inDollarQuote;
    }

    current += line + '\n';

    if (!inDollarQuote && trimmed.endsWith(';')) {
      const stmt = current.trim();
      if (stmt && stmt !== ';') {
        statements.push(stmt);
      }
      current = '';
    }
  }

  console.log(`📋 Found ${statements.length} SQL statements to execute.\n`);

  let success = 0;
  let errors = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.substring(0, 60).replace(/\n/g, ' ').trim();
    try {
      await client.query(stmt);
      console.log(`✅ [${i + 1}/${statements.length}] ${preview}...`);
      success++;
    } catch (err) {
      console.error(`❌ [${i + 1}/${statements.length}] ${preview}...`);
      console.error(`   Error: ${err.message}\n`);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ ${success} statements succeeded`);
  if (errors > 0) {
    console.log(`❌ ${errors} statements failed`);
  } else {
    console.log('🎉 ALL STATEMENTS EXECUTED SUCCESSFULLY!');
  }
  console.log('='.repeat(60));

  // Verify tables exist
  console.log('\n🔍 Verifying tables...');
  const tables = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('user_game_balances', 'game_rewards')
    ORDER BY table_name;
  `);
  console.log('Tables found:', tables.rows.map(r => r.table_name));

  // Verify functions exist
  const funcs = await client.query(`
    SELECT routine_name FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name IN ('sync_offline_points', 'get_user_balance', 'redeem_points')
    ORDER BY routine_name;
  `);
  console.log('RPCs found:  ', funcs.rows.map(r => r.routine_name));

  await client.end();
  console.log('\n🔌 Connection closed. Database is ready!');
}

runMigration().catch(err => {
  console.error('Fatal error:', err.message);
  client.end();
  process.exit(1);
});
