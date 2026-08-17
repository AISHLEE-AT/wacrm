import { NextResponse } from 'next/server';

const AISHLEE_CHANNEL_ID = 'UC0K47n1iAXa_aAKhGZzdhDQ';
const RSS_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${AISHLEE_CHANNEL_ID}`;

export async function GET() {
  try {
    const res = await fetch(RSS_FEED_URL, {
      next: { revalidate: 3600 },
      headers: {
        'Accept': 'application/xml, text/xml, */*',
        'User-Agent': 'SuprOWebApp/3.0',
      },
    });

    if (!res.ok) {
      return NextResponse.json({
        videoId: 'xhYONNuUZuk',
        title: 'SuprO commercial ad #suprotrailer #suprotec #supro',
      });
    }

    const xml = await res.text();
    const videoIdMatch = xml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    const titleMatch = xml.match(/<title>([^<]+)<\/title>/g);

    const videoId = videoIdMatch ? videoIdMatch[1] : 'xhYONNuUZuk';
    const videoTitle = titleMatch && titleMatch.length > 1 
      ? titleMatch[1].replace(/<\/?title>/g, '') 
      : 'SuprO commercial ad #suprotrailer #suprotec #supro';

    return NextResponse.json({
      videoId,
      title: videoTitle,
    });
  } catch (e) {
    return NextResponse.json({
      videoId: 'xhYONNuUZuk',
      title: 'SuprO commercial ad #suprotrailer #suprotec #supro',
    });
  }
}
