const https = require('https');

const keys = [
  process.env.GEMINI_API_KEY || '',
  process.env.GEMINI_API_KEY || '',
  process.env.GEMINI_API_KEY || '',
  process.env.GEMINI_API_KEY || ''
];

const candidateModels = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite-preview',
  'gemini-3.1-flash-lite',
  'gemini-3.7-flash',
  'gemini-2.5-pro',
  'gemini-pro-latest'
];

async function testModel(m, k) {
  const postData = JSON.stringify({
    contents: [{ parts: [{ text: 'Respond with valid json: {"status": "ok"}' }] }],
    generationConfig: { responseMimeType: 'application/json' }
  });
  return new Promise(resolve => {
    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: '/v1beta/models/' + m + ':generateContent?key=' + k,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 10000
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ model: m, key: k.substring(0, 10), status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ model: m, key: k.substring(0, 10), status: 'ERR', body: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ model: m, key: k.substring(0, 10), status: 'TIMEOUT' }); });
    req.write(postData);
    req.end();
  });
}

(async () => {
  for (const m of candidateModels) {
    for (const k of keys) {
      const res = await testModel(m, k);
      console.log(m, res.key, '=>', res.status, res.status === 200 ? 'OK' : res.body.substring(0, 70).replace(/\n/g, ' '));
      if (res.status === 200) break; // model works with at least one key
    }
  }
})();
