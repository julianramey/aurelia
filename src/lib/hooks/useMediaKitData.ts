import { useCallback, useEffect, useState, useMemo } from 'react';
import { supabase } from '../supabase';
import { MediaKitStats, BrandCollaboration, Service, PortfolioItem } from '../types';
import { useProfile } from './useProfile';

export function useMediaKitData() {
  const { profile, loading: profileLoading } = useProfile();
  const [stats, setStats] = useState<MediaKitStats[]>([]);
  const [collaborations, setCollaborations] = useState<BrandCollaboration[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug profile state
  useEffect(() => {
    console.log("useMediaKitData: Profile state changed", { 
      profileId: profile?.id,
      profileLoading,
      hasProfile: !!profile
    });
  }, [profile, profileLoading]);

  const fetchAllData = useCallback(async () => {
    console.log("fetchAllData called, profile:", profile);
    
    // If no profile, set not loading and return empty data rather than staying in loading state
    if (!profile?.id) {
      console.log("No profile ID available, ending loading state");
      setStats([]);
      setCollaborations([]);
      setServices([]);
      setPortfolio([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching media kit data for profile:", profile.id);
      
      const [statsRes, collabsRes, servicesRes, portfolioRes] = await Promise.all([
        supabase
          .from('media_kit_stats')
          .select('*')
          .eq('profile_id', profile.id),
        supabase
          .from('brand_collaborations')
          .select('*')
          .eq('profile_id', profile.id),
        supabase
          .from('services')
          .select('*')
          .eq('profile_id', profile.id),
        supabase
          .from('portfolio_items')
          .select('*')
          .eq('profile_id', profile.id)
      ]);

      console.log("Data fetch results:", {
        stats: statsRes.data?.length || 0,
        collabs: collabsRes.data?.length || 0,
        services: servicesRes.data?.length || 0,
        portfolio: portfolioRes.data?.length || 0
      });

      if (statsRes.error) throw statsRes.error;
      if (collabsRes.error) throw collabsRes.error;
      if (servicesRes.error) throw servicesRes.error;
      if (portfolioRes.error) throw portfolioRes.error;

      setStats(statsRes.data || []);
      setCollaborations(collabsRes.data || []);
      setServices(servicesRes.data || []);
      setPortfolio(portfolioRes.data || []);
    } catch (err) {
      console.error('Error fetching media kit data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch media kit data');
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
    }
  }, [profile?.id]);

  const updateStats = async (platform: string, data: Partial<MediaKitStats>) => {
    if (!profile?.id) return { error: new Error('Profile ID missing') };
    
    try {
      const { data: existingStats, error: fetchError } = await supabase
        .from('media_kit_stats')
        .select('id')
        .eq('profile_id', profile.id)
        .eq('platform', platform)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      let result;
      if (existingStats) {
        result = await supabase
          .from('media_kit_stats')
          .update(data)
          .eq('id', existingStats.id);
      } else {
        result = await supabase
          .from('media_kit_stats')
          .insert([{ profile_id: profile.id, platform, ...data }]);
      }
      if (result.error) throw result.error;
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update stats';
      setError(message);
      return { error: new Error(message) };
    }
  };

  const updateCollaborations = async (collaborations: Pick<BrandCollaboration, 'brand_name' | 'collaboration_type' | 'collaboration_date'>[]) => {
    if (!profile?.id) return { error: new Error('Profile ID missing') };
    
    try {
      const { error: deleteError } = await supabase
        .from('brand_collaborations')
        .delete()
        .eq('profile_id', profile.id);

      if (deleteError) throw deleteError;

      if (collaborations.length > 0) {
        const { error: insertError } = await supabase
          .from('brand_collaborations')
          .insert(
            collaborations.map(collab => ({
              ...collab,
              profile_id: profile.id
            }))
          );
        if (insertError) throw insertError;
      }
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update collaborations';
      setError(message);
      return { error: new Error(message) };
    }
  };

  const updateServices = async (services: Pick<Service, 'service_name' | 'description' | 'price_range'>[]) => {
    if (!profile?.id) return { error: new Error('Profile ID missing') };
    
    try {
      const { error: deleteError } = await supabase
        .from('services')
        .delete()
        .eq('profile_id', profile.id);

      if (deleteError) throw deleteError;

      if (services.length > 0) {
        const { error: insertError } = await supabase
          .from('services')
          .insert(
            services.map(service => ({
              ...service,
              profile_id: profile.id
            }))
          );
         if (insertError) throw insertError;
      }
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update services';
      setError(message);
      return { error: new Error(message) };
    }
  };

  const updatePortfolio = async (items: Partial<PortfolioItem>[]) => {
    if (!profile?.id) return;
    
    try {
      const { error } = await supabase
        .from('portfolio_items')
        .upsert(
          items.map(item => ({
            ...item,
            profile_id: profile.id
          }))
        );
      if (error) throw error;
      await fetchAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update portfolio');
    }
  };

  const refetch = useCallback(async () => {
    console.log("useMediaKitData: refetch called, profile:", profile?.id);
    
    // If no profile, set not loading and return empty data rather than staying in loading state
    if (!profile?.id) {
      console.log("... skipping refetch (no profile yet)");
      setStats([]);
      setCollaborations([]);
      setServices([]);
      setPortfolio([]);
      setLoading(false);
      // treat "no profile" as non-error
      return { success: true, error: null };
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log("useMediaKitData: Fetching fresh media kit data for profile:", profile.id);
      
      // Add individual query logging with try/catch blocks
      let statsData: MediaKitStats[] = [];
      let collabsData: BrandCollaboration[] = [];
      let servicesData: Service[] = [];
      let portfolioData: PortfolioItem[] = [];
      
      try {
        const { data, error } = await supabase
          .from('media_kit_stats')
          .select('*')
          .eq('profile_id', profile.id);
          
        if (error) {
          console.error("Stats query error:", error);
          throw error;
        }
        
        console.log("Stats query successful:", { count: data?.length || 0, data });
        statsData = data || [];
      } catch (e) {
        console.error("Stats query failed:", e);
      }
      
      try {
        const { data, error } = await supabase
          .from('brand_collaborations')
          .select('*')
          .eq('profile_id', profile.id);
          
        if (error) {
          console.error("Collaborations query error:", error);
          throw error;
        }
        
        console.log("Collaborations query successful:", { count: data?.length || 0, data });
        collabsData = data || [];
      } catch (e) {
        console.error("Collaborations query failed:", e);
      }
      
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('profile_id', profile.id);
          
        if (error) {
          console.error("Services query error:", error);
          throw error;
        }
        
        console.log("Services query successful:", { count: data?.length || 0, data });
        servicesData = data || [];
      } catch (e) {
        console.error("Services query failed:", e);
      }
      
      try {
        const { data, error } = await supabase
          .from('portfolio_items')
          .select('*')
          .eq('profile_id', profile.id);
          
        if (error) {
          console.error("Portfolio query error:", error);
          throw error;
        }
        
        console.log("Portfolio query successful:", { count: data?.length || 0, data });
        portfolioData = data || [];
      } catch (e) {
        console.error("Portfolio query failed:", e);
      }

      console.log("useMediaKitData: All queries completed, results:", {
        stats: statsData.length || 0,
        collabs: collabsData.length || 0,
        services: servicesData.length || 0,
        portfolio: portfolioData.length || 0
      });

      setStats(statsData || []);
      setCollaborations(collabsData || []);
      setServices(servicesData || []);
      setPortfolio(portfolioData || []);
      
      return { success: true, error: null };
    } catch (err) {
      console.error('useMediaKitData: Error in refetch:', err);
      const message = err instanceof Error ? err.message : 'Failed to fetch media kit data';
      setError(message);
      return { success: false, error: new Error(message) };
    } finally {
      console.log("useMediaKitData: Setting loading to false in refetch");
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    if (profile?.id) {
      fetchAllData();
    } else {
      console.log("useMediaKitData: No profile ID, skipping data fetch");
      setLoading(false);
    }
  }, [fetchAllData, profile?.id]);

  useEffect(() => {
    if (loading) {
      console.log("useMediaKitData: Setting loading timeout");
      const timeoutId = setTimeout(() => {
        console.log("useMediaKitData: Forcing loading state to false after timeout");
        setLoading(false);
      }, 5000); // 5 second timeout
      
      return () => clearTimeout(timeoutId);
    }
  }, [loading]);

  // Return a memoized object to prevent unnecessary rerenders
  return useMemo(() => ({
    stats,
    collaborations,
    services,
    portfolio,
    loading,
    error,
    updateStats,
    updateCollaborations,
    updateServices,
    updatePortfolio,
    refetch
  }), [
    stats,
    collaborations,
    services,
    portfolio,
    loading,
    error
    // Don't include the update functions or refetch in the deps array
    // since they are already stable references from useCallback
  ]);
} 