import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { useMediaKitData } from '@/lib/hooks/useMediaKitData';
import { Button } from '@/components/ui/button';
import DashboardNav from '@/components/DashboardNav';
import MediaKitTemplateDefault from '@/components/media-kit-templates/MediaKitTemplateDefault';
import MediaKitTemplateAesthetic from '@/components/media-kit-templates/MediaKitTemplateAesthetic';
import {
  UserCircleIcon,
  ChartBarIcon,
  TagIcon,
  PencilIcon,
  ArrowDownTrayIcon,
  PhotoIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import type { Profile as ImportedProfile, BrandCollaboration, Service, MediaKitStats } from '@/lib/types';

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
}

interface ProfileData {
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
}

// Define default colorscheme const
const defaultColorScheme: ColorScheme = {
  primary: '#7E69AB',
  secondary: '#6E59A5',
  accent: '#1A1F2C',
  background: '#F5F5F5',
  text: '#1A1F2C',
  accent_light: '#E5DAF8',
};

// Create a memoized version of MediaKit to prevent unnecessary rerenders
export default memo(function MediaKit({ isPreview = false, previewData = null, isPublic = false, publicProfile = null, theme }: MediaKitProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats, collaborations, services, portfolio, videos, loading: dataLoading, error: dataError, refetch } = useMediaKitData();
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
  
  // Use the provided theme prop if available, otherwise fallback to internal styles
  const computedStyles = theme || styles;

  // Flag to prevent duplicate fetches
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
      isPreview, isPublic, userId: user?.id, paramId: id
    });

    // If preview or public, no need to fetch the authenticated user's data
    if (isPreview || isPublic) return;

    // Check user existence - Just return if no ID yet, don't set error here
    if (!user?.id && !id) {
      console.log("MediaKit fetchProfile: still waiting on user.id or route id");
      return;
    }

    try {
      setLoading(true); // Set loading true when fetch actually starts
      setError(null);   // Clear any previous error
      
      // Mark that we've attempted a fetch
      setHasFetched(true);

      // Clear potentially stale localStorage data before fetching fresh data
      // unless we are in preview/public mode where we don't fetch
      if (!isPreview && !isPublic) {
        console.log("MediaKit: Clearing localStorage before fetch");
        localStorage.removeItem('updatedMediaKit');
        localStorage.removeItem('mediaKitCustomStyles');
      }

      // Get the most recent profile data directly
      const profileId = id || user?.id;
      console.log("MediaKit: Fetching profile data for ID:", profileId);
      
      if (!profileId) {
        console.error("MediaKit: No profile ID found");
        setError("Profile not found or incomplete");
        setLoading(false);
        return;
      }
      
      // Fetch profile data first
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
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
        video_links: '',
        media_kit_url: profileData.media_kit_url || '',
        contact_email: mediaKitData?.contact_email || profileData.contact_email || profileData.email || '',
        media_kit_data: mediaKitData,
        selected_template_id: templateId
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
  }, [id, user?.id, isPreview, isPublic, hasFetched]);

  // Simplified initial data load effect
  useEffect(() => {
    // Skip fetch entirely during preview/public mode
    if (isPreview || isPublic) {
      // For preview mode, process the previewData directly
      if (isPreview && previewData) {
        processPreviewData(previewData);
      } 
      // For public mode, process the publicProfile directly
      else if (isPublic && publicProfile) {
        const profile = publicProfile as ProfileData;
        const processedProfile = { ...profile };
        
        if (typeof profile.media_kit_data === 'string') {
          try {
            processedProfile.media_kit_data = JSON.parse(profile.media_kit_data);
          } catch (e) {
            console.error("Failed to parse public profile media_kit_data:", e);
          }
        }
        
        processPreviewData(processedProfile);
      }
      return;
    }

    // Simple one-time fetch on component mount
    if (!hasFetched && (user?.id || id)) {
      console.log("MediaKit: Initial data fetch");
      fetchProfile();
    }
  }, [fetchProfile, hasFetched, id, isPreview, isPublic, previewData, publicProfile, user?.id]);
  
  // Add explicit effect to set activeTemplateId from preview/public data
  useEffect(() => {
    if (isPreview && previewData) {
      // Get template ID from previewData
      const previewDataObj = previewData as any;
      const templateId = 
        (typeof previewDataObj.media_kit_data === 'object' && previewDataObj.media_kit_data?.selected_template_id) ||
        previewDataObj.selected_template_id ||
        'default';
      
      console.log("MediaKit: Setting template from previewData:", templateId);
      setActiveTemplateId(templateId);
    } 
    else if (isPublic && publicProfile) {
      // Get template ID from publicProfile
      const publicProfileObj = publicProfile as any;
      const templateId = 
        (typeof publicProfileObj.media_kit_data === 'object' && publicProfileObj.media_kit_data?.selected_template_id) ||
        publicProfileObj.selected_template_id ||
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
      console.log('processPreviewData called with data:', data);
      
      const profileData = data as ProfileData;
      
      // Debug the structure of the incoming data
      console.log('DEBUG: profile structure:', {
        hasMediaKitData: !!profileData.media_kit_data,
        mediaKitDataType: typeof profileData.media_kit_data
      });
      
      const mediaKitData = typeof profileData.media_kit_data === 'string'
        ? JSON.parse(profileData.media_kit_data)
        : profileData.media_kit_data;
      
      console.log('DEBUG: parsed mediaKitData:', mediaKitData);
      
      // Check for custom styles in localStorage first
      const savedCustomStyles = localStorage.getItem('mediaKitCustomStyles');
      
      if (savedCustomStyles) {
        // If we have custom styles saved from editor, use those instead
        console.log("MediaKit: Using custom styles from localStorage for preview");
        // Styles already loaded from localStorage useEffect
      }
      // Only apply theme colors if no custom styles found
      else if (mediaKitData && mediaKitData.colors) {
        // Ensure the colors conform to ColorScheme
        const currentColors = {
          ...defaultColorScheme, // Start with defaults
          ...mediaKitData.colors, // Override with media kit values
        };
        
        // Create a mapping from saved colors to UI expected colors
        const mappedStyles = {
          background: currentColors.background, 
          foreground: currentColors.text,
          primary: currentColors.primary, 
          primaryLight: currentColors.accent_light, 
          secondary: currentColors.secondary, 
          accent: currentColors.accent,
          neutral: currentColors.secondary, // Keep existing mapping logic if needed
          border: `${currentColors.primary}33`
        };
        
        console.log('Mapped styles from processPreviewData:', mappedStyles);
        setStyles(mappedStyles);
      } else {
        console.warn('No colors found in mediaKitData, using defaults:', mediaKitData);
        // Apply default styles if no colors found and no custom styles exist
        setStyles({
          background: defaultColorScheme.background,
          foreground: defaultColorScheme.text,
          primary: defaultColorScheme.primary,
          primaryLight: defaultColorScheme.accent_light,
          secondary: defaultColorScheme.secondary,
          accent: defaultColorScheme.accent,
          neutral: defaultColorScheme.secondary, // Or a suitable default neutral
          border: `${defaultColorScheme.primary}33`
        });
      }

      // pull in anything PublicMediaKit attached for us:
      const videos = profileData.videos || mediaKitData.videos || [];
      const portfolioImages = profileData.portfolio_images || mediaKitData.portfolio_images || [];

      const processedData = {
        ...profileData,

        // make sure our videos & portfolio show up
        videos,
        portfolio_images: portfolioImages,
        
        media_kit_data: mediaKitData,
        tagline: mediaKitData?.tagline || '',
        skills: mediaKitData?.skills || [],
        media_kit_url: profileData.media_kit_url || '',
        contact_email: mediaKitData?.contact_email || profileData.contact_email || '',
        selected_template_id: mediaKitData?.selected_template_id || 'default'
      };

      console.log('Processed preview data:', processedData);
      setProfile(processedData);
      setLoading(false);
    } catch (error) {
      console.error('Error processing data:', error);
      setError('Failed to process data');
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
  const realData: ProfileData = isPreview 
    ? { ...((typeof previewData === 'object' && previewData) || {}), ...(profile || {}) } as ProfileData
    : isPublic
      ? (() => {
          const source = profile || (publicProfile as ProfileData) || {} as ProfileData;
          const top = Array.isArray(source.videos) ? source.videos : [];
          // Add type guard and nullish access before accessing .videos
          const inner = typeof source.media_kit_data === 'object' && source.media_kit_data?.videos 
            ? source.media_kit_data.videos 
            : [];
          return {
            ...source,
            videos: top.length ? top : inner
          } as ProfileData;
        })()
      : { ...(profile || {}), ...(kitData || {}), videos: videos || [] } as ProfileData;
      
  // Debug log for public profile data flow
  if (isPublic) {
    console.log("REAL DATA CONSTRUCTION (PUBLIC MODE):", {
      publicProfileType: typeof publicProfile,
      publicProfileHasVideos: !!(publicProfile as ProfileData)?.videos?.length,
      publicProfileVideosType: typeof (publicProfile as ProfileData)?.videos,
      publicProfileHasMediaKitVideos: !!(publicProfile as ProfileData)?.media_kit_data?.videos?.length,
      processedProfileHasVideos: !!profile?.videos?.length,
      finalRealDataHasVideos: !!realData.videos?.length,
      realDataVideosType: typeof realData.videos,
      computedVideosValue: ((typeof publicProfile === 'object' && publicProfile) as ProfileData)?.videos?.length > 0
        ? "Using publicProfile.videos"
        : ((typeof publicProfile === 'object' && publicProfile) as ProfileData)?.media_kit_data?.videos?.length > 0
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
    publicProfileHasVideos: isPublic ? !!(publicProfile as ProfileData)?.videos?.length : null,
    publicProfileHasMediaKitVideos: isPublic 
      ? (
        typeof (publicProfile as ProfileData)?.media_kit_data === 'object' && 
        (publicProfile as ProfileData)?.media_kit_data !== null && 
        !!(publicProfile as ProfileData).media_kit_data.videos?.length
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

  // Add function to initialize media kit data
  const initializeMediaKitData = async () => {
    if (!user?.id) {
      console.error("No user ID available for initialization");
      return;
    }
    
    console.log("Initializing media kit data for user:", user.id);
    
    try {
      // 1. Create a default media kit data object
      const defaultMediaKitData = {
        colors: {
          primary: '#7E69AB',
          secondary: '#6E59A5',
          accent: '#1A1F2C'
        },
        skills: ['Content Creation', 'Social Media', 'Photography']
      };
      
      // 2. Update the profile with this data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          media_kit_data: defaultMediaKitData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      // 3. Create basic Instagram stats
      const { error: statsError } = await supabase
        .from('media_kit_stats')
        .upsert([{
          profile_id: user.id,
          platform: 'instagram',
          follower_count: 1000,
          engagement_rate: 3.5,
          avg_likes: 85,
          weekly_reach: 2500,
          avg_comments: 10,
          monthly_impressions: 5000
        }]);
        
      if (statsError) throw statsError;
      
      // 4. Create sample brand collaborations
      const { error: collabsError } = await supabase
        .from('brand_collaborations')
        .upsert([
          {
            profile_id: user.id,
            brand_name: 'Example Brand 1',
            collaboration_type: 'Sponsored Post',
            collaboration_date: new Date().toISOString().split('T')[0]
          },
          {
            profile_id: user.id,
            brand_name: 'Example Brand 2',
            collaboration_type: 'Affiliate',
            collaboration_date: new Date().toISOString().split('T')[0]
          }
        ]);
        
      if (collabsError) throw collabsError;
      
      // 5. Create sample services
      const { error: servicesError } = await supabase
        .from('services')
        .upsert([
          {
            profile_id: user.id,
            service_name: 'Content Creation',
            description: 'Professional content creation for your brand',
            price_range: '$100-$500'
          },
          {
            profile_id: user.id,
            service_name: 'Social Media Management',
            description: 'Manage and grow your social media presence',
            price_range: '$200-$1000'
          }
        ]);
        
      if (servicesError) throw servicesError;
      
      console.log("Successfully initialized media kit data");
      
      // Refresh the page to show new data
      window.location.reload();
    } catch (error) {
      console.error("Error initializing media kit data:", error);
    }
  };

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
  
  // Add debug logging after kitData is calculated
  console.log("MediaKit DEBUG:", {
    isPreview,
    isPublic,
    hasPreviewData: !!previewData,
    hasPublicProfile: !!publicProfile,
    profile: profile ? 'exists' : 'null',
    loading,
    dataLoading,
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

  // ADD EXTREME DEBUG LOGGING FOR TEMPLATE SELECTION
  console.log("🔥🔥🔥 FINAL TEMPLATE DECISION:", {
    templateIdFromData,
    isAesthetic: templateIdFromData === 'aesthetic',
    isDefault: templateIdFromData === 'default',
    rawValue: templateIdFromData,
    type: typeof templateIdFromData,
    mediaKitDataObject: typeof realData.media_kit_data === 'object' ? 'YES' : 'NO',
    mediaKitDataSelectedTemplateId: typeof realData.media_kit_data === 'object' ? 
      realData.media_kit_data.selected_template_id : 'NOT_AVAILABLE'
  });

  // Conditionally render the new loading screen for the main media kit view
  if (loading && !isPreview && !isPublic) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
        <div className="text-lg font-medium text-purple-600 mb-4">Loading...</div>
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // If public or preview, render template directly without extra wrappers/backgrounds
  if (isPreview || isPublic) {
    // Find the correct template component
    const TemplateComponent = templateIdFromData === 'aesthetic' 
      ? MediaKitTemplateAesthetic 
      : MediaKitTemplateDefault;
      
    // Log which component is being rendered
    console.log(`Rendering ${templateIdFromData === 'aesthetic' ? 'Aesthetic' : 'Default'} template directly for public/preview`);
      
    // Render only the template
    return <TemplateComponent data={realData} theme={computedStyles} />;
  }

  // --- Default rendering for internal view (/media-kit) ---
  return (
    <div className="min-h-screen bg-white"> {/* Keep white bg for internal page */}
      <DashboardNav />
      <main className="p-8"> {/* Keep padding for internal page */}
        <div className="mx-auto" style={{ maxWidth: '1000px' }}>
          {user?.id === realData.id && ( /* Check user ID for buttons */
            <div className="mb-6 flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    // Direct query to Supabase for the most up-to-date profile data
                    const { data: latestProfile, error } = await supabase
                      .from('profiles')
                      .select('username, media_kit_url, id')
                      .eq('id', user.id)
                      .single();
                    
                    console.log("Button clicked - Supabase direct query result:", latestProfile);
                    
                    if (error) {
                      console.error("Error fetching profile data:", error);
                      alert("Error accessing your profile data. Please try again.");
                      return;
                    }
                    
                    // Use media_kit_url if available, otherwise fall back to username
                    if (latestProfile?.media_kit_url) {
                      console.log("Opening public profile with media_kit_url:", latestProfile.media_kit_url);
                      window.open(`/${latestProfile.media_kit_url}`, '_blank');
                    } else if (latestProfile?.username) {
                      console.log("Opening public profile with username (fallback):", latestProfile.username);
                      window.open(`/${latestProfile.username}`, '_blank');
                    } else {
                      // Alert if neither is available
                      alert("Please set up your Media Kit URL in your profile settings to view your public page.");
                    }
                  } catch (error) {
                    console.error("Error in direct Supabase query:", error);
                    alert("An error occurred. Please try again.");
                  }
                }}
                className="flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                View Public Page
              </Button>
              <Button
                variant="outline"
                onClick={handleDownload}
                className="flex items-center gap-2"
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

          {/* Template rendering */}
          {(() => {
            // Capture exact value for debugging
            const exactTemplateId = templateIdFromData; 
            console.log("🔎 RENDER DECISION:", {
              exactTemplateId,
              stringComparison: exactTemplateId === 'aesthetic',
              typeofExactTemplateId: typeof exactTemplateId
            });
            
            // Direct string comparison with explicit values
            if (exactTemplateId === 'aesthetic') {
              console.log("✅ RENDERING AESTHETIC TEMPLATE");
              return <MediaKitTemplateAesthetic data={realData} theme={computedStyles} />;
            } else {
              console.log("⚠️ RENDERING DEFAULT TEMPLATE (not aesthetic)");
              return <MediaKitTemplateDefault data={realData} theme={computedStyles} />;
            }
          })()}
        </div>
      </main>
    </div>
  );
}); 

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

  const mediaKitData = typeof profileData.media_kit_data === 'string'
    ? JSON.parse(profileData.media_kit_data)
    : profileData.media_kit_data;
    
  const colors = mediaKitData?.colors || {};
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