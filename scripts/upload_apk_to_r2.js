const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Resolve environment variables from the web app's .env.local
dotenv.config({ path: path.join(__dirname, '../apps/web/.env.local') });

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.R2_BUCKET_NAME;

if (!ACCOUNT_ID || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY || !BUCKET_NAME) {
  console.error("Missing R2 environment variables. Ensure apps/web/.env.local is configured properly.");
  process.exit(1);
}

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

async function uploadApk() {
  const apkPath = path.join(__dirname, '../apps/mobile/android/app/build/outputs/apk/release/app-release.apk');
  
  if (!fs.existsSync(apkPath)) {
    console.error(`APK not found at ${apkPath}`);
    console.error("Please run the build script first.");
    process.exit(1);
  }

  const fileStream = fs.createReadStream(apkPath);
  
  const uploadParams = {
    Bucket: BUCKET_NAME,
    Key: 'supro-app.apk',
    Body: fileStream,
    ContentType: 'application/vnd.android.package-archive',
  };

  console.log(`Uploading ${apkPath} to Cloudflare R2 bucket ${BUCKET_NAME} as supro-app.apk...`);

  try {
    const data = await s3Client.send(new PutObjectCommand(uploadParams));
    console.log("Upload successful!");
    
    // Optional: Public URL output
    if (process.env.NEXT_PUBLIC_R2_PUBLIC_URL) {
      console.log(`APK Public URL: ${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/supro-app.apk`);
    } else {
      console.log(`APK Public URL: https://${ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET_NAME}/supro-app.apk (if publicly accessible)`);
    }
  } catch (err) {
    console.error("Error uploading APK:", err);
    process.exit(1);
  }
}

uploadApk();
