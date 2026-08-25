/**
 * ☁️ Cloudflare R2 Object Storage Client (S3-Compatible)
 * 
 * Provides high-speed, zero-egress fee storage for:
 *   1. 47,000+ Micro-Topic Kindle / Course Player Content JSONs
 *   2. 2,00,000+ QBank MCQ Data Bundles
 *   3. Daily Whole Year Curriculum Plans & Assets
 */

import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID || '';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'supro-content';
export const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN || process.env.NEXT_PUBLIC_R2_DOMAIN || `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.dev`;

// Configure S3-compatible client targeting Cloudflare R2 endpoint
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: R2_ACCOUNT_ID ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : undefined,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload JSON payload to Cloudflare R2 Object Storage
 */
export async function uploadJsonToR2(key: string, data: any, bucket = R2_BUCKET_NAME): Promise<{ success: boolean; url: string; key: string }> {
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const buffer = Buffer.from(jsonString, 'utf8');

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: 'application/json',
    CacheControl: 'public, max-age=31536000, immutable',
  });

  await r2Client.send(command);

  const publicUrl = `${R2_PUBLIC_DOMAIN}/${key}`;
  return { success: true, url: publicUrl, key };
}

/**
 * Fetch and parse JSON payload from Cloudflare R2
 */
export async function getJsonFromR2<T = any>(key: string, bucket = R2_BUCKET_NAME): Promise<T | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await r2Client.send(command);
    if (!response.Body) return null;

    const streamToString = await response.Body.transformToString('utf8');
    return JSON.parse(streamToString) as T;
  } catch (err: any) {
    if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
      return null;
    }
    console.warn(`[R2 Storage] Fetch error for key "${key}":`, err.message);
    return null;
  }
}

/**
 * Check if object exists in R2
 */
export async function existsInR2(key: string, bucket = R2_BUCKET_NAME): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    await r2Client.send(command);
    return true;
  } catch (e: any) {
    return false;
  }
}
