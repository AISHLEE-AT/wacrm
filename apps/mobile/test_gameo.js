const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://maznlybuvhcobppndxsg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hem5seWJ1dmhjb2JwcG5keHNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4OTc0NDAsImV4cCI6MjEwMTQ3MzQ0MH0.h47SZoRDleIEEo-Ms0cLLI67bEbFlIRTta_wXmvZoFc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testGameO() {
  console.log("🚀 Testing GameO Database Connection & Schema...");

  const mockPlayerId = '00000000-0000-0000-0000-000000000000'; // Random UUID for testing

  const mockRace = {
    player_id: mockPlayerId,
    mode: 'bike',
    distance_km: 2.5,
    duration_seconds: 300,
    start_location: { lat: 13.0827, lng: 80.2707 },
    telemetry: [
      { lat: 13.0827, lng: 80.2707, timestamp: Date.now(), speed: 0 },
      { lat: 13.0830, lng: 80.2710, timestamp: Date.now() + 1000, speed: 12 },
    ]
  };

  console.log("\n1️⃣  Attempting to INSERT a mock Ghost Race...");
  const { data: insertData, error: insertError } = await supabase
    .from('ghost_races')
    .insert([mockRace])
    .select();

  if (insertError) {
    console.error("❌ INSERT Error:", insertError);
    return;
  }
  console.log("✅ INSERT Successful! ID:", insertData[0].id);

  console.log("\n2️⃣  Attempting to FETCH Ghost Races...");
  const { data: fetchData, error: fetchError } = await supabase
    .from('ghost_races')
    .select('*')
    .eq('mode', 'bike')
    .limit(5);

  if (fetchError) {
    console.error("❌ FETCH Error:", fetchError);
    return;
  }
  console.log(`✅ FETCH Successful! Found ${fetchData.length} ghost races.`);
  console.log("Latest Race Data:", JSON.stringify(fetchData[0].start_location));

  console.log("\n🎉 ALL TESTS PASSED! The GameO database is fully functional.");
}

testGameO();
