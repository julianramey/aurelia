import type { SupabaseClient } from '@supabase/supabase-js';

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
  background: string;
  text: string;
  secondary: string;
  accent_light: string;
  accent: string;
  primary?: string;
}

export interface VideoItem {
  url: string;
  thumbnail_url: string;
}

export type EditableSection = 
  | 'profileDetails' 
  | 'brandExperience' 
  | 'servicesSkills' 
  | 'socialMedia' 
  | 'contactDetails' 
  | 'profilePicture' 
  | 'tiktokVideos' 
  | 'audienceStats' 
  | 'performance';
export type SectionVisibilityState = Record<EditableSection, boolean>;

export interface MediaKitData {
  type: 'media_kit_data';
  brand_name: string;
  tagline?: string;
  colors: ColorScheme;
  font?: string;
  selected_template_id?: string;
  profile_photo?: string;
  personal_intro?: string;
  skills?: string[];
  instagram_handle?: string;
  tiktok_handle?: string;
  portfolio_images?: string[];
  videos?: VideoItem[];
  contact_email?: string;
  section_visibility?: Partial<SectionVisibilityState>;
  last_updated?: string;
}

export interface Profile {
  id: string;
  user_id: string;
  updated_at?: string;
  created_at?: string;
  username?: string;
  avatar_url?: string;
  website?: string;
  full_name?: string;
  media_kit_data: MediaKitData | null;
  instagram_handle?: string | null;
  tiktok_handle?: string | null;
  email?: string;
  niche?: string;
  media_kit_url?: string;
  onboarding_complete?: boolean;
  personal_intro?: string;
  selected_template_id?: string;
} 