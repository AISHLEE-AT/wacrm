const fs = require('fs'); 
const file = 'C:/Users/fastg/.gemini/antigravity/scratch/wacrm/apps/web/src/app/(aishlee)/admin/course-builder/page.tsx'; 
let content = fs.readFileSync(file, 'utf8'); 
content = content.replace(/apiKey\)/g, "apiKey || '')"); 
content = content.replace(/apiKey \|\| '' \|\| ''\)/g, "apiKey || '')");
fs.writeFileSync(file, content);
