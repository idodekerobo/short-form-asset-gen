import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getInstagramMediaById, downloadInstagramVideo } from '@/lib/instagram-api';
import type { InstagramConnection } from '@/types/instagram';

export async function POST(request: NextRequest) {
  try {
    // Get Instagram connection from cookie
    const cookieStore = await cookies();
    const connectionCookie = cookieStore.get('instagram_connection');

    if (!connectionCookie) {
      return NextResponse.json(
        { error: 'Instagram not connected' },
        { status: 401 }
      );
    }

    const connection: InstagramConnection = JSON.parse(connectionCookie.value);

    // Get media ID from request
    const { mediaId } = await request.json();

    if (!mediaId) {
      return NextResponse.json(
        { error: 'Media ID is required' },
        { status: 400 }
      );
    }

    // Fetch media details
    const media = await getInstagramMediaById(mediaId, connection.accessToken);

    if (media.media_type !== 'VIDEO') {
      return NextResponse.json(
        { error: 'Selected media is not a video' },
        { status: 400 }
      );
    }

    // Download video
    const videoBuffer = await downloadInstagramVideo(media.media_url);

    // Convert to base64 for frontend consumption
    const base64Video = Buffer.from(videoBuffer).toString('base64');

    return NextResponse.json({
      success: true,
      video: {
        id: media.id,
        caption: media.caption,
        thumbnail: media.thumbnail_url,
        base64: base64Video,
        originalUrl: media.permalink,
      },
    });
  } catch (error) {
    console.error('Failed to download Instagram video:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to download video' },
      { status: 500 }
    );
  }
}
