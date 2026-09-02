const fs = require('fs');
let text = fs.readFileSync('D:/w/apps/web/next.config.ts', 'utf8');
text = text.replace(/import\s+\{\s*withSentryConfig\s*\}\s*from\s*['"]@sentry\/nextjs['"];\r?\n?/g, '');
fs.writeFileSync('D:/w/apps/web/next.config.ts', text);
console.log('Sentry import removed!');
