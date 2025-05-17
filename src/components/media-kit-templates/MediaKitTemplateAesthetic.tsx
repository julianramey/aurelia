import React from 'react';
import type { Profile, ColorScheme, MediaKitStats, BrandCollaboration, Service, PortfolioItem, VideoItem, SectionVisibilityState, EditorPreviewData, TemplateTheme as ImportedTemplateTheme } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Example UI import
import { AtSymbolIcon, PhoneIcon } from '@heroicons/react/24/solid'; // Example icons
import PreviewLoadingFallback from '@/components/PreviewLoadingFallback'; // Import the loader

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

// Theme type for this specific template component (props.theme)
export interface AestheticSpecificTheme extends ImportedTemplateTheme {
  // any Aesthetic-specific theme properties
}

export interface MediaKitTemplateAestheticProps {
  isPreview?: boolean;
  data: EditorPreviewData | null;
  theme: AestheticSpecificTheme;
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
    contactDetails: true, profilePicture: true, tiktokVideos: true, audienceStats: true, performance: true
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
  portfolio_images: [], 
  videos: [], 
  contact_email: 'aesthetic_thumb@example.com',
  section_visibility: { profileDetails: true, profilePicture: true, socialMedia: true, audienceStats: true, performance: true, tiktokVideos: true, brandExperience: true, servicesSkills: true, contactDetails: true },
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
export const AestheticTheme = (): AestheticSpecificTheme => ({
  background: '#FDFBF6', 
  foreground: '#3C3633', 
  primary: '#A99985',
  primaryLight: '#E0D8D0',
  secondary: '#7A736D',  
  accent: '#BFB0A3',
  neutral: '#CDC6C0',
  border: '#D6CCC2',
});

const MediaKitTemplateAesthetic: React.FC<MediaKitTemplateAestheticProps> = ({
  isPreview = false,
  data,
  theme,
  loading, // Destructure loading prop
  section_visibility, // Destructured prop
}) => {
  // console.log("[MediaKitTemplateAesthetic] Props Check. Data:", data, "Theme:", theme, "Loading:", loading); // Reverted
  
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

  // --- Component Structure ---
  // This is a starting point. We will refine layout, styling, and add more aesthetic elements.

  return (
    <div
      className="font-sans max-w-4xl mx-auto p-8 shadow-xl rounded-lg transition-colors duration-300"
      style={{ backgroundColor: theme.background, color: theme.foreground }}
    >
      {/* --- Header Section --- */}
      {(section_visibility.profileDetails || section_visibility.profilePicture) && (
        <header className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8 border-b pb-8" style={{ borderColor: theme.border }}>
          {section_visibility.profileDetails && (
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2" style={{ color: theme.primary }}>
                {brandName}
              </h1>
              <p className="text-lg italic" style={{ color: theme.secondary }}>
                {tagline}
              </p>
            </div>
          )}
          {section_visibility.profilePicture && profilePhoto && (
            <img
              src={profilePhoto}
              alt={`${brandName} profile`}
              className="w-32 h-32 rounded-full object-cover border-4 shadow-md"
              style={{ borderColor: theme.accent }}
            />
          )}
        </header>
      )}

      {/* --- Main Content Grid --- */}
      <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column (About, Stats, Skills) */}
        <section className="md:col-span-1 space-y-8">
          {/* About Me */}
          {section_visibility.profileDetails && (
            <div className="p-6 rounded-lg" style={{ backgroundColor: theme.primaryLight + '30' }}>
              <h2 className="text-2xl font-semibold mb-4 border-b pb-2" style={{ borderColor: theme.border, color: theme.primary }}>About Me</h2>
              <p className="text-base leading-relaxed" style={{ color: theme.foreground }}>
                {personalIntro || 'Introduce yourself here. Talk about your journey, your passion, and what makes your content unique.'}
              </p>
            </div>
          )}

          {/* Stats */}
          {(section_visibility.audienceStats || section_visibility.performance) && stats.length > 0 && (
            <div className="p-6 rounded-lg border" style={{ borderColor: theme.border }}>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: theme.primary }}>Key Stats</h2>
              <div className="space-y-3">
                {section_visibility.audienceStats && (
                  <>
                    <div className="flex justify-between items-baseline text-sm">
                      <span style={{ color: theme.secondary }}>Followers:</span>
                      <span className="font-medium text-base" style={{ color: theme.foreground }}>{formatNumber(stats[0]?.follower_count) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-baseline text-sm">
                      <span style={{ color: theme.secondary }}>Engagement:</span>
                      <span className="font-medium text-base" style={{ color: theme.foreground }}>{stats[0]?.engagement_rate ? `${stats[0]?.engagement_rate}%` : 'N/A'}</span>
                    </div>
                  </>
                )}
                {section_visibility.performance && (
                  <>
                    <div className="flex justify-between items-baseline text-sm">
                      <span style={{ color: theme.secondary }}>Avg Likes:</span>
                      <span className="font-medium text-base" style={{ color: theme.foreground }}>{formatNumber(stats[0]?.avg_likes) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-baseline text-sm">
                      <span style={{ color: theme.secondary }}>Reach:</span>
                      <span className="font-medium text-base" style={{ color: theme.foreground }}>{formatNumber(stats[0]?.weekly_reach) || 'N/A'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Skills */}
          {section_visibility.servicesSkills && skills.length > 0 && (
             <div className="p-6 rounded-lg border" style={{ borderColor: theme.border }}>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: theme.primary }}>Skills</h2>
               <div className="flex flex-wrap gap-2">
                 {skills.map((skill, index) => (
                   <span key={index} className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: theme.accent + '20', color: theme.accent }}>
                     {skill}
                   </span>
                 ))}
               </div>
            </div>
          )}
        </section>

        {/* Right Column (Portfolio, Videos, Collaborations, Services) */}
        <section className="md:col-span-2 space-y-8">
          {/* Portfolio Images - Show if brandExperience or tiktokVideos is on, and images exist */}
          {(section_visibility.brandExperience || section_visibility.tiktokVideos) && portfolioImages.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: theme.primary }}>Portfolio</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {portfolioImages.map((imgUrl, index) => (
                  <img
                    key={index}
                    src={imgUrl}
                    alt={`Portfolio image ${index + 1}`}
                    className="rounded-lg object-cover aspect-square transition-transform hover:scale-105"
                  />
                ))}
              </div>
            </div>
          )}

          {/* TikTok Videos */}
          {section_visibility.tiktokVideos && videos.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: theme.primary }}>Featured Videos</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {videos.map((video, index) => (
                  <a key={index} href={video.url} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden group transition-shadow hover:shadow-lg">
                    <img
                      src={video.thumbnail_url || '/placeholder-video.png'} 
                      alt={`Video thumbnail ${index + 1}`}
                      className="object-cover w-full h-full aspect-video group-hover:opacity-80"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Collaborations */}
          {section_visibility.brandExperience && collaborations.length > 0 && (
            <div className="p-6 rounded-lg border" style={{ borderColor: theme.border }}>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: theme.primary }}>Brand Collaborations</h2>
              <ul className="list-disc list-inside space-y-1" style={{ color: theme.secondary }}>
                {collaborations.map((collab, index) => (
                  <li key={collab.id || index}><span style={{ color: theme.foreground }}>{collab.brand_name}</span></li>
                ))}
              </ul>
            </div>
          )}

          {/* Services */}
          {section_visibility.servicesSkills && services.length > 0 && (
            <div className="p-6 rounded-lg border" style={{ borderColor: theme.border }}>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: theme.primary }}>Services Offered</h2>
              <ul className="list-disc list-inside space-y-1" style={{ color: theme.secondary }}>
                {services.map((service, index) => (
                  <li key={service.id || index}><span style={{ color: theme.foreground }}>{service.service_name}</span></li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </main>

      {/* --- Footer / Contact --- */}
      {section_visibility.contactDetails && (
        <footer className="mt-12 pt-8 border-t text-center" style={{ borderColor: theme.border }}>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: theme.primary }}>Get In Touch</h2>
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full transition-colors duration-200 hover:text-white"
              style={{ backgroundColor: theme.accent, color: getContrast(theme.accent) }}
            >
              <AtSymbolIcon className="w-5 h-5" />
              Contact Me
            </a>
          )}
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

// Utility function to format large numbers (copied from Default template)
const formatNumber = (num: number | string | undefined): string => {
  if (num === undefined || num === null) return '0';
  const value = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(value)) return '0';
  if (value >= 1000000000) return (value / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (value >= 1000000) return (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (value >= 1000) return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  // Use toLocaleString for numbers less than 1000 to get commas
  return value.toLocaleString(); 
};

export default MediaKitTemplateAesthetic; 