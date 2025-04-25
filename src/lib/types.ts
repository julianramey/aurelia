export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook' | 'linkedin';

export type MediaKitStats = {
  id: string;
  profile_id: string;
  platform: SocialPlatform;
  follower_count: number;
  engagement_rate: number;
  avg_likes: number;
  avg_comments: number;
  weekly_reach: number;
  monthly_impressions: number;
  created_at?: string;
  updated_at?: string;
};

export type BrandCollaboration = {
  id: string;
  profile_id: string;
  brand_name: string;
  collaboration_type?: string;
  collaboration_date?: string;
  created_at?: string;
  updated_at?: string;
};

export type Service = {
  id: string;
  profile_id: string;
  service_name: string;
  description?: string;
  price_range?: string;
  created_at?: string;
  updated_at?: string;
};

export type PortfolioItem = {
  id: string;
  profile_id: string;
  title?: string;
  media_url: string;
  media_type: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
};

export interface ColorScheme {
  cream: string;
  charcoal: string;
  taupe: string;
  blush: string;
  accent: string;
}

export type Profile = {
  id: string;
  user_id: string;
  username: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  instagram_handle?: string;
  tiktok_handle?: string;
  personal_intro?: string;
  niche?: string;
  media_kit_url?: string;
  media_kit_data?: string | {
    type: 'media_kit_data';
    brand_name: string;
    tagline: string;
    colors: ColorScheme;
    font: string;
    skills?: string[];
  };
  created_at?: string;
  updated_at?: string;
}; 