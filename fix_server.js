const fs = require('fs');
let file = 'D:/Supro/backend/server.js';
let text = fs.readFileSync(file, 'utf8');

// 1. Move GET /api/rides/pending ABOVE GET /api/rides/:id
const pendingBlock = `// 10. Get Pending Rides
app.get('/api/rides/pending', async (req, res) => {
  try {
    const result = await pool.query(\`SELECT * FROM rides WHERE status = 'requested'\`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});`;

text = text.replace(pendingBlock, ''); // Remove it from the bottom

text = text.replace(
  /\/\/ 5\. Get single ride/,
  `${pendingBlock}\n\n// 5. Get single ride`
);

// 2. Add GET /api/rides if it's missing
if (!text.includes("app.get('/api/rides',")) {
  text = text.replace(
    /\/\/ 5\. Get single ride/,
    `// 4.5. Get all rides
app.get('/api/rides', async (req, res) => {
  try {
    const result = await pool.query(\`SELECT * FROM rides ORDER BY created_at DESC\`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});\n\n// 5. Get single ride`
  );
}

fs.writeFileSync(file, text);
console.log('server.js fixed!');
