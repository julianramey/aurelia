import React from 'react';
import type { Profile, VideoItem, Service, BrandCollaboration, MediaKitStats, ColorScheme, SectionVisibilityState, EditorPreviewData, TemplateTheme as ImportedTemplateTheme, SocialPlatform } from '@/lib/types';
import type { SocialLinkItem } from '@/components/media-kit-blocks/SocialLinksBlock';
import PreviewLoadingFallback from '@/components/PreviewLoadingFallback';
import { SectionTitle } from '@/components/media-kit-blocks/SectionTitle';
import PersonalIntroBlock from '@/components/media-kit-blocks/PersonalIntroBlock';
import StatsGridBlock from '@/components/media-kit-blocks/StatsGridBlock';
import AudienceDemographicsBlock from '@/components/media-kit-blocks/AudienceDemographicsBlock';
import PortfolioGridBlock from '@/components/media-kit-blocks/PortfolioGridBlock';
import VideoShowcaseBlock from '@/components/media-kit-blocks/VideoShowcaseBlock';
import BrandCollaborationBlock from '@/components/media-kit-blocks/BrandCollaborationBlock';
import ServiceListBlock from '@/components/media-kit-blocks/ServiceListBlock';
import ContactInfoBlock from '@/components/media-kit-blocks/ContactInfoBlock';
import ProfileHeaderBlock from '@/components/media-kit-blocks/ProfileHeaderBlock';
import { formatNumber } from '@/lib/utils'; // Import the shared formatNumber
import {
  TagIcon,
  PhotoIcon,
  ShareIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { getPlaceholderData, DEFAULT_COLORS } from '@/lib/placeholder-data'; // ADDED IMPORT

// Interface for the data expected by this template
// Ensure it includes all necessary fields from Profile + extras
export interface DefaultSpecificData {
  id: string;
  user_id: string; // Add user_id
  username?: string; // CORRECTED: Was required, now optional to match Profile and EditorPreviewData
  brand_name?: string; // Added for live editor updates
  full_name?: string;
  avatar_url?: string;
  tagline?: string;
  personal_intro?: string;
  intro?: string;
  instagram_handle?: string;
  tiktok_handle?: string;
  youtube_handle?: string; // ADDED
  contact_email?: string;
  email?: string;
  follower_count?: number | string;
  engagement_rate?: number | string;
  avg_likes?: number | string;
  reach?: number | string;
  videos?: VideoItem[];
  portfolio_images?: string[];
  brand_collaborations?: BrandCollaboration[]; 
  services?: Service[]; 
  section_visibility?: import('@/lib/types').SectionVisibilityState; // Added for section toggles
  media_kit_data: import('@/lib/types').MediaKitData | null; // CORRECTED: Was optional, now required (MediaKitData | null)
  media_kit_url?: string;
  // Add any other fields potentially used from ExtendedProfilePreview
  stats?: MediaKitStats[];
  skills?: string[];
  colors?: ColorScheme; // Ensured present
  font?: string; // Ensured present
  profile_photo?: string; // Ensured present (maps to avatar_url from EditorPreviewData if not directly set)
  website?: string; // Ensured present
  niche?: string; // Ensured present
  onboarding_complete?: boolean; // Ensured present
  selected_template_id?: string; // Ensured present
  // Detailed stats mirroring EditorPreviewData
  instagram_followers?: number | string; // ADDED
  tiktok_followers?: number | string;    // ADDED
  youtube_followers?: number | string;   // ADDED
  avg_video_views?: number | string;    // ADDED
  avg_ig_reach?: number | string;        // ADDED
  ig_engagement_rate?: number | string;  // ADDED
  audience_age_range?: string;     // ADDED
  audience_location_main?: string; // ADDED
  audience_gender_female?: string; // ADDED
  showcase_images?: string[];        // ADDED
  past_brands_text?: string;       // ADDED
  past_brands_image_url?: string;  // ADDED
  next_steps_text?: string;        // ADDED
  contact_phone?: string;          // ADDED
}

// Interface for the theme styles for this specific template component (props.theme)
// If it's identical to the global TemplateTheme, we can use the imported one.
// For now, let's assume it might have its own specifics or could be aliased.
// export interface DefaultSpecificTheme extends ImportedTemplateTheme { // Removed as it's redundant for now
//   // any Default-specific theme properties could go here, if different from global TemplateTheme
// }

// Export the props interface
export interface MediaKitTemplateDefaultProps {
  data: EditorPreviewData | null;
  theme: ImportedTemplateTheme; // Changed from DefaultSpecificTheme to ImportedTemplateTheme
  loading?: boolean;
  section_visibility: SectionVisibilityState;
}

// --- Renamed Placeholder Data Function to GetPreviewData ---
export const DefaultGetPreviewData = (): DefaultSpecificData => {
  const placeholder = getPlaceholderData('default') as Partial<DefaultSpecificData>; // Cast for better type hints
  const defaultColorsFromPlaceholder = getPlaceholderData('default').colors || DEFAULT_COLORS;
  const defaultFontFromPlaceholder = getPlaceholderData('default').font || 'Inter';
  const defaultSectionVisibilityFromPlaceholder = getPlaceholderData('default').section_visibility;

  // Constructing the DefaultSpecificData, ensuring all fields are present
  return {
    id: placeholder.id || 'default-placeholder-id',
    user_id: placeholder.user_id || 'default-placeholder-user-id',
    username: placeholder.username || '@default_user',
    brand_name: placeholder.brand_name || 'Your Brand Name',
    full_name: placeholder.full_name || 'Default User Name',
    avatar_url: placeholder.profile_photo || placeholder.avatar_url || 'https://via.placeholder.com/150/7E69AB/FFFFFF?text=D',
    tagline: placeholder.tagline || 'Your Catchy Tagline Here',
    personal_intro: placeholder.personal_intro || 'This is a brief introduction about you and your brand. Make it engaging!',
    intro: placeholder.intro || placeholder.personal_intro || '',
    instagram_handle: placeholder.instagram_handle || '@your_insta',
    tiktok_handle: placeholder.tiktok_handle || '@your_tiktok',
    youtube_handle: placeholder.youtube_handle || '', // Fallback for youtube_handle
    contact_email: placeholder.contact_email || placeholder.email || 'contact@example.com',
    email: placeholder.email || 'contact@example.com',
    follower_count: parseFloat(String(placeholder.follower_count || placeholder.instagram_followers || 10000)) || 10000,
    engagement_rate: parseFloat(String(placeholder.engagement_rate || placeholder.ig_engagement_rate || 5.0)) || 5.0,
    avg_likes: parseFloat(String(placeholder.avg_likes || 500)) || 500,
    reach: parseFloat(String(placeholder.reach || placeholder.avg_ig_reach || 20000)) || 20000,
    videos: placeholder.videos || [
      { url: 'https://www.tiktok.com/@placeholder/video/default1', thumbnail_url: 'https://via.placeholder.com/300/7E69AB/FFFFFF?text=Video+1' },
      { url: 'https://www.tiktok.com/@placeholder/video/default2', thumbnail_url: 'https://via.placeholder.com/300/E5DAF8/1A1F2C?text=Video+2' },
    ],
    portfolio_images: placeholder.portfolio_images || [
      'https://via.placeholder.com/300/7E69AB/FFFFFF?text=Portfolio+1',
      'https://via.placeholder.com/300/E5DAF8/1A1F2C?text=Portfolio+2',
      'https://via.placeholder.com/300/8E9196/FFFFFF?text=Portfolio+3',
    ],
    brand_collaborations: placeholder.brand_collaborations || [
      { id: 'collab_default_1', profile_id: '', brand_name: 'Default Brand Co.', collaboration_type: 'Sponsored Post', collaboration_date: '2023-01-01' },
      { id: 'collab_default_2', profile_id: '', brand_name: 'Another Default Inc.', collaboration_type: 'Product Review', collaboration_date: '2023-02-15' },
    ],
    services: placeholder.services || [
      { id: 'service_default_1', profile_id: '', service_name: 'Default Service Package', description: 'High-quality default services.', price_range: '$100-$500' },
      { id: 'service_default_2', profile_id: '', service_name: 'Consultation Hour', description: 'One hour of expert advice.', price_range: '$50' },
    ],
    section_visibility: {
        profileDetails: defaultSectionVisibilityFromPlaceholder?.profileDetails ?? true,
        brandExperience: defaultSectionVisibilityFromPlaceholder?.brandExperience ?? true,
        servicesSkills: defaultSectionVisibilityFromPlaceholder?.servicesSkills ?? true,
        socialMedia: defaultSectionVisibilityFromPlaceholder?.socialMedia ?? true,
        contactDetails: defaultSectionVisibilityFromPlaceholder?.contactDetails ?? true,
        profilePicture: defaultSectionVisibilityFromPlaceholder?.profilePicture ?? true,
        tiktokVideos: defaultSectionVisibilityFromPlaceholder?.tiktokVideos ?? true,
        audienceStats: defaultSectionVisibilityFromPlaceholder?.audienceStats ?? true,
        performance: defaultSectionVisibilityFromPlaceholder?.performance ?? true,
        audienceDemographics: defaultSectionVisibilityFromPlaceholder?.audienceDemographics ?? true,
    },
    media_kit_data: placeholder.media_kit_data || null, // DefaultSpecificData expects MediaKitData | null
    stats: placeholder.stats || [{
      id: 'default-stats-id-1',
      profile_id: placeholder.id || 'default-placeholder-id',
      platform: 'instagram' as SocialPlatform,
      follower_count: 10000,
      engagement_rate: 5.0,
      avg_likes: 500,
      avg_comments: 50,
      weekly_reach: 20000,
      monthly_impressions: 80000,
      updated_at: new Date().toISOString(),
    }],
    skills: placeholder.skills || ['Content Creation', 'Social Media Management', 'Videography'],
    colors: defaultColorsFromPlaceholder,
    font: defaultFontFromPlaceholder,
    profile_photo: placeholder.profile_photo || placeholder.avatar_url || 'https://via.placeholder.com/150/7E69AB/FFFFFF?text=D',
    website: placeholder.website || 'www.yourwebsite.com',
    niche: placeholder.niche || 'General Content Creator',
    onboarding_complete: placeholder.onboarding_complete !== undefined ? placeholder.onboarding_complete : true,
    selected_template_id: placeholder.selected_template_id || 'default',
    media_kit_url: placeholder.media_kit_url || '',
    // ADDED specific stats with fallbacks, ensuring numeric conversion
    instagram_followers: parseFloat(String(placeholder.instagram_followers || 10000)) || 10000,
    tiktok_followers: parseFloat(String(placeholder.tiktok_followers || 0)) || 0,
    youtube_followers: parseFloat(String(placeholder.youtube_followers || 0)) || 0,
    avg_video_views: parseFloat(String(placeholder.avg_video_views || 0)) || 0,
    avg_ig_reach: parseFloat(String(placeholder.avg_ig_reach || 0)) || 0,
    ig_engagement_rate: parseFloat(String(placeholder.ig_engagement_rate || 0)) || 0,
    audience_age_range: placeholder.audience_age_range || '25-35',
    audience_location_main: placeholder.audience_location_main || 'New York',
    audience_gender_female: placeholder.audience_gender_female || '50%',
    showcase_images: placeholder.showcase_images || [],
    past_brands_text: placeholder.past_brands_text || '',
    past_brands_image_url: placeholder.past_brands_image_url || '',
    next_steps_text: placeholder.next_steps_text || '',
    contact_phone: placeholder.contact_phone || '',
  };
};

// --- Updated Thumbnail Data Function to return EditorPreviewData ---
export const DefaultGetThumbnailData = (): EditorPreviewData => {
  const placeholder = getPlaceholderData('default') as Partial<EditorPreviewData>; // Cast for consistency
  const defaultColors = placeholder.colors || DEFAULT_COLORS;
  const defaultFont = placeholder.font || 'Inter';

  return {
    id: 'thumb-default-id',
    user_id: 'thumb-user-id',
    username: '@default_user_thumb',
    brand_name: 'Classic Minimal (Thumb)',
    tagline: 'Clean & Professional Thumbnail',
    colors: defaultColors,
    font: defaultFont,
    profile_photo: placeholder.profile_photo || placeholder.avatar_url || 'https://via.placeholder.com/150/7E69AB/FFFFFF?text=D',
    personal_intro: 'Short intro for thumbnail.',
    skills: [],
    brand_collaborations: [],
    services: [],
    instagram_handle: '@insta_thumb',
    tiktok_handle: '@tiktok_thumb',
    portfolio_images: [],
    videos: [],
    contact_email: 'thumb@example.com',
    section_visibility: { 
        profileDetails: true, profilePicture: true, socialMedia: true, audienceStats: true, performance: true, 
        tiktokVideos: true, brandExperience: true, servicesSkills: true, contactDetails: true, audienceDemographics: true 
    },
    follower_count: 100,
    engagement_rate: 1,
    avg_likes: 10,
    reach: 100,
    stats: [],
    avatar_url: placeholder.avatar_url || 'https://via.placeholder.com/150/7E69AB/FFFFFF?text=D',
    website: 'thumb.example.com',
    full_name: placeholder.full_name || 'Default Thumbnail User',
    niche: placeholder.niche || 'Thumbnail Niche',
    media_kit_url: placeholder.media_kit_url || '',
    onboarding_complete: placeholder.onboarding_complete !== undefined ? placeholder.onboarding_complete : true,
    email: placeholder.email || 'thumb_email@example.com',
    media_kit_data: null,
    selected_template_id: 'default',
    audience_age_range: placeholder.audience_age_range || '25-35',
    audience_location_main: placeholder.audience_location_main || 'New York',
    audience_gender_female: placeholder.audience_gender_female || '50%',
    youtube_handle: placeholder.youtube_handle || '',
    // Add all other EditorPreviewData fields with minimal placeholders
    instagram_followers: parseFloat(String(placeholder.instagram_followers || 100)) || 100,
    tiktok_followers: parseFloat(String(placeholder.tiktok_followers || 0)) || 0,
    youtube_followers: parseFloat(String(placeholder.youtube_followers || 0)) || 0,
    avg_video_views: parseFloat(String(placeholder.avg_video_views || 0)) || 0,
    avg_ig_reach: parseFloat(String(placeholder.avg_ig_reach || 0)) || 0,
    ig_engagement_rate: parseFloat(String(placeholder.ig_engagement_rate || 0)) || 0,
    showcase_images: placeholder.showcase_images || [],
    past_brands_text: placeholder.past_brands_text || '',
    past_brands_image_url: placeholder.past_brands_image_url || '',
    next_steps_text: placeholder.next_steps_text || '',
    contact_phone: placeholder.contact_phone || '',
  };
};

// --- Existing Placeholder Theme Function (ensure it uses the specific theme type) ---
export const DefaultTheme = (): ImportedTemplateTheme => {
  const placeholder = getPlaceholderData('default');
  const c = placeholder.colors || DEFAULT_COLORS;
  return {
    background: c.background,
    foreground: c.text,
    primary: c.primary || c.accent, // Fallback primary to accent
    primaryLight: c.accent_light,
    secondary: c.secondary,
    accent: c.accent,
    neutral: c.secondary,
    border: `${c.primary || c.accent}33`,
    font: placeholder.font || 'Inter, sans-serif', // Use font from placeholder or default
  };
};

// AUGMENTED: Added theme-based CSS rules using CSS Variables
const themedCssRules = `
  .media-kit {
    background-color: var(--theme-bg);
    color: var(--theme-fg); /* Default text: blackish */
  }
  .media-kit .section { /* Sections in Default have bg-white via Tailwind */
    border-color: var(--theme-border);
  }
  /* ProfileHeaderBlock, SectionTitle, StatsGridBlock, ContactInfoBlock, etc., handle their own theming. */

  /* Styles for blocks that don't theme themselves or for Default-specific tweaks */
  .media-kit .brand-tag, .media-kit .service-tag {
    background-color: var(--theme-light); /* Default's accent-light */
    color: var(--theme-fg); /* Black text */
  }
  .media-kit .service-tag svg {
    color: var(--theme-fg); /* Black icon */
  }
  
  /* Fallback text in Default template structure (not in blocks) */
  .media-kit .text-gray-400 { /* Used for "No portfolio/collaborations/services" */
    color: var(--theme-fg); /* Change from gray to black */
    font-style: normal; /* Remove italic */
    font-size: 0.875rem; /* text-sm for a cleaner fallback */
    text-align: center; /* Center fallback text */
    padding-top: 0.5rem; /* Add some space for fallback text */
    padding-bottom: 0.5rem; /* Add some space for fallback text */
  }
`;

const responsiveTextStyles = `
  ${themedCssRules} /* Injecting the new theme rules */
  .stats-number {
    font-size: clamp(0.9rem, 4vw, 1.5rem);
    line-height: 1.2;
    width: 100%;
    text-align: center;
    display: block;
    margin: 0 auto;
  }
  .stats-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .brand-tag, .service-tag {
    font-size: clamp(0.8rem, 4vw, 0.9rem);
    word-break: break-word;
  }
  .contact-info-text {
    font-size: clamp(0.75rem, 4vw, 1rem);
    word-break: break-word;
    width: 100%;
  }
  .text-container { /* Used in service tags */
    display: flex;
    align-items: center;
  }
`;

const MediaKitTemplateDefault: React.FC<MediaKitTemplateDefaultProps> = ({
  data,
  theme,
  loading,
  section_visibility,
}) => {
  if (loading) {
    return (
      <div className="w-full min-h-[300px] flex items-center justify-center bg-white rounded-lg">
        <PreviewLoadingFallback />
      </div>
    );
  }

  if (!data) {
    return <div className="w-full min-h-[300px] flex items-center justify-center"><p>No data available for this media kit.</p></div>;
  }

  const mediaKitDataObject = typeof data.media_kit_data === 'object' ? data.media_kit_data : null;

  const videos = data.videos?.length
    ? data.videos
    : mediaKitDataObject?.videos || [];

  const getCollabName = (collab: BrandCollaboration): string => {
    return collab.brand_name || 'Unnamed Brand';
  }

  const getServiceName = (service: Service): string => {
    return service.service_name || 'Unnamed Service';
  }

  // Inject CSS Variables at the root
  const rootStyleProps = {
    '--theme-bg': theme.background,
    '--theme-fg': theme.foreground,
    '--theme-primary': theme.primary,
    '--theme-light': theme.primaryLight,
    '--theme-secondary': theme.secondary,
    '--theme-accent': theme.accent,
    '--theme-neutral': theme.neutral,
    '--theme-border': theme.border,
    fontFamily: data.font || theme.font || 'Inter, sans-serif', // Apply font directly here too
  } as React.CSSProperties;

  // Construct social links for ContactInfoBlock
  const defaultContactSocialLinks: SocialLinkItem[] = [];
  if (data.instagram_handle) {
    defaultContactSocialLinks.push({ type: 'instagram', url: data.instagram_handle, label: 'Instagram' });
  }
  if (data.tiktok_handle) {
    defaultContactSocialLinks.push({ type: 'tiktok', url: data.tiktok_handle, label: 'TikTok' });
  }
  // Email and Website are handled by dedicated props in ContactInfoBlock if needed by this template's design

  return (
    <div className="media-kit space-y-8 p-6 md:p-8 rounded-lg" style={rootStyleProps}>
      <style>{responsiveTextStyles}</style>
      
      {/* Hero Section - Now uses ProfileHeaderBlock with a dedicated wrapper */}
      {(section_visibility.profileDetails || section_visibility.profilePicture || section_visibility.socialMedia) && (
        <div className="hero-wrapper rounded-[0.75rem] shadow-lg">
          <ProfileHeaderBlock
            variant="default"
            avatarUrl={data.avatar_url}
            name={data.brand_name || data.full_name || 'Your Default Name'}
            subheading={data.tagline}
            socialLinks={[
              ...(data.instagram_handle ? [{
                type: 'instagram' as const,
                url: `https://instagram.com/${data.instagram_handle.replace(/^@/, '')}`,
                label: 'Instagram',
              }] : []),
              ...(data.tiktok_handle ? [{
                type: 'tiktok' as const,
                url: `https://tiktok.com/@${data.tiktok_handle.replace(/^@/, '')}`,
                label: 'TikTok',
              }] : []),
              ...(data.contact_email || data.email ? [{
                type: 'email' as const,
                url: `mailto:${data.contact_email || data.email}`,
                label: 'Contact',
              }] : []),
            ]}
            sectionVisibility={section_visibility}
          />
        </div>
      )}

      {/* Analytics Overview - Now with a dedicated wrapper */}
      {(section_visibility.audienceStats || section_visibility.performance) && (
        <div className="analytics-overview-wrapper section rounded-[0.75rem] p-6 shadow-lg border">
          <SectionTitle>Analytics Overview</SectionTitle>
          <StatsGridBlock 
            stats={[
              // Pass ALL potential stats; filtering is now done inside StatsGridBlock
              { label: 'Total Followers', value: data.follower_count }, 
              { label: 'Engagement Rate', value: data.engagement_rate },
              { label: 'Average Likes', value: data.avg_likes },
              { label: 'Weekly Reach', value: data.reach },
            ]}
            sectionVisibility={section_visibility} // Pass sectionVisibility for internal filtering
          />
        </div>
      )}

      {/* Audience Demographics Section - NEW */}
      {section_visibility.audienceDemographics && (data.audience_age_range || data.audience_location_main || data.audience_gender_female) && (
        <div className="section rounded-lg p-6 shadow-lg border">
          <SectionTitle>Audience Demographics</SectionTitle>
          <AudienceDemographicsBlock
            ageRange={data.audience_age_range}
            location={data.audience_location_main}
            femalePct={data.audience_gender_female} // Pass raw value; block handles formatting and '%'
            sectionVisibility={section_visibility}
          />
        </div>
      )}

      {/* Portfolio Showcase - Restore bg-white */}
      {/* For now, tie portfolio to tiktokVideos visibility or brandExperience. Could be its own toggle later. */}
      {(section_visibility.tiktokVideos || section_visibility.brandExperience) && (
        <div className="section rounded-[0.75rem] p-6 shadow-lg border">
          <SectionTitle>Recent Content</SectionTitle>
          
          {(() => {
            const showVideos = section_visibility.tiktokVideos && data.videos && data.videos.length > 0;
            // const showImages = !showVideos && section_visibility.brandExperience && data.portfolio_images && data.portfolio_images.length > 0;

            if (showVideos) {
              return <VideoShowcaseBlock videos={data.videos || []} sectionVisibility={section_visibility} />;
            } /* else if (showImages) {
              return <PortfolioGridBlock images={data.portfolio_images || []} sectionVisibility={section_visibility} />;
            } */ else {
              // If not showing videos (either section off or no videos), show fallback.
              // If brandExperience is also off, this might feel odd, but it's tied to the parent visibility check.
              return <div className="text-sm text-center py-2" style={{ color: 'var(--theme-foreground)' }}>No video content to display.</div>; // Updated fallback text
            }
          })()}
        </div>
      )}

      {/* Brand Collaborations - Restore bg-white */}
      {section_visibility.brandExperience && (
        <div className="section rounded-[0.75rem] p-6 shadow-lg border">
          <SectionTitle>Brand Experience</SectionTitle>
          {(Array.isArray(data.brand_collaborations) && data.brand_collaborations.length > 0) ? (
            <BrandCollaborationBlock brands={data.brand_collaborations} sectionVisibility={section_visibility} />
          ) : (
            <div className="text-sm text-center py-2" style={{ color: 'var(--theme-foreground)' }}>No brand collaborations to display</div>
          )}
        </div>
      )}

      {/* Services - Restore bg-white */}
      {section_visibility.servicesSkills && (
        <div className="section rounded-[0.75rem] p-6 shadow-lg border">
          <SectionTitle>Services Offered</SectionTitle>
          {(Array.isArray(data.services) && data.services.length > 0) ? (
            <ServiceListBlock services={data.services} sectionVisibility={section_visibility} />
          ) : (
            <div className="text-sm text-center py-2" style={{ color: 'var(--theme-foreground)' }}>No services to display</div>
          )}
        </div>
      )}

      {/* Contact Information - Restore bg-white */}
      {section_visibility.contactDetails && (
        <div className="section rounded-[0.75rem] p-6 shadow-lg border">
          <SectionTitle>Contact Information</SectionTitle>
          <ContactInfoBlock 
            email={data.contact_email || data.email}
            website={data.website} // Add website if you want it here for Default template
            // phone={data.contact_phone} // Add phone if you want it here
            socialLinks={defaultContactSocialLinks} // Pass the constructed social links
            sectionVisibility={section_visibility} 
          />
        </div>
      )}
    </div>
  );
};

export default MediaKitTemplateDefault; 