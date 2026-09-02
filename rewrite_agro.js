const fs = require('fs');
let file = 'D:/w/apps/web/src/app/(dashboard)/agro/page.tsx';
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  /const supabase = createClient\(\);[\s\S]*?const \{ data \} = await supabase[\s\S]*?\.from\('unified_master_data'\)[\s\S]*?\.order\('created_at', \{ ascending: false \}\);/,
  `// Fetch from OCI instead of Supabase
        const res = await fetch('http://152.67.7.216:8080/api/agro/media');
        const data = res.ok ? await res.json() : [];`
);

fs.writeFileSync(file, text);
console.log('Agro rewritten.');
