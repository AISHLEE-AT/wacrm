const fs = require('fs');
let file = 'D:/w/apps/web/next.config.ts';
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/import \{ withSentryConfig \} from '@sentry\/nextjs';\n/, '');
text = text.replace(/export default withSentryConfig\(nextConfig, \{[\s\S]*?\}\);/, 'export default nextConfig;');

fs.writeFileSync(file, text);
console.log('Removed Sentry from next.config.ts');
