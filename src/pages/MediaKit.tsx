import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { useMediaKitData } from '@/lib/hooks/useMediaKitData';
import { Button } from '@/components/ui/button';
import { withPreview } from '@/lib/withPreview';
import { TEMPLATES } from '@/lib/templateRegistry';
import type { 
  Profile as ImportedProfile, 
  BrandCollaboration, 
  Service, 
  MediaKitStats,
  SectionVisibilityState,
  EditorPreviewData,
  TemplateTheme as TemplateThemeType,
  MediaKitData
} from '@/lib/types';
import PreviewLoadingFallback from '@/components/PreviewLoadingFallback';
import {
  ArrowDownTrayIcon,
  PencilIcon,
  ShareIcon as ShareIconOutline,
  ChatBubbleOvalLeftEllipsisIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { ShareIcon } from '@heroicons/react/24/solid';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MediaKitTemplateDefault from '@/components/media-kit-templates/MediaKitTemplateDefault';
import MediaKitTemplateAesthetic from '@/components/media-kit-templates/MediaKitTemplateAesthetic';

// Placeholder types based on error message - adjust if actual types exist
// import type { ColorScheme, VideoItem } from '@/lib/types';
// Define ColorScheme with required keys from the error message + primary
type ColorScheme = {
  primary: string; 
  secondary: string;
  accent: string;
  background: string;
  text: string;
  accent_light: string;
  font?: string; // ADDED: to match lib/types and usage
  // [key: string]: string; // Remove index signature again
};
type VideoItem = { url: string; thumbnail_url: string; };

// Define the expected theme structure
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

interface MediaKitProps {
  isPreview?: boolean;
  previewData?: unknown;
  isPublic?: boolean;
  publicProfile?: unknown;
  theme?: {
    background: string;
    foreground: string;
    primary: string;
    primaryLight: string;
    secondary: string;
    accent: string;
    neutral: string;
    border: string;
    font: string;
  };
  previewUsername?: string;
}

// +++ DEFINE defaultSectionVisibility (can be moved to a shared file later)
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

export interface ProfileData {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  email: string;
  contact_email?: string;
  media_kit_data: MediaKitData | null;
  media_kit_url?: string;
  tagline?: string;
  personal_intro?: string;
  brand_name?: string;
  colors?: ColorScheme;
  videos?: Array<{ url: string; thumbnail_url: string }>;
  portfolio_images?: string[];
  avatar_url?: string;
  instagram_handle?: string | null;
  tiktok_handle?: string | null;
  intro?: string;
  follower_count?: number | string;
  engagement_rate?: number | string;
  avg_likes?: number | string;
  reach?: number | string;
  brand_collaborations?: BrandCollaboration[];
  services?: Service[];
  skills?: string[];
  selected_template_id?: string;
  created_at?: string;
  updated_at?: string;
  niche?: string;
  media_kit_stats?: MediaKitStats[];
  website?: string;
  onboarding_complete?: boolean;
  section_visibility?: Partial<SectionVisibilityState>;
}

// Define default colorscheme const
export const defaultColorScheme: ColorScheme = {
  primary: '#7E69AB',
  secondary: '#6E59A5',
  accent: '#1A1F2C',
  background: '#F5F5F5',
  text: '#1A1F2C',
  accent_light: '#E5DAF8',
  font: 'Inter',
};

// Create a memoized version of MediaKit to prevent unnecessary rerenders
const MemoizedMediaKitComponent = memo(function MediaKit({ isPreview = false, previewData = null, isPublic = false, publicProfile = null, theme, previewUsername }: MediaKitProps) {
  const { id: routeIdFromParams } = useParams<{ id?: string }>();
  const navigate = useNavigate(); 
  const { user } = useAuth();
  const { stats: fetchedStats, collaborations: fetchedCollabs, services: fetchedServices } = useMediaKitData();
  const location = useLocation();
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTemplateId, setActiveTemplateId] = useState<string>('default');
  const [styles, setStyles] = useState<TemplateTheme>({
    background: '#F5F5F5',
    foreground: '#1A1F2C',
    primary: '#7E69AB',
    primaryLight: '#E5DAF8',
    secondary: '#6E59A5',
    accent: '#1A1F2C',
    neutral: '#8E9196', // Initial neutral, can be overridden by localStorage or new logic
    border: 'rgba(126, 105, 171, 0.2)',
    font: 'Inter',
  });
  const computedStyles = theme || styles;
  const [hasFetched, setHasFetched] = useState(false);
  
  // Initial load from localStorage for mediaKitCustomStyles (SHOULD BE THE ONLY ONE LIKE THIS)
  useEffect(() => {
    const saved = localStorage.getItem('mediaKitCustomStyles');
    if (saved) {
      try {
        setStyles(JSON.parse(saved));
      } catch (e) {
        console.error("MediaKit: Error parsing mediaKitCustomStyles from localStorage", e);
      }
    }
  }, []); // Empty dependency array: runs once on mount

  const updatedMediaKitFromState = location.state?.updatedMediaKit;
  
  const localUpdatedMediaKit = useMemo(() => {
    try {
      if (updatedMediaKitFromState) {
        return updatedMediaKitFromState;
      }
      const storedData = localStorage.getItem('updatedMediaKit');
      if (!storedData) return null;
      const parsedData = JSON.parse(storedData);
      if (!parsedData.full_name && parsedData.brand_name) {
        parsedData.full_name = parsedData.brand_name;
      }
      if (parsedData.selected_template_id) {
        setActiveTemplateId(parsedData.selected_template_id);
      }
      const defaultColors = defaultColorScheme;
      if (parsedData.colors && typeof parsedData.colors === 'object') {
        parsedData.colors = { ...defaultColors, ...parsedData.colors };
      } else {
        parsedData.colors = defaultColors;
      }
      return parsedData;
    } catch (e) {
      console.error("MediaKit: Error parsing localStorage updatedMediaKit:", e);
      return null;
    }
  }, [updatedMediaKitFromState, setActiveTemplateId]); // Added setActiveTemplateId to deps if it's stable
  
  const kitData = isPreview ? profile?.media_kit_data : (localUpdatedMediaKit || profile?.media_kit_data);

  // useEffect for persisting raw content edits from updatedMediaKitFromState (NO THEME LOGIC HERE)
  useEffect(() => {
    if (updatedMediaKitFromState) {
      console.log("MediaKit: Processing updatedMediaKit from state (raw data persistence only)");
      const completeMediaKitData = {
        full_name: updatedMediaKitFromState.full_name || updatedMediaKitFromState.brand_name,
        personal_intro: updatedMediaKitFromState.personal_intro,
        tagline: updatedMediaKitFromState.tagline,
        ...updatedMediaKitFromState
      };
      localStorage.setItem('updatedMediaKit', JSON.stringify(completeMediaKitData));
    }
  }, [updatedMediaKitFromState]);
  
  // Debug logging for public profile props (KEEP ONE INSTANCE)
  useEffect(() => {
    if (isPublic && publicProfile) {
      console.log("MEDIAKIT: Received public profile:", publicProfile);
      const typedPublicProfile = publicProfile as ProfileData;
      const mediaKitData = typeof typedPublicProfile.media_kit_data === 'string' 
        ? JSON.parse(typedPublicProfile.media_kit_data) 
        : typedPublicProfile.media_kit_data;
      console.log("MEDIAKIT: Colors in public profile:", mediaKitData?.colors);
    }
  }, [isPublic, publicProfile]);

  // Simplified fetch profile function
  const fetchProfile = useCallback(async () => {
    // Prevent duplicate fetches
    if (hasFetched && !isPreview && !isPublic) {
      console.log("MediaKit: Skipping duplicate fetch");
      return;
    }

    console.log("MediaKit: fetchProfile called", {
      isPreview, isPublic, userId: user?.id, paramId: routeIdFromParams, previewUsernameProvided: !!previewUsername
    });

    // ✅ Only skip real "public" page renders
    if (isPublic) return;

    // Check user existence - Just return if no ID yet, don't set error here
    // For preview mode, previewUsername is the key. For standard, user.id or routeIdFromParams.
    if (!isPreview && !user?.id && !routeIdFromParams) {
      console.log("MediaKit fetchProfile: (standard mode) still waiting on user.id or route id");
      return;
    }
    if (isPreview && !previewUsername) {
      console.log("MediaKit fetchProfile: (preview mode) no previewUsername provided.");
      // Potentially set error or loading false if this is a permanent state
      setError("Preview username not available for fetching.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true); // Set loading true when fetch actually starts
      setError(null);   // Clear any previous error
      
      // Mark that we've attempted a fetch
      setHasFetched(true);

      // Clear potentially stale localStorage data before fetching fresh data
      // unless we are in preview/public mode where we don't fetch (already handled by isPublic guard)
      // if (!isPreview && !isPublic) { // This condition is effectively !isPublic now
      if (!isPublic) { // Only clear if not in public mode. Previews will clear.
        console.log("MediaKit: Clearing localStorage before fetch (not public mode)");
        localStorage.removeItem('updatedMediaKit');
        localStorage.removeItem('mediaKitCustomStyles');
      }

      // use previewUsername when in preview mode
      const profileId = isPreview
        ? previewUsername           // ← your Dashboard passed this in
        : (routeIdFromParams || user?.id);
      
      console.log("MediaKit: Fetching profile data for effective ID:", profileId, " (isPreview:", isPreview, ")");
      
      if (!profileId) {
        console.error("MediaKit: No effective profile ID found (profileId is undefined/null)");
        setError("Profile identifier not found or incomplete");
        setLoading(false);
        return;
      }
      
      // Fetch profile data first
      // When isPreview is true, profileId is previewUsername, so we query by 'username'
      // When isPreview is false, profileId is routeIdFromParams (username) or user.id (uuid)
      const queryTargetColumn = isPreview ? 'username' : (routeIdFromParams ? 'username' : 'id');

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq(queryTargetColumn, profileId) // Use queryTargetColumn
        .single();

      if (profileError) {
        console.error("MediaKit: Profile fetch error:", profileError);
        setError(profileError.message || "Failed to fetch profile data");
        setLoading(false);
        return;
      }
      
      if (!profileData) {
        console.error("MediaKit: No profile data found");
        setError("Profile not found or incomplete");
        setLoading(false);
        return;
      }

      // Log raw profile data from Supabase to check if media_kit_url exists
      console.log("MediaKit: Profile data fetched successfully:", profileData.id);

      // Fetch related data in parallel
      const [statsResult, collabsResult, servicesResult, videosResult] = await Promise.all([
        supabase.from('media_kit_stats').select('*').eq('profile_id', profileId),
        supabase.from('brand_collaborations').select('*').eq('profile_id', profileId),
        supabase.from('services').select('*').eq('profile_id', profileId),
        supabase.from('media_kit_videos').select('url, thumbnail_url').eq('profile_id', profileId)
      ]);
      
      const statsData = statsResult.data || [];
      const collabsData = collabsResult.data || [];
      const servicesData = servicesResult.data || [];
      const videosData = videosResult.data || [];
      
      // Extract Instagram stats if available
      const instagramStats = statsData.find(s => s.platform === 'instagram') || {
        follower_count: 0,
        engagement_rate: 0,
        avg_likes: 0,
        weekly_reach: 0
      };
      
      // Handle media kit data parsing
      let mediaKitData: {
        type: "media_kit_data";
        brand_name: string;
        tagline: string;
        colors: ColorScheme;
        font: string;
        selected_template_id?: string;
        skills?: string[];
        contact_email?: string;
        videos?: VideoItem[];
        portfolio_images?: string[];
        personal_intro?: string;
        instagram_handle?: string;
        tiktok_handle?: string;
      } | null = null;
      let templateId = 'default';
      let skills: string[] = [];
      try {
        // Parse first, then assign to the typed variable
        const rawMediaKitData = typeof profileData.media_kit_data === 'string'
          ? JSON.parse(profileData.media_kit_data)
          : profileData.media_kit_data;
        
        // Use a temporary variable for the potentially incomplete parsed data
        const parsedJson = rawMediaKitData || {};

        // Construct the object ensuring all required fields have defaults
        mediaKitData = {
          type: "media_kit_data", 
          brand_name: parsedJson?.brand_name || profileData.brand_name || '', 
          tagline: parsedJson?.tagline || profileData.tagline || '', 
          colors: parsedJson?.colors || { primary: '#7E69AB', secondary: '#6E59A5', accent: '#1A1F2C', background: '#F5F5F5', text: '#1A1F2C', accent_light: '#E5DAF8', font: 'Inter' }, 
          font: parsedJson?.font || 'Inter', 
          // Spread the rest of the parsed data
          ...parsedJson,
        }; // Assert type after providing defaults
        
        // Now assign the correctly typed object back
        profileData.media_kit_data = mediaKitData;

        // Get template ID from mediaKitData - default to 'default' if not present
        templateId = mediaKitData?.selected_template_id || 'default'; 
        
        // Set activeTemplateId state to ensure it's the source of truth
        console.log("MediaKit: Setting activeTemplateId from fetched data:", templateId);
        setActiveTemplateId(templateId);
        console.log("MediaKit: Loaded template ID:", templateId);

        skills = mediaKitData?.skills || [];
        
        // Attach videos to media_kit_data
        if (typeof profileData.media_kit_data === 'string') {
          profileData.media_kit_data = mediaKitData;
        }
        mediaKitData.videos = videosData;
        profileData.media_kit_data = mediaKitData;
        
        // Check for custom styles in localStorage first
        const savedCustomStyles = localStorage.getItem('mediaKitCustomStyles');
        
        if (savedCustomStyles) {
          // If we have custom styles saved, prioritize those over database values
          console.log("MediaKit: Using custom styles from localStorage instead of database");
          
          // Don't set styles here, they're already loaded in a separate useEffect
        }
        // Only apply database colors if no custom styles exist
        else if (mediaKitData?.colors) {
          console.log("MediaKit: No custom styles found, using database colors");
          
          const primaryColor = mediaKitData.colors.primary || '#7E69AB';
          let primary, primaryLight;
          if (primaryColor.toLowerCase() === '#7e69ab') {
            primary = '#7E69AB';
            primaryLight = '#E5DAF8';
          } else {
            primary = primaryColor;
            primaryLight = primaryColor;
          }
          setStyles(prev => ({
            ...prev,
            background: '#F5F5F5',
            foreground: mediaKitData.colors.accent || '#1A1F2C',
            primary: primary,
            primaryLight: primaryLight,
            secondary: mediaKitData.colors.secondary || '#6E59A5',
            neutral: '#8E9196',
            border: `${mediaKitData.colors.primary || '#7E69AB'}33`,
            font: mediaKitData.colors.font || 'Inter',
          }));
        }
      } catch (error) {
        console.error('MediaKit: Error parsing media kit data:', error);
        // Continue anyway with default values
      }
      
      // Create the complete profile
      const completeProfile: ProfileData = {
        ...profileData,
        skills,
        follower_count: instagramStats.follower_count || 0,
        engagement_rate: instagramStats.engagement_rate || 0,
        avg_likes: instagramStats.avg_likes || 0,
        reach: instagramStats.weekly_reach || 0,
        services: servicesData,
        brand_collaborations: collabsData,
        portfolio_images: [],
        profile_photo: profileData.avatar_url || '',
        media_kit_url: profileData.media_kit_url || '',
        contact_email: mediaKitData?.contact_email || profileData.contact_email || profileData.email || '',
        media_kit_data: mediaKitData,
        selected_template_id: templateId,
      };

      console.log("MediaKit: Setting complete profile");
      setProfile(completeProfile);
      // Re-apply theme based on the fetched data AFTER setting profile
      setStyles(computeStylesFromProfile(completeProfile)); 
      setLoading(false);
    } catch (error) {
      console.error('MediaKit: Fatal error in profile fetching:', error);
      setError('Failed to load media kit');
      setLoading(false);
    }
  }, [routeIdFromParams, user?.id, isPreview, isPublic, hasFetched, previewUsername]);

  // Simplified initial data load effect
  useEffect(() => {
    // (no skips here—let preview call fetchProfile)

    // Simple one-time fetch on component mount
    // Ensure fetchProfile is called if we have any valid identifier for any mode
    if (!hasFetched && (previewUsername || user?.id || routeIdFromParams)) {
      console.log("MediaKit: Initial data fetch triggered by useEffect", { hasFetched, previewUsernameProvided: !!previewUsername, userIdProvided: !!user?.id, routeIdFromParamsProvided: !!routeIdFromParams });
      fetchProfile();
    }
  }, [fetchProfile, hasFetched, previewUsername, user?.id, routeIdFromParams]); // Added previewUsername to deps
  
  // Add explicit effect to set activeTemplateId from preview/public data
  useEffect(() => {
    if (isPreview && previewData) {
      // Get template ID from previewData
      const previewDataObj = previewData as ProfileData | null;
      const mediaKitObject = previewDataObj && typeof previewDataObj.media_kit_data === 'object' ? previewDataObj.media_kit_data : null;
      const templateId = 
        (mediaKitObject?.selected_template_id) ||
        previewDataObj?.selected_template_id ||
        'default';
      
      console.log("MediaKit: Setting template from previewData:", templateId);
      setActiveTemplateId(templateId);
    } 
    else if (isPublic && publicProfile) {
      // Get template ID from publicProfile
      const publicProfileObj = publicProfile as ProfileData | null;
      const mediaKitObject = publicProfileObj && typeof publicProfileObj.media_kit_data === 'object' ? publicProfileObj.media_kit_data : null;

      const templateId = 
        (mediaKitObject?.selected_template_id) ||
        publicProfileObj?.selected_template_id ||
        'default';
      
      console.log("MediaKit: Setting template from publicProfile:", templateId);
      setActiveTemplateId(templateId);
    }
  }, [isPreview, previewData, isPublic, publicProfile]);

  // Simple handler for navigation back from editor  
  useEffect(() => {
    const handlePopState = () => {
      // Clear hasFetched flag when navigating back to allow a fresh fetch
      if (window.location.pathname === '/media-kit') {
        console.log("MediaKit: Navigation detected back to media kit");
        
        // Check for state from navigation
        const state = window.history.state?.usr;
        
        // Only proceed if we have navigation state
        if (state?.updatedMediaKit) {
          console.log("MediaKit: Found updatedMediaKit in navigation state:", state.updatedMediaKit);
          
          // Check and update template selection if it was changed
          // Look for template ID in media_kit_data, which is where it's actually stored
          const newTemplateId = state.updatedMediaKit.media_kit_data?.selected_template_id;
          if (newTemplateId) {
            console.log("MediaKit: Updating template selection to:", newTemplateId);
            setActiveTemplateId(newTemplateId);
            
            // Save the updated template ID to localStorage for persistence
            try {
              const storedData = localStorage.getItem('updatedMediaKit');
              if (storedData) {
                const parsedData = JSON.parse(storedData);
                parsedData.selected_template_id = newTemplateId;
                localStorage.setItem('updatedMediaKit', JSON.stringify(parsedData));
                console.log("MediaKit: Saved updated template ID to localStorage");
              } else {
                // If no updatedMediaKit exists yet, create one with the template ID
                localStorage.setItem('updatedMediaKit', JSON.stringify({
                  selected_template_id: newTemplateId
                }));
              }
            } catch (e) {
              console.error("MediaKit: Error saving template ID to localStorage:", e);
            }
          }
          
          // Handle colors as before
          if (state.updatedMediaKit.colors) {
            console.log("MediaKit: Found updatedMediaKit.colors in navigation state");
            
            // Create and save new styles
            const newStyles = {
              background: state.updatedMediaKit.colors.background || '#F5F5F5',
              foreground: state.updatedMediaKit.colors.text || '#1A1F2C',
              primary: state.updatedMediaKit.colors.accent || '#7E69AB',
              primaryLight: state.updatedMediaKit.colors.accent_light || '#E5DAF8',
              secondary: state.updatedMediaKit.colors.secondary || '#6E59A5',
              accent: state.updatedMediaKit.colors.text || '#1A1F2C',
              neutral: state.updatedMediaKit.colors.secondary || '#8E9196',
              border: `${state.updatedMediaKit.colors.accent || '#7E69AB'}33`,
              font: state.updatedMediaKit.colors.font || 'Inter',
            };
            
            // Save to localStorage for persistence
            localStorage.setItem('mediaKitCustomStyles', JSON.stringify(newStyles));
            
            // Update styles
            setStyles(newStyles);
          }
          
          setHasFetched(false);
          fetchProfile();
        }
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [fetchProfile]);

  // Add a timeout mechanism to prevent infinite loading
  useEffect(() => {
    if (loading) {
      console.log("MediaKit: Loading timeout started");
      const timeoutId = setTimeout(() => {
        console.log("MediaKit: Loading timeout reached (6s)");
        setLoading(false);
      }, 6000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [loading]);

  function processPreviewData(data: unknown) {
    try {
      const pData = data as ProfileData;
      let mKitDataObj: Partial<Extract<ProfileData['media_kit_data'], object>> = {}; // Default to empty object
      if (typeof pData.media_kit_data === 'string') {
        try { 
          const parsed = JSON.parse(pData.media_kit_data);
          if (typeof parsed === 'object' && parsed !== null) mKitDataObj = parsed;
        } catch { /* ignore parse error, use empty object */ }
      } else if (typeof pData.media_kit_data === 'object' && pData.media_kit_data !== null) {
        mKitDataObj = pData.media_kit_data;
      }
      
      const currentPrevColors = mKitDataObj.colors || defaultColorScheme;
      const mediaKitDataForStyles = { ...mKitDataObj, colors: currentPrevColors, type: "media_kit_data" as const, brand_name: mKitDataObj.brand_name || '', tagline: mKitDataObj.tagline || '', font: mKitDataObj.font || 'Inter' }; 
      const finalPrevStyles = computeStylesFromProfile({ ...pData, media_kit_data: mediaKitDataForStyles } as ProfileData);
      
      const videosL = pData.videos || mKitDataObj.videos || [];
      const portfolioL = mKitDataObj.portfolio_images || pData.portfolio_images || [];

      const processedP: ProfileData = {
        ...pData,
        videos: videosL,
        portfolio_images: portfolioL,
        media_kit_data: { 
            type: "media_kit_data" as const,
            brand_name: mKitDataObj.brand_name || pData.brand_name || '',
            tagline: mKitDataObj.tagline || pData.tagline || '',
            colors: currentPrevColors,
            font: mKitDataObj.font || 'Inter',
            selected_template_id: mKitDataObj.selected_template_id || pData.selected_template_id || 'default',
            skills: mKitDataObj.skills || pData.skills || [],
            contact_email: mKitDataObj.contact_email || pData.contact_email || pData.email || '',
            videos: videosL,
            portfolio_images: portfolioL,
            personal_intro: mKitDataObj.personal_intro || pData.personal_intro || '',
            instagram_handle: mKitDataObj.instagram_handle || pData.instagram_handle || '',
            tiktok_handle: mKitDataObj.tiktok_handle || pData.tiktok_handle || '',
            section_visibility: { ...defaultSectionVisibility, ...(mKitDataObj.section_visibility || {}) },
        },
        tagline: mKitDataObj.tagline || pData.tagline || '',
        skills: mKitDataObj.skills || pData.skills || [],
        selected_template_id: mKitDataObj.selected_template_id || pData.selected_template_id || 'default'
      };
      setProfile(processedP);
      setActiveTemplateId(processedP.selected_template_id || 'default');
      setLoading(false);
    } catch (err: unknown) { 
      if (err instanceof Error) {
        setError('Failed to process preview data: ' + err.message); 
      } else {
        setError('Failed to process preview data');
      }
      setLoading(false); 
    }
  }

  // Add useEffect for logging - moved before early returns
  useEffect(() => {
    if (profile) {
      // Log profile data for debugging
      console.log("Brand collaborations:", profile.brand_collaborations);
      console.log("Services:", profile.services);
    }
  }, [profile]);

  // Better debug for preview data specifically
  useEffect(() => {
    if (isPreview && previewData) {
      console.log("MediaKit Preview: Received new preview data:", {
        full_name: (previewData as ProfileData)?.full_name,
        tagline: (previewData as ProfileData)?.tagline,
        personal_intro: (previewData as ProfileData)?.personal_intro
      });
    }
  }, [isPreview, previewData]);

  // >>>>>>> CENTRALIZED THEME LOGIC useEffect <<<<<<<<<
  useEffect(() => {
    if (!profile) {
      return;
    }

    let rawColors: ColorScheme | undefined | null = null;
    
    const profileMediaKitData = typeof profile.media_kit_data === 'string' 
        ? JSON.parse(profile.media_kit_data) as MediaKitData 
        : profile.media_kit_data as MediaKitData | null;

    const kitDataObject = typeof kitData === 'string' 
        ? JSON.parse(kitData) as MediaKitData 
        : kitData as MediaKitData | null;

    // Determine rawColors for theme (background, text, accents etc.)
    if (profile.colors) { // profile.colors is ColorScheme from local ProfileData type
        rawColors = profile.colors;
    } else if (kitDataObject?.colors) {
        rawColors = { ...defaultColorScheme, ...kitDataObject.colors } as ColorScheme;
    } else if (profileMediaKitData?.colors) {
        rawColors = { ...defaultColorScheme, ...profileMediaKitData.colors } as ColorScheme;
    }
    
    const cs = rawColors || defaultColorScheme;

    // Determine finalFont with clearer priority
    const kitDataTopLevelFont = kitDataObject?.font;
    const kitDataColorsFont = (kitDataObject?.colors as ColorScheme | undefined)?.font; // Use local ColorScheme for cast
    // The 'profile.colors.font' could be considered too, but ProfileData's top-level 'colors' is not from DB Profile.
    // Sticking to kitData which is from media_kit_data (DB or local) or preview makes more sense for font.

    const finalFont = kitDataTopLevelFont ||         // Priority 1: kitData.font (media_kit_data.font or local/preview override)
                      kitDataColorsFont ||           // Priority 2: kitData.colors.font (media_kit_data.colors.font or local/preview override)
                      defaultColorScheme.font;     // Priority 3: Default font

    const mapped: TemplateTheme = {
      background:   cs.background,
      foreground:   cs.text,
      primary:      cs.accent,        // User instruction: use accent for primary color slot
      primaryLight: cs.accent_light,  
      secondary:    cs.secondary,    
      accent:       cs.accent,        // Actual accent color from scheme (same as primary due to above)
      neutral:      cs.secondary,     // User instruction: use cs.secondary for neutral slot
      border:       `${cs.accent}33`,   // Border based on accent (which is primary)
      font:         finalFont 
    };

    setStyles(mapped);

    localStorage.setItem(
      'mediaKitCustomStyles',
      JSON.stringify(mapped)
    );
  }, [profile, kitData]);

  // Ensure realData is declared only once
  const realData: EditorPreviewData = useMemo(() => {
    let baseProf: ProfileData | null | unknown = null;
    if (isPreview) baseProf = previewData || profile;
    else if (isPublic) baseProf = publicProfile || profile;
    else baseProf = localUpdatedMediaKit || profile;

    const p = baseProf as ProfileData | null;
    if (!p) {
      // Return a minimal EditorPreviewData structure
      return { 
        id: '', user_id: '', username: '', full_name: 'Media Kit', email: '', 
        media_kit_data: {type:"media_kit_data", brand_name:"", tagline:"", colors:defaultColorScheme, font:"Inter", section_visibility: defaultSectionVisibility}, 
        services: [], brand_collaborations: [], portfolio_images: [], videos: [], media_kit_stats: [],
        section_visibility: defaultSectionVisibility,
        avatar_url: '',
        website: '',
        niche: '',
        media_kit_url: '',
        onboarding_complete: false,
        brand_name: '',
        tagline: '',
        colors: defaultColorScheme,
        font: 'Inter',
        personal_intro: '',
        skills: [],
        instagram_handle: '',
        tiktok_handle: '',
        youtube_handle: '',
        contact_email: '',
        profile_photo: '',
        selected_template_id: 'default',
        follower_count: 0,
        engagement_rate: 0,
        avg_likes: 0,
        reach: 0,
        stats: [],
        // Luxury specific defaults for the empty return
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
      } as EditorPreviewData;
    }

    // Parse the media_kit_data JSON
    let mKitObjParsed: Partial<MediaKitData> = {};
    if (typeof p.media_kit_data === 'string') {
      try { 
        const parsed = JSON.parse(p.media_kit_data);
        if (typeof parsed === 'object' && parsed !== null) {
            mKitObjParsed = parsed;
        }
      } catch (e) { 
        console.error("Failed to parse media_kit_data from p.media_kit_data (string)", e); 
      }
    } else if (typeof p.media_kit_data === 'object' && p.media_kit_data !== null) {
      mKitObjParsed = p.media_kit_data;
    }
    
    const finalVideos = p.videos || mKitObjParsed.videos || [];
    const finalPortfolioImages = mKitObjParsed.portfolio_images || p.portfolio_images || [];
    const finalStats = fetchedStats || mKitObjParsed.stats || p.media_kit_stats || [];
    const finalServices = p.services || mKitObjParsed.services || fetchedServices || [];
    const finalBrandCollaborations = p.brand_collaborations || mKitObjParsed.brand_collaborations || fetchedCollabs || [];


    const result: EditorPreviewData = {
        // Start with base profile fields (p)
        id: p.id || '',
        user_id: p.user_id || '',
        username: p.username || '',
        full_name: p.full_name || '',
        email: p.email || '',
        avatar_url: p.avatar_url || '',
        profile_photo: p.avatar_url || '', // Use avatar_url as fallback for profile_photo
        niche: p.niche || '',
        media_kit_url: p.media_kit_url || '',
        onboarding_complete: p.onboarding_complete ?? false,
        
        // Fields potentially overridden or supplemented by mKitObjParsed or top-level p
        brand_name: String(mKitObjParsed.brand_name || p.brand_name || p.full_name || 'Creator Name'),
        tagline: String(mKitObjParsed.tagline || p.tagline || ''),
        personal_intro: String(mKitObjParsed.personal_intro || p.personal_intro || ''),
        contact_email: String(mKitObjParsed.contact_email || p.contact_email || p.email || ''),
        
        colors: mKitObjParsed.colors || p.colors || defaultColorScheme,
        font: String(mKitObjParsed.font || (mKitObjParsed.colors as ColorScheme)?.font || defaultColorScheme.font),
        
        skills: mKitObjParsed.skills || p.skills || [],
        instagram_handle: String(mKitObjParsed.instagram_handle || p.instagram_handle || ''),
        tiktok_handle: String(mKitObjParsed.tiktok_handle || p.tiktok_handle || ''),
        youtube_handle: String(mKitObjParsed.youtube_handle || (p as EditorPreviewData).youtube_handle || ''),
        selected_template_id: String(mKitObjParsed.selected_template_id || p.selected_template_id || 'default'),

        // Aggregated/Fetched data
        videos: finalVideos,
        portfolio_images: finalPortfolioImages,
        stats: finalStats, 
        services: finalServices,
        brand_collaborations: finalBrandCollaborations,

        // Top-level stats from 'p' (often from form state or older structure)
        // These act as fallbacks if not in mKitObjParsed or mKitObjParsed.stats
        follower_count: Number(p.follower_count || 0),
        engagement_rate: Number(p.engagement_rate || 0),
        avg_likes: Number(p.avg_likes || 0),
        reach: Number(p.reach || 0),

        // Luxury & specific fields primarily from mKitObjParsed
        // These are defined in EditorPreviewData and MediaKitData types
        website: String(mKitObjParsed.website || p.website || ''), // p.website as fallback
        contact_phone: String(mKitObjParsed.contact_phone || ''),
        
        past_brands_text: String(mKitObjParsed.past_brands_text || ''),
        past_brands_image_url: String(mKitObjParsed.past_brands_image_url || ''),
        next_steps_text: String(mKitObjParsed.next_steps_text || ''),
        showcase_images: mKitObjParsed.showcase_images || [],

        audience_age_range: String(mKitObjParsed.audience_age_range || ''),
        audience_location_main: String(mKitObjParsed.audience_location_main || ''),
        audience_gender_female: String(mKitObjParsed.audience_gender_female || ''),

        // Platform-specific metrics, now expected at top-level of EditorPreviewData
        // Sourced from mKitObjParsed (where editor saves them)
        instagram_followers: Number(mKitObjParsed.instagram_followers || 0),
        tiktok_followers: Number(mKitObjParsed.tiktok_followers || 0),
        youtube_followers: Number(mKitObjParsed.youtube_followers || 0),
        avg_video_views: Number(mKitObjParsed.avg_video_views || 0),
        avg_ig_reach: Number(mKitObjParsed.avg_ig_reach || 0),
        ig_engagement_rate: Number(mKitObjParsed.ig_engagement_rate || 0),

        section_visibility: {
            ...defaultSectionVisibility,
            ...(mKitObjParsed.section_visibility || {}),
            ...(p.section_visibility || {}),
        },
        
        // The raw media_kit_data object itself
        // Ensure MediaKitData is attached if it exists (even if partial)
        media_kit_data: mKitObjParsed && Object.keys(mKitObjParsed).length > 0 ? mKitObjParsed as MediaKitData : null,

    };
    // console.log("MediaKit.tsx: final realData for template:", JSON.stringify(result, null, 2));
    return result;

  }, [isPreview, previewData, publicProfile, localUpdatedMediaKit, profile, fetchedStats, fetchedCollabs, fetchedServices]);
  
  // Debug log for public profile data flow
  if (isPublic) {
    const publicProfileData = publicProfile as ProfileData | null;
    const publicMediaKitObject = publicProfileData && typeof publicProfileData.media_kit_data === 'object' ? publicProfileData.media_kit_data : null;
    console.log("REAL DATA CONSTRUCTION (PUBLIC MODE):", {
      publicProfileType: typeof publicProfile,
      publicProfileHasVideos: !!publicProfileData?.videos?.length,
      publicProfileVideosType: typeof publicProfileData?.videos,
      publicProfileHasMediaKitVideos: !!publicMediaKitObject?.videos?.length,
      processedProfileHasVideos: !!profile?.videos?.length,
      finalRealDataHasVideos: !!realData.videos?.length,
      realDataVideosType: typeof realData.videos,
      computedVideosValue: (publicProfileData?.videos?.length || 0) > 0
        ? "Using publicProfile.videos"
        : (publicMediaKitObject?.videos?.length || 0) > 0
          ? "Using publicProfile.media_kit_data.videos"
          : "Using empty array fallback"
    });
  }
  
  // Debug videos data structure
  console.log("MediaKit DEBUG videos:", {
    isPublic,
    topLevelVideos: realData.videos,
    mediaKitVideos: typeof realData.media_kit_data === 'object' ? realData.media_kit_data?.videos : undefined,
    videosLength: realData.videos?.length,
    mediaKitVideosLength: typeof realData.media_kit_data === 'object' ? realData.media_kit_data?.videos?.length : undefined,
    publicProfileType: isPublic ? typeof publicProfile : null,
    publicProfileHasVideos: isPublic ? !!(publicProfile as ProfileData | null)?.videos?.length : null,
    publicProfileHasMediaKitVideos: isPublic 
      ? (
        (() => {
          const pp = publicProfile as ProfileData | null;
          const mkObj = pp && typeof pp.media_kit_data === 'object' ? pp.media_kit_data : null;
          return !!mkObj?.videos?.length;
        })()
      ) 
      : null
  });

  // Log the realData tagline value 
  console.log("MediaKit received data:", {
    isPreview,
    isPublic,
    hasTagline: 'tagline' in realData,
    tagline: realData.tagline,
    taglineType: typeof realData.tagline
  });

  // Debug the updatedMediaKit data from localStorage and state
  console.log("MediaKit: UpdatedMediaKit Sources:", {
    fromState: updatedMediaKitFromState ? {
      selected_template_id: updatedMediaKitFromState.selected_template_id,
      hasTemplateId: !!updatedMediaKitFromState.selected_template_id
    } : 'none',
    fromLocalStorage: localUpdatedMediaKit ? {
      selected_template_id: localUpdatedMediaKit.selected_template_id,
      hasTemplateId: !!localUpdatedMediaKit.selected_template_id
    } : 'none'
  });

  // Add fallbacks for essential properties to prevent errors
  if (!realData.full_name) realData.full_name = 'Media Kit';
  if (!realData.email) realData.email = ''; // Add fallback for email
  if (!realData.username) realData.username = ''; // Add fallback for username
  
  // Only add fallback for non-preview mode
  // Preview mode should show exactly what's passed in
  if (!isPreview && !realData.tagline) realData.tagline = 'Content Creator';
  
  if (!realData.services) realData.services = [];
  if (!realData.brand_collaborations) realData.brand_collaborations = [];
  if (!realData.portfolio_images) realData.portfolio_images = ['https://placehold.co/600x400','https://placehold.co/600x400','https://placehold.co/600x400'];
  if (!realData.selected_template_id) realData.selected_template_id = 'default';

  console.log("MediaKit: Final realData:", {
    hasData: !!realData,
    id: realData?.id,
    name: realData?.full_name,
    email: realData?.email,
    hasServices: Array.isArray(realData?.services),
    serviceCount: Array.isArray(realData?.services) ? realData.services.length : 'N/A',
    selected_template_id: realData.selected_template_id
  });

  const handleEdit = () => {
    console.log("Edit button clicked - contact_email state:", realData.contact_email);
    navigate('/media-kit/edit');
  };

  const handleDownload = async () => {
    // TODO: Implement download functionality
    console.log('Download media kit');
  };

  const handleViewPublic = () => {
    let path;
    if (profile?.media_kit_url) {
      path = profile.media_kit_url.startsWith('/') ? profile.media_kit_url : `/${profile.media_kit_url}`;
    } else if (profile?.username) {
      path = `/${profile.username}`;
    } else {
      console.warn("Cannot view public page: media_kit_url or username not available on profile.");
      alert("Media kit URL or username not available. Please ensure your profile is set up correctly.")
      return;
    }
    // Open in a new tab
    window.open(path, '_blank', 'noopener,noreferrer');
  };

  // Add function to initialize media kit data
  const initializeMediaKitData = useCallback(async () => {
    if (hasFetched && !(isPreview && !profile)) { setLoading(false); return; }
    setLoading(true); setError(null); setHasFetched(true);

    if (isPreview && previewData) { processPreviewData(previewData); return; }
    if (isPublic && publicProfile) {
        const profileDataToSet = publicProfile as ProfileData;
        setProfile(profileDataToSet);
        const templateId = (typeof profileDataToSet.media_kit_data === 'object' && profileDataToSet.media_kit_data?.selected_template_id) || profileDataToSet.selected_template_id || 'default';
        setActiveTemplateId(templateId);
        setStyles(computeStylesFromProfile(profileDataToSet));
        setLoading(false);
        return;
    }

    const targetId = isPreview ? previewUsername : (routeIdFromParams || user?.id);
    const queryColumn = isPreview ? 'username' : (routeIdFromParams ? 'username' : 'id');
    if (!targetId) { setError('Profile identifier not found.'); setLoading(false); return; }

    try {
      const { data: fetchedProfileData, error: supabaseError } = await supabase
        .from('profiles')
        .select(`*, media_kit_stats(*), brand_collaborations(*), services(*), media_kit_videos(url, thumbnail_url)`)
        .eq(queryColumn, targetId)
        .single();

      if (supabaseError) throw supabaseError;
      if (!fetchedProfileData) throw new Error('Profile not found.');

      let parsedMediaKitObject: Partial<Extract<ProfileData['media_kit_data'], object>> = {};
      if (typeof fetchedProfileData.media_kit_data === 'string') {
        try { 
          const parsed = JSON.parse(fetchedProfileData.media_kit_data);
          if (typeof parsed === 'object' && parsed !== null) parsedMediaKitObject = parsed;
        } catch { /* ignore parse error, use empty object */ }
      } else if (typeof fetchedProfileData.media_kit_data === 'object' && fetchedProfileData.media_kit_data !== null) {
        parsedMediaKitObject = fetchedProfileData.media_kit_data;
      }
      
      const joinedVideos: VideoItem[] = (fetchedProfileData.media_kit_videos as VideoItem[]) || [];
      const joinedServices: Service[] = (fetchedProfileData.services as Service[]) || [];
      const joinedCollabs: BrandCollaboration[] = (fetchedProfileData.brand_collaborations as BrandCollaboration[]) || [];
      const joinedStats: MediaKitStats[] = (fetchedProfileData.media_kit_stats as MediaKitStats[]) || [];

      const completeProfile: ProfileData = {
        ...(fetchedProfileData as Omit<ProfileData, 'media_kit_data' | 'videos' | 'services' | 'brand_collaborations'>), 
        id: fetchedProfileData.id || '',
        user_id: fetchedProfileData.user_id || '',
        username: fetchedProfileData.username || '',
        full_name: fetchedProfileData.full_name || parsedMediaKitObject?.brand_name || '',
        email: fetchedProfileData.email || '',
        media_kit_data: { 
          type: "media_kit_data" as const,
          brand_name: parsedMediaKitObject?.brand_name || fetchedProfileData.brand_name || '',
          tagline: parsedMediaKitObject?.tagline || fetchedProfileData.tagline || '',
          colors: parsedMediaKitObject?.colors || defaultColorScheme,
          font: parsedMediaKitObject?.font || 'Inter',
          selected_template_id: parsedMediaKitObject?.selected_template_id || fetchedProfileData.selected_template_id || 'default',
          skills: parsedMediaKitObject?.skills || fetchedProfileData.skills || [],
          contact_email: parsedMediaKitObject?.contact_email || fetchedProfileData.contact_email || fetchedProfileData.email || '',
          videos: joinedVideos, 
          portfolio_images: parsedMediaKitObject?.portfolio_images || fetchedProfileData.portfolio_images || [],
          personal_intro: parsedMediaKitObject?.personal_intro || fetchedProfileData.personal_intro || '',
          instagram_handle: parsedMediaKitObject?.instagram_handle || fetchedProfileData.instagram_handle || '',
          tiktok_handle: parsedMediaKitObject?.tiktok_handle || fetchedProfileData.tiktok_handle || '',
          section_visibility: { ...defaultSectionVisibility, ...(parsedMediaKitObject?.section_visibility || {}) },
        },
        services: joinedServices,
        brand_collaborations: joinedCollabs,
        videos: joinedVideos, 
        follower_count: joinedStats.find(s => s.platform === 'instagram')?.follower_count || 0,
        engagement_rate: joinedStats.find(s => s.platform === 'instagram')?.engagement_rate || 0,
        avg_likes: joinedStats.find(s => s.platform === 'instagram')?.avg_likes || 0,
        reach: joinedStats.find(s => s.platform === 'instagram')?.weekly_reach || 0,
        selected_template_id: parsedMediaKitObject?.selected_template_id || fetchedProfileData.selected_template_id || 'default',
        tagline: parsedMediaKitObject?.tagline || fetchedProfileData.tagline || '',
      };
      if (!completeProfile.full_name && (typeof completeProfile.media_kit_data === 'object' && completeProfile.media_kit_data.brand_name)) {
        completeProfile.full_name = completeProfile.media_kit_data.brand_name;
      }
      
      setProfile(completeProfile);
      setActiveTemplateId(parsedMediaKitObject?.selected_template_id || fetchedProfileData.selected_template_id || 'default');
      setLoading(false);
    } catch (e: unknown) { 
      if (e instanceof Error) {
        setError(e.message || 'Failed to load media kit data.');
      } else {
        setError('Failed to load media kit data.');
      }
      setLoading(false); 
    }
  }, [ routeIdFromParams, user?.id, isPreview, isPublic, hasFetched, previewUsername, previewData, publicProfile, setActiveTemplateId, setProfile, setLoading, setError, setHasFetched ]);

  useEffect(() => {
    if (!hasFetched && (previewUsername || user?.id || routeIdFromParams || (isPublic && publicProfile) || (isPreview && previewData) )) {
      initializeMediaKitData();
    }
  }, [initializeMediaKitData, hasFetched, previewUsername, user?.id, routeIdFromParams, isPublic, publicProfile, isPreview, previewData]);
  
  // Add this console log just before the return statement to see the theme values
  console.log("MediaKit Theme:", computedStyles);
  console.log("MediaKit kitData:", kitData);
  console.log("MediaKit Raw Profile:", {
    ...profile,
    id: profile?.id,
    username: profile?.username,
    media_kit_url: profile?.media_kit_url
  });
  console.log("MediaKit Display Profile:", {
    ...realData,
    id: realData?.id,
    username: realData?.username,
    media_kit_url: realData?.media_kit_url
  });
  console.log("MediaKit Username Debug:", { 
    profileUsername: profile?.username,
    profileMediaKitUrl: profile?.media_kit_url,
    displayProfileUsername: realData?.username,
    displayProfileMediaKitUrl: realData?.media_kit_url,
    profileDataLoaded: !!profile, 
    isLoading: loading,
    dataSource: isPreview ? 'preview' : isPublic ? 'public' : localUpdatedMediaKit ? 'local' : 'database'
  });

  // User suggested console logs for button visibility debugging
  if (user && profile) {
    console.log("BUTTON VISIBILITY DEBUG:", {
      isPreview,
      isPublic,
      userId: user.id,
      profileId: profile.id,
      profileUserId: profile.user_id,
      conditionMet: !isPreview && !isPublic && user && profile && user.id === profile.id
    });
  } else {
    console.log("BUTTON VISIBILITY DEBUG: User or Profile not yet available for check.", { isPreview, isPublic });
  }
  
  // Add debug logging after kitData is calculated
  console.log("MediaKit DEBUG:", {
    isPreview,
    isPublic,
    hasPreviewData: !!previewData,
    hasPublicProfile: !!publicProfile,
    profile: profile ? 'exists' : 'null',
    loading,
    dataLoading: !!fetchedStats,
    kitData: kitData ? 'exists' : 'null',
    error
  });
  
  // --- Define ActiveTemplateComponent before return ---
  // Add explicit debug logs about template selection
  console.log("MediaKit: TEMPLATE SELECTION:", { 
    activeTemplateId,
    realDataTemplateId: realData.selected_template_id,
    mediaKitDataTemplateId: typeof realData.media_kit_data === 'object' ? realData.media_kit_data.selected_template_id : 'N/A',
    shouldUseAesthetic: activeTemplateId === 'aesthetic'
  });

  // Force a direct check of the template ID from the data source
  // This bypasses all the complex state machinery and just directly uses the ID from the data
  const templateIdFromData = typeof realData.media_kit_data === 'object' ? 
    realData.media_kit_data.selected_template_id : 
    realData.selected_template_id || 'default';
  console.log("DIRECT TEMPLATE ID CHECK:", {
    fromMediaKitData: typeof realData.media_kit_data === 'object' ? 
      realData.media_kit_data.selected_template_id : 'not available',
    fromTopLevel: realData.selected_template_id || 'not available',
    finalValue: templateIdFromData
  });

  // --- NEW LOADING CHECK FOR PREVIEW MODE --- 
  if (isPreview) {
    if (loading || !profile) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-white">
          <PreviewLoadingFallback />
        </div>
      );
    }
  }
  // --- END NEW LOADING CHECK ---

  // If public or preview, render template directly without extra wrappers/backgrounds
  if (isPreview || isPublic) {
    // Find the correct template component
    const currentTemplateId = templateIdFromData; // Already derived correctly
    const TemplateDefinition = TEMPLATES.find(t => t.id === currentTemplateId);

    if (!TemplateDefinition) {
      console.error(`Template with ID '${currentTemplateId}' not found in registry.`);
      return <div>Error: Template not found.</div>; // Or some fallback UI
    }
    const TemplateComponent = TemplateDefinition.Component;
    
    const currentVisibility = realData.section_visibility 
      ? { ...defaultSectionVisibility, ...realData.section_visibility } 
      : defaultSectionVisibility;

    console.log(`Rendering ${TemplateDefinition.name} template directly for public/preview`);
    return <TemplateComponent data={realData} theme={computedStyles} loading={loading} section_visibility={currentVisibility as SectionVisibilityState} />;
  }

  // --- Default rendering for internal view (/media-kit) ---
  // flatData here is derived from the `profile` state object
  const internalTemplateId = templateIdFromData; // Already derived correctly
  const ActiveTemplateDefinition = TEMPLATES.find(t => t.id === internalTemplateId);
  const ActiveTemplateComponent = ActiveTemplateDefinition ? ActiveTemplateDefinition.Component : null;
  const internalVisibility = realData.section_visibility; // Already processed by transformDataForTemplate

  if (loading && !isPreview && !isPublic) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <PreviewLoadingFallback />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white"> {/* Keep white bg for internal page */}
      <main className="p-8"> {/* Keep padding for internal page */}
        <div className="mx-auto" style={{ maxWidth: '1000px' }}>
          {/* Edit/Download/View Public buttons bar - Restored old look from user provided JSX */}
          {!isPreview && !isPublic && user && profile && user.id === profile.id && (
            <div className="mb-6 flex justify-end gap-4"> {/* Adjusted gap from user example if needed */}
              <Button
                variant="outline"
                onClick={handleViewPublic}
                className="flex items-center gap-2"
              >
                <ShareIconOutline className="h-4 w-4" />
                View Public Page
              </Button>
              {/* New Share Button with Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="default" 
                    className="flex items-center gap-2 text-white"
                    style={{ backgroundColor: computedStyles.primary }}
                  >
                    <ShareIcon className="h-4 w-4" />
                    Share
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56"> {/* Added width for better aesthetics */}
                  <DropdownMenuItem className="flex items-center gap-3 py-2 px-3" onSelect={() => console.log('Share to TikTok clicked (no action yet)')}>
                    <TikTokIcon />
                    <span>TikTok</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-3 py-2 px-3" onSelect={() => console.log('Share to Instagram clicked (no action yet)')}>
                    <InstagramIcon />
                    <span>Instagram</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-3 py-2 px-3" onSelect={() => console.log('Share via iMessage clicked (no action yet)')}>
                    <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5" /> {/* Increased icon size slightly */}
                    <span>iMessage</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-3 py-2 px-3" onSelect={() => console.log('Share via Email clicked (no action yet)')}>
                    <EnvelopeIcon className="h-5 w-5" /> {/* Increased icon size slightly */}
                    <span>Email</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                onClick={handleEdit}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white"
              >
                <PencilIcon className="h-4 w-4" />
                Edit Media Kit
              </Button>
            </div>
          )}
          {/* Main Content: Template Component */}
          <div 
            className="template-container"
            style={{
              '--primary': computedStyles.primary,
              '--secondary': computedStyles.secondary,
              '--accent': computedStyles.accent,
              '--accent-light': computedStyles.primaryLight, // map primaryLight to --accent-light
              '--background': computedStyles.background,
              '--foreground': computedStyles.foreground,
              '--border': computedStyles.border,
              '--neutral': computedStyles.neutral,
              '--font-family': computedStyles.font,
            } as React.CSSProperties}
          >
            {ActiveTemplateComponent ? (
              <ActiveTemplateComponent
                data={realData} 
                theme={computedStyles}
                loading={loading}
                section_visibility={internalVisibility as SectionVisibilityState}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white">
                <PreviewLoadingFallback />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
});

// Export the HOC-wrapped memoized component
export default withPreview(MemoizedMediaKitComponent);

// Default theme (this is a fallback if computeStylesFromProfile receives no profileData)
const defaultTheme: TemplateTheme = {
  background: '#F5F5F5',
  foreground: '#1A1F2C',
  primary: '#7E69AB', // Default primary (maps to cs.accent in dynamic themes)
  primaryLight: '#E5DAF8',
  secondary: '#6E59A5',
  accent: '#1A1F2C', 
  neutral: '#8E9196', 
  border: 'rgba(126, 105, 171, 0.2)',
  font: 'Inter', 
};

function computeStylesFromProfile(profileData: ProfileData | EditorPreviewData | null): TemplateTheme {
  if (!profileData) return defaultTheme;

  let cs: ColorScheme = defaultColorScheme;
  let rawFont: string = defaultColorScheme.font || 'Inter'; // Ensure default if font is somehow undefined

  // Check if media_kit_data exists and is an object (typical for ProfileData, possible for EditorPreviewData)
  if ('media_kit_data' in profileData && profileData.media_kit_data && typeof profileData.media_kit_data === 'object') {
    const mkd = profileData.media_kit_data as MediaKitData; // Cast for easier access

    // Prioritize colors from media_kit_data, then top-level profileData.colors
    cs = { ...defaultColorScheme, ...(mkd.colors || ('colors' in profileData && profileData.colors) || {}) };
    
    // Font priority:
    // 1. media_kit_data.font
    // 2. media_kit_data.colors.font
    // 3. top-level profileData.font (if profileData is EditorPreviewData and has it)
    // 4. Fallback to font from the derived color scheme 'cs' (if it has one)
    // 5. Default font
    rawFont = mkd.font || 
              (mkd.colors as ColorScheme)?.font || 
              ('font' in profileData && typeof profileData.font === 'string' && profileData.font) || // Check top-level font
              (cs as ColorScheme)?.font || 
              defaultColorScheme.font || 'Inter';

  } else if ('colors' in profileData && profileData.colors) {
    // This branch handles cases where media_kit_data might not be primary (e.g., a flatter EditorPreviewData)
    // or if profileData is a simple object with colors and possibly font.
    cs = { ...defaultColorScheme, ...(profileData.colors || {}) };
    if ('font' in profileData && typeof profileData.font === 'string' && profileData.font) {
       rawFont = profileData.font;
    } else if ((cs as ColorScheme)?.font) {
       rawFont = (cs as ColorScheme).font!;
    }
  }
  // Ensure cs has all base properties from defaultColorScheme after specific overrides
  cs = { ...defaultColorScheme, ...cs };
  
  // Final check for font if it's still default and cs might have a more specific one
  if ((rawFont === defaultColorScheme.font || rawFont === 'Inter') && (cs as ColorScheme)?.font) {
    rawFont = (cs as ColorScheme).font!;
  }


  return {
    background:   cs.background,
    foreground:   cs.text,
    primary:      cs.accent,
    primaryLight: cs.accent_light,
    secondary:    cs.secondary,
    accent:       cs.accent,
    neutral:      cs.secondary, // As per previous logic, neutral often maps to secondary or another accent
    border:       `${cs.accent}33`,
    font:         rawFont 
  };
}

// Placeholder icons for TikTok and Instagram if specific ones are not in Heroicons
// You can replace these with actual SVGs or different icons if you have them
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919A48.978 48.978 0 0112 2.163zm0 3.805c-3.403 0-6.152 2.749-6.152 6.152s2.75 6.152 6.152 6.152 6.152-2.75 6.152-6.152c0-3.403-2.749-6.152-6.152-6.152zm0 9.995c-2.127 0-3.847-1.72-3.847-3.847s1.72-3.847 3.847-3.847 3.847 1.72 3.847 3.847c0 2.127-1.72 3.847-3.847-3.847zm6.406-9.995c-.616 0-1.114.499-1.114 1.114s.498 1.114 1.114 1.114c.615 0 1.113-.498 1.113-1.113s-.498-1.114-1.113-1.114z" />
  </svg>
);