import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { useMediaKitData } from '@/lib/hooks/useMediaKitData';
import { Button } from '@/components/ui/button';
import DashboardNav from '@/components/DashboardNav';
import {
  UserCircleIcon,
  ChartBarIcon,
  TagIcon,
  PencilIcon,
  ArrowDownTrayIcon,
  PhotoIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import type { Profile as ImportedProfile } from '@/lib/types';

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
  full_name: string;
  email?: string;
  contact_email?: string;
  media_kit_data: {
    videos?: Array<{ url: string; thumbnail_url: string }>;
    [key: string]: unknown;
  };
  media_kit_url?: string;
  tagline?: string;
  personal_intro?: string;
  brand_name?: string;
  colors?: Record<string, string>;
  videos?: Array<{ url: string; thumbnail_url: string }>;
  portfolio_images?: string[];
}

// Create a memoized version of MediaKit to prevent unnecessary rerenders
export default memo(function MediaKit({ isPreview = false, previewData = null, isPublic = false, publicProfile = null, theme }: MediaKitProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats, collaborations, services, portfolio, videos, loading: dataLoading, error: dataError, refetch } = useMediaKitData();
  const location = useLocation();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      
      if (updatedMediaKitFromState.colors) {
        // Store in localStorage to persist across page reloads
        localStorage.setItem('mediaKitCustomStyles', JSON.stringify({
          background: updatedMediaKitFromState.colors.background || '#F5F5F5',
          foreground: updatedMediaKitFromState.colors.text || '#1A1F2C',
          primary: updatedMediaKitFromState.colors.accent || '#7E69AB',
          primaryLight: updatedMediaKitFromState.colors.accent_light || '#E5DAF8',
          secondary: updatedMediaKitFromState.colors.secondary || '#6E59A5',
          accent: updatedMediaKitFromState.colors.text || '#1A1F2C',
          neutral: updatedMediaKitFromState.colors.secondary || '#8E9196',
          border: `${updatedMediaKitFromState.colors.accent || '#7E69AB'}33`
        }));
        
        // Map colors correctly from editor format to component format
        setStyles(prev => ({
          ...prev,
          background: updatedMediaKitFromState.colors.background || '#F5F5F5',
          foreground: updatedMediaKitFromState.colors.text || '#1A1F2C',
          primary: updatedMediaKitFromState.colors.accent || '#7E69AB',
          primaryLight: updatedMediaKitFromState.colors.accent_light || '#E5DAF8',
          secondary: updatedMediaKitFromState.colors.secondary || '#6E59A5',
          accent: updatedMediaKitFromState.colors.text || '#1A1F2C',
          neutral: updatedMediaKitFromState.colors.secondary || '#8E9196',
          border: `${updatedMediaKitFromState.colors.accent || '#7E69AB'}33`
        }));
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
      let mediaKitData, skills = [];
      try {
        mediaKitData = typeof profileData.media_kit_data === 'string'
          ? JSON.parse(profileData.media_kit_data)
          : profileData.media_kit_data || {};
          
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
      const completeProfile = {
        ...profileData,
        skills,
        follower_count: instagramStats.follower_count || 0,
        engagement_rate: instagramStats.engagement_rate || 0,
        avg_likes: instagramStats.avg_likes || 0,
        reach: instagramStats.weekly_reach || 0,
        services: servicesData?.map(s => s.service_name || 'Unnamed Service') || [],
        brand_collaborations: collabsData?.map(c => c.brand_name || 'Unnamed Brand') || [],
        portfolio_images: [],
        profile_photo: '',
        video_links: '',
        media_kit_url: profileData.media_kit_url || '',
        contact_email: profileData.contact_email || ''
      };

      console.log("MediaKit: Setting complete profile");
      setProfile(completeProfile);
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
  
  // Simple handler for navigation back from editor  
  useEffect(() => {
    const handlePopState = () => {
      // Clear hasFetched flag when navigating back to allow a fresh fetch
      if (window.location.pathname === '/media-kit') {
        console.log("MediaKit: Navigation detected back to media kit");
        
        // Check for state from navigation
        const state = window.history.state?.usr;
        if (state?.updatedMediaKit?.colors) {
          console.log("MediaKit: Found updatedMediaKit in navigation state:", state.updatedMediaKit.colors);
          
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
        
        // Don't set styles here, they'll be loaded from the useEffect that reads localStorage
      }
      // Only apply theme colors if no custom styles found
      else if (mediaKitData && mediaKitData.colors) {
        const colors = mediaKitData.colors;
        
        // Create a mapping from saved colors to UI expected colors
        const mappedStyles = {
          background: colors.background || '#F5F5F5',
          foreground: colors.text || '#1A1F2C',
          primary: colors.accent || '#7E69AB',
          primaryLight: colors.accent_light || '#E5DAF8',
          secondary: colors.secondary || '#6E59A5',
          accent: colors.accent || '#1A1F2C',
          neutral: colors.secondary || '#8E9196',
          border: `${colors.accent || '#7E69AB'}33`
        };
        
        console.log('Mapped styles:', mappedStyles);
        setStyles(mappedStyles);
      } else {
        console.warn('No colors found in mediaKitData:', mediaKitData);
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
        contact_email: mediaKitData?.contact_email || profileData.contact_email || ''
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
  const realData = isPreview 
    ? { ...((typeof previewData === 'object' && previewData) || {}), ...(profile || {}) }
    : isPublic
      ? (() => {
          // use the fully-processed `profile` state here,
          // not the raw prop
          const source = profile || (publicProfile as ProfileData) || {} as ProfileData;
          const top = Array.isArray(source.videos) ? source.videos : [];
          const inner = source.media_kit_data?.videos || [];
          return {
            ...source,
            videos: top.length ? top : inner
          };
        })()
      : { ...(profile || {}), ...(kitData || {}), videos: videos || [] };
      
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
    mediaKitVideos: realData.media_kit_data?.videos,
    videosLength: realData.videos?.length,
    mediaKitVideosLength: realData.media_kit_data?.videos?.length,
    publicProfileType: isPublic ? typeof publicProfile : null,
    publicProfileHasVideos: isPublic ? !!(publicProfile as ProfileData)?.videos?.length : null,
    publicProfileHasMediaKitVideos: isPublic ? !!(publicProfile as ProfileData)?.media_kit_data?.videos?.length : null
  });

  // Log the realData tagline value 
  console.log("MediaKit received data:", {
    isPreview,
    isPublic,
    hasTagline: 'tagline' in realData,
    tagline: realData.tagline,
    taglineType: typeof realData.tagline
  });

  // Add fallbacks for essential properties to prevent errors
  if (!realData.full_name) realData.full_name = 'Media Kit';
  
  // Only add fallback for non-preview mode
  // Preview mode should show exactly what's passed in
  if (!isPreview && !realData.tagline) realData.tagline = 'Content Creator';
  
  if (!realData.services) realData.services = [];
  if (!realData.brand_collaborations) realData.brand_collaborations = [];
  if (!realData.portfolio_images) realData.portfolio_images = ['https://placehold.co/600x400','https://placehold.co/600x400','https://placehold.co/600x400'];

  console.log("MediaKit: Final realData:", {
    hasData: !!realData,
    id: realData?.id,
    name: realData?.full_name,
    email: realData?.email,
    contact_email: realData?.contact_email,
    hasServices: Array.isArray(realData?.services),
    serviceCount: Array.isArray(realData?.services) ? realData.services.length : 'N/A'
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

  // Add a function to format numbers with K/M/B suffixes for large values
  const formatNumber = (num: number | string | undefined): string => {
    if (num === undefined) return '0';
    
    const value = typeof num === 'string' ? parseFloat(num) : num;
    
    if (isNaN(value)) return '0';
    
    if (value >= 1000000000) {
      return (value / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
    }
    
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    
    if (value >= 1000) {
      return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    
    return value.toString();
  };

  // Better responsive text styles without truncation
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
  
  // 1) Error screen only once we're done loading and actually have an error
  if (!loading && error) {
    return (
      <div style={{ padding:'2rem', textAlign:'center', color:'red' }}>
        Error: {error}
      </div>
    );
  }

  // 2) Skeleton until we've fetched a real profile (or in preview/public mode)
  if ((loading && !isPreview && !isPublic) || (!profile && !isPreview && !isPublic)) {
    console.log("MediaKit: Showing skeleton, loading:", loading, "profile:", !!profile);
    return (
      <div className="min-h-screen" style={{ background: computedStyles.background }}>
        <style>{responsiveTextStyles}</style>
        {!isPreview && !isPublic && <DashboardNav />}
        <main className="p-8">
          <div className="mx-auto" style={{ maxWidth: '1000px' }}>
            <div className="mb-6 flex justify-end gap-4">
              <div className="w-32 h-10 bg-white/50 rounded-md animate-pulse"></div>
              <div className="w-32 h-10 bg-white/50 rounded-md animate-pulse"></div>
              <div className="w-32 h-10 bg-white/50 rounded-md animate-pulse"></div>
            </div>
            
            <div className="space-y-6">
              {/* Hero Section Skeleton */}
              <div className="bg-white rounded-[0.75rem] p-8 shadow-sm border" style={{ borderColor: computedStyles.border }}>
                <div className="grid grid-cols-1 md:grid-cols-[200px,1fr] gap-8">
                  <div className="w-[200px] h-[200px] mx-auto md:mx-0 rounded-full overflow-hidden bg-white/60 animate-pulse"></div>
                  <div className="space-y-4">
                    <div className="h-10 w-3/4 bg-white/60 rounded animate-pulse"></div>
                    <div className="h-6 w-1/2 bg-white/60 rounded animate-pulse"></div>
                    <div className="h-20 w-full bg-white/60 rounded animate-pulse"></div>
                    <div className="flex gap-3">
                      <div className="h-10 w-28 bg-white/60 rounded-lg animate-pulse"></div>
                      <div className="h-10 w-28 bg-white/60 rounded-lg animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stats Section Skeleton */}
              <div className="bg-white rounded-[0.75rem] p-6 shadow-sm border" style={{ borderColor: computedStyles.border }}>
                <div className="h-8 w-48 bg-white/60 rounded animate-pulse mb-6"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="p-6 rounded-[0.75rem] bg-white/60 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 3) Now we definitely have a `profile` (or are in preview/public), render the real page
  return (
    <div className="min-h-screen" style={{ background: computedStyles.background }}>
      <style>{responsiveTextStyles}</style>
      {!isPreview && !isPublic && <DashboardNav />}
      <main className="p-8">
        <div className="mx-auto" style={{ maxWidth: '1000px' }}>
          {!isPreview && !isPublic && user?.id === realData.id && (
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

          <div className="media-kit space-y-6">
            {/* Hero Section */}
            <div className="hero bg-white rounded-[0.75rem] p-8 shadow-sm border grid grid-cols-1 md:grid-cols-[200px,1fr] gap-8" style={{ borderColor: computedStyles.border }}>
              <div className="photo w-[200px] h-[200px] mx-auto md:mx-0 rounded-full overflow-hidden border-4" style={{ borderColor: computedStyles.primaryLight }}>
                {realData.avatar_url ? (
                  <img src={realData.avatar_url} alt={realData.full_name} className="w-full h-full object-cover" />
                ) : (
                  <img src="https://placehold.co/400x400" alt="Profile Photo" className="w-full h-full object-cover" />
                )}
              </div>
              
              <div className="info text-center md:text-left">
                <h1 className="font-['Playfair_Display'] text-[2.5rem] mb-2" style={{ color: computedStyles.foreground }}>
                  {realData.full_name}
                </h1>
                <p className="text-[1.1rem] italic mb-4" style={{ color: computedStyles.primary }}>
                  {realData.tagline}
                </p>

                <p className="text-base mb-6" style={{ color: computedStyles.neutral }}>
                  {realData.personal_intro || realData.intro || ''}
                </p>
                
                <div className="social-links flex flex-wrap gap-4 justify-center md:justify-start">
                  {realData.instagram_handle && (
                    <a
                      href={`https://instagram.com/${realData.instagram_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.9rem] font-medium px-4 py-2 rounded-lg transition-all hover:bg-primary hover:text-white"
                      style={{ 
                        background: computedStyles.primaryLight,
                        color: computedStyles.foreground
                      }}
                    >
                      Instagram
                    </a>
                  )}
                  {realData.tiktok_handle && (
                    <a
                      href={`https://tiktok.com/@${realData.tiktok_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.9rem] font-medium px-4 py-2 rounded-lg transition-all hover:bg-primary hover:text-white"
                      style={{ 
                        background: computedStyles.primaryLight,
                        color: computedStyles.foreground
                      }}
                    >
                      TikTok
                    </a>
                  )}
                  {(realData.contact_email || realData.email) && (
                    <a
                      href={`mailto:${realData.contact_email || realData.email}`}
                      className="text-[0.9rem] font-medium px-4 py-2 rounded-lg transition-all hover:bg-primary hover:text-white"
                      style={{ 
                        background: computedStyles.primaryLight,
                        color: computedStyles.foreground
                      }}
                    >
                      Contact
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Analytics Overview */}
            <div className="section bg-white rounded-[0.75rem] p-6 shadow-sm border" style={{ borderColor: computedStyles.border }}>
              <h2 className="font-['Playfair_Display'] text-[1.5rem] mb-6 flex items-center gap-2" style={{ color: computedStyles.foreground }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" style={{ color: computedStyles.primary }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
                Analytics Overview
              </h2>
              <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="stats-item p-6 rounded-[0.75rem] text-center" style={{ background: computedStyles.primaryLight }}>
                  <h3 className="stats-number font-semibold mb-1" style={{ color: computedStyles.primary }}>
                    {formatNumber(realData.follower_count) || '0'}
                  </h3>
                  <p className="text-[0.9rem]" style={{ color: computedStyles.neutral }}>Total Followers</p>
                </div>
                <div className="stats-item p-6 rounded-[0.75rem] text-center" style={{ background: computedStyles.primaryLight }}>
                  <h3 className="stats-number font-semibold mb-1" style={{ color: computedStyles.primary }}>
                    {realData.engagement_rate || '0'}%
                  </h3>
                  <p className="text-[0.9rem]" style={{ color: computedStyles.neutral }}>Engagement Rate</p>
                </div>
                <div className="stats-item p-6 rounded-[0.75rem] text-center" style={{ background: computedStyles.primaryLight }}>
                  <h3 className="stats-number font-semibold mb-1" style={{ color: computedStyles.primary }}>
                    {formatNumber(realData.avg_likes) || '0'}
                  </h3>
                  <p className="text-[0.9rem]" style={{ color: computedStyles.neutral }}>Average Likes</p>
                </div>
                <div className="stats-item p-6 rounded-[0.75rem] text-center" style={{ background: computedStyles.primaryLight }}>
                  <h3 className="stats-number font-semibold mb-1" style={{ color: computedStyles.primary }}>
                    {formatNumber(realData.reach) || '0'}
                  </h3>
                  <p className="text-[0.9rem]" style={{ color: computedStyles.neutral }}>Weekly Reach</p>
                </div>
              </div>
            </div>

            {/* Portfolio Showcase - Always show this section */}
            <div className="section bg-white rounded-[0.75rem] p-6 shadow-sm border" style={{ borderColor: computedStyles.border }}>
              <h2 className="font-['Playfair_Display'] text-[1.5rem] mb-6 flex items-center gap-2" style={{ color: computedStyles.foreground }}>
                <PhotoIcon className="w-6 h-6" style={{ color: computedStyles.primary }} />
                Recent Content
              </h2>
              
              {(() => {
                // pick whichever source has videos
                const vids = realData.videos?.length
                          ? realData.videos
                          : realData.media_kit_data?.videos || [];

                if (vids.length === 0) {
                  // fallback to portfolio_images or placeholders…
                  return (
                    <div className="grid grid-cols-3 gap-4">
                      {(realData.portfolio_images?.length 
                        ? realData.portfolio_images
                        : [
                          'https://placehold.co/600x400',
                          'https://placehold.co/600x400',
                          'https://placehold.co/600x400'
                        ]).map((image, index) => (
                        <img 
                          key={index}
                          src={image}
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-[200px] object-cover rounded-[0.75rem] border-2 transition-transform hover:scale-[1.02]"
                          style={{ borderColor: computedStyles.border }}
                        />
                      ))}
                    </div>
                  );
                }

                // Videos: Display all on one row with consistent sizing and proper padding
                return (
                  <div className="flex justify-center px-1" 
                       style={{ 
                         gap: vids.length >= 3 && vids.length <= 4 ? '1.5rem' : '1rem',
                       }}>
                    {vids.map((v, i) => (
                      <a
                        key={i}
                        href={v.url}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block rounded-lg overflow-hidden flex-1"
                        style={{ 
                          border: `2px solid ${computedStyles.primary}`,
                          maxWidth: vids.length <= 3 ? '26%' : '19.8%', // Made 4-5 videos 7% larger
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
                              className={`${vids.length >= 4 ? 'w-9 h-9' : 'w-10 h-10'}`}
                            >
                              <path d="M8 5v14l11-7L8 5z"/>
                            </svg>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Brand Collaborations - Always show this section */}
            <div className="section bg-white rounded-[0.75rem] p-6 shadow-sm border" style={{ borderColor: computedStyles.border }}>
              <h2 className="font-['Playfair_Display'] text-[1.5rem] mb-6 flex items-center gap-2" style={{ color: computedStyles.foreground }}>
                <ShareIcon className="w-6 h-6" style={{ color: computedStyles.primary }} />
                Brand Experience
              </h2>
              <div className="brands-grid flex flex-wrap gap-4">
                {(Array.isArray(realData.brand_collaborations) && realData.brand_collaborations.length > 0) 
                  ? realData.brand_collaborations.map((brand, index) => (
                      <div
                        key={index}
                        className="brand-tag font-medium px-5 py-3 rounded-lg"
                        style={{ background: computedStyles.primaryLight, color: computedStyles.primary }}
                      >
                        {brand}
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

            {/* Services - Always show this section */}
            <div className="section bg-white rounded-[0.75rem] p-6 shadow-sm border" style={{ borderColor: computedStyles.border }}>
              <h2 className="font-['Playfair_Display'] text-[1.5rem] mb-6 flex items-center gap-2" style={{ color: computedStyles.foreground }}>
                <TagIcon className="w-6 h-6" style={{ color: computedStyles.primary }} />
                Services Offered
              </h2>
              
              <ul className="services-list grid grid-cols-1 md:grid-cols-3 gap-4">
                {(Array.isArray(realData.services) && realData.services.length > 0)
                  ? realData.services.map((service, index) => (
                      <li
                        key={index}
                        className="service-tag font-medium p-4 rounded-[0.75rem] flex items-center gap-2"
                        style={{ background: computedStyles.primaryLight, color: computedStyles.primary }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 flex-shrink-0">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-container">{service}</span>
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

            {/* Contact Information */}
            <div className="section bg-white rounded-[0.75rem] p-6 shadow-sm border" style={{ borderColor: computedStyles.border }}>
              <h2 className="font-['Playfair_Display'] text-[1.5rem] mb-6 flex items-center gap-2" style={{ color: computedStyles.foreground }}>
                <ShareIcon className="w-6 h-6" style={{ color: computedStyles.primary }} />
                Contact Information
              </h2>
              <div className="contact-info grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-[0.75rem] border" style={{ borderColor: computedStyles.border }}>
                  <h4 className="text-[0.9rem] mb-2" style={{ color: computedStyles.neutral }}>Email</h4>
                  <p>
                    <a 
                      href={`mailto:${realData.contact_email || realData.email || 'contact@example.com'}`} 
                      className="contact-info-text font-medium hover:underline block" 
                      style={{ color: computedStyles.primary }}
                    >
                      {realData.contact_email || realData.email || 'contact@example.com'}
                    </a>
                  </p>
                </div>
                <div className="bg-white p-4 rounded-[0.75rem] border" style={{ borderColor: computedStyles.border }}>
                  <h4 className="text-[0.9rem] mb-2" style={{ color: computedStyles.neutral }}>Instagram</h4>
                  <p>
                    <a 
                      href={`https://instagram.com/${realData.instagram_handle ? realData.instagram_handle.replace(/^@/, '') : 'username'}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="contact-info-text font-medium hover:underline block"
                      style={{ color: computedStyles.primary }}
                    >
                      {'@' + (realData.instagram_handle ? realData.instagram_handle.replace(/^@/, '') : 'username')}
                    </a>
                  </p>
                </div>
                <div className="bg-white p-4 rounded-[0.75rem] border" style={{ borderColor: computedStyles.border }}>
                  <h4 className="text-[0.9rem] mb-2" style={{ color: computedStyles.neutral }}>TikTok</h4>
                  <p>
                    <a 
                      href={`https://tiktok.com/@${realData.tiktok_handle ? realData.tiktok_handle.replace(/^@/, '') : 'username'}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="contact-info-text font-medium hover:underline block"
                      style={{ color: computedStyles.primary }}
                    >
                      {'@' + (realData.tiktok_handle ? realData.tiktok_handle.replace(/^@/, '') : 'username')}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}); 