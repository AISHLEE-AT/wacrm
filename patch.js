const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}
const files = walk('apps/web/src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  content = content.replace(/\(typeof window !== 'undefined' && window\.localStorage \? window\.localStorage\.getItem : \(\) => null\)\(([^)]+)\)/g, '(typeof window !== \\'undefined\\' && window.localStorage ? window.localStorage.getItem($1) : null)');
  content = content.replace(/\(typeof window !== 'undefined' && window\.localStorage \? window\.localStorage\.setItem : \(\) => \{\}\)\(([^,]+),\s*([^)]+)\)/g, '(typeof window !== \\'undefined\\' && window.localStorage ? window.localStorage.setItem($1, $2) : null)');
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Patched', file);
  }
});
