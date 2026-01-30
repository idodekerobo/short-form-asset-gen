/**
 * Instagram API Client
 * 
 * Official Instagram API with Instagram Login implementation
 * Documentation: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login
 * 
 * Requirements:
 * - Instagram Business or Creator account
 * - Meta Developer App configured with Instagram API
 * - OAuth 2.0 flow for user authorization
 */

import type { 
  InstagramAuthTokens, 
  InstagramUser, 
  InstagramMedia, 
  InstagramMediaListResponse 
} from '@/types/instagram';

const INSTAGRAM_GRAPH_API_BASE = 'https://graph.instagram.com';
const INSTAGRAM_OAUTH_BASE = 'https://api.instagram.com/oauth';

export class InstagramAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'InstagramAPIError';
  }
}

/**
 * Generate Instagram OAuth authorization URL
 * User will be redirected here to grant permissions
 */
export function getInstagramAuthUrl(): string {
  const appId = process.env.INSTAGRAM_APP_ID;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

  if (!appId || !redirectUri) {
    throw new InstagramAPIError('Instagram app credentials not configured');
  }

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: 'instagram_business_basic,instagram_business_content_publish,instagram_business_manage_messages,instagram_business_manage_comments',
    response_type: 'code',
  });

  return `${INSTAGRAM_OAUTH_BASE}/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 * Called in the OAuth callback after user authorizes
 */
export async function exchangeCodeForToken(
  code: string
): Promise<InstagramAuthTokens> {
  const appId = process.env.INSTAGRAM_APP_ID;
  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

  if (!appId || !appSecret || !redirectUri) {
    throw new InstagramAPIError('Instagram app credentials not configured');
  }

  const params = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
    code,
  });

  const response = await fetch(`${INSTAGRAM_OAUTH_BASE}/access_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new InstagramAPIError(
      error.error_message || 'Failed to exchange code for token',
      response.status,
      error.error_type
    );
  }

  return response.json();
}

/**
 * Get user profile information
 */
export async function getInstagramUser(
  accessToken: string
): Promise<InstagramUser> {
  const params = new URLSearchParams({
    fields: 'id,username,account_type',
    access_token: accessToken,
  });

  const response = await fetch(
    `${INSTAGRAM_GRAPH_API_BASE}/me?${params.toString()}`
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new InstagramAPIError(
      error.error?.message || 'Failed to fetch user profile',
      response.status,
      error.error?.type
    );
  }

  return response.json();
}

/**
 * Get user's media (photos and videos)
 * 
 * Returns list of media with metadata including media_url for videos
 * Note: media_url for videos is a temporary CDN link (expires in a few hours)
 */
export async function getInstagramMedia(
  accessToken: string,
  limit: number = 25,
  after?: string
): Promise<InstagramMediaListResponse> {
  const params = new URLSearchParams({
    fields: 'id,media_type,media_url,thumbnail_url,caption,timestamp,permalink,username',
    access_token: accessToken,
    limit: limit.toString(),
  });

  if (after) {
    params.append('after', after);
  }

  const response = await fetch(
    `${INSTAGRAM_GRAPH_API_BASE}/me/media?${params.toString()}`
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new InstagramAPIError(
      error.error?.message || 'Failed to fetch media',
      response.status,
      error.error?.type
    );
  }

  return response.json();
}

/**
 * Get specific media item by ID
 */
export async function getInstagramMediaById(
  mediaId: string,
  accessToken: string
): Promise<InstagramMedia> {
  const params = new URLSearchParams({
    fields: 'id,media_type,media_url,thumbnail_url,caption,timestamp,permalink,username',
    access_token: accessToken,
  });

  const response = await fetch(
    `${INSTAGRAM_GRAPH_API_BASE}/${mediaId}?${params.toString()}`
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new InstagramAPIError(
      error.error?.message || 'Failed to fetch media',
      response.status,
      error.error?.type
    );
  }

  return response.json();
}

/**
 * Download video from Instagram media_url
 * 
 * IMPORTANT: Instagram's media_url is temporary (expires after a few hours)
 * You should download and store the video immediately after fetching it
 */
export async function downloadInstagramVideo(
  mediaUrl: string
): Promise<ArrayBuffer> {
  const response = await fetch(mediaUrl);

  if (!response.ok) {
    throw new InstagramAPIError(
      'Failed to download video from Instagram',
      response.status
    );
  }

  return response.arrayBuffer();
}

/**
 * Refresh long-lived access token
 * Long-lived tokens last 60 days and can be refreshed
 */
export async function refreshAccessToken(
  accessToken: string
): Promise<InstagramAuthTokens> {
  const params = new URLSearchParams({
    grant_type: 'ig_refresh_token',
    access_token: accessToken,
  });

  const response = await fetch(
    `${INSTAGRAM_GRAPH_API_BASE}/refresh_access_token?${params.toString()}`
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new InstagramAPIError(
      error.error?.message || 'Failed to refresh token',
      response.status,
      error.error?.type
    );
  }

  return response.json();
}
