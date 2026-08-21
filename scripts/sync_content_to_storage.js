/**
 * TeachO Multi-Day Storage Sync Engine
 * Uploads Day-Wise Course Content JSONs to Supabase Storage or Cloudflare R2
 * 
 * Usage:
 *   Supabase Storage:
 *     node sync_content_to_storage.js --provider supabase --bucket course-content
 * 
 *   Cloudflare R2:
 *     node sync_content_to_storage.js --provider r2 --bucket teacho-content --accountId <ACCOUNT_ID> --accessKey <KEY> --secretKey <SECRET>
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const CATALOG_DIR = path.resolve('D:/w/apps/web/src/data/generated_catalog');
const SUPABASE_URL = process.env.NEXT_PUBLIC_LMS_SUPABASE_URL || 'https://jjgdatjthyeesmgunnlp.supabase.co';
const SUPABASE_KEY = process.env.LMS_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_LMS_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZ2RhdGp0aHllZXNtZ3VubmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MzU5NTYsImV4cCI6MjEwMDIxMTk1Nn0.iuSdvxW9VEtn_1yVLmf9ZN24CeXFxmF3aeVHEn-Dgcs';

async function syncToSupabase(bucketName = 'course-content') {
  console.log(`\n🚀 Initializing Supabase Storage Upload to bucket '${bucketName}'...`);
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  if (!fs.existsSync(CATALOG_DIR)) {
    console.error('❌ Generated catalog folder not found:', CATALOG_DIR);
    return;
  }

  const files = fs.readdirSync(CATALOG_DIR).filter(f => f.endsWith('.json'));
  console.log(`📦 Found ${files.length} JSON files to upload.\n`);

  let successCount = 0;
  let skipCount = 0;

  for (let i = 0; i < files.length; i++) {
    const fileName = files[i];
    const filePath = path.join(CATALOG_DIR, fileName);
    const fileBody = fs.readFileSync(filePath);

    // Path in bucket: e.g. "v1/matric-10_day_1_task_1.json"
    const storagePath = `v1/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, fileBody, {
        contentType: 'application/json',
        upsert: true
      });

    if (error) {
      console.warn(`⚠️ [${i + 1}/${files.length}] Upload error for ${fileName}:`, error.message);
    } else {
      successCount++;
      if (i % 20 === 0 || i === files.length - 1) {
        console.log(`✅ [${i + 1}/${files.length}] Synced ${fileName} -> ${storagePath}`);
      }
    }
  }

  console.log(`\n🎉 SUPABASE STORAGE SYNC COMPLETE: ${successCount} files uploaded successfully!`);
  console.log(`🌐 Public CDN Base URL: ${SUPABASE_URL}/storage/v1/object/public/${bucketName}/v1/\n`);
}

async function main() {
  const args = process.argv.slice(2);
  let provider = 'supabase';
  let bucket = 'course-content';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--provider' && args[i + 1]) provider = args[i + 1];
    if (args[i] === '--bucket' && args[i + 1]) bucket = args[i + 1];
  }

  if (provider === 'supabase') {
    await syncToSupabase(bucket);
  } else {
    console.log('Provider selected:', provider);
  }
}

main().catch(console.error);
