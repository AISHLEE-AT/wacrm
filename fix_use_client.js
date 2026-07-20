const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('import ') && !content.includes("'use client'") && !content.includes('"use client"')) {
                content = "'use client';\n" + content;
                fs.writeFileSync(fullPath, content);
                console.log(`Added use client to: ${fullPath}`);
            }
        }
    }
}
processDir('C:/Users/fastg/.gemini/antigravity/scratch/wacrm/apps/web/src/aishlee/components');
processDir('C:/Users/fastg/.gemini/antigravity/scratch/wacrm/apps/web/src/aishlee/context');
