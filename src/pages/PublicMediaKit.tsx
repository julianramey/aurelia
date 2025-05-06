import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import MediaKitTemplateDefault from '@/components/media-kit-templates/MediaKitTemplateDefault';
import MediaKit from '@/pages/MediaKit'; // Import the MediaKit component
import { createClient } from '@supabase/supabase-js';
import type { Profile } from '@/lib/types';

// Define the expected theme structure (can be moved to types.ts later)
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

// Define the expected structure of colors coming from the database (matching editor format)
interface EditorColorScheme {
  background?: string;
  text?: string;
  secondary?: string;
  accent_light?: string;
  accent?: string;
}

// Helper to compute theme from profile colors
const computeTheme = (profileData: Profile | null): TemplateTheme => {
  // Expect EditorColorScheme structure from media_kit_data
  const colors: EditorColorScheme | null = (typeof profileData?.media_kit_data === 'object' && profileData.media_kit_data !== null) 
    ? profileData.media_kit_data.colors 
    : null;
    
  if (!colors) {
    return defaultTheme;
  }
  
  // Map the colors from the editor format to TemplateTheme
  const primary = colors.accent || defaultTheme.primary;
  // Use accent_light if available, otherwise fallback
  const primaryLight = colors.accent_light || defaultTheme.primaryLight;
  
  return {
    background: colors.background || defaultTheme.background, // Use background
    foreground: colors.text || defaultTheme.foreground,       // Use text
    primary: primary,
    primaryLight: primaryLight, // Use accent_light
    secondary: colors.secondary || defaultTheme.secondary,    // Use secondary
    accent: colors.accent || defaultTheme.accent,             // Use accent (often same as primary)
    neutral: colors.secondary || defaultTheme.neutral,        // Use secondary for neutral
    border: `${primary}33` 
  };
};

export default function PublicMediaKit() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [computedTheme, setComputedTheme] = useState<TemplateTheme>(defaultTheme);

  // Create a no-cache Supabase client for this component to ensure we get fresh data on initial load
  const supabaseNoCache = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      global: {
        fetch: (url: RequestInfo | URL, options: RequestInit = {}) => {
          const headers = new Headers(options.headers || {});
          headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
          headers.set('Pragma', 'no-cache');
          
          return fetch(url, { 
            ...options, 
            cache: 'no-store',
            headers
          });
        }
      }
    }
  );

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        setError(null);

        console.log("PublicMediaKit: Fetching profile with username:", username);
        
        // First try to find by media_kit_url
        let { data: profileData, error: profileError } = await supabaseNoCache
          .from('profiles')
          .select('*')
          .eq('media_kit_url', username)
          .single();

        // Next try to find by username if media_kit_url search didn't find anything
        if (!profileData && !profileError) {
          ({ data: profileData, error: profileError } = await supabaseNoCache
            .from('profiles')
            .select('*')
            .eq('username', username)
            .single());
        }

        // Finally try by ID if neither worked
        if (!profileData && !profileError) {
          ({ data: profileData, error: profileError } = await supabaseNoCache
            .from('profiles')
            .select('*')
            .eq('id', username)
            .single());
        }

        if (profileError) throw profileError;
        if (!profileData) throw new Error('Profile not found');

        console.log("PublicMediaKit: Profile fetched successfully:", profileData.id);
        
        // Clear localStorage to ensure we don't use stale data from editor
        localStorage.removeItem('updatedMediaKit');
        
        // Process media_kit_data if it's a string
        if (typeof profileData.media_kit_data === 'string') {
          try {
            const parsed = JSON.parse(profileData.media_kit_data);
            profileData.media_kit_data = parsed;
          } catch (e) {
            console.error("PublicMediaKit DEBUG: Failed to parse media_kit_data string:", e);
          }
        }

        // Fetch related data in parallel after profile is found
        console.log("PublicMediaKit: Fetching related data for profile:", profileData.id);
        
        const [statsResult, collabsResult, servicesResult, portfolioResult, videosResult] = await Promise.all([
          supabaseNoCache.from('media_kit_stats').select('*').eq('profile_id', profileData.id),
          supabaseNoCache.from('brand_collaborations').select('*').eq('profile_id', profileData.id),
          supabaseNoCache.from('services').select('*').eq('profile_id', profileData.id),
          supabaseNoCache.from('portfolio_items').select('*').eq('profile_id', profileData.id),
          supabaseNoCache.from('media_kit_videos').select('url, thumbnail_url').eq('profile_id', profileData.id)
        ]);
        
        // 🔥 DEBUG: log the raw Supabase response
        console.group('PublicMediaKit: media_kit_videos result')
        console.log('videosResult:', videosResult)
        console.log('videosResult.data:', videosResult.data)
        console.log('videosResult.error:', videosResult.error)
        console.groupEnd()
        
        // Extract and process related data
        const statsData = statsResult.data || [];
        const collabsData = collabsResult.data || [];
        const servicesData = servicesResult.data || [];
        const portfolioData = portfolioResult.data || [];
        const videosData = videosResult.data || [];
        
        // Extract Instagram stats if available
        const instagramStats = statsData.find(s => s.platform === 'instagram') || {
          follower_count: 0,
          engagement_rate: 0,
          avg_likes: 0,
          weekly_reach: 0
        };
        
        // Ensure media_kit_data is an object
        if (!profileData.media_kit_data) {
          profileData.media_kit_data = {
            type: 'media_kit_data',
            brand_name: profileData.full_name || '',
            tagline: '',
            colors: { cream: '', charcoal: '', taupe: '', blush: '', accent: '' },
            font: 'Inter'
          };
        } else if (typeof profileData.media_kit_data === 'string') {
          try {
            profileData.media_kit_data = JSON.parse(profileData.media_kit_data);
          } catch (e) {
            profileData.media_kit_data = {
              type: 'media_kit_data',
              brand_name: profileData.full_name || '',
              tagline: '',
              colors: { cream: '', charcoal: '', taupe: '', blush: '', accent: '' },
              font: 'Inter'
            };
          }
        }
        
        // IMPORTANT: Attach videos to media_kit_data
        profileData.media_kit_data.videos = videosData;
        
        // IMPORTANT: Create a new completeProfile object that:
        // 1) Has videos at the top level for realData.videos
        // 2) Preserves media_kit_data.videos for the fallback path
        // 3) Includes selected_template_id at the top level for template selection
        const completeProfile = {
          ...profileData,
          // explicitly set videos at the top level 
          videos: videosData,
          // portfolio data transforms
          portfolio_images: portfolioData.map(p => p.media_url) || [],
          // instagram stats
          follower_count: instagramStats.follower_count || 0,
          engagement_rate: instagramStats.engagement_rate || 0,
          avg_likes: instagramStats.avg_likes || 0,
          reach: instagramStats.weekly_reach || 0,
          // other data - Pass the original object arrays
          services: servicesData || [],
          brand_collaborations: collabsData || [],
          skills: profileData.media_kit_data?.skills || [],
          // Extract contact_email from media_kit_data if available
          contact_email: profileData.media_kit_data?.contact_email || null,
          // IMPORTANT: Copy selected_template_id from media_kit_data for template selection
          // Ensure media_kit_data is an object before accessing its properties
          selected_template_id: (typeof profileData.media_kit_data === 'object' && profileData.media_kit_data?.selected_template_id) || 'default',
        };

        // Add debug log to verify template ID is being passed correctly
        console.log("PublicMediaKit DEBUG - Template ID:", {
          fromMediaKitData: profileData.media_kit_data?.selected_template_id,
          inCompleteProfile: completeProfile.selected_template_id,
          isAesthetic: completeProfile.selected_template_id === 'aesthetic',
          rawMediaKitData: profileData.media_kit_data
        });

        // Set the profile state with complete data
        setProfile(completeProfile);
        // Compute and set the theme based on fetched data
        setComputedTheme(computeTheme(completeProfile));
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Media kit not found');
      } finally {
        setLoading(false);
      }
    }

    if (username) {
      fetchProfile();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // Render the template component within a padded structure
  return (
    <div className="min-h-screen" style={{ background: computedTheme.background }}>
      <main className="py-12">
        <div className="max-w-4xl mx-auto">
          <MediaKit isPublic={true} publicProfile={profile} theme={computedTheme} />
        </div>
      </main>
    </div>
  );
} 