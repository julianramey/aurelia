import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
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
  BaseTemplateTheme as TemplateThemeType
} from '@/lib/types';
import PreviewLoadingFallback from '@/components/PreviewLoadingFallback';
import {
  ArrowDownTrayIcon,
  PencilIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
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
};

export interface ProfileData {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  email: string;
  contact_email?: string;
  media_kit_data: string | {
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
    section_visibility?: Partial<SectionVisibilityState>;
  };
  media_kit_url?: string;
  tagline?: string;
  personal_intro?: string;
  brand_name?: string;
  colors?: Record<string, string>;
  videos?: Array<{ url: string; thumbnail_url: string }>;
  portfolio_images?: string[];
  avatar_url?: string;
  instagram_handle?: string;
  tiktok_handle?: string;
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
}

// Define default colorscheme const
export const defaultColorScheme: ColorScheme = {
  primary: '#7E69AB',
  secondary: '#6E59A5',
  accent: '#1A1F2C',
  background: '#F5F5F5',
  text: '#1A1F2C',
  accent_light: '#E5DAF8',
};

// Create a memoized version of MediaKit to prevent unnecessary rerenders
const MemoizedMediaKitComponent = memo(function MediaKit({ isPreview = false, previewData = null, isPublic = false, publicProfile = null, theme, previewUsername }: MediaKitProps) {
  const { id: routeIdFromParams } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats: initialStats, collaborations: initialCollabs, services: initialServices, portfolio: initialPortfolio, videos: initialVideos } = useMediaKitData();
  const location = useLocation();
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTemplateId, setActiveTemplateId] = useState<string>('default');
  const [styles, setStyles] = useState({
    background: '#F5F5F5',
    foreground: '#1A1F2C',
    primary: '#7E69AB',
    primaryLight: '#E5DAF8',
    secondary: '#6E59A5',
    accent: '#1A1F2C',
    neutral: '#8E9196',
    border: 'rgba(126, 105, 171, 0.2)'
  });
  const computedStyles = theme || styles;
  const [hasFetched, setHasFetched] = useState(false);
  
  // IMPORTANT: Load saved styles from localStorage FIRST, before any other effects run
  // This ensures custom styles take precedence over database-loaded styles
  useEffect(() => {
    try {
      const savedStyles = localStorage.getItem('mediaKitCustomStyles');
      if (savedStyles) {
        const parsedStyles = JSON.parse(savedStyles);
        console.log("MediaKit: Loading saved styles from localStorage (high priority):", parsedStyles);
        setStyles(parsedStyles);
      }
    } catch (e) {
      console.error("MediaKit: Error loading saved styles:", e);
    }
  }, []);

  const updatedMediaKitFromState = location.state?.updatedMediaKit;
  
  // 1. Memoize the parsed localStorage value to prevent unnecessary rerenders
  const localUpdatedMediaKit = useMemo(() => {
    try {
      if (updatedMediaKitFromState) {
        return updatedMediaKitFromState;
      }
      
      const storedData = localStorage.getItem('updatedMediaKit');
      if (!storedData) return null;
      
      const parsedData = JSON.parse(storedData);
      console.log("MediaKit: Parsed localUpdatedMediaKit from localStorage:", {
        full_name: parsedData.full_name,
        brand_name: parsedData.brand_name,
        tagline: parsedData.tagline
      });
      
      // Ensure the full_name is explicitly set from brand_name if missing
      if (!parsedData.full_name && parsedData.brand_name) {
        parsedData.full_name = parsedData.brand_name;
      }

      // Update activeTemplateId if selected_template_id is present in localStorage
      if (parsedData.selected_template_id) {
        console.log("MediaKit: Setting template from localStorage:", parsedData.selected_template_id);
        setActiveTemplateId(parsedData.selected_template_id);
      }
      
      // Ensure colors within parsedData conform to ColorScheme type
      const defaultColors = defaultColorScheme; // Use the const

      if (parsedData.colors && typeof parsedData.colors === 'object') {
        parsedData.colors = {
          ...defaultColors, // Start with defaults
          ...parsedData.colors, // Override with parsed values
        }; // Restore correct merging logic
      } else {
        // Assign defaults if colors are missing or invalid
        parsedData.colors = defaultColors;
      }

      return parsedData;
    } catch (e) {
      console.error("MediaKit: Error parsing localStorage updatedMediaKit:", e);
      return null;
    }
  }, [updatedMediaKitFromState]);
  
  const kitData = isPreview ? profile?.media_kit_data : (localUpdatedMediaKit || profile?.media_kit_data);

  // If updated media kit data exists, force the colors to use a lighter purple for a consistent look
  useEffect(() => {
    if (updatedMediaKitFromState) {
      console.log("MediaKit: Processing updatedMediaKit from state:", {
        colors: updatedMediaKitFromState.colors,
        mediaKitDataColors: typeof updatedMediaKitFromState.media_kit_data === 'object' ? 
          updatedMediaKitFromState.media_kit_data.colors : 'not available',
        tagline: updatedMediaKitFromState.tagline,
        personal_intro: updatedMediaKitFromState.personal_intro,
        brand_name: updatedMediaKitFromState.brand_name,
        full_name: updatedMediaKitFromState.full_name
      });
      
      // Create a complete profile data object from the updatedMediaKit
      // This will be used via `kitData` in the realData assignment
      const completeMediaKitData = {
        full_name: updatedMediaKitFromState.full_name || updatedMediaKitFromState.brand_name,
        personal_intro: updatedMediaKitFromState.personal_intro,
        tagline: updatedMediaKitFromState.tagline,
        ...updatedMediaKitFromState
      };
      
      // Store this enhanced data structure for persistence
      localStorage.setItem('updatedMediaKit', JSON.stringify(completeMediaKitData));
      
      // IMPORTANT: Handle colors from both direct object and media_kit_data
      let incomingColors;
      if (typeof updatedMediaKitFromState.media_kit_data === 'object' && 
          updatedMediaKitFromState.media_kit_data?.colors) {
        // Prioritize colors from media_kit_data
        incomingColors = updatedMediaKitFromState.media_kit_data.colors;
        console.log("MediaKit: Using colors from media_kit_data object:", incomingColors);
      } else if (updatedMediaKitFromState.colors) {
        // Fallback to top-level colors
        incomingColors = updatedMediaKitFromState.colors;
        console.log("MediaKit: Using colors from top-level object:", incomingColors);
      }
      
      if (incomingColors) {
        // Ensure the incoming colors conform to ColorScheme
        const colorScheme = {
          ...defaultColorScheme, // Start with defaults
          ...incomingColors, // Override with state values
        };

        console.log("MediaKit: Final colorScheme:", colorScheme);

        // Map colors correctly from editor format to component format
        const newStyles = {
          background: colorScheme.background, 
          foreground: colorScheme.text,
          primary: colorScheme.accent, 
          primaryLight: colorScheme.accent_light, 
          secondary: colorScheme.secondary, 
          accent: colorScheme.accent, 
          neutral: colorScheme.secondary, // Use existing mapping logic
          border: `${colorScheme.accent}33`
        };

        // Store in localStorage to persist across page reloads
        localStorage.setItem('mediaKitCustomStyles', JSON.stringify(colorScheme));
        
        // Map colors correctly from editor format to component format
        setStyles(newStyles);
      }
    }
  }, [updatedMediaKitFromState]);
  
  // Debug logging for props
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
          colors: parsedJson?.colors || { primary: '#7E69AB', secondary: '#6E59A5', accent: '#1A1F2C', background: '#F5F5F5', text: '#1A1F2C', accent_light: '#E5DAF8' }, 
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
            border: `${mediaKitData.colors.primary || '#7E69AB'}33`
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
              border: `${state.updatedMediaKit.colors.accent || '#7E69AB'}33`
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
            type: "media_kit_data",
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
      setStyles(finalPrevStyles);
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
        id:'', user_id:'', username:'', full_name:'Media Kit', email:'', 
        media_kit_data: {type:"media_kit_data", brand_name:"", tagline:"", colors:defaultColorScheme, font:"Inter", section_visibility: defaultSectionVisibility}, 
        services: [], brand_collaborations: [], portfolio_images: [], videos: [], media_kit_stats: [],
        section_visibility: defaultSectionVisibility, // Top-level for EditorPreviewData
        // Ensure all other required fields from Profile / EditorPreviewData are present with defaults
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
        contact_email: '',
        profile_photo: '',
        selected_template_id: 'default',
        follower_count: 0,
        engagement_rate: 0,
        avg_likes: 0,
        reach: 0,
        stats: [],
        // Add any other specific fields from EditorPreviewData that are not in ProfileData with defaults
        instagram_followers: '',
        tiktok_followers: '',
        youtube_followers: '',
        audience_age_range: '',
        audience_location_main: '',
        audience_gender_female: 0,
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

    let mKitObjParsed: Partial<Extract<ProfileData['media_kit_data'], object>> = {};
    if (typeof p.media_kit_data === 'string') {
        try { 
          const parsed = JSON.parse(p.media_kit_data);
          if (typeof parsed === 'object' && parsed !== null) mKitObjParsed = parsed;
        } catch { /* use empty object */ }
    } else if (typeof p.media_kit_data === 'object' && p.media_kit_data !== null) {
        mKitObjParsed = p.media_kit_data;
    }
    
    const finalVideos = p.videos || mKitObjParsed.videos || [];
    const finalPortfolioImages = mKitObjParsed.portfolio_images || p.portfolio_images || [];

    // This is ProfileData like structure
    const constructedBaseData = {
        ...p, 
        services: p.services || initialServices || [], // Use initialServices from hook as further fallback
        brand_collaborations: p.brand_collaborations || initialCollabs || [], // Use initialCollabs
        videos: finalVideos, 
        portfolio_images: finalPortfolioImages, 
        follower_count: p.follower_count || (initialStats.find(s => s.platform === 'instagram')?.follower_count) || 0,
        engagement_rate: p.engagement_rate || (initialStats.find(s => s.platform === 'instagram')?.engagement_rate) || 0,
        avg_likes: p.avg_likes || (initialStats.find(s => s.platform === 'instagram')?.avg_likes) || 0,
        reach: p.reach || (initialStats.find(s => s.platform === 'instagram')?.weekly_reach) || 0,
        media_kit_data: { 
            type: "media_kit_data",
            brand_name: mKitObjParsed.brand_name || p.brand_name || '',
            tagline: mKitObjParsed.tagline || p.tagline || '',
            colors: mKitObjParsed.colors || defaultColorScheme,
            font: mKitObjParsed.font || 'Inter',
            selected_template_id: mKitObjParsed.selected_template_id || p.selected_template_id || 'default',
            skills: mKitObjParsed.skills || p.skills || [],
            contact_email: mKitObjParsed.contact_email || p.contact_email || p.email || '',
            videos: finalVideos, 
            portfolio_images: finalPortfolioImages,
            personal_intro: mKitObjParsed.personal_intro || p.personal_intro || '',
            instagram_handle: mKitObjParsed.instagram_handle || p.instagram_handle || '',
            tiktok_handle: mKitObjParsed.tiktok_handle || p.tiktok_handle || '',
            section_visibility: { ...defaultSectionVisibility, ...(mKitObjParsed.section_visibility || {}) },
        },
        full_name: p.full_name || mKitObjParsed.brand_name || p.brand_name || 'Media Kit Name',
        email: p.email || '',
        username: p.username || '',
        tagline: mKitObjParsed.tagline || p.tagline || (!isPreview ? 'Content Creator' : ''),
        selected_template_id: mKitObjParsed.selected_template_id || p.selected_template_id || 'default',
        // Ensure fields from Profile are present
        avatar_url: p.avatar_url || mKitObjParsed.profile_photo || '',
        website: p.website || '',
        niche: p.niche || '',
        media_kit_url: p.media_kit_url || '',
        onboarding_complete: p.onboarding_complete ?? false,
        profile_photo: p.avatar_url || mKitObjParsed.profile_photo || '', // profile_photo for EditorPreviewData
        // Ensure specific EditorPreviewData fields (often from Profile) are present
        brand_name: mKitObjParsed.brand_name || p.brand_name || p.full_name || '',
        colors: mKitObjParsed.colors || defaultColorScheme,
        font: mKitObjParsed.font || 'Inter',
        personal_intro: mKitObjParsed.personal_intro || p.personal_intro || '',
        skills: mKitObjParsed.skills || p.skills || [],
        stats: initialStats || [], // Use initialStats from hook
        contact_phone: (p as any).contact_phone || '', // Assuming contact_phone might be on p
    };

    // Shape into EditorPreviewData
    const finalEditorData: EditorPreviewData = {
        ...constructedBaseData,
        section_visibility: (typeof constructedBaseData.media_kit_data === 'object' && constructedBaseData.media_kit_data.section_visibility)
            ? { ...defaultSectionVisibility, ...constructedBaseData.media_kit_data.section_visibility }
            : defaultSectionVisibility,
        // Provide defaults for EditorPreviewData fields not guaranteed by ProfileData (constructedBaseData)
        // These were previously accessed with (p as any)
        contact_phone: (constructedBaseData as any).contact_phone || (mKitObjParsed as any)?.contact_phone || '',
        audience_age_range: (constructedBaseData as any).audience_age_range || '',
        audience_location_main: (constructedBaseData as any).audience_location_main || '',
        audience_gender_female: (constructedBaseData as any).audience_gender_female || 0,
        avg_video_views: (constructedBaseData as any).avg_video_views || 0,
        avg_ig_reach: (constructedBaseData as any).avg_ig_reach || 0,
        ig_engagement_rate: (constructedBaseData as any).ig_engagement_rate || 0,
        showcase_images: (constructedBaseData as any).showcase_images || [],
        past_brands_text: (constructedBaseData as any).past_brands_text || '',
        past_brands_image_url: (constructedBaseData as any).past_brands_image_url || '',
        next_steps_text: (constructedBaseData as any).next_steps_text || '',
        instagram_followers: (constructedBaseData as any).instagram_followers || '',
        tiktok_followers: (constructedBaseData as any).tiktok_followers || '',
        youtube_followers: (constructedBaseData as any).youtube_followers || '',
    };
    
    // This console log helps verify the structure of finalEditorData
    // console.log("Final realData for EditorPreviewData:", finalEditorData);
    return finalEditorData;
  }, [profile, previewData, publicProfile, isPreview, isPublic, localUpdatedMediaKit, initialStats, initialCollabs, initialServices]);
  
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
    if (profile?.media_kit_url) {
      const path = profile.media_kit_url.startsWith('/') ? profile.media_kit_url : `/${profile.media_kit_url}`;
      navigate(path);
    } else if (profile?.username) {
      navigate(`/${profile.username}`);
    } else {
      // TODO: Show a toast message from UI components
      console.warn("Cannot view public page: media_kit_url or username not available on profile.");
      alert("Media kit URL or username not available. Please ensure your profile is set up correctly.")
    }
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
          type: "media_kit_data",
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
      
      const newStyles = computeStylesFromProfile(completeProfile);
      const newActiveTemplateId = (typeof completeProfile.media_kit_data === 'object' && completeProfile.media_kit_data.selected_template_id) || completeProfile.selected_template_id || 'default';

      setProfile(completeProfile);
      setStyles(newStyles);
      setActiveTemplateId(newActiveTemplateId);
      setLoading(false);
    } catch (e: unknown) { 
      if (e instanceof Error) {
        setError(e.message || 'Failed to load media kit data.');
      } else {
        setError('Failed to load media kit data.');
      }
      setLoading(false); 
    }
  }, [ routeIdFromParams, user?.id, isPreview, isPublic, hasFetched, previewUsername, previewData, publicProfile, setActiveTemplateId, setProfile, setStyles, setLoading, setError, setHasFetched ]);

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
    dataLoading: !!initialStats,
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
    return <TemplateComponent data={realData as any} theme={computedStyles} loading={loading} section_visibility={currentVisibility as SectionVisibilityState} />;
  }

  // --- Default rendering for internal view (/media-kit) ---
  // Determine ActiveTemplateComponent using the registry
  const currentTemplateIdInternal = templateIdFromData; // Already derived correctly
  const ActiveTemplateDefinition = TEMPLATES.find(t => t.id === currentTemplateIdInternal);
  const ActiveTemplateComponent = ActiveTemplateDefinition ? ActiveTemplateDefinition.Component : null;
  const internalVisibility = realData.section_visibility 
    ? { ...defaultSectionVisibility, ...realData.section_visibility } 
    : defaultSectionVisibility;

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
                <ShareIcon className="h-4 w-4" />
                View Public Page
              </Button>
              <Button
                variant="outline"
                onClick={handleDownload}
                className="flex items-center gap-2"
                disabled // Kept disabled as it was
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Download
              </Button>
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
          <div className="template-container">
            {ActiveTemplateComponent ? (
              <ActiveTemplateComponent
                data={realData as any} 
                theme={computedStyles}
                loading={loading}
                section_visibility={internalVisibility as SectionVisibilityState}
              />
            ) : (
              <div>Loading template... (ID: {currentTemplateIdInternal})</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
});

// Export the HOC-wrapped memoized component
export default withPreview(MemoizedMediaKitComponent);

// Default theme
const defaultTheme: TemplateTheme = {
  background: '#F5F5F5',
  foreground: '#1A1F2C',
  primary: '#7E69AB',
  primaryLight: '#E5DAF8',
  secondary: '#6E59A5',
  accent: '#1A1F2C', // Often same as foreground in default
  neutral: '#8E9196',
  border: 'rgba(126, 105, 171, 0.2)' // #7E69AB with 20% opacity
};

// Add a helper function to compute styles from profile data
function computeStylesFromProfile(profileData: ProfileData | null): TemplateTheme {
  if (!profileData) return defaultTheme;

  const mediaKitDataObject = typeof profileData.media_kit_data === 'string'
    ? (JSON.parse(profileData.media_kit_data) as Extract<ProfileData['media_kit_data'], object> | null)
    : profileData.media_kit_data;
    
  const colors = mediaKitDataObject?.colors || {};
  const baseColors = { ...defaultColorScheme, ...colors }; // Merge with defaults

  return {
    background: baseColors.background,
    foreground: baseColors.text,
    primary: baseColors.accent, // Map accent to primary
    primaryLight: baseColors.accent_light,
    secondary: baseColors.secondary,
    accent: baseColors.accent, // Keep accent as accent too
    neutral: baseColors.secondary, // Use secondary for neutral
    border: `${baseColors.accent}33`,
  };
} 