// Instagram OAuth & API Types
export interface InstagramAuthTokens {
  access_token: string;
  user_id: string;
  expires_in?: number;
}

export interface InstagramUser {
  id: string;
  username: string;
  account_type?: 'BUSINESS' | 'MEDIA_CREATOR' | 'PERSONAL';
}

export interface InstagramMedia {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string;
  caption?: string;
  timestamp: string;
  permalink: string;
  username?: string;
}

export interface InstagramMediaListResponse {
  data: InstagramMedia[];
  paging?: {
    cursors?: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

export interface InstagramConnection {
  userId: string;
  username: string;
  accessToken: string;
  connectedAt: string;
}
