import { NextResponse } from 'next/server';
import { getInstagramAuthUrl } from '@/lib/instagram-api';

export async function GET() {
  try {
    const authUrl = getInstagramAuthUrl();
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Failed to generate Instagram auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Instagram connection' },
      { status: 500 }
    );
  }
}
