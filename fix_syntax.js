const fs = require('fs');
const cp = require('child_process');

// Restore drivo
cp.execSync('git checkout 92472f41 -- "apps/web/src/app/(dashboard)/drivo/page.tsx"');
// Restore teacho
cp.execSync('git checkout 9030d159 -- "apps/web/src/components/teacho/StudentOnboardingWebModal.tsx"');

// Fix drivo
let file1 = 'apps/web/src/app/(dashboard)/drivo/page.tsx';
let txt1 = fs.readFileSync(file1, 'utf8');

txt1 = txt1.replace(
  /const \{ data \} = await supabase\s*\.from\('drivers'\)\s*\.select\('\*'\)\s*\.eq\('user_id', currentUser\.id\)\s*\.maybeSingle\(\);/,
  `const rawPhone = currentUser.phone || profile?.phone || '';
        const cleanPhone = rawPhone.replace(/\\D/g, '').slice(-10);
        const res = await fetch('/api/drivers/phone/' + cleanPhone);
        const data = res.ok ? await res.json() : null;`
);

txt1 = txt1.replace(
  /await supabase\.from\('drivers'\)\.update\(\{[\s\S]*?pickup_latitude: latitude,[\s\S]*?pickup_longitude: longitude,[\s\S]*?updated_at: new Date\(\)\.toISOString\(\)[\s\S]*?\}\)\.eq\('id', driverRecord\.id\);/,
  `await fetch('/api/drivers/location', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ driver_id: driverRecord.id, latitude, longitude })
          });`
);

txt1 = txt1.replace(
  /await supabase\.from\('drivers'\)\.update\(\{ status: 'busy' \}\)\.eq\('id', driverRecord\.id\);/,
  `await fetch('/api/drivers/' + driverRecord.id + '/status', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'busy' })
          });`
);

txt1 = txt1.replace(
  /await supabase\.from\('drivers'\)\.update\(\{ status: 'online' \}\)\.eq\('user_id', currentUser\.id\);/g,
  `if (driverRecord?.id) {
          await fetch('/api/drivers/' + driverRecord.id + '/status', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'online' })
          });
        }`
);

txt1 = txt1.replace(
  /await supabase\.from\('rides'\)\.update\(\{ status: 'completed' \}\)\.eq\('id', activeOrder\.id\);/g,
  `await fetch('/api/rides/' + activeOrder.id + '/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });`
);

txt1 = txt1.replace(
  /await supabase\.from\('rides'\)\.update\(\{ status: 'driver_arrived' \}\)\.eq\('id', activeOrder\.id\);/g,
  `await fetch('/api/rides/' + activeOrder.id + '/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'driver_arrived' })
      });`
);

txt1 = txt1.replace(
  /await supabase\.from\('rides'\)\.update\(\{ status: 'in_progress'[\s\S]*?\}\)\.eq\('id', activeOrder\.id\);/g,
  `await fetch('/api/rides/' + activeOrder.id + '/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_progress' })
      });`
);

txt1 = txt1.replace(
  /const \{ error \} = await supabase[\s\S]*?\.from\('rides'\)[\s\S]*?\.update\(\{[\s\S]*?driver_id: driverRecord\.id,[\s\S]*?status: 'accepted',[\s\S]*?otp: tripOtp[\s\S]*?\}\)[\s\S]*?\.eq\('id', ride\.id\);/,
  `const res = await fetch('/api/rides/' + ride.id + '/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted', driver_id: driverRecord.id, otp: tripOtp })
      });
      const error = res.ok ? null : new Error('Failed');`
);

txt1 = txt1.replace(
  /const channel = supabase[\s\S]*?public:rides:driver_[\s\S]*?supabase\.removeChannel\(channel\);\n    \};/g,
  `// Replaced with interval polling for new rides
      const interval = setInterval(async () => {
        try {
          const res = await fetch('/api/rides/pending?driver_id=' + driverRecord?.id);
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

fs.writeFileSync(file1, txt1);

// Fix teacho
let file2 = 'apps/web/src/components/teacho/StudentOnboardingWebModal.tsx';
let txt2 = fs.readFileSync(file2, 'utf8');

txt2 = txt2.replace(
  /const \{ error \} = await supabase\s*\.from\('profiles'\)\s*\.update\(\{\s*onboarding_completed: true,\s*full_name: fullName\.trim\(\),\s*current_course_id: finalCourse,\s*board: selectedBoard\s*\}\)\s*\.eq\('id', user\.id\);/,
  `const cleanPhone = (user.phone || '').replace(/\\D/g, '').slice(-10);
      if (cleanPhone) {
        await fetch('/api/profiles/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: cleanPhone,
            full_name: fullName.trim(),
            course_id: finalCourse,
            board: selectedBoard
          })
        });
      }
      const error = null;`
);

fs.writeFileSync(file2, txt2);

console.log('Restored and cleanly replaced OCI APIs in Drivo and Teacho!');
