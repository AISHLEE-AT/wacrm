const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const connectionString = 'postgres://postgres:Poovisri2016@@db.maznlybuvhcobppndxsg.supabase.co:5432/postgres';

const client = new Client({
  connectionString: connectionString,
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to Supabase DB successfully!");
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'sync_points_rpc.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await client.query(sql);
    console.log("Offline Sync RPC Schema executed successfully!");
    
  } catch (err) {
    console.error("Error executing schema:", err);
  } finally {
    await client.end();
  }
}

run();
