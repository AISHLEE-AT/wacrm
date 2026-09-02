const fs = require('fs');
let file = 'D:/w/apps/web/src/app/(dashboard)/drivo/page.tsx';
let text = fs.readFileSync(file, 'utf8');

// The file has a lot of supabase calls. To be safe without breaking the complex UI state,
// I'll replace the core functions.

// 1. Fetch current driver
text = text.replace(
  /const \{ data \} = await supabase[\s\S]*?\.from\('drivers'\)[\s\S]*?\.select\('\*'\)[\s\S]*?\.eq\('user_id', currentUser\.id\)[\s\S]*?\.maybeSingle\(\);/,
  `// Fetch by phone instead of user_id for OCI
        const res = await fetch('http://152.67.7.216:8080/api/drivers/phone/' + cleanPhone);
        const data = res.ok ? await res.json() : null;`
);

// 2. Update location
text = text.replace(
  /await supabase\.from\('drivers'\)\.update\(\{[\s\S]*?pickup_latitude: latitude,[\s\S]*?pickup_longitude: longitude,[\s\S]*?updated_at: new Date\(\)\.toISOString\(\)[\s\S]*?\}\)\.eq\('id', driverRecord\.id\);/,
  `await fetch('http://152.67.7.216:8080/api/drivers/location', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: driverRecord.id, latitude, longitude })
          });`
);

// 3. Mark as busy
text = text.replace(
  /await supabase\.from\('drivers'\)\.update\(\{ status: 'busy' \}\)\.eq\('id', driverRecord\.id\);/,
  `await fetch('http://152.67.7.216:8080/api/drivers/' + driverRecord.id + '/status', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'busy' })
          });`
);

// 4. Mark as online (multiple times)
text = text.replace(
  /await supabase\.from\('drivers'\)\.update\(\{ status: 'online' \}\)\.eq\('user_id', currentUser\.id\);/g,
  `if (driverRecord?.id) {
          await fetch('http://152.67.7.216:8080/api/drivers/' + driverRecord.id + '/status', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'online' })
          });
        }`
);

// 5. Ride status updates (completed, arrived, in_progress)
text = text.replace(
  /await supabase\.from\('rides'\)\.update\(\{ status: 'completed' \}\)\.eq\('id', activeOrder\.id\);/g,
  `await fetch('http://152.67.7.216:8080/api/rides/' + activeOrder.id + '/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });`
);

text = text.replace(
  /await supabase\.from\('rides'\)\.update\(\{ status: 'driver_arrived' \}\)\.eq\('id', activeOrder\.id\);/g,
  `await fetch('http://152.67.7.216:8080/api/rides/' + activeOrder.id + '/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'driver_arrived' })
      });`
);

text = text.replace(
  /await supabase\.from\('rides'\)\.update\(\{ status: 'in_progress'[\s\S]*?\}\)\.eq\('id', activeOrder\.id\);/g,
  `await fetch('http://152.67.7.216:8080/api/rides/' + activeOrder.id + '/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_progress' })
      });`
);

// Accept ride
text = text.replace(
  /const \{ error \} = await supabase[\s\S]*?\.from\('rides'\)[\s\S]*?\.update\(\{[\s\S]*?driver_id: driverRecord\.id,[\s\S]*?status: 'accepted',[\s\S]*?otp: tripOtp[\s\S]*?\}\)[\s\S]*?\.eq\('id', ride\.id\);/,
  `const res = await fetch('http://152.67.7.216:8080/api/rides/' + ride.id + '/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted', driver_id: driverRecord.id, otp: tripOtp })
      });
      const error = res.ok ? null : new Error('Failed');`
);

// Realtime fallback for active order fetch
text = text.replace(
  /const channel = supabase[\s\S]*?public:rides:driver_[\s\S]*?supabase\.removeChannel\(channel\);\n    \};/g,
  `// Replaced with interval polling for new rides
      const interval = setInterval(async () => {
        try {
          const res = await fetch('http://152.67.7.216:8080/api/rides/pending?driver_id=' + driverRecord?.id);
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
               setIncomingRequests(data);
            }
          }
        } catch (e) {}
      }, 5000);
      return () => clearInterval(interval);`
);


fs.writeFileSync(file, text);
console.log('Drivo updated.');
