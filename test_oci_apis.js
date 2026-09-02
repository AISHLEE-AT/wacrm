const http = require('http');

async function testEndpoint(name, url, options = {}) {
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = text;
    }
    
    if (res.ok) {
      console.log('[OK] ' + name + ' PASSED (' + res.status + ')');
      if (Array.isArray(data)) {
         console.log('    -> Returned ' + data.length + ' items.');
      } else if (typeof data === 'object') {
         console.log('    -> Returned object with keys: ' + Object.keys(data).join(', '));
      }
    } else {
      console.log('[FAIL] ' + name + ' FAILED (' + res.status + ')');
      console.log('    -> Error: ' + text);
    }
  } catch (err) {
    console.log('[ERROR] ' + name + ' FAILED (Network/Code Error)');
    console.log('    -> ' + err.message);
  }
}

async function runTests() {
  const BASE_URL = 'http://152.67.7.216:8080';
  console.log('--- STARTING OCI BACKEND TESTS ---\\n');
  
  // 1. Rideo
  await testEndpoint('Rideo - Get Rides', BASE_URL + '/api/rides');
  
  // 2. DriveO
  await testEndpoint('DriveO - Get Pending Rides', BASE_URL + '/api/rides/pending');
  await testEndpoint('DriveO - Get Driver by Phone', BASE_URL + '/api/drivers/phone/9999999999'); // Should be 404 or empty
  
  // 3. DealO
  await testEndpoint('DealO - Get Listings', BASE_URL + '/api/dealo/listings');
  
  // 4. RentO
  await testEndpoint('RentO - Get Machinery', BASE_URL + '/api/rento/machinery');
  
  // 5. GroupO
  await testEndpoint('GroupO - Get Groups', BASE_URL + '/api/groupo/groups');
  await testEndpoint('GroupO - Get Status', BASE_URL + '/api/groupo/status?phone=9443110101');
  
  // 6. Tuto
  await testEndpoint('Tuto - QBank Search', BASE_URL + '/api/qbank/search?query=test');
  
  // 7. Fago
  await testEndpoint('Fago (Agro) - Get Media', BASE_URL + '/api/agro/media');
  
  console.log('\\n--- TESTS COMPLETE ---');
}

runTests();
