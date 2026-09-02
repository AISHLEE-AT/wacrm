const fs = require('fs');
const path = require('path');

const searchStr = '6381029380';
const replaceStr = '6381029380';
const targetDir = 'D:\\w';

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === '.git' || file === '.next' || file === '.dart_tool') continue;
    
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else {
      const ext = path.extname(fullPath);
      if (['.ts', '.tsx', '.js', '.jsx', '.dart', '.sql'].includes(ext)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes(searchStr)) {
            console.log(`Replacing in: ${fullPath}`);
            const newContent = content.split(searchStr).join(replaceStr);
            fs.writeFileSync(fullPath, newContent, 'utf8');
          }
        } catch (e) {
          // ignore read errors
        }
      }
    }
  }
}

console.log('Starting bulk replacement...');
walkDir(targetDir);
console.log('Replacement complete.');
