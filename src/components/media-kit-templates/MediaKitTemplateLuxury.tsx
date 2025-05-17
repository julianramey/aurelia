import React from 'react';
import type { Profile, VideoItem, Service, BrandCollaboration, MediaKitStats, ColorScheme, SectionVisibilityState, EditorPreviewData, TemplateTheme as BaseTemplateTheme } from '@/lib/types';
import { cn } from '@/lib/utils';

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
  },
  follower_count: 1200000,
  engagement_rate: 3.5,
  avg_likes: 25000,
  reach: 300000,
  stats: [], // Placeholder for MediaKitStats[]
  media_kit_data: null, // Placeholder for MediaKitData | null

  // Luxury Specific Fields (if they are part of EditorPreviewData)
  instagram_followers: '1.2M',
  tiktok_followers: '500K',
  youtube_followers: '250K',
  audience_age_range: '28 - 55',
  audience_location_main: '75% USA & EUROPE',
  audience_gender_female: '70% FEMALE',
  avg_video_views: '150K',
  avg_ig_reach: '300K',
  ig_engagement_rate: '3.5%',
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

const formatStat = (value?: string | number) => {
  if (value === undefined || value === null || String(value).trim() === '') return '-';
  return String(value);
};

// Helper component for Stat items
const StatItem: React.FC<{ value?: string | number; label: string; icon?: React.ReactNode; className?: string }> = ({ value, label, icon, className }) => (
  <div 
    className={cn(
        "text-center p-6 md:p-8 rounded-xl group transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1",
        className
    )}
    style={{ 
      backgroundColor: 'var(--card-bg)', 
      boxShadow: '0 8px 25px rgba(0,0,0,0.07)' // Softer shadow as per previous iteration
    }}
  >
    {icon && (
      <div 
        className="mb-3 text-4xl mx-auto w-16 h-16 flex items-center justify-center rounded-full transition-transform duration-300 ease-in-out group-hover:rotate-[5deg]" 
        style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 20%, transparent)', color: 'var(--accent)' }}
      >
        {icon}
      </div>
    )}
    <div className="text-3xl md:text-5xl font-bold" style={{ color: 'var(--primary)', fontFamily: "'Poppins', sans-serif" }}>{formatStat(value)}</div>
    <div className="text-md md:text-lg font-light tracking-wider uppercase" style={{ color: 'var(--text-secondary)', fontFamily: "'Poppins', sans-serif" }}>{label}</div>
  </div>
);

export function MediaKitTemplateLuxury({ 
  data, 
  theme, 
  loading,
  section_visibility,
}: LuxuryProps) {
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading Luxury Media Kit...</p></div>;
  }

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center"><p>No data available for this media kit.</p></div>;
  }
  
  const templateTheme = theme as LuxurySpecificTheme; // Cast for specific luxury theme properties

  const cssVars = {
    '--primary': templateTheme.primary,
    '--accent': templateTheme.accent,
    '--bg': templateTheme.background,
    '--card-bg': templateTheme.cardBackground || templateTheme.background,
    '--text-primary': templateTheme.foreground,
    '--text-secondary': templateTheme.secondary,
    '--text-muted': templateTheme.neutral,
    '--border': templateTheme.border,
  } as React.CSSProperties;

  const s = section_visibility || defaultSectionVisibility; // Fallback if not provided

  // Section title component for consistency
  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <>
      <h2 
        className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-center" 
        style={{ fontFamily: "'Playfair Display', serif", color: 'var(--primary)' }}
      >
        {children}
      </h2>
      <div className="w-20 h-1 mx-auto mb-12" style={{backgroundColor: 'var(--accent)'}}></div>
    </>
  );

  return (
    <div
      className="font-['Poppins'] antialiased leading-relaxed selection:bg-opacity-50 min-h-screen p-6 md:p-12 lg:p-16"
      style={{
        background: 'var(--bg)',
        color: 'var(--text-primary)',
        fontFamily: data.font || 'Poppins, sans-serif',
        ...cssVars
      }}
    >
      <style>{`
        .font-['Poppins'] ::selection {
          background-color: var(--accent);
          color: var(--bg);
        }
      `}</style>
      
      {/* Header Section */}
      {s.profilePicture && data.avatar_url && (
        <div className="text-center mb-20 md:mb-24 lg:mb-32">
          <div className="relative inline-block mb-10">
            <div 
              className="absolute inset-[-10px] rounded-full z-0 opacity-50"
              style={{
                background: `radial-gradient(circle, color-mix(in srgb, var(--accent) 30%, transparent) 0%, color-mix(in srgb, var(--accent) 10%, transparent) 70%, transparent 100%)`,
                filter: 'blur(10px)'
              }}
            ></div>
            <img 
              src={data.avatar_url} 
              alt={data.full_name || data.brand_name || 'Profile'} 
              className="relative z-10 w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-full object-cover shadow-2xl"
              style={{ 
                boxShadow: `inset 0 0 0 3px rgba(255,255,255,0.2), 0 15px 35px -10px color-mix(in srgb, var(--accent) 30%, black)`
              }}
            />
          </div>
          {s.profileDetails && data.username && (
            <p 
              className="text-base md:text-lg mb-4" 
              style={{ color: 'var(--accent)', fontFamily: "'Poppins', sans-serif" }}
            >
              {data.username}
            </p>
          )}
          {s.profileDetails && data.brand_name && (
            <h1 
              className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight" 
              style={{ color: 'var(--primary)', fontFamily: "'Playfair Display', serif", textShadow: '1px 1px 3px rgba(0,0,0,0.1)' }}
            >
              {data.brand_name.toUpperCase()}
              <span style={{ color: 'var(--accent)' }}>.</span>
            </h1>
          )}
          {s.profileDetails && data.tagline && (
            <>
              <div className="max-w-xs md:max-w-md mx-auto mt-8 mb-6 border-t-2" style={{ borderColor: 'var(--accent)' }}></div>
              <p 
                className="text-xl md:text-2xl lg:text-3xl font-light tracking-widest" 
                style={{ color: 'var(--text-secondary)', fontFamily: "'Poppins', sans-serif" }}
              >
                {data.tagline.toUpperCase()}
              </p>
            </>
          )}
        </div>
      )}

      {/* About Me Section */}
      {s.profileDetails && data.personal_intro && (
        <section className="mb-20 md:mb-24 lg:mb-32 text-center max-w-3xl mx-auto">
          <SectionTitle>ABOUT ME</SectionTitle>
          <p 
            className="text-lg md:text-xl leading-loose" 
            style={{ color: 'var(--text-secondary)', fontFamily: "'Poppins', sans-serif" }}
          >
            {data.personal_intro}
          </p>
        </section>
      )}

      {/* Social Stats Grid */}
      {s.audienceStats && (data.instagram_followers || data.tiktok_followers || data.youtube_followers) && (
        <section className="mb-20 md:mb-24 lg:mb-32">
          <SectionTitle>PLATFORM REACH</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {data.instagram_followers && (
              <StatItem value={formatStat(data.instagram_followers)} label="Instagram Followers" icon={<InstagramIconSVG />} />
            )}
            {data.tiktok_followers && (
              <StatItem value={formatStat(data.tiktok_followers)} label="TikTok Followers" icon={<TikTokIconSVG />} />
            )}
            {data.youtube_followers && (
              <StatItem value={formatStat(data.youtube_followers)} label="YouTube Subscribers" icon={<YouTubeIconSVG />} />
            )}
          </div>
        </section>
      )}

      {/* Audience Demographics */}
      {s.audienceStats && (data.audience_age_range || data.audience_location_main || data.audience_gender_female) && (
        <section className="mb-20 md:mb-24 lg:mb-32">
          <SectionTitle>AUDIENCE DEMOGRAPHICS</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {data.audience_age_range && <StatItem value={data.audience_age_range} label="Age Range" />}
            {data.audience_location_main && <StatItem value={data.audience_location_main} label="Primary Location" />}
            {data.audience_gender_female && <StatItem value={data.audience_gender_female} label="Female Audience" />}
          </div>
        </section>
      )}
      
      {/* Key Metrics */}
      {s.performance && (data.avg_video_views || data.avg_ig_reach || data.ig_engagement_rate) && (
        <section className="mb-20 md:mb-24 lg:mb-32">
          <SectionTitle>KEY METRICS</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {data.avg_video_views && <StatItem value={formatStat(data.avg_video_views)} label="Avg. Video Views" />}
            {data.avg_ig_reach && <StatItem value={formatStat(data.avg_ig_reach)} label="Avg. IG Post Reach" />}
            {data.ig_engagement_rate && <StatItem value={formatStat(data.ig_engagement_rate)} label="IG Engagement Rate" />}
          </div>
        </section>
      )}

      {/* Video Showcase Section */}
      {s.tiktokVideos && data.videos && data.videos.length > 0 && (
        <section className="mb-20 md:mb-24 lg:mb-32">
          <SectionTitle>VIDEO SHOWCASE</SectionTitle>
          <div 
            className="grid gap-4 md:gap-6 items-start justify-center"
            style={{
              gridTemplateColumns: `repeat(auto-fit, minmax(150px, 1fr))`,
              maxWidth: "1200px",
              margin: "0 auto"
            }}
          >
            {data.videos.slice(0, 5).map((video, index) => (
              <div key={video.url || index} className="flex flex-col items-center">
                <a 
                  href={video.url && video.url !== '#' ? video.url : undefined}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`block relative mx-auto border-[8px] md:border-[10px] rounded-[28px] md:rounded-[40px] shadow-xl overflow-hidden group transform transition-transform hover:scale-105 duration-300 ${video.url && video.url !== '#' ? 'cursor-pointer' : 'cursor-default'}`}
                  style={{
                    borderColor: '#1C1C1E', 
                    backgroundColor: '#000000',
                    width: '100%',
                    aspectRatio: '9/19.5',
                  }}
                  title={video.url && video.url !== '#' ? "Watch Video" : undefined}
                >
                  <img 
                    src={video.thumbnail_url || 'https://placehold.co/375x812/000000/FFFFFF?text=Video'} 
                    alt={`Video thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div 
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-[18px] md:h-[24px] bg-[#1C1C1E] rounded-b-lg md:rounded-b-xl"
                  ></div>
                  <div
                    className="absolute bottom-[8px] md:bottom-[10px] left-1/2 -translate-x-1/2 w-[30%] md:w-[35%] h-[3px] md:h-[4px] bg-gray-400 rounded-full opacity-50 group-hover:opacity-80 transition-opacity"
                  ></div>
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Services Offered */}
      {s.servicesSkills && data.services && data.services.length > 0 && (
        <section className="mb-20 md:mb-24 lg:mb-32">
          <SectionTitle>SERVICES OFFERED</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {data.services.map((service) => (
              <div 
                key={service.id} 
                className="p-6 md:p-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col"
                style={{ backgroundColor: 'var(--card-bg)' }}
              >
                {/* Placeholder for Icon */}
                <div className="mb-4 text-3xl w-12 h-12 flex items-center justify-center rounded-full" style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}>
                  <span>✨</span> 
                </div>
                <h3 className="text-xl lg:text-2xl font-semibold mb-3" style={{ color: 'var(--primary)'}}>{service.service_name}</h3>
                {service.description && <p className="text-sm lg:text-base mb-4 flex-grow" style={{ color: 'var(--text-secondary)'}}>{service.description}</p>}
                {service.price_range && <p className="text-base lg:text-lg font-medium mt-auto pt-3 border-t" style={{ color: 'var(--accent)', borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)'}}>{service.price_range}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* Past Collaborations (using brand_collaborations from EditorPreviewData) */}
      {s.brandExperience && data.brand_collaborations && data.brand_collaborations.length > 0 && (
        <section className="mb-20 md:mb-24 lg:mb-32">
          <SectionTitle>PREVIOUSLY PARTNERED WITH</SectionTitle>
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 mb-12 max-w-4xl mx-auto">
            {data.brand_collaborations.map((collab, index) => (
              <span key={collab.id || index} className="text-lg font-medium" style={{ color: 'var(--text-secondary)'}}>
                {collab.brand_name}
              </span>
            ))}
          </div>
          {/* Add brand image if available */}
          {data.past_brands_image_url && (
            <div className="max-w-3xl mx-auto">
              <img 
                src={data.past_brands_image_url} 
                alt="Brand collaborations" 
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          )}
        </section>
      )}

      {/* Next Steps Section */}
      {data.next_steps_text && (
        <section className="mb-20 md:mb-24 lg:mb-32 text-center max-w-3xl mx-auto">
          <SectionTitle>NEXT STEPS</SectionTitle>
          <p 
            className="text-lg md:text-xl leading-loose" 
            style={{ color: 'var(--text-secondary)', fontFamily: "'Poppins', sans-serif" }}
          >
            {data.next_steps_text}
          </p>
        </section>
      )}

      {/* Contact Section */}
      {s.contactDetails && (data.contact_email || data.website || data.contact_phone) && (
        <section className="text-center py-10 md:py-16 border-t" style={{ borderColor: 'var(--border)'}}>
          <h2 
            className="text-3xl md:text-4xl font-bold mb-6 tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif", color: 'var(--primary)' }}
          >
            CONTACT
          </h2>
          <div className="space-y-3">
            {data.contact_email && (
              <a href={`mailto:${data.contact_email}`} className="block text-lg hover:underline transition-all duration-300" style={{ color: 'var(--text-secondary)'}}>{data.contact_email}</a>
            )}
            {data.website && (
              <a href={data.website.startsWith('http') ? data.website : `https://${data.website}`} target="_blank" rel="noopener noreferrer" className="block text-lg hover:underline transition-all duration-300" style={{ color: 'var(--text-secondary)'}}>{data.website}</a>
            )}
            {data.contact_phone && (
              <a href={`tel:${data.contact_phone}`} className="block text-lg hover:underline transition-all duration-300" style={{ color: 'var(--text-secondary)'}}>{data.contact_phone}</a>
            )}
          </div>
        </section>
      )}

      {/* Footer with subtle branding */}
      <footer className="text-center py-6 text-sm opacity-60" style={{ color: 'var(--text-muted)' }}>
        <p>© {new Date().getFullYear()} {data.brand_name || data.full_name || data.username}</p>
      </footer>
    </div>
  );
}

// Helper function to determine contrast color (black or white) for text on a given background
// This might be better placed in a utils file if used across multiple templates
const getContrastColor = (hexColor: string): string => {
  if (!hexColor) return '#000000'; // Default to black if color is undefined
  const normalizedHex = hexColor.replace('#', '');
  if (normalizedHex.length !== 6 && normalizedHex.length !== 3) return '#000000'; // Invalid hex

  let r, g, b;
  if (normalizedHex.length === 3) {
    r = parseInt(normalizedHex[0] + normalizedHex[0], 16);
    g = parseInt(normalizedHex[1] + normalizedHex[1], 16);
    b = parseInt(normalizedHex[2] + normalizedHex[2], 16);
  } else {
    r = parseInt(normalizedHex.substring(0, 2), 16);
    g = parseInt(normalizedHex.substring(2, 4), 16);
    b = parseInt(normalizedHex.substring(4, 6), 16);
  }
  
  // Formula for luminance
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#FFFFFF';
};

// Default visibility (if not passed from editor)
const defaultSectionVisibility: SectionVisibilityState = {
  profileDetails: true,
  brandExperience: true,
  servicesSkills: true,
  socialMedia: true,
  contactDetails: true,
  profilePicture: true,
  tiktokVideos: true,
  audienceStats: true,
  performance: true,
};

// --- SVG Icons ---
const InstagramIconSVG = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);
const TikTokIconSVG = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02c.08 1.53.63 3.09 1.75 4.17c1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97c-.57-.26-1.1-.59-1.62-.93c-.01 2.92.01 5.84-.02 8.75c-.08 1.4-.54 2.79-1.35 3.94c-1.31 1.92-3.58 3.17-5.91 3.21c-1.43.08-2.86-.31-4.08-1.03c-2.02-1.19-3.44-3.37-3.65-5.71c-.02-.5-.03-1-.01-1.49c.18-1.9 1.12-3.72 2.58-4.96c1.66-1.44 3.98-2.13 6.15-1.72c.02 1.48-.04 2.96-.04 4.44c-.99-.32-2.15-.23-3.02.37c-.63.41-1.11 1.04-1.36 1.75c-.21.51-.15 1.07-.14 1.61c.24 1.64 1.82 3.02 3.5 2.87c1.12-.01 2.19-.66 2.77-1.61c.19-.33.4-.67.41-1.06c.1-1.79.06-3.57.07-5.36c.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);
const YouTubeIconSVG = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
  </svg>
);

export default MediaKitTemplateLuxury; 