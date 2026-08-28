import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.R2_BUCKET_NAME;

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID || '',
    secretAccessKey: SECRET_ACCESS_KEY || '',
  },
});

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!ACCOUNT_ID || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY || !BUCKET_NAME) {
    return NextResponse.json({ error: 'R2 configuration is missing' }, { status: 500 });
  }

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: 'supro-app.apk',
    });

    // Generate a presigned URL valid for 1 hour (3600 seconds)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    // Redirect the user directly to the presigned download URL
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 });
  }
}
