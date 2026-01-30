import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getInstagramMedia } from '@/lib/instagram-api';
import type { InstagramConnection } from '@/types/instagram';

export async function GET(request: NextRequest) {
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

    // Get pagination parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '25');
    const after = searchParams.get('after') || undefined;

    // Fetch media from Instagram
    const mediaResponse = await getInstagramMedia(
      connection.accessToken,
      limit,
      after
    );

    return NextResponse.json(mediaResponse);
  } catch (error) {
    console.error('Failed to fetch Instagram media:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch media' },
      { status: 500 }
    );
  }
}
