const fs = require('fs');
const file = 'D:/w/apps/web/src/app/book/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace driver location polling
content = content.replace(
  /const { data: driver } = await supabase\.from\('drivers'\)\.select\('pickup_latitude, pickup_longitude'\)\.eq\('id', activeRide\.driver_id\)\.maybeSingle\(\);/,
  `const res = await fetch('http://152.67.7.216:8080/api/drivers/' + activeRide.driver_id);
   const driver = res.ok ? await res.json() : null;`
);

// Replace search drivers
content = content.replace(
  /const { data, error } = await supabase\.rpc\('get_nearby_drivers', {[\s\S]*?}\)/,
  `const res = await fetch(\`http://152.67.7.216:8080/api/drivers/nearby?lat=\${pickup[0]}&lng=\${pickup[1]}&radius_km=100\`);
   const data = res.ok ? await res.json() : null;
   const error = res.ok ? null : new Error('Failed to fetch from OCI');`
);

// Replace ride insert
content = content.replace(
  /const { data: rideResponse, error } = await supabase\.from\('rides'\)\.insert\({[\s\S]*?}\)\.select\(\)\.single\(\)/,
  `const rideReq = await fetch('http://152.67.7.216:8080/api/rides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_phone: passengerPhone,
        service_type: driver.vehicle_type,
        pickup_address: \`GPS: \${pickup![0].toFixed(4)}, \${pickup![1].toFixed(4)}\`,
        pickup_lat: pickup![0],
        pickup_lng: pickup![1],
        dropoff_address: \`GPS: \${dropoff![0].toFixed(4)}, \${dropoff![1].toFixed(4)}\`,
        dropoff_lat: dropoff![0],
        dropoff_lng: dropoff![1],
        distance_km: tripKm.toFixed(1),
        estimated_fare: price
      })
   });
   const error = rideReq.ok ? null : new Error('Failed to insert ride in OCI');
   const rideResponse = rideReq.ok ? await rideReq.json() : null;`
);

// Remove realtime subscription and replace with polling
content = content.replace(
  /\/\/ Setup Realtime listener[\s\S]*?\.subscribe\(\)/,
  `// Setup Polling (Replaces Supabase Realtime)
      const pollInterval = setInterval(async () => {
        try {
          const checkRes = await fetch('http://152.67.7.216:8080/api/rides/' + rideResponse.id);
          if (checkRes.ok) {
            const updatedRide = await checkRes.json();
            if (updatedRide.status === 'declined') {
               alert('The driver has declined the ride request.');
               setActiveRide(null);
               setDriverETA(null);
               clearInterval(pollInterval);
            } else if (updatedRide.status !== 'requested') {
               setActiveRide(updatedRide);
            }
          }
        } catch (err) {}
      }, 5000);`
);

fs.writeFileSync(file, content);
console.log('BookRidePage updated successfully!');
