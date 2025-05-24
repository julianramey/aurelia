import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import MediaKit from '@/pages/MediaKit';
import { createClient } from '@supabase/supabase-js';
import type { 
  Profile as BaseProfile, // Rename to avoid conflict with local richer Profile type
  MediaKitData, 
  SectionVisibilityState, 
  ColorScheme as LibColorScheme, 
  Service, 
  BrandCollaboration, 
  MediaKitStats, 
  VideoItem as LibVideoItem 
} from '@/lib/types';
import { LinkIcon, ShareIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const ONE_MINUTE_MS = 60 * 1000;

// Local, more expansive Profile type for what MediaKit expects as publicProfile
interface PublicProfileViewData extends BaseProfile {
  // Fields from BaseProfile are inherited
  media_kit_data: MediaKitData; // Ensure this is the rich, full MediaKitData object

  // Fields flattened from media_kit_data or related tables
  // (as seen in the user-provided working PublicMediaKit.tsx)
  videos?: LibVideoItem[]; // From media_kit_videos, also in media_kit_data.videos
  portfolio_images?: string[]; // From portfolio_items
  follower_count?: number | string;
  engagement_rate?: number | string;
  avg_likes?: number | string;
  reach?: number | string;
  stats?: MediaKitStats[]; // Full stats array
  services?: Service[];
  brand_collaborations?: BrandCollaboration[];
  skills?: string[]; // From media_kit_data.skills
  section_visibility?: SectionVisibilityState;
  // contact_email is already optional in BaseProfile, but ensure it's sourced correctly
  selected_template_id?: string; // From media_kit_data.selected_template_id
}

interface TemplateTheme {
  background: string;
  foreground: string;
  primary: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  neutral: string;
  border: string;
  font: string;
}

const defaultThemeColors: LibColorScheme = {
  background: '#F5F5F5',
  text: '#1A1F2C',
  secondary: '#6E59A5',
  accent_light: '#E5DAF8',
  accent: '#7E69AB', 
  primary: '#7E69AB', 
};

const defaultThemeFont = 'Inter'; // Define default font separately

const defaultTheme: TemplateTheme = {
  background: defaultThemeColors.background,
  foreground: defaultThemeColors.text,
  primary: defaultThemeColors.primary,
  primaryLight: defaultThemeColors.accent_light,
  secondary: defaultThemeColors.secondary,
  accent: defaultThemeColors.accent,
  neutral: defaultThemeColors.secondary, 
  border: `${defaultThemeColors.primary}33`,
  font: defaultThemeFont,
};

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
  audienceDemographics: true,
};

const computeTheme = (profileData: PublicProfileViewData | null): TemplateTheme => {
  const mediaKitObject = profileData?.media_kit_data;
  const colorsFromMKData: LibColorScheme | null = mediaKitObject?.colors || null;
  const fontFromMKData: string | undefined = mediaKitObject?.font;
    
  if (!colorsFromMKData) return { ...defaultTheme, font: fontFromMKData || defaultThemeFont };
  
  const mergedColors = { ...defaultThemeColors, ...colorsFromMKData };
  // primary and accent are based on the logic from the user's request for PublicMediaKit
  // The user explicitly wanted primary to be driven by accent from the picker
  const accentColor = mergedColors.accent;
  
  return {
    background:   mergedColors.background,
    foreground:   mergedColors.text,
    primary:      accentColor,        // Use the picker's accent
    primaryLight: mergedColors.accent_light,
    secondary:    mergedColors.secondary,
    accent:       accentColor,        // Actual accent color from scheme
    neutral:      mergedColors.secondary, // Use cs.secondary for neutral slot
    border:       `${accentColor}33`,   // Border based on accent
    font:         fontFromMKData || defaultThemeFont
  };
};

export default function PublicMediaKit() {
  const { username } = useParams();
  const [profile, setProfile] = useState<PublicProfileViewData | null>(null); // Use the new richer type
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [computedTheme, setComputedTheme] = useState<TemplateTheme>(defaultTheme);
  const [viewTracked, setViewTracked] = useState(false); // Prevent multiple tracking calls
  const [showCopiedMessage, setShowCopiedMessage] = useState(false); // For copy link feedback

  const supabaseNoCache = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: (url: RequestInfo | URL, options: RequestInit = {}) => {
          const headers = new Headers(options.headers || {});
          headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
          headers.set('Pragma', 'no-cache');
          return fetch(url, { ...options, cache: 'no-store', headers });
        }
      }
    }
  );

  useEffect(() => {
    async function fetchProfileData() {
      try {
        setLoading(true);
        setError(null);
        setViewTracked(false); // Reset view tracking status on new username
        if (!username) throw new Error("Username/ID parameter is missing.");

        console.log("PublicMediaKit: Fetching profile for identifier:", username);
        const { data: fetchedProfile, error: fetchError } = await supabaseNoCache
          .from('profiles')
          .select('*') // Select all from BaseProfile
          .or(`media_kit_url.eq.${username},username.eq.${username}`)
          .maybeSingle<BaseProfile>(); // Fetches as BaseProfile initially

        if (fetchError && !fetchedProfile) {
          console.error("PublicMediaKit: Supabase fetch error:", fetchError);
          throw fetchError; 
        }
        if (!fetchedProfile) {
          console.error("PublicMediaKit: Profile not found for identifier (url/username):", username);
          throw new Error('Profile not found for identifier: ' + username);
        }

        console.log("PublicMediaKit: Profile raw fetched:", fetchedProfile.id);
        localStorage.removeItem('updatedMediaKit');
        
        let mkDataFromDb: Partial<MediaKitData> = {};
        if (typeof fetchedProfile.media_kit_data === 'string') {
          try { mkDataFromDb = JSON.parse(fetchedProfile.media_kit_data); }
          catch (e) { console.error("PublicMediaKit: Failed to parse media_kit_data string, using defaults.", e); }
        } else if (fetchedProfile.media_kit_data && typeof fetchedProfile.media_kit_data === 'object') {
          mkDataFromDb = fetchedProfile.media_kit_data as Partial<MediaKitData>;
        }
        
        const fullyFormedMkData: MediaKitData = {
            type: 'media_kit_data',
            brand_name: mkDataFromDb.brand_name || fetchedProfile.full_name || '',
            tagline: mkDataFromDb.tagline || '',
            colors: { ...defaultThemeColors, ...(mkDataFromDb.colors || {}) },
            font: mkDataFromDb.font || 'Inter',
            selected_template_id: mkDataFromDb.selected_template_id || 'default',
            personal_intro: mkDataFromDb.personal_intro || fetchedProfile.personal_intro || '',
            skills: mkDataFromDb.skills || [],
            contact_email: mkDataFromDb.contact_email || fetchedProfile.email || '',
            instagram_handle: mkDataFromDb.instagram_handle || fetchedProfile.instagram_handle,
            tiktok_handle: mkDataFromDb.tiktok_handle || fetchedProfile.tiktok_handle,
            portfolio_images: mkDataFromDb.portfolio_images || [],
            videos: mkDataFromDb.videos || [],
            section_visibility: { ...defaultSectionVisibility, ...(mkDataFromDb.section_visibility || {}) },
            profile_photo: mkDataFromDb.profile_photo || fetchedProfile.avatar_url,
            last_updated: mkDataFromDb.last_updated || new Date().toISOString(),
        };
        
        const [statsResult, collabsResult, servicesResult, portfolioResult, videosResult] = await Promise.all([
          supabaseNoCache.from('media_kit_stats').select('*').eq('profile_id', fetchedProfile.id),
          supabaseNoCache.from('brand_collaborations').select('*').eq('profile_id', fetchedProfile.id),
          supabaseNoCache.from('services').select('*').eq('profile_id', fetchedProfile.id),
          supabaseNoCache.from('portfolio_items').select('image_url, title, description').eq('profile_id', fetchedProfile.id), // Specific fields
          supabaseNoCache.from('media_kit_videos').select('url, thumbnail_url, embed_html, provider_name').eq('profile_id', fetchedProfile.id) // Added embed_html and provider_name
        ]);
        
        fullyFormedMkData.videos = videosResult.data || []; // Ensure videos are from the direct fetch
        
        // ADDED LOGGING FOR VIDEO DATA
        console.log('[PublicMediaKit] Fetched videos data:', fullyFormedMkData.videos);
        if (fullyFormedMkData.videos && fullyFormedMkData.videos.length > 0) {
          fullyFormedMkData.videos.forEach((video, index) => {
            console.log(`[PublicMediaKit] Video ${index}: URL: ${video.url}, Thumbnail URL: ${video.thumbnail_url}, Embed HTML: ${video.embed_html ? String(video.embed_html).substring(0, 50) + "..." : null}, Provider: ${video.provider_name}`);
          });
        }
        // END ADDED LOGGING
        
        const statsData = statsResult.data || [];
        const collabsData = collabsResult.data || [];
        const servicesData = servicesResult.data || [];
        const portfolioData = portfolioResult.data || [];
        
        const instagramStats = statsData.find(s => s.platform === 'instagram') || {
          follower_count: 0, engagement_rate: 0, avg_likes: 0, weekly_reach: 0
        };
        
        // Construct the PublicProfileViewData object
        const completeProfileData: PublicProfileViewData = {
          ...fetchedProfile, // Base fields from Profile table
          user_id: fetchedProfile.id, // ENSURE user_id IS POPULATED FROM fetchedProfile.id
          username: fetchedProfile.username || fullyFormedMkData.brand_name || 'anonymous_user',
          full_name: fullyFormedMkData.brand_name || fetchedProfile.full_name || 'Creator Name',
          email: fullyFormedMkData.contact_email || fetchedProfile.email || '',
          media_kit_data: fullyFormedMkData, // The rich, complete media_kit_data object
          section_visibility: fullyFormedMkData.section_visibility as SectionVisibilityState,

          // Flattened fields as expected by MediaKit in public mode (mirroring working example)
          videos: fullyFormedMkData.videos, // Sourced from fullyFormedMkData which got them from fetch
          portfolio_images: portfolioData.map(p => p.image_url as string), // Map from portfolio_items fetch
          
          follower_count: instagramStats.follower_count,
          engagement_rate: instagramStats.engagement_rate,
          avg_likes: instagramStats.avg_likes,
          reach: instagramStats.weekly_reach,
          stats: statsData,
          
          services: servicesData,
          brand_collaborations: collabsData,
          
          skills: fullyFormedMkData.skills, // From media_kit_data
          // contact_email is already in BaseProfile (optional) and handled by ...fetchedProfile or mkData
          selected_template_id: fullyFormedMkData.selected_template_id, // From media_kit_data
        };

        console.log("PublicMediaKit: Final profile object for MediaKit component:", completeProfileData.id, "Template:", completeProfileData.selected_template_id);
        setProfile(completeProfileData);
        setComputedTheme(computeTheme(completeProfileData));

        // Track view after profile is successfully fetched and set
        if (completeProfileData && completeProfileData.user_id && !viewTracked) {
          const lastViewedKey = `lastViewed_${completeProfileData.user_id}`;
          const lastViewedTimestamp = localStorage.getItem(lastViewedKey);
          const currentTime = new Date().getTime();

          if (lastViewedTimestamp && (currentTime - parseInt(lastViewedTimestamp, 10) < ONE_MINUTE_MS)) {
            console.log(`View tracking skipped for ${completeProfileData.user_id}, recently viewed within the last minute.`);
            setViewTracked(true); // Mark as processed for this load to avoid re-attempts during the same session load
          } else {
            console.log("PublicMediaKit: Attempting to track view for user_id:", completeProfileData.user_id);
            const { error: funcError } = await supabase.functions.invoke('track-kit-view', {
              body: { kitUserId: completeProfileData.user_id },
            });
            if (funcError) {
              console.error('Error calling track-kit-view function:', funcError);
              // Don't block UI for analytics error, just log it
            } else {
              console.log('View tracking function invoked successfully for user_id:', completeProfileData.user_id);
              localStorage.setItem(lastViewedKey, currentTime.toString()); // Store timestamp on successful track
              setViewTracked(true); // Mark as tracked for this load
            }
          }
        } else {
          console.log("View tracking conditions not met or already tracked:", { 
            hasProfile: !!completeProfileData,
            hasUserId: !!completeProfileData?.user_id,
            isViewTracked: viewTracked
          });
        }

      } catch (err) {
        console.error('PublicMediaKit: Error fetching profile data:', err);
        setError((err as Error).message || 'Media kit not found or an error occurred.');
      } finally {
        setLoading(false);
      }
    }
    fetchProfileData();
  }, [username]); // Remove viewTracked from dependencies

  const handleTrackEngagement = async (engagementType: 'share_click' | 'copy_link_click') => {
    console.log("handleTrackEngagement called with type:", engagementType);
    if (profile && profile.user_id) {
      const lastEngagedKey = `lastEngaged_${profile.user_id}_${engagementType}`;
      const lastEngagedTimestamp = localStorage.getItem(lastEngagedKey);
      const currentTime = new Date().getTime();

      if (lastEngagedTimestamp && (currentTime - parseInt(lastEngagedTimestamp, 10) < ONE_MINUTE_MS)) {
        console.log(`Engagement tracking skipped for ${profile.user_id}, type ${engagementType}, recently engaged within the last minute.`);
        // For copy link, we still want to show the "Link Copied!" message.
        if (engagementType === 'copy_link_click' && !showCopiedMessage) {
          setShowCopiedMessage(true);
          setTimeout(() => setShowCopiedMessage(false), 2000);
        }
        return; // Skip the actual tracking call if rate-limited
      }

      console.log("Attempting to track engagement. kitUserId:", profile.user_id, "engagementType:", engagementType);
      try {
        const { error: funcError } = await supabase.functions.invoke('track-kit-engagement', {
          body: { kitUserId: profile.user_id, engagementType: engagementType },
        });
        if (funcError) {
          console.error(`Error calling track-kit-engagement function for ${engagementType}:`, funcError);
        } else {
          console.log(`Engagement tracking function invoked successfully for ${engagementType}, user_id:`, profile.user_id);
          localStorage.setItem(lastEngagedKey, currentTime.toString()); // Store timestamp on successful track
        }
      } catch (e) {
        console.error(`Exception calling track-kit-engagement function for ${engagementType}:`, e);
      }
    } else {
      console.log("Engagement tracking conditions not met:", { 
        hasProfile: !!profile,
        hasUserId: !!profile?.user_id
      });
    }
  };

  const handleShare = () => {
    // Basic share (if navigator.share is available)
    if (navigator.share) {
      navigator.share({
        title: `${profile?.full_name || 'Media Kit'}`,
        text: `Check out ${profile?.full_name || 'this creator\'s'} media kit!`,
        url: window.location.href,
      })
      .then(() => {
        console.log('Successful share');
        handleTrackEngagement('share_click');
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support navigator.share
      // For now, just track the click, and user can manually copy link
      console.log('Navigator.share not supported, tracking share click attempt.');
      handleTrackEngagement('share_click');
      // Optionally, you could open a modal here with sharing options or a copy link button
      // For simplicity, we will rely on the separate "Copy Link" button for non-navigator.share cases.
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        console.log('Link copied to clipboard');
        // The visual feedback is now primarily handled within handleTrackEngagement if not rate-limited,
        // or directly if rate-limited but still needs to show.
        // Call handleTrackEngagement, which will handle the "Link Copied!" message and the actual tracking.
        handleTrackEngagement('copy_link_click');
      })
      .catch(err => console.error('Failed to copy link: ', err));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div 
          className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2"
          style={{ borderColor: defaultTheme.primary }}
        ></div>
        <p className="ml-3 text-gray-700">Loading Media Kit...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-semibold text-red-600 mb-2">Oops!</h2>
        <p className="text-gray-700">{error || 'Could not load the media kit. Please check the URL or try again later.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: computedTheme.background }}>
      <main className="py-0 md:py-12">
        <div className="max-w-4xl mx-auto relative">
          <MediaKit isPublic={true} publicProfile={profile} theme={computedTheme} />
          
          {/* Engagement Buttons Container - Fixed at bottom right */} 
          {profile && (
            <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50">
              <button
                onClick={handleShare}
                title="Share Media Kit"
                className="p-3 bg-rose hover:bg-rose/90 text-white rounded-full shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105 flex items-center justify-center"
                style={{ backgroundColor: computedTheme.primary }}
              >
                <ShareIcon className="h-6 w-6" />
              </button>
              <button
                onClick={handleCopyLink}
                title="Copy Link to Media Kit"
                className="p-3 bg-rose hover:bg-rose/90 text-white rounded-full shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105 flex items-center justify-center"
                style={{ backgroundColor: computedTheme.primary }}
              >
                <LinkIcon className="h-6 w-6" />
              </button>
            </div>
          )}

          {/* Copied Link Message - Positioned to the left of the buttons */} 
          {showCopiedMessage && (
            <div 
              className="fixed bottom-8 left-8 bg-rose text-white text-sm py-2 px-4 rounded-full shadow-lg flex items-center gap-2 z-50 transition-opacity duration-300 ease-in-out"
              style={{ backgroundColor: computedTheme.primary, color: computedTheme.background /* Or a contrasting text color if background is light */ }}
            >
              <CheckCircleIcon className="h-5 w-5" />
              Link Copied!
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 