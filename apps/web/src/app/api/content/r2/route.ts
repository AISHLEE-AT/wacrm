import { NextRequest, NextResponse } from 'next/server';
import { getJsonFromR2, uploadJsonToR2, R2_PUBLIC_DOMAIN } from '@/lib/storage/r2Client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  const type = searchParams.get('type'); // 'micro_topic' | 'qbank_category' | 'qbank_block'
  const category = searchParams.get('category');
  const block = searchParams.get('block');

  let objectKey = key;

  if (!objectKey) {
    if (type === 'qbank_category' && category) {
      objectKey = `qbank/categories/${category.toUpperCase()}.json`;
    } else if (type === 'qbank_block' && block) {
      objectKey = `qbank/blocks/block_${block}.json`;
    } else if (type === 'micro_topic' && searchParams.get('topic')) {
      objectKey = `micro-topics/${searchParams.get('topic')}.json`;
    }
  }

  if (!objectKey) {
    return NextResponse.json(
      { error: 'Missing object key or query parameters (key, type, category, or topic)' },
      { status: 400 }
    );
  }

  try {
    const data = await getJsonFromR2(objectKey);

    if (!data) {
      return NextResponse.json(
        { error: `Object "${objectKey}" not found in Cloudflare R2 storage` },
        { status: 404 }
      );
    }

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        'CDN-Cache-Control': 'max-age=604800',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to fetch from Cloudflare R2 storage', details: err?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, data } = body;

    if (!key || !data) {
      return NextResponse.json({ error: 'Missing key or data in request body' }, { status: 400 });
    }

    const result = await uploadJsonToR2(key, data);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to upload to Cloudflare R2', details: err?.message },
      { status: 500 }
    );
  }
}
