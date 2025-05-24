import React from 'react';
import type { Profile, ColorScheme, MediaKitStats, BrandCollaboration, Service, PortfolioItem, VideoItem, SectionVisibilityState, EditorPreviewData, TemplateTheme as ImportedTemplateTheme } from '@/lib/types';
import type { SocialLinkItem } from '@/components/media-kit-blocks/SocialLinksBlock';
import { AtSymbolIcon, PhoneIcon } from '@heroicons/react/24/solid'; // Example icons
import PreviewLoadingFallback from '@/components/PreviewLoadingFallback'; // Import the loader
import { formatNumber } from '@/lib/utils'; // Import the shared formatNumber

// Import Blocks
import { SectionTitle } from '@/components/media-kit-blocks/SectionTitle';
import ProfileHeaderBlock from '@/components/media-kit-blocks/ProfileHeaderBlock';
import PersonalIntroBlock from '@/components/media-kit-blocks/PersonalIntroBlock';
import StatsGridBlock from '@/components/media-kit-blocks/StatsGridBlock';
import AudienceDemographicsBlock from '@/components/media-kit-blocks/AudienceDemographicsBlock';
import SkillsListBlock from '@/components/media-kit-blocks/SkillsListBlock';
import PortfolioGridBlock from '@/components/media-kit-blocks/PortfolioGridBlock';
import VideoShowcaseBlock from '@/components/media-kit-blocks/VideoShowcaseBlock';
import BrandCollaborationBlock from '@/components/media-kit-blocks/BrandCollaborationBlock';
import ServiceListBlock from '@/components/media-kit-blocks/ServiceListBlock';
import ContactInfoBlock from '@/components/media-kit-blocks/ContactInfoBlock';

// Define the structure of the nested media_kit_data if it's an object
type MediaKitDataObject = {
  type: 'media_kit_data';
  brand_name?: string;
  tagline?: string;
  colors?: ColorScheme;
  font?: string;
  skills?: string[];
  videos?: VideoItem[];
  contact_email?: string;
  personal_intro?: string;
  instagram_handle?: string;
  tiktok_handle?: string;
  portfolio_images?: string[];
};

// Define the specific data structure this template expects and its GetPreviewData function will return.
// This should include all fields used by the template component and returned by AestheticGetPreviewData.
export interface AestheticSpecificData {
  id: string;
  user_id: string;
  username?: string;
  avatar_url?: string;
  website?: string;
  full_name?: string;
  niche?: string; // Corrected: was string[], now string as per placeholder
  media_kit_url?: string;
  onboarding_complete?: boolean;
  email?: string; // from Profile, for base info
  // Fields specific to Aesthetic template or merged from form data
  brand_name?: string; 
  tagline?: string;
  personal_intro?: string;
  profile_photo?: string;
  skills?: string[];
  colors?: ColorScheme;
  font?: string;
  contact_email?: string; // Main contact email for display
  portfolio_images?: string[];
  stats?: MediaKitStats[];
  brand_collaborations?: BrandCollaboration[]; // Re-added explicitly
  services?: Service[]; // Re-added explicitly
  videos?: VideoItem[];
  section_visibility?: SectionVisibilityState;
  media_kit_data: null; // Placeholder usually has this as null
}

export interface MediaKitTemplateAestheticProps {
  isPreview?: boolean;
  data: EditorPreviewData | null;
  theme: ImportedTemplateTheme;
  loading?: boolean; 
  section_visibility: SectionVisibilityState;
}

// --- Renamed Placeholder Data Function to GetPreviewData ---
export const AestheticGetPreviewData = (): AestheticSpecificData => ({
  id: 'aesthetic-placeholder-id',
  user_id: 'aesthetic-placeholder-user-id',
  username: '@aesthetic_creator',
  avatar_url: 'https://via.placeholder.com/150/CBD5E0/4A5568?text=A',
  website: 'www.aestheticvibes.com',
  full_name: 'Alex Aesthetic',
  niche: 'Lifestyle, Minimalism, Art', // Kept as string
  media_kit_url: '',
  onboarding_complete: true,
  email: 'hello@alexaesthetic.com', // Base email
  brand_name: 'Alex Aesthetic',
  tagline: 'Curating beauty in everyday life.',
  personal_intro: 'Passionate about minimalist design, modern art, and sustainable living. Join me on a journey of curated aesthetics and mindful moments.',
  profile_photo: 'https://via.placeholder.com/150/CBD5E0/4A5568?text=A',
  skills: ['Content Creation', 'Photography', 'Brand Storytelling', 'Visual Design'],
  colors: { 
    background: '#FDFBF6', text: '#3C3633', secondary: '#7A736D',
    accent_light: '#E0D8D0', accent: '#A99985', primary: '#A99985',
  },
  font: 'Poppins',
  contact_email: 'hello@alexaesthetic.com', // Display contact email
  portfolio_images: [
    'https://via.placeholder.com/300/E0D8D0/3C3633?text=Portfolio+1',
    'https://via.placeholder.com/300/A99985/FDFBF6?text=Portfolio+2',
    'https://via.placeholder.com/300/7A736D/FDFBF6?text=Portfolio+3',
  ],
  stats: [{
    id: 'aesthetic-stats-id-1',
    profile_id: 'aesthetic-placeholder-id',
    platform: 'instagram',
    follower_count: 75000,
    engagement_rate: 4.2,
    avg_likes: 1800,
    avg_comments: 90,
    weekly_reach: 120000,
    monthly_impressions: 450000,
    updated_at: new Date().toISOString(),
  }],
  brand_collaborations: [
    { id: 'collab1', profile_id:'', brand_name: 'Eco Living Co.', collaboration_type: 'Sponsored Post', collaboration_date: '2023-08-15' },
    { id: 'collab2', profile_id:'', brand_name: 'Artisan Goods', collaboration_type: 'Product Review', collaboration_date: '2023-07-01' },
  ],
  services: [
    { id:'serv1', profile_id:'', service_name: 'Content Packages', description: 'Curated content for brands.', price_range: '$500-$2000' },
    { id:'serv2', profile_id:'', service_name: 'Visual Storytelling Workshops', description: 'Learn the art of aesthetic branding.', price_range: '$150/person' },
  ],
  videos: [
    { url: 'https://www.tiktok.com/@placeholder/video/1', thumbnail_url: 'https://via.placeholder.com/300/CBD5E0/4A5568?text=Video+1' },
    { url: 'https://www.tiktok.com/@placeholder/video/2', thumbnail_url: 'https://via.placeholder.com/300/A99985/FDFBF6?text=Video+2' },
  ],
  section_visibility: {
    profileDetails: true, brandExperience: true, servicesSkills: true, socialMedia: true, 
    contactDetails: true, profilePicture: true, tiktokVideos: true, audienceStats: true, performance: true,
    audienceDemographics: true,
  },
  media_kit_data: null,
});

// --- Updated Thumbnail Data Function to return EditorPreviewData ---
export const AestheticGetThumbnailData = (): EditorPreviewData => ({
  id: 'thumb-aesthetic-id',
  user_id: 'thumb-user-id',
  username: '@aesthetic_thumb',
  brand_name: 'Modern Aesthetic (Thumb)',
  tagline: 'Sleek & Stylish Thumbnail',
  colors: { 
    background: '#FDFBF6', text: '#3C3633', secondary: '#7A736D',
    accent_light: '#E0D8D0', accent: '#A99985', primary: '#A99985',
  },
  font: 'Poppins',
  profile_photo: 'https://via.placeholder.com/150/CBD5E0/4A5568?text=A',
  personal_intro: 'Aesthetic thumbnail intro.',
  skills: [], 
  brand_collaborations: [], 
  services: [], 
  instagram_handle: '@insta_aesthetic_thumb',
  tiktok_handle: '@tiktok_aesthetic_thumb',
  youtube_handle: '',
  portfolio_images: [], 
  videos: [], 
  contact_email: 'aesthetic_thumb@example.com',
  section_visibility: { profileDetails: true, profilePicture: true, socialMedia: true, audienceStats: true, performance: true, tiktokVideos: true, brandExperience: true, servicesSkills: true, contactDetails: true, audienceDemographics: true },
  follower_count: 200,
  engagement_rate: 2,
  avg_likes: 20,
  reach: 200,
  stats: [], 
  avatar_url: 'https://via.placeholder.com/150/CBD5E0/4A5568?text=A', 
  website: 'aesthetic-thumb.example.com',
  full_name: 'Aesthetic Thumbnail User',
  niche: 'Aesthetic Thumbnail Niche',
  media_kit_url: '',
  onboarding_complete: true,
  email: 'aesthetic_email_thumb@example.com',
  media_kit_data: null, 
  selected_template_id: 'aesthetic',
});

// --- Existing Placeholder Theme Function (ensure it uses the specific theme type) ---
export const AestheticTheme = (): ImportedTemplateTheme => ({
  background: '#FDFBF6', 
  foreground: '#3C3633', 
  primary: '#A99985',
  primaryLight: '#E0D8D0',
  secondary: '#7A736D',  
  accent: '#A99985',
  neutral: '#CDC6C0',
  border: '#D6CCC2',
  font: 'Poppins',
});

const MediaKitTemplateAesthetic: React.FC<MediaKitTemplateAestheticProps> = ({
  isPreview,
  data,
  theme,
  loading, // Destructure loading prop
  section_visibility, // Destructured prop
}) => {
  // console.log("[MediaKitTemplateAesthetic] Props Check. Data:", data, "Theme:", theme, "Loading:", loading); // Reverted
  // console.log(`[Aesthetic Template Render] Actual theme received:`, theme);
  
  if (loading) {
    return (
      <div className="w-full min-h-[500px] flex items-center justify-center bg-white rounded-lg">
        <PreviewLoadingFallback />
      </div>
    );
  }
  
  if (!data) {
    return <div className="w-full min-h-[500px] flex items-center justify-center"><p>No data available for this media kit.</p></div>;
  }

  const profile = data;
  // Explicitly type mediaKitData using `object` instead of `{}`
  const mediaKitData: MediaKitDataObject | object = typeof profile.media_kit_data === 'object' && profile.media_kit_data !== null
    ? profile.media_kit_data
    : {};

  // Now access properties safely using optional chaining
  // Prioritize profile.brand_name (from EditorFormData), then mediaKitData.brand_name, then profile.full_name
  const brandName = profile?.brand_name || (mediaKitData as MediaKitDataObject)?.brand_name || profile?.full_name || 'Aesthetic Name';
  const tagline = (mediaKitData as MediaKitDataObject)?.tagline ?? profile?.tagline ?? 'Content Creator & Influencer';
  const personalIntro = (mediaKitData as MediaKitDataObject)?.personal_intro ?? profile?.personal_intro ?? '';
  const profilePhoto = profile?.profile_photo ?? profile?.avatar_url;
  const contactEmail = (mediaKitData as MediaKitDataObject)?.contact_email ?? profile?.email ?? '';

  // Extract arrays safely
  const stats: MediaKitStats[] = profile?.stats ?? [];
  const collaborations: BrandCollaboration[] = profile?.brand_collaborations ?? [];
  const services: Service[] = profile?.services ?? [];
  const portfolioImages: string[] = (mediaKitData as MediaKitDataObject)?.portfolio_images ?? profile?.portfolio_images ?? [];
  const videos: VideoItem[] = (mediaKitData as MediaKitDataObject)?.videos ?? profile?.videos ?? [];
  const skills: string[] = (mediaKitData as MediaKitDataObject)?.skills ?? profile?.skills ?? [];

  const aestheticSocialLinks: SocialLinkItem[] = [];
  if (profile.instagram_handle) {
    aestheticSocialLinks.push({ type: 'instagram', url: `https://instagram.com/${profile.instagram_handle.replace(/^@/, '')}`, label: 'Instagram' });
  }
  if (profile.tiktok_handle) {
    aestheticSocialLinks.push({ type: 'tiktok', url: `https://tiktok.com/@${profile.tiktok_handle.replace(/^@/, '')}`, label: 'TikTok' });
  }
  if (contactEmail) { // Add email to social links if present
    aestheticSocialLinks.push({ type: 'email', url: `mailto:${contactEmail}`, label: 'Email' });
  }
  if (profile.website) { // Add website if present
    aestheticSocialLinks.push({ type: 'website', url: profile.website, label: 'Website' });
  }

  // --- Component Structure ---
  return (
    <div
      className="font-sans max-w-4xl mx-auto p-4 md:p-8 shadow-xl rounded-lg transition-colors duration-300"
      style={{
        backgroundColor: theme.background,
        color: theme.foreground,
        fontFamily: theme.font ? `${theme.font}, Poppins, sans-serif` : 'Poppins, sans-serif',
        // CSS Variables for child components to use:
        '--background': theme.background,
        '--foreground': theme.foreground,
        '--primary': theme.primary,
        '--primary-light': theme.primaryLight,
        '--secondary': theme.secondary,
        '--accent': theme.accent,
        '--neutral': theme.neutral,
        '--border': theme.border,
      } as React.CSSProperties}
    >
      {/* --- Header Section --- */}
      {section_visibility.profileDetails && (
        <ProfileHeaderBlock
          avatarUrl={profilePhoto}
          name={brandName}
          subheading={tagline}
          socialLinks={aestheticSocialLinks}
          sectionVisibility={section_visibility}
        />
      )}

      {/* --- Main Content Grid --- */}
      <main className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-10 md:mt-12">
        {/* Left Column (About, Stats, Audience Insights, Skills) */}
        <section className="md:col-span-1 space-y-6 md:space-y-8">
          {/* About Me */}
          {section_visibility.profileDetails && personalIntro && (
            <div className="p-4 md:p-6 rounded-lg" style={{ backgroundColor: 'var(--primary-light)' }}>
              <SectionTitle>About Me</SectionTitle>
              <PersonalIntroBlock text={personalIntro} sectionVisibility={section_visibility} />
            </div>
          )}

          {/* Stats */}
          {(section_visibility.audienceStats || section_visibility.performance) && (
            <div className="p-4 md:p-6 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--primary-light)' }}>
              <h3 className="text-xl md:text-2xl font-semibold mb-4 text-center" style={{ color: 'var(--accent)', fontFamily: theme.font ? `${theme.font}, Poppins, sans-serif` : 'Poppins, sans-serif' }}>Key Stats</h3>
              <StatsGridBlock
                stats={(() => {
                  const displayStats = [];
                  if (profile.follower_count != null && String(profile.follower_count).trim() !== '') {
                    displayStats.push({ label: 'Followers', value: profile.follower_count });
                  }
                  if (profile.avg_likes != null && String(profile.avg_likes).trim() !== '') {
                    displayStats.push({ label: 'Avg Likes', value: profile.avg_likes });
                  }
                  if (profile.engagement_rate != null && String(profile.engagement_rate).trim() !== '') {
                    // Ensure % is appended if not already present and value is numeric
                    const erValue = String(profile.engagement_rate);
                    const displayER = /%$/.test(erValue) || isNaN(parseFloat(erValue)) ? erValue : `${parseFloat(erValue)}%`;
                    displayStats.push({ label: 'Engagement Rate', value: displayER });
                  }
                  if (profile.reach != null && String(profile.reach).trim() !== '') {
                    displayStats.push({ label: 'Weekly Reach', value: profile.reach });
                  }
                  
                  // Optionally, if you still want to show platform-specific stats from profile.stats
                  // WHEN NOT IN EDITOR PREVIEW (i.e., on the actual live media kit page),
                  // you might add a condition here. For now, this focuses on editor preview accuracy.

                  // Example of how you might re-introduce profile.stats if needed,
                  // perhaps by checking a prop that indicates if it's a live view vs editor.
                  // For now, sticking to the user's Option 2 for clarity.
                  /*
                  if (profile.stats && profile.stats.length > 0) {
                    profile.stats.forEach(s => {
                      // ... (add logic to push stats from profile.stats, avoiding duplicates)
                    });
                  }
                  */
                  return displayStats;
                })()}
                sectionVisibility={section_visibility} // Pass section_visibility if StatsGridBlock uses it
              />
            </div>
          )}

          {/* Audience Demographics Section */}
          {section_visibility.audienceDemographics && (profile.audience_age_range || profile.audience_location_main || profile.audience_gender_female) && (
            <div className="p-4 md:p-6 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--primary-light)' }}>
              <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-center" style={{ color: 'var(--accent)', fontFamily: theme.font ? `${theme.font}, Poppins, sans-serif` : 'Poppins, sans-serif' }}>Audience Insights</h3>
              <AudienceDemographicsBlock 
                ageRange={profile.audience_age_range}
                location={profile.audience_location_main}
                femalePct={profile.audience_gender_female}
                sectionVisibility={section_visibility}
              />
            </div>
          )}
      
          {/* Skills */}
          {section_visibility.servicesSkills && skills.length > 0 && (
             <div className="p-4 md:p-6 rounded-lg shadow-md" style={{ backgroundColor: 'var(--primary-light)', borderColor: 'var(--border)' }}>
              <SectionTitle>Skills</SectionTitle>
               <SkillsListBlock skills={skills} sectionVisibility={section_visibility} />
            </div>
          )}
        </section>

        {/* Right Column (Videos, Collaborations, Services) */}
        <section className="md:col-span-2 space-y-6 md:space-y-8">
          {/* Portfolio / Video Showcase - REVERTED to original structure for theme background */}
          {(section_visibility.tiktokVideos || section_visibility.brandExperience) && (
            <div className="p-4 md:p-6 rounded-lg shadow-md" style={{ backgroundColor: 'var(--primary-light)', borderColor: 'var(--border)' }}>
              <SectionTitle>Recent Content</SectionTitle>
              {(() => {
                const showVideos = section_visibility.tiktokVideos && videos && videos.length > 0;
                const showImages = !showVideos && section_visibility.brandExperience && portfolioImages && portfolioImages.length > 0;

                if (showVideos) {
                  return <VideoShowcaseBlock videos={videos} sectionVisibility={section_visibility} isPreview={isPreview} />;
                } else if (showImages) {
                  return <PortfolioGridBlock images={portfolioImages} sectionVisibility={section_visibility} />;
                } else {
                  return <p className="text-center text-sm" style={{ color: theme.secondary }}>No content to display.</p>;
                }
              })()}
            </div>
          )}

          {/* Collaborations */}
          {section_visibility.brandExperience && collaborations.length > 0 && (
            <div className="p-4 md:p-6 rounded-lg shadow-md" style={{ backgroundColor: 'var(--primary-light)', borderColor: 'var(--border)' }}>
              <SectionTitle>Brand Collaborations</SectionTitle>
              <BrandCollaborationBlock brands={collaborations} sectionVisibility={section_visibility} />
            </div>
          )}

          {/* Services */}
          {section_visibility.servicesSkills && services.length > 0 && (
            <div className="p-4 md:p-6 rounded-lg shadow-md" style={{ backgroundColor: 'var(--primary-light)', borderColor: 'var(--border)' }}>
              <SectionTitle>Services Offered</SectionTitle>
              <ServiceListBlock services={services} sectionVisibility={section_visibility} />
            </div>
          )}
        </section>
      </main>

      {/* --- Footer / Contact --- */}
      {section_visibility.contactDetails && (
        <footer className="mt-10 md:mt-12 pt-6 md:pt-8 border-t text-center" style={{ borderColor: theme.border }}>
          <SectionTitle>Get In Touch</SectionTitle>
          <ContactInfoBlock
            email={contactEmail}
            phone={profile.contact_phone} 
            website={profile.website}
            socialLinks={aestheticSocialLinks.filter(link => link.type !== 'website' && link.type !== 'email')}
            sectionVisibility={section_visibility}
          />
        </footer>
      )}
    </div>
  );
};

// Contrast helper function (same as in MediaKitEditor)
const getContrast = (hex: string): string => {
  if (!hex) return '#000000'; // Default to black if hex is undefined
  const normalizedHex = hex.replace('#', '');
  if (normalizedHex.length !== 6) return '#000000'; // Basic validation
  try {
    const r = parseInt(normalizedHex.substring(0, 2), 16);
    const g = parseInt(normalizedHex.substring(2, 4), 16);
    const b = parseInt(normalizedHex.substring(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq >= 128 ? '#000000' : '#ffffff';
  } catch (e) {
    console.error("Error parsing hex color for contrast:", hex, e);
    return '#000000'; // Fallback on error
  }
};

export default MediaKitTemplateAesthetic; 