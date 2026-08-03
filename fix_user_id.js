const fs = require('fs');
const path = require('path');

const filesToFix = [
  'apps/web/src/app/api/automations/route.ts',
  'apps/web/src/app/api/flows/route.ts',
  'apps/web/src/app/api/whatsapp/broadcast/route.ts',
  'apps/web/src/app/api/whatsapp/config/verify-registration/route.ts',
  'apps/web/src/app/api/whatsapp/media/[mediaId]/route.ts',
  'apps/web/src/app/api/whatsapp/react/route.ts',
  'apps/web/src/app/api/whatsapp/templates/submit/route.ts',
  'apps/web/src/app/api/whatsapp/templates/[id]/route.ts',
  'apps/web/src/app/api/whatsapp/templates/sync/route.ts',
];

filesToFix.forEach(file => {
  const p = path.join(__dirname, file);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    // For queries against profiles, replace .eq('user_id', ...) with .eq('id', ...)
    // Note: Some might be .eq('user_id', user.id) or .eq('user_id', userId)
    content = content.replace(/\.eq\(['"]user_id['"],/g, ".eq('id',");
    fs.writeFileSync(p, content, 'utf8');
    console.log('Fixed', file);
  } else {
    console.log('Not found', file);
  }
});

// Fix admin drivers route
const adminPath = path.join(__dirname, 'apps/web/src/app/api/admin/drivers/route.ts');
if (fs.existsSync(adminPath)) {
  let content = fs.readFileSync(adminPath, 'utf8');
  content = content.replace(/select\('user_id, full_name, email, account_id'\)/g, "select('id, full_name, email, account_id')");
  content = content.replace(/\.in\('user_id', userIds\)/g, ".in('id', userIds)");
  fs.writeFileSync(adminPath, content, 'utf8');
  console.log('Fixed admin route');
}

// Fix automations engine
const enginePath = path.join(__dirname, 'apps/web/src/lib/automations/engine.ts');
if (fs.existsSync(enginePath)) {
  let content = fs.readFileSync(enginePath, 'utf8');
  content = content.replace(/\.select\(['"]user_id['"]\)/g, ".select('id')");
  content = content.replace(/profiles\?\.\[0\]\?\.user_id/g, "profiles?.[0]?.id");
  fs.writeFileSync(enginePath, content, 'utf8');
  console.log('Fixed engine.ts');
}
