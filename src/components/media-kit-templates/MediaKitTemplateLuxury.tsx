import React from 'react';
import type { Profile, VideoItem, Service, BrandCollaboration, MediaKitStats, ColorScheme, SectionVisibilityState, EditorPreviewData, TemplateTheme as BaseTemplateTheme } from '@/lib/types';
import type { SocialLinkItem } from '@/components/media-kit-blocks/SocialLinksBlock';
import { cn, formatNumber } from '@/lib/utils';
import PreviewLoadingFallback from '@/components/PreviewLoadingFallback';

// Import Blocks
import { SectionTitle } from '@/components/media-kit-blocks/SectionTitle';
import ProfileHeaderBlock from '@/components/media-kit-blocks/ProfileHeaderBlock';
import PersonalIntroBlock from '@/components/media-kit-blocks/PersonalIntroBlock';
import StatsGridBlock from '@/components/media-kit-blocks/StatsGridBlock';
import AudienceDemographicsBlock from '@/components/media-kit-blocks/AudienceDemographicsBlock';
import SkillsListBlock from '@/components/media-kit-blocks/SkillsListBlock';
import PortfolioGridBlock from '@/components/media-kit-blocks/PortfolioGridBlock';
import VideoShowcaseBlock from '@/components/media-kit-blocks/VideoShowcaseBlock';
import ShowcaseImagesBlock from '@/components/media-kit-blocks/ShowcaseImagesBlock';
import BrandCollaborationBlock from '@/components/media-kit-blocks/BrandCollaborationBlock';
import ServiceListBlock from '@/components/media-kit-blocks/ServiceListBlock';
import ContactInfoBlock from '@/components/media-kit-blocks/ContactInfoBlock';

// Icons - Minimal necessary icons if any are used directly in this template after block refactoring.
// Most icons should now be encapsulated within their respective blocks.
// Specific icons for createPlatformStat if they are not passed as components:
import { VideoCameraIcon, UsersIcon, HeartIcon, PlayCircleIcon } from '@heroicons/react/24/outline';

// Data structure for the Luxury Media Kit Template
// This should align with TemplateData from Default and include specifics from mediakitluxury.html
export interface LuxurySpecificData {
  id: string;
  user_id: string;
  username?: string; // e.g., @EMILYSINSTA
  brand_name?: string; // e.g., EMILY - can be same as full_name or a specific brand name
  full_name?: string; // e.g., EMILY
  avatar_url?: string; // Profile image src
  tagline?: string; // e.g., LIFESTYLE | BEAUTY | COPYWRITING
  personal_intro?: string; // About Me text

  // Social Stats (example for one platform, repeat for others as needed or make it an array)
  // For simplicity, using direct fields. Could be an array of platforms.
  instagram_followers?: string | number;
  tiktok_followers?: string | number;
  youtube_followers?: string | number;

  // Audience Demographics
  audience_age_range?: string; // e.g., "25 - 45"
  audience_location_main?: string; // e.g., "80% AUSTRALIA"
  audience_gender_female?: string; // e.g., "65% FEMALE"

  // Key Stats (can be an array of { value: string, label: string, icon?: string } later)
  avg_video_views?: string | number;
  avg_ig_reach?: string | number;
  ig_engagement_rate?: string | number;

  contact_email?: string;
  website?: string; // Changed from website_url
  contact_phone?: string; // Ensured present

  portfolio_images?: string[]; // Array of image URLs
  showcase_images?: string[]; // For content showcase on page 2 (phone mockups)

  services?: Service[];
  past_brands_text?: string; // Text description for brands worked with
  past_brands_image_url?: string; // Single image for brand showcase
  next_steps_text?: string;
  
  // Fields from default template data structure for compatibility / editor integration
  media_kit_data: import('@/lib/types').MediaKitData | null;
  media_kit_url?: string;
  stats?: MediaKitStats[];
  skills?: string[];
  colors?: ColorScheme; // Provided by the editor
  font?: string; // Provided by the editor - will be 'Poppins' for this template
  section_visibility?: SectionVisibilityState;
  videos?: VideoItem[]; // Added for consistency
  brand_collaborations?: BrandCollaboration[]; // Added for consistency
  instagram_handle?: string; // Added for social links
  tiktok_handle?: string;    // Added for social links
}

// Theme for the Luxury template, mapping to its specific color needs
// Aligns with TemplateTheme from default for consistency, but colors will be specific to luxury
export interface LuxurySpecificTheme extends BaseTemplateTheme {
  cardBackground: string; 
  textPrimary: string;   
  textSecondary: string; 
  textMuted: string;     
  borderLight: string;   
}

export interface LuxuryProps {
  data: EditorPreviewData;               // all fields: avatar_url, brand_name, username, videos[], services[], stats, audience_*, personal_intro, tagline, contact_email, website, etc.
  theme: BaseTemplateTheme;              // colors via CSS vars: primary, accent, background, cardBackground, textSecondary, border, etc.
  section_visibility: SectionVisibilityState;
  loading?: boolean;
}

// Define a local type for thumbnail data - REMOVED

// --- Renamed Placeholder Data Function to GetPreviewData ---
export const LuxuryGetPreviewData = (): LuxurySpecificData => ({
  id: 'luxury-placeholder-id',
  user_id: 'luxury-placeholder-user-id',
  username: '@luxe_style_official',
  brand_name: 'Ophelia Stone',
  full_name: 'Ophelia Stone',
  avatar_url: 'https://via.placeholder.com/180/C9A987/FFFFFF?text=O', 
  tagline: 'CURATOR OF FINE LIVING | LUXURY TRAVEL & LIFESTYLE',
  personal_intro: 'Dedicated to the art of refined living, Ophelia Stone shares insights into luxury travel, timeless style, and curated experiences. Discover a world where elegance meets adventure.',
  instagram_followers: '1.2M',
  tiktok_followers: '500K',
  youtube_followers: '250K',
  audience_age_range: '28 - 55',
  audience_location_main: '75% USA & EUROPE',
  audience_gender_female: '70% FEMALE',
  avg_video_views: '150K',
  avg_ig_reach: '300K',
  ig_engagement_rate: '3.5%',
  contact_email: 'ophelia.stone@luxelife.com',
  website: 'www.opheliastone.com',
  contact_phone: '+1 234 567 8900',
  portfolio_images: [
    'https://via.placeholder.com/400/D3C0B1/333333?text=Luxe+Scene+1',
    'https://via.placeholder.com/400/EAE0D6/333333?text=Luxe+Detail+2',
    'https://via.placeholder.com/400/C9A987/FFFFFF?text=Luxe+Travel+3',
  ],
  showcase_images: [
    'https://via.placeholder.com/300x600/F9F7F5/C9A987?text=Mobile+Showcase+1',
    'https://via.placeholder.com/300x600/EAE0D6/333333?text=Mobile+Showcase+2',
    'https://via.placeholder.com/300x600/D3C0B1/FFFFFF?text=Mobile+Showcase+3',
  ],
  services: [
    { id: 'lux_serv_1', profile_id: '', service_name: 'Bespoke Travel Curation', description: '', price_range: 'From $5,000' },
    { id: 'lux_serv_2', profile_id: '', service_name: 'Luxury Brand Partnerships', description: '', price_range: 'By Project' },
    { id: 'lux_serv_3', profile_id: '', service_name: 'Content Creation Suite', description: '', price_range: 'From $2,500' },
  ],
  past_brands_text: 'Collaborated with iconic brands including Chanel, Four Seasons, and Rolex, creating impactful campaigns that resonate with discerning audiences.',
  past_brands_image_url: 'https://via.placeholder.com/600x400/C9A987/FFFFFF?text=Featured+Brands',
  next_steps_text: 'Partner with Ophelia to elevate your brand. For collaborations, media inquiries, or bespoke projects, please get in touch.',
  media_kit_data: null,
  stats: [],
  skills: ['Luxury Branding', 'High-End Content Production', 'Affluent Market Strategy', 'Event Curation'],
  colors: { 
    background: '#F9F7F5', text: '#333333', secondary: '#777777',
    accent_light: '#EAE0D6', accent: '#C9A987', primary: '#2D2D2D',
  },
  font: 'Poppins', 
  section_visibility: {
    profileDetails: true, brandExperience: true, servicesSkills: true, socialMedia: true,
    contactDetails: true, profilePicture: true, tiktokVideos: true, audienceStats: true, performance: true,
    audienceDemographics: true,
  },
  videos: [
    { url: '#', thumbnail_url: 'https://placehold.co/300x400/EEEEEE/757575?text=Video+1' },
    { url: '#', thumbnail_url: 'https://placehold.co/300x400/EEEEEE/757575?text=Video+2' },
    { url: '#', thumbnail_url: 'https://placehold.co/300x400/EEEEEE/757575?text=Video+3' },
  ],
  brand_collaborations: [
      { id: 'collab1', profile_id: '', brand_name: 'Chanel' },
      { id: 'collab2', profile_id: '', brand_name: 'Four Seasons' },
      { id: 'collab3', profile_id: '', brand_name: 'Rolex' },
  ],
  instagram_handle: '@luxe_style_official',
  tiktok_handle: '@luxe_style_official_tok',
});

// --- New Thumbnail Data Function ---
export const LuxuryGetThumbnailData = (): EditorPreviewData => ({
  // Default/common fields from EditorPreviewData
  id: 'luxury-thumb-id',
  user_id: 'luxury-thumb-user-id',
  username: '@luxe_thumb',
  brand_name: 'Elegant Luxury',
  tagline: 'Refined & Exclusive',
  avatar_url: 'https://via.placeholder.com/180/C9A987/FFFFFF?text=O',
  personal_intro: 'Thumbnail preview for Luxury.',
  niche: 'Luxury, Lifestyle',
  media_kit_url: '',
  onboarding_complete: true,
  selected_template_id: 'luxury',
  profile_photo: 'https://via.placeholder.com/180/C9A987/FFFFFF?text=O',
  // colors needs to be ColorScheme
  colors: {
    background: '#F9F7F5',
    text: '#333333',
    secondary: '#777777',
    accent_light: '#EAE0D6',
    accent: '#C9A987',
    primary: '#2D2D2D',
  },
  font: 'Poppins',
  skills: [],
  brand_collaborations: [],
  services: [],
  instagram_handle: '@luxe_thumb',
  tiktok_handle: '@luxe_thumb_tok',
  portfolio_images: [],
  videos: [],
  contact_email: 'thumb@luxury.com',
  section_visibility: { /* provide a default SectionVisibilityState */
    profileDetails: true, brandExperience: true, servicesSkills: true, socialMedia: true,
    contactDetails: true, profilePicture: true, tiktokVideos: false, audienceStats: true, performance: true,
    audienceDemographics: true,
  },
  follower_count: 1200000,
  engagement_rate: 3.5,
  avg_likes: 25000,
  reach: 300000,
  stats: [], // Placeholder for MediaKitStats[]
  media_kit_data: null, // Placeholder for MediaKitData | null

  // Luxury Specific Fields (if they are part of EditorPreviewData)
  instagram_followers: 1200000,
  tiktok_followers: 500000,
  youtube_followers: 250000,
  audience_age_range: '28 - 55',
  audience_location_main: '75% USA & EUROPE',
  audience_gender_female: '70% FEMALE',
  avg_video_views: 150000,
  avg_ig_reach: 300000,
  ig_engagement_rate: 3.5,
  showcase_images: [],
  past_brands_text: '',
  past_brands_image_url: '',
  next_steps_text: '',
});

// --- Existing Placeholder Theme Function (ensure it's exported) ---
export const LuxuryTheme = (): LuxurySpecificTheme => ({
  // BaseTemplateTheme properties that LuxurySpecificTheme extends
  background: '#F9F7F5',
  foreground: '#333333', // Corresponds to textPrimary
  primary: '#2D2D2D',
  primaryLight: '#EAE0D6', 
  secondary: '#777777',    // Corresponds to textSecondary
  accent: '#C9A987',       // Main accent color - THIS WAS MISSING
  neutral: '#999999',      // Corresponds to textMuted
  border: '#E0E0E0',       // Corresponds to borderLight or a general border
  cardBackground: '#FFFFFF', 

  // LuxurySpecificTheme "own" properties for type LuxurySpecificTheme to be complete
  // Values here should match the BaseTemplateTheme mappings above for consistency.
  textPrimary: '#333333',
  textSecondary: '#777777',
  textMuted: '#999999',
  borderLight: '#F0F0F0', 
});

// Helper for converting platform specific followers to a generic stat item
const createPlatformStat = (label: string, value?: string | number, icon?: React.ReactNode) => {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  return { label, value, icon }; // formatStat will be applied by StatsGridBlock
};

// ADD this default visibility object
const defaultSectionVisibility: SectionVisibilityState = {
  profileDetails: true,
  profilePicture: true,
  socialMedia: true,
  audienceStats: true,
  performance: true,
  audienceDemographics: true,
  tiktokVideos: true,
  brandExperience: true,
  servicesSkills: true,
  contactDetails: true,
};

export function MediaKitTemplateLuxury({ 
  data, 
  theme, 
  loading,
  section_visibility = defaultSectionVisibility
}: LuxuryProps): React.ReactElement | null {

  if (loading) {
    return (
      <div className="w-full min-h-[700px] flex items-center justify-center rounded-lg" style={{ backgroundColor: theme.background }}>
        <PreviewLoadingFallback />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full min-h-[700px] flex items-center justify-center p-8" style={{ backgroundColor: theme.background }}>
        <p style={{ color: theme.foreground }}>No data available for this media kit.</p>
      </div>
    );
  }

  const {
    username,
    brand_name,
    full_name,
    avatar_url,
    tagline,
    personal_intro,
    instagram_followers,
    tiktok_followers,
    youtube_followers,
    audience_age_range,
    audience_location_main,
    audience_gender_female,
    avg_video_views,
    avg_ig_reach,
    ig_engagement_rate,
    contact_email,
    website,
    contact_phone,
    portfolio_images = [],
    showcase_images = [],
    services = [],
    past_brands_text,
    past_brands_image_url,
    next_steps_text,
    skills = [],
    videos = [],
    brand_collaborations = [],
    profile_photo,
    follower_count,
    engagement_rate,
    avg_likes,
    reach,
  } = data;

  const vis = section_visibility || defaultSectionVisibility;

  const templateFont = theme.font || data.font || 'Poppins, sans-serif';
  const displayName = brand_name || full_name || 'Luxury Creator';
  const displayAvatar = profile_photo || avatar_url;

  const socialLinks: SocialLinkItem[] = [];
  if (data.instagram_handle) socialLinks.push({ type: 'instagram', url: `https://instagram.com/${data.instagram_handle.replace(/^@/, '')}`, label: 'Instagram' });
  if (data.tiktok_handle) socialLinks.push({ type: 'tiktok', url: `https://tiktok.com/@${data.tiktok_handle.replace(/^@/, '')}`, label: 'TikTok' });
  if (website) socialLinks.push({ type: 'website', url: website, label: 'Website' });
  if (contact_email) socialLinks.push({ type: 'email', url: `mailto:${contact_email}`, label: 'Email' });

  // Prepare Performance Metrics
  const performanceMetrics = [];
  if (avg_likes) performanceMetrics.push({ label: 'Avg Likes per Post', value: avg_likes });
  if (reach) performanceMetrics.push({ label: 'Avg Reach per Post', value: reach });
  if (avg_video_views) performanceMetrics.push({ label: 'Avg Video Views', value: avg_video_views });
  if (avg_ig_reach) performanceMetrics.push({ label: 'Avg IG Post Reach', value: avg_ig_reach });
  if (ig_engagement_rate) performanceMetrics.push({ label: 'IG Engagement Rate', value: ig_engagement_rate });
  // Add other general engagement if available and distinct from ig_engagement_rate
  if (engagement_rate && !ig_engagement_rate) { // Avoid duplicating if ig_engagement_rate is the primary one
    performanceMetrics.push({ label: 'Overall Engagement Rate', value: engagement_rate });
  }

  // Prepare Platform Follower Stats
  const platformFollowerStats = [];
  if (instagram_followers) platformFollowerStats.push({ label: 'Instagram Followers', value: instagram_followers, icon: <UsersIcon className="w-5 h-5" /> });
  if (tiktok_followers) platformFollowerStats.push({ label: 'TikTok Followers', value: tiktok_followers, icon: <UsersIcon className="w-5 h-5" /> });
  if (youtube_followers) platformFollowerStats.push({ label: 'YouTube Subscribers', value: youtube_followers, icon: <UsersIcon className="w-5 h-5" /> });
  // Add total followers if it's meaningful and distinct
  if (follower_count && (!instagram_followers && !tiktok_followers && !youtube_followers)) { // Only if specific ones aren't already shown
    platformFollowerStats.push({ label: 'Total Followers', value: follower_count });
  }

  const мягкийТени = '0 5px 25px rgba(0,0,0,0.07)'; // Softer shadow
  const цветФонаБлока = 'color-mix(in srgb, var(--theme-accent, #C9A987) 10%, var(--theme-background, #F9F7F5) 90%)';
  const цветГраницыБлока = 'color-mix(in srgb, var(--theme-accent, #C9A987) 25%, var(--theme-background, #F9F7F5) 75%)';

  return (
    <div 
      className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-12 max-w-6xl mx-auto antialiased" 
      style={{ backgroundColor: 'var(--theme-background)', color: 'var(--theme-foreground)', fontFamily: templateFont }}
    >
      <div className="space-y-16 md:space-y-24"> {/* Increased spacing */}
        {vis.profileDetails && (
          <ProfileHeaderBlock
            name={displayName}
            subheading={tagline}
            avatarUrl={displayAvatar}
            socialLinks={socialLinks}
            sectionVisibility={vis}
            // Consider a 'luxury' variant for ProfileHeaderBlock in the future if more distinction is needed
          />
        )}

        {vis.profileDetails && personal_intro && (
          <div 
            className="p-8 md:p-10 lg:p-12 rounded-xl" // Increased padding
            style={{ 
              backgroundColor: цветФонаБлока, 
              borderColor: цветГраницыБлока, 
              boxShadow: мягкийТени 
            }}
          >
            <SectionTitle>About Me</SectionTitle>
            <div className="text-base md:text-lg leading-relaxed" style={{ color: 'var(--theme-foreground)'}}> {/* Enhanced intro text style */}
              <PersonalIntroBlock text={personal_intro} sectionVisibility={vis} />
            </div>
          </div>
        )}

        {(vis.audienceStats || vis.performance) && performanceMetrics.length > 0 && (
          <div 
            className="p-8 md:p-10 lg:p-12 rounded-xl" // Increased padding
            style={{ 
              backgroundColor: цветФонаБлока, 
              borderColor: цветГраницыБлока, 
              boxShadow: мягкийТени 
            }}
          >
            <StatsGridBlock stats={performanceMetrics} sectionVisibility={vis} title="Key Performance Metrics" />
          </div>
        )}
        
        {vis.socialMedia && platformFollowerStats.length > 0 && (
          <div 
            className="p-8 md:p-10 lg:p-12 rounded-xl" // Increased padding
            style={{ 
              backgroundColor: цветФонаБлока, 
              borderColor: цветГраницыБлока, 
              boxShadow: мягкийТени 
            }}
          >
            <StatsGridBlock stats={platformFollowerStats} sectionVisibility={vis} title="Platform Followers" />
          </div>
        )}

        {vis.audienceDemographics && (audience_age_range || audience_location_main || audience_gender_female) && (
          <div 
            className="p-8 md:p-10 lg:p-12 rounded-xl" // Increased padding
            style={{ 
              backgroundColor: цветФонаБлока, 
              borderColor: цветГраницыБлока, 
              boxShadow: мягкийТени 
            }}
          >
            <SectionTitle>Audience Insights</SectionTitle>
            <AudienceDemographicsBlock
              ageRange={audience_age_range}
              location={audience_location_main}
              femalePct={audience_gender_female}
              sectionVisibility={vis}
            />
          </div>
        )}

        {vis.tiktokVideos && videos && videos.length > 0 && (
          <div 
            className="p-8 md:p-10 lg:p-12 rounded-xl" // Increased padding
            style={{ 
              backgroundColor: цветФонаБлока, 
              borderColor: цветГраницыБлока, 
              boxShadow: мягкийТени 
            }}
          >
            <SectionTitle>Featured Videos</SectionTitle>
            <VideoShowcaseBlock videos={videos} sectionVisibility={vis} />
          </div>
        )}

        {vis.brandExperience && ((brand_collaborations && brand_collaborations.length > 0) || past_brands_text) && (
          <div 
            className="p-8 md:p-10 lg:p-12 rounded-xl" // Increased padding
            style={{ 
              backgroundColor: цветФонаБлока, 
              borderColor: цветГраницыБлока, 
              boxShadow: мягкийТени 
            }}
          >
            <SectionTitle>Brand Collaborations</SectionTitle>
            {past_brands_text && <p className="mb-4 text-base md:text-lg leading-relaxed" style={{ color: 'var(--theme-foreground)' }}>{past_brands_text}</p>} {/* Enhanced text style */}
            {past_brands_image_url && (
              <img src={past_brands_image_url} alt="Past Brands" className="w-full h-auto object-cover rounded-lg mb-6 shadow-md"/>
            )}
            {brand_collaborations && brand_collaborations.length > 0 && (
              <BrandCollaborationBlock brands={brand_collaborations} sectionVisibility={vis} />
            )}
          </div>
        )}
        
        {vis.servicesSkills && services && services.length > 0 && (
          <div 
            className="p-8 md:p-10 lg:p-12 rounded-xl" // Increased padding
            style={{ 
              backgroundColor: цветФонаБлока, 
              borderColor: цветГраницыБлока, 
              boxShadow: мягкийТени 
            }}
          >
            <SectionTitle>Services Offered</SectionTitle>
            <ServiceListBlock services={services} sectionVisibility={vis} />
          </div>
        )}

        {vis.servicesSkills && skills && skills.length > 0 && (
          <div 
            className="p-8 md:p-10 lg:p-12 rounded-xl" // Increased padding
            style={{ 
              backgroundColor: цветФонаБлока, 
              borderColor: цветГраницыБлока, 
              boxShadow: мягкийТени 
            }}
          >
            <SectionTitle>Skills</SectionTitle>
            <SkillsListBlock skills={skills} sectionVisibility={vis} />
          </div>
        )}
      </div>

      {(vis.brandExperience || vis.contactDetails) && (showcase_images && showcase_images.length > 0 || next_steps_text) && (
        <div className="mt-16 md:mt-24 pt-12 md:pt-16 border-t" style={{ borderColor: цветГраницыБлока }}> {/* Increased spacing and themed border */}
          <div className="text-center mb-10 md:mb-12">
            <SectionTitle>
              Content Showcase &amp; Collaboration
            </SectionTitle>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start"> {/* Increased gap */}
            {vis.brandExperience && showcase_images && showcase_images.length > 0 && (
              <div className="space-y-8"> {/* Increased spacing */}
                <h3 className="text-2xl md:text-3xl font-semibold" style={{ color: 'var(--theme-accent)', fontFamily: "'Playfair Display', serif" }}>Featured Content</h3>
                <ShowcaseImagesBlock images={showcase_images} sectionVisibility={vis} />
              </div>
            )}

            {vis.contactDetails && next_steps_text && (
              <div 
                className="space-y-6 p-8 md:p-10 lg:p-12 rounded-xl" // Increased padding & spacing
                style={{ 
                  backgroundColor: цветФонаБлока, 
                  borderColor: цветГраницыБлока, 
                  boxShadow: мягкийТени 
                }}
              >
                <h3 className="text-2xl md:text-3xl font-semibold" style={{ color: 'var(--theme-accent)', fontFamily: "'Playfair Display', serif" }}>Next Steps</h3>
                <p className="text-base md:text-lg leading-relaxed" style={{ color: 'var(--theme-foreground)' }}>{next_steps_text}</p> {/* Enhanced text style */}
              </div>
            )}
          </div>
        </div>
      )}
      
      {vis.contactDetails && (
        <footer className="mt-16 md:mt-24 pt-12 md:pt-16 border-t text-center" style={{ borderColor: цветГраницыБлока }}> {/* Increased spacing and themed border */}
          <SectionTitle>Get In Touch</SectionTitle>
          <ContactInfoBlock
            email={contact_email}
            phone={contact_phone}
            website={website}
            sectionVisibility={vis}
          />
          <p className="text-sm mt-10" style={{color: 'var(--theme-foreground)' }}> {/* Increased spacing */}
            &copy; {new Date().getFullYear()} {displayName}. All rights reserved.
          </p>
        </footer>
      )}
    </div>
  );
}

export default MediaKitTemplateLuxury; 