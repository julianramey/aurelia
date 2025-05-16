import React from 'react';
import type { Profile, VideoItem, Service, BrandCollaboration, MediaKitStats, ColorScheme, SectionVisibilityState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import PreviewLoadingFallback from '@/components/PreviewLoadingFallback';
import {
  UserCircleIcon,
  ChartBarIcon,
  TagIcon,
  PencilIcon,
  ArrowDownTrayIcon,
  PhotoIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';

// Interface for the data expected by this template
// Ensure it includes all necessary fields from Profile + extras
interface TemplateData {
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
}

// Interface for the theme styles
interface TemplateTheme {
  background: string;
  foreground: string;
  primary: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  neutral: string;
  border: string;
}

// Export the props interface
export interface MediaKitTemplateDefaultProps {
  data: TemplateData | null;
  theme: TemplateTheme;
  loading?: boolean;
}

// Utility function copied from MediaKit.tsx
const formatNumber = (num: number | string | undefined): string => {
  if (num === undefined) return '0';
  const value = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(value)) return '0';
  if (value >= 1000000000) return (value / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (value >= 1000000) return (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (value >= 1000) return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return value.toString();
};

// Responsive styles copied from MediaKit.tsx
const responsiveTextStyles = `
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
  .text-container {
    display: flex;
    align-items: center;
  }
`;

const MediaKitTemplateDefault: React.FC<MediaKitTemplateDefaultProps> = ({
  data,
  theme,
  loading,
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

  const visibility: SectionVisibilityState = {
    profileDetails:      data.section_visibility?.profileDetails  ?? true,
    profilePicture:      data.section_visibility?.profilePicture  ?? true,
    socialMedia:         data.section_visibility?.socialMedia     ?? true,
    audienceStats:       data.section_visibility?.audienceStats   ?? true,
    performance:         data.section_visibility?.performance     ?? true,
    tiktokVideos:        data.section_visibility?.tiktokVideos    ?? true,
    brandExperience:     data.section_visibility?.brandExperience ?? true,
    servicesSkills:      data.section_visibility?.servicesSkills  ?? true,
    contactDetails:      data.section_visibility?.contactDetails  ?? true,
  };

  // Need to handle the case where data.media_kit_data might be a string
  const mediaKitDataObject = typeof data.media_kit_data === 'object' ? data.media_kit_data : null;

  // Safely access potentially nested properties from mediaKitDataObject
  const videos = data.videos?.length
    ? data.videos
    : mediaKitDataObject?.videos || [];

  // Helper to get collaboration name
  const getCollabName = (collab: BrandCollaboration): string => {
    return collab.brand_name || 'Unnamed Brand';
  }

  // Helper to get service name
  const getServiceName = (service: Service): string => {
    return service.service_name || 'Unnamed Service';
  }

  return (
    <div className="media-kit space-y-6 p-4 rounded-lg" style={{ backgroundColor: theme.background }}>
      <style>{responsiveTextStyles}</style>
      
      {/* Hero Section - Conditionally render parts or whole based on visibility */}
      {(visibility.profileDetails || visibility.profilePicture || visibility.socialMedia) && (
        <div className="hero bg-white rounded-[0.75rem] p-8 shadow-sm border grid grid-cols-1 md:grid-cols-[200px,1fr] gap-8" style={{ borderColor: theme.border }}>
          {visibility.profilePicture && (
            <div className="photo w-[200px] h-[200px] mx-auto md:mx-0 rounded-full overflow-hidden border-4" style={{ borderColor: theme.primaryLight }}>
              {data.avatar_url ? (
                <img src={data.avatar_url} alt={data.brand_name || data.full_name || 'Profile'} className="w-full h-full object-cover" />
              ) : (
                <img src="https://placehold.co/400x400" alt="Profile Photo" className="w-full h-full object-cover" /> // Placeholder
              )}
            </div>
          )}
          
          {(visibility.profileDetails || visibility.socialMedia) && (
            <div className="info text-center md:text-left">
              {visibility.profileDetails && (
                <>
                  <h1 className="font-['Playfair_Display'] text-[2.5rem] mb-2" style={{ color: theme.foreground }}>
                    {data.brand_name || data.full_name || 'Your Default Name'}
                  </h1>
                  <p className="text-[1.1rem] italic mb-4" style={{ color: theme.primary }}>
                    {data.tagline}
                  </p>
                  <p className="text-base mb-6" style={{ color: theme.neutral }}>
                    {data.personal_intro || data.intro || ''}
                  </p>
                </>
              )}
              
              {visibility.socialMedia && (
                <div className="social-links flex flex-wrap gap-4 justify-center md:justify-start">
                  {data.instagram_handle && (
                    <a
                      href={`https://instagram.com/${data.instagram_handle.replace(/^@/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.9rem] font-medium px-4 py-2 rounded-lg transition-all hover:bg-primary hover:text-white"
                      style={{ 
                        background: theme.primaryLight,
                        color: theme.foreground
                      }}
                    >
                      Instagram
                    </a>
                  )}
                  {data.tiktok_handle && (
                    <a
                      href={`https://tiktok.com/@${data.tiktok_handle.replace(/^@/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.9rem] font-medium px-4 py-2 rounded-lg transition-all hover:bg-primary hover:text-white"
                      style={{ 
                        background: theme.primaryLight,
                        color: theme.foreground
                      }}
                    >
                      TikTok
                    </a>
                  )}
                  {(data.contact_email || data.email) && (
                    // Note: Contact button in social links, also a dedicated contact section later
                    <a
                      href={`mailto:${data.contact_email || data.email}`}
                      className="text-[0.9rem] font-medium px-4 py-2 rounded-lg transition-all hover:bg-primary hover:text-white"
                      style={{ 
                        background: theme.primaryLight,
                        color: theme.foreground
                      }}
                    >
                      Contact
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Analytics Overview - Restore bg-white */}
      {(visibility.audienceStats || visibility.performance) && (
        <div className="section bg-white rounded-[0.75rem] p-6 shadow-sm border" style={{ borderColor: theme.border }}>
          <h2 className="font-['Playfair_Display'] text-[1.5rem] mb-6 flex items-center gap-2" style={{ color: theme.foreground }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" style={{ color: theme.primary }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
            Analytics Overview
          </h2>
          <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-6">
            {visibility.audienceStats && (
              <>
                <div className="stats-item p-6 rounded-[0.75rem] text-center" style={{ background: theme.primaryLight }}>
                  <h3 className="stats-number font-semibold mb-1" style={{ color: theme.primary }}>
                    {formatNumber(data.follower_count) || '0'}
                  </h3>
                  <p className="text-[0.9rem]" style={{ color: theme.neutral }}>Total Followers</p>
                </div>
                <div className="stats-item p-6 rounded-[0.75rem] text-center" style={{ background: theme.primaryLight }}>
                  <h3 className="stats-number font-semibold mb-1" style={{ color: theme.primary }}>
                    {data.engagement_rate || '0'}%
                  </h3>
                  <p className="text-[0.9rem]" style={{ color: theme.neutral }}>Engagement Rate</p>
                </div>
              </>
            )}
            {visibility.performance && (
              <>
                <div className="stats-item p-6 rounded-[0.75rem] text-center" style={{ background: theme.primaryLight }}>
                  <h3 className="stats-number font-semibold mb-1" style={{ color: theme.primary }}>
                    {formatNumber(data.avg_likes) || '0'}
                  </h3>
                  <p className="text-[0.9rem]" style={{ color: theme.neutral }}>Average Likes</p>
                </div>
                <div className="stats-item p-6 rounded-[0.75rem] text-center" style={{ background: theme.primaryLight }}>
                  <h3 className="stats-number font-semibold mb-1" style={{ color: theme.primary }}>
                    {formatNumber(data.reach) || '0'}
                  </h3>
                  <p className="text-[0.9rem]" style={{ color: theme.neutral }}>Weekly Reach</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Portfolio Showcase - Restore bg-white */}
      {/* For now, tie portfolio to tiktokVideos visibility or brandExperience. Could be its own toggle later. */}
      {(visibility.tiktokVideos || visibility.brandExperience) && (
        <div className="section bg-white rounded-[0.75rem] p-6 shadow-sm border" style={{ borderColor: theme.border }}>
          <h2 className="font-['Playfair_Display'] text-[1.5rem] mb-6 flex items-center gap-2" style={{ color: theme.foreground }}>
            <PhotoIcon className="w-6 h-6" style={{ color: theme.primary }} />
            Recent Content
          </h2>
          
          {(() => {
            const showVideos = visibility.tiktokVideos && data.videos && data.videos.length > 0;
            const showImages = !showVideos && visibility.brandExperience && data.portfolio_images && data.portfolio_images.length > 0; // Show images if videos are off AND brandExperience is on

            if (showVideos) {
              return (
                <div className="flex justify-center px-1" 
                     style={{ 
                       gap: videos.length >= 3 && videos.length <= 4 ? '1.5rem' : '1rem',
                     }}>
                  {videos.map((v, i) => (
                    <a
                      key={i}
                      href={v.url}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block rounded-lg overflow-hidden flex-1"
                      style={{ 
                        border: `2px solid ${theme.primary}`,
                        maxWidth: videos.length <= 3 ? '26%' : '19.8%',
                      }}
                    >
                      <div className="relative">
                        <img
                          src={v.thumbnail_url}
                          alt={`Video ${i+1}`}
                          className="w-full object-cover aspect-[3/4]"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-25">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="white" 
                            viewBox="0 0 24 24" 
                            className={`${videos.length >= 4 ? 'w-9 h-9' : 'w-10 h-10'}`}
                          >
                            <path d="M8 5v14l11-7L8 5z"/>
                          </svg>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              );
            } else if (showImages) {
              return (
                <div className="grid grid-cols-3 gap-4">
                  {data.portfolio_images?.map((image, index) => (
                    <img 
                      key={index}
                      src={image}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-[200px] object-cover rounded-[0.75rem] border-2 transition-transform hover:scale-[1.02]"
                      style={{ borderColor: theme.border }}
                    />
                  ))}
                </div>
              );
            } else {
              return <div className="text-[0.9rem] italic text-gray-400">No portfolio content to display based on current visibility settings.</div>;
            }
          })()}
        </div>
      )}

      {/* Brand Collaborations - Restore bg-white */}
      {visibility.brandExperience && (
        <div className="section bg-white rounded-[0.75rem] p-6 shadow-sm border" style={{ borderColor: theme.border }}>
          <h2 className="font-['Playfair_Display'] text-[1.5rem] mb-6 flex items-center gap-2" style={{ color: theme.foreground }}>
            <ShareIcon className="w-6 h-6" style={{ color: theme.primary }} />
            Brand Experience
          </h2>
          <div className="brands-grid flex flex-wrap gap-4">
            {(Array.isArray(data.brand_collaborations) && data.brand_collaborations.length > 0) 
              ? data.brand_collaborations.map((brand, index) => (
                  <div
                    key={brand.id || index} 
                    className="brand-tag font-medium px-5 py-3 rounded-lg"
                    style={{ background: theme.primaryLight, color: theme.primary }}
                  >
                    {getCollabName(brand)}
                  </div>
                ))
              : (
                <div className="text-[0.9rem] italic text-gray-400">
                  No brand collaborations to display
                </div>
              )
            }
          </div>
        </div>
      )}

      {/* Services - Restore bg-white */}
      {visibility.servicesSkills && (
        <div className="section bg-white rounded-[0.75rem] p-6 shadow-sm border" style={{ borderColor: theme.border }}>
          <h2 className="font-['Playfair_Display'] text-[1.5rem] mb-6 flex items-center gap-2" style={{ color: theme.foreground }}>
            <TagIcon className="w-6 h-6" style={{ color: theme.primary }} />
            Services Offered
          </h2>
          
          <ul className="services-list grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Array.isArray(data.services) && data.services.length > 0)
              ? data.services.map((service, index) => (
                  <li
                    key={service.id || index} 
                    className="service-tag font-medium p-4 rounded-[0.75rem] flex items-center gap-2"
                    style={{ background: theme.primaryLight, color: theme.primary }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-container">{getServiceName(service)}</span>
                  </li>
                ))
              : (
                <li className="text-[0.9rem] italic text-gray-400 col-span-3">
                  No services to display
                </li>
              )
            }
          </ul>
        </div>
      )}

      {/* Contact Information - Restore bg-white */}
      {visibility.contactDetails && (
        <div className="section bg-white rounded-[0.75rem] p-6 shadow-sm border" style={{ borderColor: theme.border }}>
          <h2 className="font-['Playfair_Display'] text-[1.5rem] mb-6 flex items-center gap-2" style={{ color: theme.foreground }}>
            <ShareIcon className="w-6 h-6" style={{ color: theme.primary }} />
            Contact Information
          </h2>
          <div className="contact-info grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-[0.75rem] border" style={{ borderColor: theme.border }}>
              <h4 className="text-[0.9rem] mb-2" style={{ color: theme.neutral }}>Email</h4>
              <p>
                <a 
                  href={`mailto:${data.contact_email || data.email || 'contact@example.com'}`} 
                  className="contact-info-text font-medium hover:underline block" 
                  style={{ color: theme.primary }}
                >
                  {data.contact_email || data.email || 'contact@example.com'}
                </a>
              </p>
            </div>
            <div className="bg-white p-4 rounded-[0.75rem] border" style={{ borderColor: theme.border }}>
              <h4 className="text-[0.9rem] mb-2" style={{ color: theme.neutral }}>Instagram</h4>
              <p>
                <a 
                  href={`https://instagram.com/${data.instagram_handle ? data.instagram_handle.replace(/^@/, '') : 'username'}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="contact-info-text font-medium hover:underline block"
                  style={{ color: theme.primary }}
                >
                  {'@' + (data.instagram_handle ? data.instagram_handle.replace(/^@/, '') : 'username')}
                </a>
              </p>
            </div>
            <div className="bg-white p-4 rounded-[0.75rem] border" style={{ borderColor: theme.border }}>
              <h4 className="text-[0.9rem] mb-2" style={{ color: theme.neutral }}>TikTok</h4>
              <p>
                <a 
                  href={`https://tiktok.com/@${data.tiktok_handle ? data.tiktok_handle.replace(/^@/, '') : 'username'}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="contact-info-text font-medium hover:underline block"
                  style={{ color: theme.primary }}
                >
                  {'@' + (data.tiktok_handle ? data.tiktok_handle.replace(/^@/, '') : 'username')}
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaKitTemplateDefault; 