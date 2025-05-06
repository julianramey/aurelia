import React from 'react';
import type { Profile, ColorScheme, MediaKitStats, BrandCollaboration, Service, PortfolioItem, VideoItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Example UI import
import { AtSymbolIcon, PhoneIcon } from '@heroicons/react/24/solid'; // Example icons

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

// Define a more specific type for the previewData prop, combining Profile with potential nested data
// This might need further refinement based on how MediaKitEditor actually structures previewData
type ExtendedProfilePreview = Omit<Profile, 'brand_collaborations' | 'services'> & {
  stats?: MediaKitStats[];
  brand_collaborations?: BrandCollaboration[];
  services?: Service[];
  portfolio_items?: PortfolioItem[]; // Assuming portfolio items might be passed directly
  videos?: VideoItem[]; // Use the existing VideoItem type
  profile_photo?: string; // Ensure profile_photo is included if passed separately
  // Include other fields from MediaKitData that might be directly on previewData
  tagline?: string;
  skills?: string[];
  colors?: ColorScheme;
  font?: string;
  contact_email?: string;
  portfolio_images?: string[]; // Keep if images are passed this way too
};

// Export the props interface
export interface MediaKitTemplateAestheticProps {
  isPreview?: boolean;
  data: ExtendedProfilePreview | null;
  theme: {
    background: string;
    foreground: string;
    primary: string;
    primaryLight: string;
    secondary: string;
    accent: string;
    neutral: string;
    border: string;
  };
}

const MediaKitTemplateAesthetic: React.FC<MediaKitTemplateAestheticProps> = ({
  isPreview = false,
  data,
  theme,
}) => {
  if (!data) {
    // Optionally render a loading state or null if no data
    return null;
  }

  const profile = data;
  // Explicitly type mediaKitData using `object` instead of `{}`
  const mediaKitData: MediaKitDataObject | object = typeof profile.media_kit_data === 'object' && profile.media_kit_data !== null
    ? profile.media_kit_data
    : {};

  // Now access properties safely using optional chaining
  const brandName = (mediaKitData as MediaKitDataObject)?.brand_name ?? profile?.full_name ?? 'Your Name';
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
      <header className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8 border-b pb-8" style={{ borderColor: theme.border }}>
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold mb-2" style={{ color: theme.primary }}>
            {brandName}
          </h1>
          <p className="text-lg italic" style={{ color: theme.secondary }}>
            {tagline}
          </p>
        </div>
        {profilePhoto && (
          <img
            src={profilePhoto}
            alt={`${brandName} profile`}
            className="w-32 h-32 rounded-full object-cover border-4 shadow-md"
            style={{ borderColor: theme.accent }}
          />
        )}
      </header>

      {/* --- Main Content Grid --- */}
      <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column (About, Stats, Skills) */}
        <section className="md:col-span-1 space-y-8">
          {/* About Me */}
          <div className="p-6 rounded-lg" style={{ backgroundColor: theme.primaryLight + '30' }}> {/* Light accent bg */}
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2" style={{ borderColor: theme.border, color: theme.primary }}>About Me</h2>
            <p className="text-base leading-relaxed" style={{ color: theme.foreground }}>
              {personalIntro || 'Introduce yourself here. Talk about your journey, your passion, and what makes your content unique.'}
            </p>
          </div>

          {/* Stats */}
          {stats.length > 0 && (
            <div className="p-6 rounded-lg border" style={{ borderColor: theme.border }}>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: theme.primary }}>Key Stats</h2>
              {/* Use a vertical list for better spacing and adjust font size */}
              <div className="space-y-3">
                <div className="flex justify-between items-baseline text-sm"> {/* Use items-baseline */} 
                  <span style={{ color: theme.secondary }}>Followers:</span>
                  <span className="font-medium text-base" style={{ color: theme.foreground }}>{formatNumber(stats[0].follower_count) || 'N/A'}</span> {/* Changed to text-base */} 
                </div>
                <div className="flex justify-between items-baseline text-sm"> {/* Use items-baseline */} 
                  <span style={{ color: theme.secondary }}>Engagement:</span>
                  <span className="font-medium text-base" style={{ color: theme.foreground }}>{stats[0].engagement_rate ? `${stats[0].engagement_rate}%` : 'N/A'}</span> {/* Changed to text-base */} 
                </div>
                <div className="flex justify-between items-baseline text-sm"> {/* Use items-baseline */} 
                  <span style={{ color: theme.secondary }}>Avg Likes:</span>
                  <span className="font-medium text-base" style={{ color: theme.foreground }}>{formatNumber(stats[0].avg_likes) || 'N/A'}</span> {/* Changed to text-base */} 
                </div>
                <div className="flex justify-between items-baseline text-sm"> {/* Use items-baseline */} 
                  <span style={{ color: theme.secondary }}>Reach:</span>
                  <span className="font-medium text-base" style={{ color: theme.foreground }}>{formatNumber(stats[0].weekly_reach) || 'N/A'}</span> {/* Changed to text-base */} 
                </div>
              </div>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
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
          {/* Portfolio Images */}
          {portfolioImages.length > 0 && (
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
          {videos.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: theme.primary }}>Featured Videos</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {videos.map((video, index) => (
                  <a key={index} href={video.url} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden group transition-shadow hover:shadow-lg">
                    <img
                      src={video.thumbnail_url || '/placeholder-video.png'} // Add a placeholder
                      alt={`Video thumbnail ${index + 1}`}
                      className="object-cover w-full h-full aspect-video group-hover:opacity-80"
                    />
                    {/* Optional: Add a play icon overlay */}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Collaborations */}
          {collaborations.length > 0 && (
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
          {services.length > 0 && (
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
      <footer className="mt-12 pt-8 border-t text-center" style={{ borderColor: theme.border }}>
        <h2 className="text-2xl font-semibold mb-4" style={{ color: theme.primary }}>Get In Touch</h2>
        {contactEmail && (
          <a
            href={`mailto:${contactEmail}`}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full transition-colors duration-200 hover:text-white"
            style={{ backgroundColor: theme.accent, color: getContrast(theme.accent) }} // Use contrast helper
          >
            <AtSymbolIcon className="w-5 h-5" />
            Contact Me
          </a>
        )}
        {/* Add social links here if available */}
      </footer>
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