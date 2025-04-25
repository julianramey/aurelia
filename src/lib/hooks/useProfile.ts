import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabase';
import type { Profile } from '../types';

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      console.log("useProfile: fetchProfile called, user:", user?.id);
      
      if (!user) {
        console.log("useProfile: No user, setting profile to null");
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        console.log("useProfile: Fetching profile for user:", user.id);
        
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (fetchError) {
          console.error("useProfile: Error fetching profile:", fetchError);
          throw fetchError;
        }

        console.log("useProfile: Profile fetched successfully:", data?.id);
        setProfile(data);
        setError(null);
      } catch (err) {
        console.error('useProfile: Error fetching profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
        setProfile(null);
      } finally {
        console.log("useProfile: Setting loading to false");
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      console.error('No user found when trying to update profile');
      return { error: new Error('No user found') };
    }

    try {
      // First check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // Ignore "not found" error
        console.error('Error checking existing profile:', checkError);
        throw checkError;
      }

      // Remove any undefined or null values from updates
      const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string | number | boolean | object | null>);

      const profileData = {
        id: user.id,
        updated_at: new Date().toISOString(),
        ...(existingProfile || {}),
        ...cleanUpdates
      };

      console.log('Updating profile with:', profileData);
      
      const { data, error: updateError } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id'
        })
        .select()
        .single();

      if (updateError) {
        console.error('Supabase update error:', updateError);
        throw updateError;
      }

      if (!data) {
        console.error('No data returned from update');
        throw new Error('Failed to update profile - no data returned');
      }

      console.log('Profile updated successfully:', data);
      setProfile(data);
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 
        typeof err === 'object' && err !== null && 'message' in err ? String(err.message) :
        'Failed to update profile';
      
      console.error('Error updating profile:', err);
      return { 
        data: null, 
        error: new Error(errorMessage)
      };
    }
  };

  return { profile, loading, error, updateProfile };
} 