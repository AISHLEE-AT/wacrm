const fs = require('fs');
let file = 'D:/w/apps/web/src/app/(dashboard)/rideo/page.tsx';
let text = fs.readFileSync(file, 'utf8');

// Replace ride insert
text = text.replace(
  /const \{ data: rideRecord, error \} = await supabase[\s\S]*?\.insert\(\{[\s\S]*?\}\)[\s\S]*?\.select\(\)\.single\(\);/,
  `const rideReq = await fetch('http://152.67.7.216:8080/api/rides', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_phone: passengerPhone,
            service_type: selectedCategory.id,
            pickup_address: pickupAddress,
            pickup_lat: pickup[0],
            pickup_lng: pickup[1],
            dropoff_address: dropoffAddress,
            dropoff_lat: dropoff[0],
            dropoff_lng: dropoff[1],
            distance_km: distanceKm,
            estimated_fare: estimatedFare
          })
        });
        const error = rideReq.ok ? null : new Error('Failed');
        const rideRecord = rideReq.ok ? await rideReq.json() : null;
        if (rideRecord) { rideRecord.otp = otp; }`
);

// Replace realtime polling (there is a useEffect doing polling or channel)
text = text.replace(
  /const \{ data \} = await supabase\.from\('rides'\)\.select\('\*'\)\.eq\('id', rideRecord\.id\)\.maybeSingle\(\);/,
  `const res = await fetch('http://152.67.7.216:8080/api/rides/' + rideRecord.id);
          const data = res.ok ? await res.json() : null;`
);

// Replace expired update
text = text.replace(
  /supabase\.from\('rides'\)\.update\(\{ status: 'expired' \}\)\.eq\('id', rideRecord\.id\)\.then\(\(\) => \{\}\);/,
  `fetch('http://152.67.7.216:8080/api/rides/' + rideRecord.id + '/status', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'expired' })
            }).catch(() => {});`
);

// Replace cancel update
text = text.replace(
  /await supabase\.from\('rides'\)\.update\(\{ status: 'cancelled' \}\)\.eq\('id', currentRide\.id\);/,
  `await fetch('http://152.67.7.216:8080/api/rides/' + currentRide.id + '/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });`
);

fs.writeFileSync(file, text);
console.log('Rideo updated.');
