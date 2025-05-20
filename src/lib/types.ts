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
  font?: string;
}

export interface VideoItem {
  url: string;
  thumbnail_url: string;
  last_updated?: string;
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
  | 'performance'
  | 'audienceDemographics';
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
  youtube_handle?: string;
  portfolio_images?: string[];
  videos?: VideoItem[];
  contact_email?: string;
  section_visibility?: Partial<SectionVisibilityState>;
  last_updated?: string;

  // Fields for Luxury Template
  website?: string;
  contact_phone?: string;
  past_brands_text?: string;
  past_brands_image_url?: string;
  next_steps_text?: string;
  showcase_images?: string[];
  audience_age_range?: string;
  audience_location_main?: string;
  audience_gender_female?: string;
  avg_video_views?: number;
  avg_ig_reach?: number;
  ig_engagement_rate?: number;
  instagram_followers?: number;
  tiktok_followers?: number;
  youtube_followers?: number;

  // Added based on usage in MediaKitEditor.tsx and MediaKit.tsx for data persistence
  stats?: MediaKitStats[];
  services?: Service[];
  brand_collaborations?: BrandCollaboration[];
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
  youtube_handle?: string | null;
  email?: string;
  niche?: string;
  media_kit_url?: string;
  onboarding_complete?: boolean;
  personal_intro?: string;
  selected_template_id?: string;
}

// General Theme structure for templates
export interface TemplateTheme {
  background: string;
  foreground: string;
  primary: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  neutral: string;
  border: string;
  cardBackground?: string;
  font?: string;
}

// Data structure for the live preview in the editor and for template thumbnails
// It combines Profile data with live form data and template-specific placeholder fields.
export type EditorPreviewData = Omit<Profile, 'created_at' | 'updated_at' | 'services' | 'brand_collaborations'> & {
  // Directly include fields derived from formData for live preview
  brand_name: string;
  tagline: string;
  colors: ColorScheme;
  font: string;
  personal_intro: string;
  skills: string[];
  brand_collaborations: BrandCollaboration[];
  services: Service[];
  instagram_handle: string;
  tiktok_handle: string;
  youtube_handle: string;
  portfolio_images: string[];
  videos: VideoItem[];
  contact_email: string;
  section_visibility: SectionVisibilityState;
  // Metrics
  follower_count: number; 
  engagement_rate: number; 
  avg_likes: number; 
  reach: number; 
  stats: MediaKitStats[];
  profile_photo?: string;
  selected_template_id?: string;

  // Luxury Template Specific Fields (for comprehensive preview)
  website?: string;
  contact_phone?: string;
  past_brands_text?: string;
  past_brands_image_url?: string;
  next_steps_text?: string;
  showcase_images?: string[];
  audience_age_range?: string;
  audience_location_main?: string;
  audience_gender_female?: string;
  avg_video_views?: number;
  avg_ig_reach?: number;
  ig_engagement_rate?: number;
  instagram_followers?: number;
  tiktok_followers?: number;
  youtube_followers?: number;

  media_kit_data: MediaKitData | null; 
}; 

// Moved from MediaKitEditor.tsx to avoid circular dependencies
export interface EditorFormData {
  brand_name: string;
  tagline: string;
  colors: ColorScheme;
  font: string;
  personal_intro: string;
  instagram_handle: string;
  tiktok_handle: string;
  youtube_handle: string;
  portfolio_images: string[];
  brand_collaborations_text: string; // Raw text
  services_text: string; // Raw text
  skills_text: string; // Raw text
  follower_count: string | number;
  engagement_rate: string | number;
  avg_likes: string | number;
  reach: string | number;
  email: string; // Contact email
  profile_photo: string; // URL

  // New fields for luxury template / other specific data
  past_brands_text: string;
  past_brands_image_url: string;
  next_steps_text: string;
  showcase_images: string[];
  contact_phone: string;
  website: string;

  // Audience Demographics
  audience_age_range: string;
  audience_location_main: string;
  audience_gender_female: string;

  // Platform-specific and detailed metrics (ensure these are string | number for form input flexibility)
  instagram_followers?: string | number;
  tiktok_followers?: string | number;
  youtube_followers?: string | number;
  avg_video_views?: string | number;
  avg_ig_reach?: string | number;
  ig_engagement_rate?: string | number;
} 