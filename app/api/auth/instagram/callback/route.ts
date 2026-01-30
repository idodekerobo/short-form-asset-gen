import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, getInstagramUser } from '@/lib/instagram-api';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorReason = searchParams.get('error_reason');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('Instagram OAuth error:', {
      error,
      errorReason,
      errorDescription,
    });
    return NextResponse.redirect(
      new URL(
        `/create?error=${encodeURIComponent(errorDescription || 'Instagram authorization failed')}`,
        request.url
      )
    );
  }

  // Validate authorization code
  if (!code) {
    return NextResponse.redirect(
      new URL('/create?error=No authorization code received', request.url)
    );
  }

  try {
    // Exchange code for access token
    const tokens = await exchangeCodeForToken(code);

    // Get user profile
    const user = await getInstagramUser(tokens.access_token);

    // Store tokens in secure HTTP-only cookie
    // In production, you should store this in a database
    const cookieStore = await cookies();
    cookieStore.set('instagram_connection', JSON.stringify({
      userId: user.id,
      username: user.username,
      accessToken: tokens.access_token,
      connectedAt: new Date().toISOString(),
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 60, // 60 days
      path: '/',
    });

    // Redirect back to create page with success message
    return NextResponse.redirect(
      new URL(
        `/create?instagram_connected=true&username=${encodeURIComponent(user.username)}`,
        request.url
      )
    );
  } catch (err) {
    console.error('Failed to complete Instagram OAuth:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to connect Instagram';
    return NextResponse.redirect(
      new URL(`/create?error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}
