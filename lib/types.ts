  profile_photo?: string;
  font?: string;
  colors?: ColorScheme;
  videos?: VideoItem[];
  portfolio_images?: string[];
  brand_collaborations?: BrandCollaboration[];
  services?: Service[];
  skills?: string[];
  section_visibility?: Partial<SectionVisibilityState>;
  // Performance Metrics (ensure these are all optional or have defaults)
  follower_count?: number | string; // General follower count
  engagement_rate?: number | string; // General engagement rate
  avg_likes?: number | string; // General average likes
  reach?: number | string; // General reach
  stats?: MediaKitStats[]; // For platform-specific, API-driven stats

  // Specific platform followers (can be manually entered)
  instagram_followers?: number | string;
  tiktok_followers?: number | string;
  youtube_followers?: number | string;

  // Specific performance metrics (can be manually entered)
  avg_video_views?: number | string; // e.g. for TikTok/YouTube overall
  avg_ig_reach?: number | string; // Average Instagram post reach
  ig_engagement_rate?: number | string; // Specific Instagram engagement rate

  // Luxury Template Specific Fields (already added, ensure consistency)
  website?: string; 