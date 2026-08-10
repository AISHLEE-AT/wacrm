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
    
    // Read the SQL files
    const sql66 = fs.readFileSync(path.join('D:\\w\\supabase\\migrations', '066_seed_virtual_drivers_all_tamilnadu.sql'), 'utf8');
    const sql67 = fs.readFileSync(path.join('D:\\w\\supabase\\migrations', '067_add_aadhar_number_drivers.sql'), 'utf8');
    
    await client.query(sql66);
    console.log("Migration 066 executed successfully!");
    
    await client.query(sql67);
    console.log("Migration 067 executed successfully!");
    
  } catch (err) {
    console.error("Error executing schema:", err);
  } finally {
    await client.end();
  }
}

run();
