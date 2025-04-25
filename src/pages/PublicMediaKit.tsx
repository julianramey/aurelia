import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import MediaKit from './MediaKit';
import { createClient } from '@supabase/supabase-js';
import type { Profile } from '@/lib/types';

export default function PublicMediaKit() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        
        const [statsResult, collabsResult, servicesResult, portfolioResult] = await Promise.all([
          supabaseNoCache.from('media_kit_stats').select('*').eq('profile_id', profileData.id),
          supabaseNoCache.from('brand_collaborations').select('*').eq('profile_id', profileData.id),
          supabaseNoCache.from('services').select('*').eq('profile_id', profileData.id),
          supabaseNoCache.from('portfolio_items').select('*').eq('profile_id', profileData.id)
        ]);
        
        // Extract and process related data
        const statsData = statsResult.data || [];
        const collabsData = collabsResult.data || [];
        const servicesData = servicesResult.data || [];
        const portfolioData = portfolioResult.data || [];
        
        // Extract Instagram stats if available
        const instagramStats = statsData.find(s => s.platform === 'instagram') || {
          follower_count: 0,
          engagement_rate: 0,
          avg_likes: 0,
          weekly_reach: 0
        };
        
        // Create a complete profile with all related data
        const completeProfile = {
          ...profileData,
          follower_count: instagramStats.follower_count || 0,
          engagement_rate: instagramStats.engagement_rate || 0,
          avg_likes: instagramStats.avg_likes || 0,
          reach: instagramStats.weekly_reach || 0,
          services: servicesData?.map(s => s.service_name || 'Unnamed Service') || [],
          brand_collaborations: collabsData?.map(c => c.brand_name || 'Unnamed Brand') || [],
          portfolio_images: portfolioData?.map(p => p.media_url) || [],
          skills: profileData.media_kit_data?.skills || []
        };

        // Set the profile state with complete data
        setProfile(completeProfile);
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

  return (
    <MediaKit isPublic={true} publicProfile={profile} />
  );
} 