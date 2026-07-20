const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            content = content.replace(/useState\(null\)/g, "useState<any>(null)");
            content = content.replace(/useState\(''\)/g, "useState<string>('')");
            content = content.replace(/useState\(\[\]\)/g, "useState<any[]>([])");
            // simple catch block fix
            content = content.replace(/catch\s*\(\s*err\s*\)/g, "catch (err: any)");
            // event any fix
            content = content.replace(/handleNotesChange = \(e\)/g, "handleNotesChange = (e: any)");
            // simple event any fix
            content = content.replace(/onChange=\{\(e\) =>/g, "onChange={(e: any) =>");
            content = content.replace(/onSubmit=\{\(e\) =>/g, "onSubmit={(e: any) =>");
            
            // Fix implicitly any params
            content = content.replace(/handleOpenEditor = \(mIdx, tIdx\)/g, 'handleOpenEditor = (mIdx: number, tIdx: number)');
            
            // other specific fixes for course builder
            fs.writeFileSync(fullPath, content);
            console.log(`Processed: ${fullPath}`);
        }
    }
}

processDir('C:/Users/fastg/.gemini/antigravity/scratch/wacrm/apps/web/src/app/(aishlee)');
