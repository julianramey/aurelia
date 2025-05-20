import React from 'react';
import type {
  EditorPreviewData,
  TemplateTheme as ImportedTemplateTheme,
  SectionVisibilityState,
  ColorScheme,
  MediaKitStats as OriginalMediaKitStats,
  BrandCollaboration,
  Service,
  VideoItem,
} from '@/lib/types';
import type { SocialLinkItem } from '@/components/media-kit-blocks/SocialLinksBlock';
import { motion } from 'framer-motion';
import { getPlaceholderData, DEFAULT_COLORS } from '@/lib/placeholder-data';

// Import Block Components
import ProfileHeaderBlock from '@/components/media-kit-blocks/ProfileHeaderBlock';
import PersonalIntroBlock from '@/components/media-kit-blocks/PersonalIntroBlock';
import StatsGridBlock from '@/components/media-kit-blocks/StatsGridBlock';
import AudienceDemographicsBlock from '@/components/media-kit-blocks/AudienceDemographicsBlock';
import PortfolioGridBlock from '@/components/media-kit-blocks/PortfolioGridBlock';
import VideoShowcaseBlock from '@/components/media-kit-blocks/VideoShowcaseBlock';
import BrandCollaborationBlock from '@/components/media-kit-blocks/BrandCollaborationBlock';
import ServiceListBlock from '@/components/media-kit-blocks/ServiceListBlock';
import ContactInfoBlock from '@/components/media-kit-blocks/ContactInfoBlock';
import SkillsListBlock from '@/components/media-kit-blocks/SkillsListBlock';
import SocialLinksBlock from '@/components/media-kit-blocks/SocialLinksBlock';

import PreviewLoadingFallback from '@/components/PreviewLoadingFallback';
import { formatNumber } from '@/lib/utils';

// Placeholder icons
const EmailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" /><path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" /></svg>;
const WebsiteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 10.707V17.5a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 011 17.5V10.707a1 1 0 01.293-.707l7-7zM13 13a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1z" /></svg>;
const InstagramIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919A48.978 48.978 0 0112 2.163zm0 3.805c-3.403 0-6.152 2.749-6.152 6.152s2.75 6.152 6.152 6.152 6.152-2.75 6.152-6.152c0-3.403-2.749-6.152-6.152-6.152zm0 9.995c-2.127 0-3.847-1.72-3.847-3.847s1.72-3.847 3.847-3.847 3.847 1.72 3.847 3.847c0 2.127-1.72 3.847-3.847-3.847zm6.406-9.995c-.616 0-1.114.499-1.114 1.114s.498 1.114 1.114 1.114c.615 0 1.113-.498 1.113-1.113s-.498-1.114-1.113-1.114z" /></svg>;
const TikTokIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>;
const YouTubeIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>;

// Local StatItem definition to match StatsGridBlock props
interface StatItem { label: string; value: string; iconName?: string; }

export interface MediaKitTemplateElegantProps {
  data: EditorPreviewData | null;
  theme: ImportedTemplateTheme;
  loading?: boolean;
  section_visibility: SectionVisibilityState;
}

export const ElegantGetPreviewData = (): EditorPreviewData => {
  const placeholder = getPlaceholderData('elegant') as Partial<EditorPreviewData>; // Cast to Partial<EditorPreviewData> for better type hints
  const defaultColorsFromPlaceholder = getPlaceholderData('elegant').colors || DEFAULT_COLORS;
  const defaultFontFromPlaceholder = getPlaceholderData('elegant').font || 'Playfair Display';
  const defaultSectionVisibilityFromPlaceholder = getPlaceholderData('elegant').section_visibility;

  return {
    id: placeholder.id || 'elegant-placeholder-id',
    user_id: placeholder.user_id || 'elegant-user-id',
    username: placeholder.username || '@elegantcreator',
    brand_name: placeholder.brand_name || 'ELEGANCE & CO.',
    full_name: placeholder.full_name || 'Eleanor Vance',
    avatar_url: placeholder.profile_photo || placeholder.avatar_url || 'https://via.placeholder.com/400/EEE8E4/5C524D?text=EV',
    profile_photo: placeholder.profile_photo || placeholder.avatar_url || 'https://via.placeholder.com/400/EEE8E4/5C524D?text=EV',
    colors: defaultColorsFromPlaceholder,
    font: defaultFontFromPlaceholder,
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
    media_kit_data: null,
    selected_template_id: 'elegant',
    email: placeholder.email || 'eleanor@example.com', // Main email for the profile
    tagline: placeholder.tagline || 'Timeless Style & Modern Sophistication',
    personal_intro: placeholder.personal_intro || 'A curator of refined experiences and aesthetics, dedicated to bringing a touch of elegance to the everyday. Exploring the world of art, design, and mindful living.',
    skills: placeholder.skills || ['Creative Direction', 'Brand Curation', 'Visual Storytelling', 'Luxury Content'],
    instagram_handle: placeholder.instagram_handle || 'elegance.and.co',
    tiktok_handle: placeholder.tiktok_handle || 'elegant.tok',
    youtube_handle: placeholder.youtube_handle || 'TheElegantPerspective',
    portfolio_images: placeholder.portfolio_images || [
      'https://via.placeholder.com/800x600/E0D8D0/6B5F57?text=Portfolio+Elegant+1',
      'https://via.placeholder.com/800x600/C8BBAE/6B5F57?text=Portfolio+Elegant+2',
      'https://via.placeholder.com/800x600/F5F1ED/6B5F57?text=Portfolio+Elegant+3',
    ],
    videos: placeholder.videos || [ { url: 'https://example.com/video1', thumbnail_url: 'https://via.placeholder.com/400x250/D3C9C2/6B5F57?text=Video+1' } ],
    contact_email: placeholder.contact_email || 'contact@eleganceandco.com', // Specific contact email
    website: placeholder.website || 'www.eleganceandco.com',
    contact_phone: placeholder.contact_phone || '+1 987 654 3210',
    stats: placeholder.stats || [] as OriginalMediaKitStats[],
    brand_collaborations: placeholder.brand_collaborations || [ { id: 'ecollab1', profile_id: 'el-user-id', brand_name: 'Luxe & Co.', collaboration_type: 'Campaign Feature', collaboration_date: '2024-02-01' } ],
    services: placeholder.services || [ { id: 'eserv1', profile_id: 'el-user-id', service_name: 'Brand Consulting', description: 'Elevating brand identity with a touch of sophistication.', price_range: 'Inquire' } ],
    niche: placeholder.niche || 'Luxury Lifestyle & Design',
    media_kit_url: placeholder.media_kit_url || 'eleanor-vance-kit',
    onboarding_complete: placeholder.onboarding_complete !== undefined ? placeholder.onboarding_complete : true,
    follower_count: parseFloat(String(placeholder.follower_count || placeholder.instagram_followers || 150000)) || 150000,
    engagement_rate: parseFloat(String(placeholder.engagement_rate || placeholder.ig_engagement_rate || 0.045)) || 0.045,
    avg_likes: parseFloat(String(placeholder.avg_likes || 7000)) || 7000,
    reach: parseFloat(String(placeholder.reach || placeholder.avg_ig_reach || 950000)) || 950000,
    instagram_followers: parseFloat(String(placeholder.instagram_followers || 150000)) || 150000,
    tiktok_followers: parseFloat(String(placeholder.tiktok_followers || 75000)) || 75000,
    youtube_followers: parseFloat(String(placeholder.youtube_followers || 25000)) || 25000,
    audience_age_range: placeholder.audience_age_range || '28-55',
    audience_location_main: placeholder.audience_location_main || 'Paris, Milan, New York',
    audience_gender_female: placeholder.audience_gender_female || '65%',
    avg_video_views: parseFloat(String(placeholder.avg_video_views || 90000)) || 90000,
    avg_ig_reach: parseFloat(String(placeholder.avg_ig_reach || 800000)) || 800000,
    ig_engagement_rate: parseFloat(String(placeholder.ig_engagement_rate || 0.045)) || 0.045,
    showcase_images: placeholder.showcase_images || [],
    past_brands_text: placeholder.past_brands_text || '',
    past_brands_image_url: placeholder.past_brands_image_url || '',
    next_steps_text: placeholder.next_steps_text || 'Let\'s create something exceptional.',
  };
};

export const ElegantGetThumbnailData = (): EditorPreviewData => {
  // Thumbnail data should also source from getPlaceholderData for consistency in fallbacks
  // but override with thumbnail-specific, minimal values.
  const placeholder = getPlaceholderData('elegant');
  const elegantColors = placeholder.colors || DEFAULT_COLORS;
  const elegantFont = placeholder.font || 'Playfair Display';

  return {
    id: 'thumb-elegant-id',
    user_id: 'uid-elegant-thumb',
    username: '@elegant_thumb',
    full_name: 'Eleanor Vance (Thumbnail)',
    email: 'thumb_preview@elegant.com',
    avatar_url: 'https://via.placeholder.com/150/D3C9C2/4A3F37?text=ET',
    profile_photo: 'https://via.placeholder.com/150/D3C9C2/4A3F37?text=ET',
    website: 'www.elegantthumb.com',
    niche: 'Luxury Lifestyle Thumbnail',
    media_kit_url: 'elegant-thumb-kit',
    onboarding_complete: true,
    brand_name: 'Elegant Thumbnail',
    tagline: 'Sophistication in Miniature',
    colors: elegantColors,
    font: elegantFont,
    personal_intro: 'A brief, elegant thumbnail preview.',
    skills: [],
    instagram_handle: '@el_thumb_insta',
    tiktok_handle: '@el_thumb_tok',
    youtube_handle: 'ElegantThumbChannel',
    videos: [],
    portfolio_images: [],
    stats: [],
    follower_count: 1234,
    engagement_rate: 1.2,
    avg_likes: 12,
    reach: 345,
    instagram_followers: 1234,
    tiktok_followers: 567,
    youtube_followers: 123,
    avg_video_views: 45,
    avg_ig_reach: 234,
    ig_engagement_rate: 1.1,
    brand_collaborations: [],
    services: [],
    audience_age_range: '25-55',
    audience_location_main: 'Global Cities',
    audience_gender_female: '60%',
    showcase_images: [],
    past_brands_text: '',
    past_brands_image_url: '',
    next_steps_text: 'Connect for elegance.',
    contact_email: 'thumb_contact@elegant.com',
    contact_phone: '',
    section_visibility: {
      profileDetails: true, brandExperience: false, servicesSkills: false, socialMedia: true,
      contactDetails: false, profilePicture: true, tiktokVideos: false, audienceStats: true,
      performance: true, audienceDemographics: false
    },
    media_kit_data: null,
    selected_template_id: 'elegant',
  };
};

export const ElegantTheme = (): ImportedTemplateTheme => {
  const placeholder = getPlaceholderData('elegant');
  const c = placeholder.colors || DEFAULT_COLORS;
  
  return {
    background: c.background,
    foreground: c.text,
    primary: c.primary || c.accent, // Fallback primary to accent if primary isn't in ColorScheme
    primaryLight: c.accent_light,
    secondary: c.secondary,
    accent: c.accent,
    neutral: c.secondary, // As per previous logic, neutral often maps to secondary
    border: `${c.primary || c.accent}33`, // Use primary or accent for border
    font: placeholder.font || 'Playfair Display, serif', // Use specific font for Elegant
  };
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const motionProps = (delay = 0) => ({
  initial: "hidden",
  whileInView: "visible",
  viewport: { once: true, amount: 0.1 },
  variants: sectionVariants,
  transition: { duration: 0.5, ease: "easeOut", delay }
});

const MediaKitTemplateElegant: React.FC<MediaKitTemplateElegantProps> = ({
  data,
  theme: initialTheme,
  loading,
  section_visibility,
}) => {
  if (loading) return <PreviewLoadingFallback />;
  if (!data) return <div className="p-8 text-center text-gray-500 font-serif">No data available.</div>;

  const theme = initialTheme || ElegantTheme();

  const templateStyle: React.CSSProperties = {
    '--background': theme.background,
    '--foreground': theme.foreground,
    '--primary': theme.primary,
    '--primary-light': theme.primaryLight,
    '--secondary': theme.secondary,
    '--accent': theme.accent,
    '--neutral': theme.neutral,
    '--border': theme.border,
    '--font-family-heading': theme.font || 'Playfair Display, serif',
    '--font-family-body': theme.font ? `${theme.font}, Lato, sans-serif` : 'Lato, sans-serif',
    '--spacing-unit': '8px',
    '--spacing-xs': 'calc(var(--spacing-unit) * 0.5)',
    '--spacing-sm': 'var(--spacing-unit)',
    '--spacing-md': 'calc(var(--spacing-unit) * 2)',
    '--spacing-lg': 'calc(var(--spacing-unit) * 3)',
    '--spacing-xl': 'calc(var(--spacing-unit) * 4)',
    '--spacing-xxl': 'calc(var(--spacing-unit) * 6)',
  } as React.CSSProperties;

  const currentVisibility = section_visibility || ElegantGetPreviewData().section_visibility;

  const headerSocialLinks: SocialLinkItem[] = [];
  if (data.instagram_handle) headerSocialLinks.push({ type: 'instagram', url: `https://instagram.com/${data.instagram_handle.replace(/^@/, '')}`, label: `@${data.instagram_handle.replace(/^@/, '')}` });
  if (data.tiktok_handle) headerSocialLinks.push({ type: 'tiktok', url: `https://tiktok.com/@${data.tiktok_handle.replace(/^@/, '')}`, label: `@${data.tiktok_handle.replace(/^@/, '')}` });
  if (data.youtube_handle) headerSocialLinks.push({ type: 'youtube', url: `https://youtube.com/@${data.youtube_handle.replace(/^@/, '')}`, label: `${data.youtube_handle.replace(/^@/, '')}` });
  
  const connectSocialLinks: SocialLinkItem[] = [];
  if (data.instagram_handle) connectSocialLinks.push({ type: 'instagram', url: `https://instagram.com/${data.instagram_handle.replace(/^@/, '')}`, label: `@${data.instagram_handle.replace(/^@/, '')}`, icon: <InstagramIcon/> });
  if (data.tiktok_handle) connectSocialLinks.push({ type: 'tiktok', url: `https://tiktok.com/@${data.tiktok_handle.replace(/^@/, '')}`, label: `@${data.tiktok_handle.replace(/^@/, '')}`, icon: <TikTokIcon/> });
  if (data.youtube_handle) connectSocialLinks.push({ type: 'youtube', url: `https://youtube.com/@${data.youtube_handle.replace(/^@/, '')}`, label: data.youtube_handle.replace(/^@/, ''), icon: <YouTubeIcon/> });

  const engagementRate = Number(data.ig_engagement_rate) || 0;
  const mediaKitStatsForBlock: StatItem[] = [
    { label: "Instagram", value: formatNumber(data.instagram_followers || 0), iconName: "instagram" },
    { label: "TikTok", value: formatNumber(data.tiktok_followers || 0), iconName: "tiktok" },
    { label: "YouTube", value: formatNumber(data.youtube_followers || 0), iconName: "youtube" },
    { label: "Avg. Views", value: formatNumber(data.avg_video_views || 0), iconName: "eye" },
    { label: "IG Reach", value: formatNumber(data.avg_ig_reach || 0), iconName: "users" },
    { label: "IG Engagement", value: `${engagementRate.toFixed(1)}%`, iconName: "heart" },
  ];
  
  const globalStyles = `
    .elegant-container-root {
      background-color: var(--background);
      color: var(--foreground);
      font-family: var(--font-family-body);
      line-height: 1.7;
      font-weight: 300;
    }
    .elegant-container-root h1, .elegant-container-root h2, .elegant-container-root h3, .elegant-container-root h4, .elegant-container-root .font-heading {
      font-family: var(--font-family-heading);
      color: var(--primary);
      font-weight: 600;
    }
    .elegant-container-root h1 { font-size: 3rem; margin-bottom: var(--spacing-md); line-height: 1.2; }
    .elegant-container-root h2 { font-size: 2.25rem; margin-bottom: var(--spacing-md); line-height: 1.2; }
    .elegant-container-root h3 { font-size: 1.5rem; margin-bottom: var(--spacing-sm); line-height: 1.3; }
    .elegant-container-root h4 { font-size: 1.25rem; margin-bottom: var(--spacing-xs); line-height: 1.3; }
    .elegant-container-root p { margin-bottom: var(--spacing-md); font-size: 1rem; color: var(--secondary); }
    .elegant-container-root a { color: var(--accent); text-decoration: none; transition: color 0.3s ease; }
    .elegant-container-root a:hover { color: var(--primary); }

    .elegant-section {
      padding: var(--spacing-xxl) var(--spacing-xl);
    }
    @media (max-width: 768px) {
      .elegant-section { padding: var(--spacing-xl) var(--spacing-lg); }
    }
    .elegant-section-title-wrapper {
      text-align: center;
      margin-bottom: var(--spacing-xl);
    }
    .elegant-section-title-wrapper h2 {
      color: var(--primary);
      letter-spacing: 0.05em;
      text-transform: uppercase;
      font-weight: 700;
    }
    .elegant-section-subtitle {
      font-size: 1.125rem;
      color: var(--secondary);
      margin-top: calc(-1 * var(--spacing-md));
      font-family: var(--font-family-body);
      font-weight: 300;
    }
    .content-card {
      background-color: var(--background); 
      border: 1px solid var(--border);
      padding: var(--spacing-lg);
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.03);
    }
  `;

  return (
    <>
      <style jsx global>{globalStyles}</style>
      <div className="elegant-container-root mx-auto max-w-6xl" style={templateStyle}>
        
        {currentVisibility.profilePicture && (
          <motion.div {...motionProps()}>
            {loading ? <div className="min-h-[300px] flex items-center justify-center"><PreviewLoadingFallback/></div> :
              <ProfileHeaderBlock
                variant="hero"
                avatarUrl={data.profile_photo || data.avatar_url}
                name={data.brand_name || data.full_name || "Creator Name"}
                subheading={data.tagline}
                socialLinks={headerSocialLinks}
                sectionVisibility={currentVisibility}
              />
            }
          </motion.div>
        )}

        <div className="main-content-grid grid md:grid-cols-12 gap-x-[var(--spacing-lg)] p-[var(--spacing-xl)]">
          <motion.aside 
            aria-label="Creator Details and Contact"
            className="md:col-span-4 space-y-[var(--spacing-lg)]"
            {...motionProps(0.1)}
          >
            {currentVisibility.profileDetails && data.personal_intro && (
              <motion.div className="content-card" {...motionProps(0.15)}>
                {loading ? <PreviewLoadingFallback/> : <>
                  <h3 className="font-heading text-xl mb-[var(--spacing-sm)] text-[var(--primary)]">About</h3>
                  <PersonalIntroBlock text={data.personal_intro} sectionVisibility={currentVisibility} />
                </>}
              </motion.div>
            )}
            {currentVisibility.socialMedia && connectSocialLinks.length > 0 && (
                <motion.div className="content-card" {...motionProps(0.2)}>
                  {loading ? <PreviewLoadingFallback/> : <>
                    <h3 className="font-heading text-xl mb-[var(--spacing-sm)] text-[var(--primary)]">Connect</h3>
                    <SocialLinksBlock
                      links={connectSocialLinks}
                    />
                  </>}
                </motion.div>
            )}
             {currentVisibility.contactDetails && (data.contact_email || data.contact_phone || data.website) && (
              <motion.div className="content-card" {...motionProps(0.25)}>
                {loading ? <PreviewLoadingFallback/> : <>
                  <h3 className="font-heading text-xl mb-[var(--spacing-sm)] text-[var(--primary)]">Contact</h3>
                  <ContactInfoBlock
                    email={data.contact_email}
                    phone={data.contact_phone}
                    website={data.website}
                    sectionVisibility={currentVisibility}
                  />
                </>}
              </motion.div>
            )}
          </motion.aside>

          <motion.main 
            aria-label="Creator Statistics and Skills"
            className="md:col-span-8 space-y-[var(--spacing-lg)]"
            {...motionProps(0.15)}
          >
            {currentVisibility.performance && mediaKitStatsForBlock.length > 0 && (
              <motion.div className="content-card" {...motionProps(0.2)}>
                 {loading ? <PreviewLoadingFallback/> : <>
                   <h3 className="font-heading text-xl mb-[var(--spacing-sm)] text-[var(--primary)]">Performance Metrics</h3>
                  <StatsGridBlock 
                      stats={mediaKitStatsForBlock} 
                      sectionVisibility={currentVisibility} 
                  />
                 </>}
              </motion.div>
            )}
            {currentVisibility.audienceDemographics && (data.audience_age_range || data.audience_location_main || data.audience_gender_female) && (
              <motion.div className="content-card" {...motionProps(0.25)}>
                 {loading ? <PreviewLoadingFallback/> : <>
                   <h3 className="font-heading text-xl mb-[var(--spacing-sm)] text-[var(--primary)]">Audience Insights</h3>
                  <AudienceDemographicsBlock
                    ageRange={data.audience_age_range}
                    location={data.audience_location_main}
                    femalePct={data.audience_gender_female || "0"}
                    sectionVisibility={currentVisibility}
                  />
                 </>}
              </motion.div>
            )}
            {currentVisibility.servicesSkills && data.skills && data.skills.length > 0 && (
               <motion.div className="content-card" {...motionProps(0.3)}>
                 {loading ? <PreviewLoadingFallback/> : <>
                   <h3 className="font-heading text-xl mb-[var(--spacing-sm)] text-[var(--primary)]">Expertise</h3>
                  <SkillsListBlock 
                      skills={data.skills} 
                      sectionVisibility={currentVisibility}
                  />
                 </>}
              </motion.div>
            )}
          </motion.main>
        </div>
        
        {currentVisibility.brandExperience && data.portfolio_images && data.portfolio_images.length > 0 && (
          <motion.section aria-labelledby="portfolio-title" className="elegant-section portfolio-section" {...motionProps(0.2)}>
            {loading ? <div className="min-h-[300px] flex items-center justify-center"><PreviewLoadingFallback/></div> : <>
              <div className="elegant-section-title-wrapper"><h2 id="portfolio-title" className="elegant-section-title">Portfolio Showcase</h2></div>
              <PortfolioGridBlock 
                  images={data.portfolio_images} 
                  sectionVisibility={currentVisibility}
              />
            </>}
          </motion.section>
        )}

        {currentVisibility.tiktokVideos && data.videos && data.videos.length > 0 && (
          <motion.section aria-labelledby="video-title" className="elegant-section video-section" {...motionProps(0.25)}>
             {loading ? <div className="min-h-[300px] flex items-center justify-center"><PreviewLoadingFallback/></div> : <>
               <div className="elegant-section-title-wrapper"><h2 id="video-title" className="elegant-section-title">Featured Videos</h2></div>
              <VideoShowcaseBlock 
                  videos={data.videos} 
                  sectionVisibility={currentVisibility}
              />
             </>}
          </motion.section>
        )}

        {currentVisibility.brandExperience && data.brand_collaborations && data.brand_collaborations.length > 0 && (
          <motion.section aria-labelledby="collaborations-title" className="elegant-section collaborations-section" {...motionProps(0.3)}>
            {loading ? <div className="min-h-[300px] flex items-center justify-center"><PreviewLoadingFallback/></div> : <>
              <div className="elegant-section-title-wrapper"><h2 id="collaborations-title" className="elegant-section-title">Notable Collaborations</h2></div>
              <BrandCollaborationBlock
                brands={data.brand_collaborations || []}
                sectionVisibility={currentVisibility}
              />
            </>}
          </motion.section>
        )}

        {currentVisibility.servicesSkills && data.services && data.services.length > 0 && (
          <motion.section aria-labelledby="services-title" className="elegant-section services-section" {...motionProps(0.35)}>
            {loading ? <div className="min-h-[300px] flex items-center justify-center"><PreviewLoadingFallback/></div> : <>
              <div className="elegant-section-title-wrapper"><h2 id="services-title" className="elegant-section-title">Services Offered</h2></div>
              <ServiceListBlock
                services={data.services || []}
                sectionVisibility={currentVisibility}
              />
            </>}
          </motion.section>
        )}
        
        <motion.footer className="text-center py-[var(--spacing-xl)] mt-[var(--spacing-xxl)] border-t border-[var(--border)] bg-[var(--accent-light)]" {...motionProps(0.4)}>
          {loading ? <PreviewLoadingFallback/> : <>
            {data.next_steps_text && <p className="font-heading text-lg text-[var(--primary)] mb-[var(--spacing-sm)]">{data.next_steps_text}</p>}
            <p className="text-sm text-[var(--secondary)]">&copy; {new Date().getFullYear()} {data.brand_name || data.full_name}. All Rights Reserved.</p>
          </>}
        </motion.footer>
      </div>
    </>
  );
};

export default MediaKitTemplateElegant;