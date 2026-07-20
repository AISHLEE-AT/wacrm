const fs = require('fs'); 
const f = 'C:/Users/fastg/.gemini/antigravity/scratch/wacrm/apps/web/src/aishlee/services/geminiService.js'; 
let c = fs.readFileSync(f, 'utf8'); 
c = c.replace(/userApiKey = null/g, "userApiKey = ''"); 
fs.writeFileSync(f, c);
console.log("Fixed geminiService");
