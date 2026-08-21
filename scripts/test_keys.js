const { GoogleGenerativeAI } = require('@google/generative-ai');

const keys = [
  process.env.GEMINI_API_KEY || '',
  process.env.GEMINI_API_KEY || '',
  process.env.GEMINI_API_KEY || '',
  process.env.GEMINI_API_KEY || '',
  'AIzaSyCjagu5qgBIdlX45x0O5HaMfj8E3a55Q_M',
  'AIzaSyBbQb2mmAGu1VoyJmrpO17tFMk8bXvECzk'
];

async function checkKeys() {
  console.log('Testing each Gemini API Key...');
  const workingKeys = [];

  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const short = k.substring(0, 14) + '...';
    try {
      const genAI = new GoogleGenerativeAI(k);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const res = await model.generateContent('Say "OK"');
      const txt = (await res.response).text();
      console.log(`Key ${i + 1} (${short}): ✅ VALID (${txt.trim().substring(0, 20)})`);
      workingKeys.push(k);
    } catch (e) {
      console.log(`Key ${i + 1} (${short}): ❌ ERROR (${e.message.substring(0, 80)})`);
    }
  }

  console.log(`\nWorking keys: ${workingKeys.length} / ${keys.length}`);
  return workingKeys;
}

checkKeys().catch(console.error);
