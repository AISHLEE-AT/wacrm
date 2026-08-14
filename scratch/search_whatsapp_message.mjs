import fs from 'fs';
import path from 'path';

function searchDirectory(dir, pattern) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && !fullPath.includes('node_modules') && !fullPath.includes('.next') && !fullPath.includes('.git')) {
      searchDirectory(fullPath, pattern);
    } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.mjs'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(pattern)) {
        console.log(`FOUND in file: ${fullPath}`);
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (line.includes(pattern)) {
            console.log(`  Line ${idx + 1}: ${line.trim()}`);
          }
        });
      }
    }
  }
}

console.log('Searching for "Ready to book a ride"...');
searchDirectory('D:\\w\\apps\\web\\src', 'Ready to book');
searchDirectory('D:\\w\\apps\\web\\src', 'Option 1');
