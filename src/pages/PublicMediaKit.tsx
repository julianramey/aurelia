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
}

const defaultThemeColors: LibColorScheme = {
  background: '#F5F5F5',
  text: '#1A1F2C',
  secondary: '#6E59A5',
  accent_light: '#E5DAF8',
  accent: '#7E69AB', 
  primary: '#7E69AB', 
};

const defaultTheme: TemplateTheme = {
  background: defaultThemeColors.background,
  foreground: defaultThemeColors.text,
  primary: defaultThemeColors.primary,
  primaryLight: defaultThemeColors.accent_light,
  secondary: defaultThemeColors.secondary,
  accent: defaultThemeColors.accent,
  neutral: defaultThemeColors.secondary, 
  border: `${defaultThemeColors.primary}33` 
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
};

const computeTheme = (profileData: PublicProfileViewData | null): TemplateTheme => {
  const mediaKitObject = profileData?.media_kit_data;
  const colors: LibColorScheme | null = mediaKitObject?.colors || null;
    
  if (!colors) return defaultTheme;
  
  const mergedColors = { ...defaultThemeColors, ...colors };
  const primary = mergedColors.primary || mergedColors.accent;
  const primaryLight = mergedColors.accent_light;
  
  return {
    background: mergedColors.background,
    foreground: mergedColors.text,
    primary: primary,
    primaryLight: primaryLight,
    secondary: mergedColors.secondary,
    accent: mergedColors.accent,
    neutral: mergedColors.secondary,
    border: `${primary}33` 
  };
};

export default function PublicMediaKit() {
  const { username } = useParams();
  const [profile, setProfile] = useState<PublicProfileViewData | null>(null); // Use the new richer type
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [computedTheme, setComputedTheme] = useState<TemplateTheme>(defaultTheme);

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
          supabaseNoCache.from('media_kit_videos').select('url, thumbnail_url').eq('profile_id', fetchedProfile.id)
        ]);
        
        fullyFormedMkData.videos = videosResult.data || []; // Ensure videos are from the direct fetch
        
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
      } catch (err) {
        console.error('PublicMediaKit: Error fetching profile data:', err);
        setError((err as Error).message || 'Media kit not found or an error occurred.');
      } finally {
        setLoading(false);
      }
    }
    fetchProfileData();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
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
        <div className="max-w-4xl mx-auto">
          <MediaKit isPublic={true} publicProfile={profile} theme={computedTheme} />
        </div>
      </main>
    </div>
  );
} 