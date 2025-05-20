import React from 'react';
import type {
  EditorPreviewData,
  TemplateTheme as ImportedTemplateTheme,
  SectionVisibilityState,
  ColorScheme,
  MediaKitStats,
  BrandCollaboration,
  Service,
  VideoItem,
} from '@/lib/types';
import type { SocialLinkItem } from '@/components/media-kit-blocks/SocialLinksBlock';

// Import Blocks
import ProfileHeaderBlock from '@/components/media-kit-blocks/ProfileHeaderBlock';
import PersonalIntroBlock from '@/components/media-kit-blocks/PersonalIntroBlock';
import StatsGridBlock from '@/components/media-kit-blocks/StatsGridBlock';
import AudienceDemographicsBlock from '@/components/media-kit-blocks/AudienceDemographicsBlock';
import PortfolioGridBlock from '@/components/media-kit-blocks/PortfolioGridBlock';
// import VideoShowcaseBlock from '@/components/media-kit-blocks/VideoShowcaseBlock'; // Not explicitly in screenshot, portfolio used instead
import BrandCollaborationBlock from '@/components/media-kit-blocks/BrandCollaborationBlock'; // Not explicitly in screenshot, but good to have as an option
import ServiceListBlock from '@/components/media-kit-blocks/ServiceListBlock'; // Not explicitly in screenshot, but good to have
import ContactInfoBlock from '@/components/media-kit-blocks/ContactInfoBlock';
import { SectionTitle } from '@/components/media-kit-blocks/SectionTitle'; // Might use custom titles
import PreviewLoadingFallback from '@/components/PreviewLoadingFallback';
import { formatNumber } from '@/lib/utils';
import SkillsListBlock from '@/components/media-kit-blocks/SkillsListBlock';

// --- Icons (simple SVGs for direct use if Heroicons aren't a perfect fit or for specific styling) ---
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919A48.978 48.978 0 0112 2.163zm0 3.805c-3.403 0-6.152 2.749-6.152 6.152s2.75 6.152 6.152 6.152 6.152-2.75 6.152-6.152c0-3.403-2.749-6.152-6.152-6.152zm0 9.995c-2.127 0-3.847-1.72-3.847-3.847s1.72-3.847 3.847-3.847 3.847 1.72 3.847 3.847c0 2.127-1.72 3.847-3.847 3.847zm6.406-9.995c-.616 0-1.114.499-1.114 1.114s.498 1.114 1.114 1.114c.615 0 1.113-.498 1.113-1.113s-.498-1.114-1.113-1.114z" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const UserIcon = () => (
  <svg fill="currentColor" viewBox="0 0 20 20" className="w-5 h-5"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
);

const GraphIcon = () => (
  <svg fill="currentColor" viewBox="0 0 20 20" className="w-5 h-5"><path d="M2 11h1v1H2v-1zm2-2h1v3H4V9zm2-5h1v8H6V4zm2-2h1v10H8V2zm2 5h1v5h-1V7zm2-3h1v8h-1V4zm2 3h1v5h-1V7z"></path></svg>
);


// Define the specific data structure this template expects
// export interface V1SpecificData extends EditorPreviewData { // Kept for potential future V1-specific fields, but empty for now.
//   // Add any V1 specific fields if needed, but aim to use EditorPreviewData
// }
// For now, V1GetPreviewData will return EditorPreviewData directly as V1SpecificData is empty.

export interface MediaKitTemplateV1Props {
  data: EditorPreviewData | null;
  theme: ImportedTemplateTheme;
  loading?: boolean;
  section_visibility: SectionVisibilityState;
}

export const V1GetPreviewData = (): EditorPreviewData => ({ // Changed return type to EditorPreviewData
  id: 'v1-placeholder-id',
  user_id: 'v1-user-id',
  username: '@emilysinsta',
  brand_name: 'EMILY.',
  full_name: 'Emily R.',
  avatar_url: 'https://via.placeholder.com/300/CCCCCC/FFFFFF?text=Emily',
  profile_photo: 'https://via.placeholder.com/300/CCCCCC/FFFFFF?text=Emily',
  colors: { 
    background: '#F8F7F4',
    text: '#333333',
    primary: '#B0A695',
    secondary: '#5C5C5C',
    accent: '#333333',
    accent_light: '#EAE6E1',
    font: 'Inter',
  } as ColorScheme,
  font: 'Inter',
  section_visibility: { // Provide a minimal valid section_visibility
    profileDetails: true, brandExperience: true, servicesSkills: true, socialMedia: true,
    contactDetails: true, profilePicture: true, tiktokVideos: true, audienceStats: true,
    performance: true, audienceDemographics: true,
  },
  media_kit_data: null,
  selected_template_id: 'v1',
  // Add other *required* fields from EditorPreviewData with basic valid values
  email: 'example@example.com',
  tagline: 'Default Tagline',
  personal_intro: 'Default intro.',
  skills: ['Content Creation', 'Photography', 'Social Media Strategy', 'Video Editing'],
  instagram_handle: '@insta',
  tiktok_handle: '@tiktok',
  portfolio_images: [
    'https://via.placeholder.com/300x600/E2E2E2/949494?text=Portfolio+1',
    'https://via.placeholder.com/300x600/D2D2D2/848484?text=Portfolio+2',
    'https://via.placeholder.com/300x600/C2C2C2/747474?text=Portfolio+3',
    'https://via.placeholder.com/300x600/B2B2B2/646464?text=Portfolio+4',
  ],
  videos: [],
  contact_email: 'contact@example.com',
  stats: [],
  brand_collaborations: [
    { id: 'collab1', profile_id: 'v1-user-id', brand_name: 'Aesthetic Brand Co.', collaboration_type: 'Sponsored Post', collaboration_date: '2023-10-15' },
    { id: 'collab2', profile_id: 'v1-user-id', brand_name: 'Minimalist Living Inc.', collaboration_type: 'Product Feature', collaboration_date: '2023-11-01' },
    { id: 'collab3', profile_id: 'v1-user-id', brand_name: 'Clean Beauty Ltd.', collaboration_type: 'Campaign', collaboration_date: '2023-09-20' },
  ],
  services: [
    { id: 'serv1', profile_id: 'v1-user-id', service_name: 'Content Creation Package', description: 'High-quality photo and video content.', price_range: '$500 - $1000' },
    { id: 'serv2', profile_id: 'v1-user-id', service_name: 'Social Media Consultation', description: 'Strategy session to boost engagement.', price_range: '$250' },
    { id: 'serv3', profile_id: 'v1-user-id', service_name: 'UGC Campaign (3 Videos)', description: 'Authentic user-generated style content.', price_range: '$750' },
  ],
  niche: 'Default Niche',
  media_kit_url: 'defaulturl',
  onboarding_complete: false,
  follower_count: 0,
  engagement_rate: 0,
  avg_likes: 0,
  reach: 0,
  instagram_followers: 0,
  tiktok_followers: 0,
  youtube_followers: 0,
  audience_age_range: '',
  audience_location_main: '',
  audience_gender_female: '',
  avg_video_views: 0,
  avg_ig_reach: 0,
  ig_engagement_rate: 0,
  showcase_images: [],
  past_brands_text: '',
  past_brands_image_url: '',
  next_steps_text: '',
  contact_phone: '',
  website: '',
});

export const V1GetThumbnailData = (): EditorPreviewData => ({
  ...V1GetPreviewData(), // Start with full preview data
  id: 'thumb-v1-id',
  brand_name: 'V1 Minimal',
  tagline: 'Clean & Modern',
  // Override other fields if needed for a more concise thumbnail
});

export const V1Theme = (): ImportedTemplateTheme => {
  const previewColors = V1GetPreviewData().colors as ColorScheme;
  return {
    background: previewColors.background,
    foreground: previewColors.text,
    primary: previewColors.primary,
    primaryLight: previewColors.accent_light, // Or calculate a lighter primary
    secondary: previewColors.secondary,
    accent: previewColors.accent,
    neutral: previewColors.secondary, // Or another muted color
    border: `color-mix(in srgb, ${previewColors.primary} 20%, transparent)`, // Subtle border
    font: previewColors.font || 'Inter',
  };
};

const MediaKitTemplateV1: React.FC<MediaKitTemplateV1Props> = ({
  data,
  theme,
  loading,
  section_visibility,
}) => {
  if (loading) {
    return <PreviewLoadingFallback />;
  }
  if (!data) {
    return <div className="p-8 text-center">No data available for this media kit.</div>;
  }

  // Apply theme as CSS variables for the preview
  const templateStyle = {
    '--theme-bg': theme.background,
    '--theme-fg': theme.foreground,
    '--theme-primary': theme.primary,
    '--theme-primary-light': theme.primaryLight,
    '--theme-secondary': theme.secondary,
    '--theme-accent': theme.accent,
    '--theme-neutral': theme.neutral,
    '--theme-border': theme.border,
    fontFamily: data.font || theme.font || 'Inter, sans-serif',
  } as React.CSSProperties;

  // Fallback for section visibility if not provided
  const currentVisibility = section_visibility || V1GetPreviewData().section_visibility;

  const {
    username,
    brand_name,
    full_name,
    tagline,
    personal_intro,
    avatar_url,
    profile_photo,
    instagram_handle,
    tiktok_handle,
    contact_email,
    website,
    contact_phone,
    instagram_followers,
    tiktok_followers,
    youtube_followers,
    audience_age_range,
    audience_location_main,
    audience_gender_female,
    avg_video_views,
    avg_ig_reach,
    ig_engagement_rate,
    portfolio_images,
    skills,
    niche,
    brand_collaborations,
    services,
  } = data;
  
  const displayBrandName = brand_name || full_name || "Creator Name";
  const displayUsername = instagram_handle ? `@${instagram_handle.replace(/^@/, '')}` : username || "";
  const nicheTags = tagline || niche || (skills && skills.length > 0 ? skills.join(' | ') : "Content Creator");


  // Custom CSS for V1 Template
  const styles = `
    .v1-template-container {
      background-color: var(--theme-bg, #F8F7F4);
      color: var(--theme-fg, #333333);
      padding: 20px;
      max-width: 900px; /* Max width of template */
      margin: auto;
      font-family: ${data.font || theme.font || 'Inter, sans-serif'};
      line-height: 1.6;
    }
    @media (min-width: 768px) {
      .v1-template-container {
        padding: 40px; /* More padding on larger screens */
      }
    }

    .v1-header-zone {
      background-color: var(--theme-primary-light, #EAE6E1);
      padding: 30px 25px;
      border-radius: 16px; /* Slightly larger radius */
      margin-bottom: 40px; /* Increased spacing */
    }
    @media (min-width: 768px) {
      .v1-header-zone {
        padding: 40px 35px;
      }
    }

    .v1-main-content {
      display: grid;
      grid-template-columns: 1fr;
      gap: 40px; /* Increased gap */
    }
    @media (min-width: 768px) {
      .v1-main-content {
        grid-template-columns: 1fr 2fr; /* Retain 1/3 and 2/3 split */
      }
    }

    .v1-left-column, .v1-right-column {
      display: flex;
      flex-direction: column;
      gap: 30px; /* Consistent gap within columns */
    }

    .v1-profile-image-container {
      display: flex;
      justify-content: center;
    }
    .v1-profile-image {
      width: 160px; /* Slightly increased */
      height: 160px;
      border-radius: 50%;
      object-fit: cover;
      border: 5px solid var(--theme-primary, #B0A695);
      margin-bottom: 15px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    @media (min-width: 768px) {
      .v1-profile-image-container {
        justify-content: flex-start;
      }
      .v1-profile-image {
        width: 180px;
        height: 180px;
      }
    }

    .v1-creator-info-header {
      text-align: center;
    }
    .v1-creator-username {
      color: var(--theme-secondary, #5C5C5C);
      font-size: 0.85rem; /* Fine-tuned */
      font-weight: 500; /* Medium weight for username */
      letter-spacing: 0.075em;
      margin-bottom: 6px;
      text-transform: uppercase;
    }
    .v1-creator-brandname {
      color: var(--theme-accent, #333333); 
      font-size: clamp(2.8rem, 5vw, 3.8rem); /* Responsive font size */
      font-weight: 700;
      line-height: 1.15;
      margin-bottom: 10px;
      letter-spacing: -0.01em; /* Slight tightening */
    }
    .v1-creator-niche {
      color: var(--theme-secondary, #5C5C5C);
      font-size: 0.75rem; /* Fine-tuned */
      font-weight: 500;
      letter-spacing: 0.12em; /* Wider spacing for tags */
      text-transform: uppercase;
    }

    .v1-platform-stats {
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 20px 0;
      gap: 15px;
      border-top: 1px solid var(--theme-border, #D1CFCB);
      border-bottom: 1px solid var(--theme-border, #D1CFCB);
      margin-top: 25px;
      margin-bottom: 25px;
    }
    .v1-platform-stat-item {
      text-align: center;
      color: var(--theme-foreground, #333333);
    }
    .v1-platform-stat-item svg {
      margin: 0 auto 10px auto;
      fill: var(--theme-accent, #333333);
      width: 22px; /* Slightly smaller icons */
      height: 22px;
    }
    .v1-platform-stat-value {
      font-size: 1.4rem; /* Adjusted */
      font-weight: 600;
      line-height: 1.2;
    }
    .v1-platform-stat-label {
      font-size: 0.7rem; /* Adjusted */
      color: var(--theme-secondary, #5C5C5C);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .v1-section {
      /* Sections are now seamless with page bg, spacing defines them */
    }
    .v1-section-title {
      font-size: 1.0rem; /* Slightly smaller, more refined */
      font-weight: 600;
      text-transform: uppercase;
      color: var(--theme-accent, #333333);
      margin-bottom: 20px; /* Increased spacing after title */
      padding-bottom: 8px; /* Increased padding for underline */
      border-bottom: 2px solid var(--theme-primary, #B0A695);
      display: inline-block;
      letter-spacing: 0.05em;
    }
    
    .v1-audience-stats, .v1-key-stats {
      display: flex;
      justify-content: space-between; /* Space between for a cleaner look */
      gap: 20px;
      text-align: center;
      padding: 10px 0; /* Added padding */
    }
    .v1-audience-stat-item, .v1-key-stat-item {
      color: var(--theme-foreground, #333333);
      flex: 1; /* Allow items to grow and take space */
    }
    .v1-audience-stat-item .value, .v1-key-stat-item .value {
      font-size: 1.7rem; /* Adjusted */
      font-weight: 600;
      color: var(--theme-accent, #333333);
      line-height: 1.2;
      margin-bottom: 4px; /* Spacing between value and label */
    }
    .v1-audience-stat-item .icon, .v1-key-stat-item .icon {
      margin: 0 auto 10px auto;
      fill: var(--theme-primary, #B0A695); /* Match primary for these icons */
    }
    .v1-audience-stat-item .label, .v1-key-stat-item .label {
      font-size: 0.75rem; /* Adjusted */
      color: var(--theme-secondary, #5C5C5C);
      line-height: 1.3;
    }
    .v1-key-stats .v1-key-stat-item .icon svg { /* Target nested SVG */
        width: 28px;
        height: 28px;
    }
     .v1-audience-stats .v1-audience-stat-item .icon svg { /* Target nested SVG */
        width: 28px;
        height: 28px;
    }

    /* Styling for PersonalIntroBlock content if needed */
    .v1-section .personal-intro-text p {
      color: var(--theme-secondary, #5C5C5C); /* Softer text for intro */
      font-size: 0.95rem;
      line-height: 1.7;
    }
    
    /* Styling for SkillsListBlock */
    .skills-list {
      display: flex; 
      flex-wrap: wrap; 
      gap: 10px;
    }
    .skill-tag {
      background-color: var(--theme-primary-light, #EAE6E1) !important; /* Ensure override */
      color: var(--theme-accent, #333333) !important; /* Ensure override */
      border-radius: 20px; /* Pill shape */
      padding: 8px 15px;
      font-size: 0.8rem;
      font-weight: 500;
      border: 1px solid var(--theme-border, #D1CFCB);
    }

    /* Styling for ServiceListBlock */
    .service-list-item {
      background-color: var(--theme-primary-light, #EAE6E1);
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 10px;
      border: 1px solid var(--theme-border, #D1CFCB);
    }
    .service-list-item h5 { /* Service Name */
      color: var(--theme-accent, #333333);
      font-weight: 600;
      font-size: 1rem;
      margin-bottom: 5px;
    }
    .service-list-item p { /* Service Description */
      color: var(--theme-secondary, #5C5C5C);
      font-size: 0.85rem;
      margin-bottom: 8px;
    }
    .service-list-item .price-range {
      color: var(--theme-accent, #333333);
      font-size: 0.9rem;
      font-weight: 500;
    }

    /* Styling for BrandCollaborationBlock */
    .brand-collaboration-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
    }
    .brand-collaboration-item {
      background-color: var(--theme-primary-light, #EAE6E1);
      padding: 12px;
      border-radius: 8px;
      text-align: center;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--theme-accent, #333333);
      border: 1px solid var(--theme-border, #D1CFCB);
    }

    .v1-portfolio-title { /* Using v1-section-title */ }
    .v1-phone-mockup-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); /* Slightly smaller min for better fit */
      gap: 25px; /* Increased gap */
      padding: 10px 0; /* Reduced top/bottom padding */
    }
    @media (min-width: 640px) {
      .v1-phone-mockup-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }
    .v1-phone-mockup {
      background-color: #2C2C2E; /* Slightly lighter dark grey */
      border-radius: 30px; /* More rounded */
      padding: 12px; /* Increased padding */
      box-shadow: 0 6px 20px rgba(0,0,0,0.15);
      aspect-ratio: 9 / 19.5; /* Fine-tuned aspect ratio */
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .v1-phone-screen {
      background-color: #000;
      width: 100%;
      height: 100%;
      border-radius: 18px; /* More rounded screen */
      overflow: hidden;
    }
    .v1-phone-screen img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .v1-contact-footer {
      margin-top: 50px; /* Increased spacing */
      padding-top: 30px;
      border-top: 1px solid var(--theme-border, #D1CFCB);
      text-align: center;
    }
    .v1-contact-footer .contact-info-item {
      margin: 0 12px; /* Slightly more space */
      display: inline-block;
      color: var(--theme-secondary, #5C5C5C);
      font-size: 0.9rem;
    }
    .v1-contact-footer .contact-info-item a {
      color: var(--theme-accent, #333333);
      text-decoration: none;
      font-weight: 500;
    }
    .v1-contact-footer .contact-info-item a:hover {
      text-decoration: underline;
      color: var(--theme-primary, #B0A695);
    }
    
    /* Let's Chat specific styling in left column */
    .v1-left-column .v1-section > a.lets-chat-email {
        font-size: 1rem;
        font-weight: 500;
        display: inline-block; /* Allow underline to be tight */
        padding: 2px 0;
        border-bottom: 1px solid transparent; /* For hover effect */
    }
    .v1-left-column .v1-section > a.lets-chat-email:hover {
        color: var(--theme-primary, #B0A695);
        border-bottom-color: var(--theme-primary, #B0A695);
        text-decoration: none;
    }

  `;

  return (
    <>
      <style>{styles}</style>
      <div className="v1-template-container" style={templateStyle}>
        <div className="v1-header-zone">
          {currentVisibility.profileDetails && (
            <div className="v1-creator-info-header">
              {displayUsername && <div className="v1-creator-username">{displayUsername}</div>}
              <div className="v1-creator-brandname">{displayBrandName}</div>
              {nicheTags && <div className="v1-creator-niche">{nicheTags}</div>}
            </div>
          )}
          {currentVisibility.socialMedia && (instagram_followers || tiktok_followers || youtube_followers) && (
            <div className="v1-platform-stats">
              {instagram_followers && (
                <div className="v1-platform-stat-item">
                  <InstagramIcon />
                  <div className="v1-platform-stat-value">{formatNumber(instagram_followers)}</div>
                  <div className="v1-platform-stat-label">Followers</div>
                </div>
              )}
              {tiktok_followers && (
                <div className="v1-platform-stat-item">
                  <TikTokIcon />
                  <div className="v1-platform-stat-value">{formatNumber(tiktok_followers)}</div>
                  <div className="v1-platform-stat-label">Followers</div>
                </div>
              )}
              {youtube_followers && (
                <div className="v1-platform-stat-item">
                  <YouTubeIcon />
                  <div className="v1-platform-stat-value">{formatNumber(youtube_followers)}</div>
                  <div className="v1-platform-stat-label">Followers</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="v1-main-content">
          <div className="v1-left-column">
            {currentVisibility.profilePicture && (
              <div className="v1-profile-image-container">
                <img 
                  src={profile_photo || avatar_url || 'https://via.placeholder.com/180'} 
                  alt={displayBrandName}
                  className="v1-profile-image" 
                />
              </div>
            )}
            {currentVisibility.profileDetails && personal_intro && (
              <div className="v1-section">
                <h3 className="v1-section-title">About Me</h3>
                <div className="personal-intro-text">
                  <PersonalIntroBlock text={personal_intro} sectionVisibility={currentVisibility} />
                </div>
              </div>
            )}
            {currentVisibility.contactDetails && contact_email && (
              <div className="v1-section">
                <h3 className="v1-section-title">Let's Chat</h3>
                <a href={`mailto:${contact_email}`} className="lets-chat-email block hover:underline" style={{color: 'var(--theme-accent)'}}>{contact_email}</a>
              </div>
            )}
          </div>

          <div className="v1-right-column">
            {currentVisibility.audienceDemographics && (audience_age_range || audience_location_main || audience_gender_female) && (
              <div className="v1-section">
                <h3 className="v1-section-title">Audience</h3>
                <div className="v1-audience-stats">
                  {audience_age_range && <div className="v1-audience-stat-item"><div className="icon"><UserIcon /></div><div className="value">{audience_age_range}</div><div className="label">Age Range</div></div>}
                  {audience_location_main && <div className="v1-audience-stat-item"><div className="icon"><UserIcon /></div>{/* Placeholder for location icon if available */}<div className="value">{audience_location_main}</div><div className="label">Primary Location</div></div>}
                  {audience_gender_female && <div className="v1-audience-stat-item"><div className="icon"><UserIcon /></div><div className="value">{audience_gender_female}</div><div className="label">Female</div></div>}
                </div>
              </div>
            )}
            {currentVisibility.performance && (avg_video_views || avg_ig_reach || ig_engagement_rate) && (
              <div className="v1-section">
                <h3 className="v1-section-title">Key Stats</h3>
                <div className="v1-key-stats">
                  {avg_video_views && <div className="v1-key-stat-item"><div className="icon"><GraphIcon /></div><div className="value">{formatNumber(avg_video_views)}</div><div className="label">Avg. Video Views</div></div>}
                  {avg_ig_reach && <div className="v1-key-stat-item"><div className="icon"><GraphIcon /></div><div className="value">{formatNumber(avg_ig_reach)}</div><div className="label">Avg. IG Reach</div></div>}
                  {ig_engagement_rate && <div className="v1-key-stat-item"><div className="icon"><GraphIcon /></div><div className="value">{ig_engagement_rate}%</div><div className="label">IG Engagement Rate</div></div>}
                </div>
              </div>
            )}
            {currentVisibility.servicesSkills && skills && skills.length > 0 && (
              <div className="v1-section">
                <h3 className="v1-section-title">Skills</h3>
                <SkillsListBlock skills={skills} sectionVisibility={currentVisibility} />
              </div>
            )}
          </div>
        </div>
        
        {currentVisibility.servicesSkills && services && services.length > 0 && (
          <div className="v1-section mt-8">
            <h3 className="v1-section-title">Services Offered</h3>
            <ServiceListBlock services={services} sectionVisibility={currentVisibility} />
          </div>
        )}

        {currentVisibility.brandExperience && brand_collaborations && brand_collaborations.length > 0 && (
          <div className="v1-section mt-8">
            <h3 className="v1-section-title">Brand Collaborations</h3>
            <BrandCollaborationBlock brands={brand_collaborations} sectionVisibility={currentVisibility} />
          </div>
        )}

        {currentVisibility.tiktokVideos && portfolio_images && portfolio_images.length > 0 && (
          <div className="v1-section mt-8">
            <div className="v1-phone-mockup-grid">
              {portfolio_images.slice(0, 4).map((imgUrl, index) => ( // Max 4 images like screenshot
                <div key={index} className="v1-phone-mockup">
                  <div className="v1-phone-screen">
                    <img src={imgUrl} alt={`Portfolio image ${index + 1}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentVisibility.contactDetails && (contact_email || website || contact_phone) && (
            <div className="v1-contact-footer">
                {contact_email && <span className="contact-info-item"><a href={`mailto:${contact_email}`}>{contact_email}</a></span>}
                {website && <span className="contact-info-item"><a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer">{website}</a></span>}
                {contact_phone && <span className="contact-info-item">{contact_phone}</span>}
            </div>
        )}
        
      </div>
    </>
  );
};

export default MediaKitTemplateV1; 