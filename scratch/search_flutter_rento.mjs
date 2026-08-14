import fs from 'fs';
import path from 'path';

function searchDirectory(dir, pattern) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDirectory(fullPath, pattern);
    } else if (stat.isFile() && file.endsWith('.dart')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.toLowerCase().includes(pattern.toLowerCase())) {
        console.log(`FOUND in file: ${fullPath}`);
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (line.toLowerCase().includes(pattern.toLowerCase())) {
            console.log(`  Line ${idx + 1}: ${line.trim()}`);
          }
        });
      }
    }
  }
}

console.log('Searching in supro_flutter for RentO & webview...');
searchDirectory('D:\\w\\apps\\supro_flutter\\lib', 'webview');
searchDirectory('D:\\w\\apps\\supro_flutter\\lib', 'rento');
