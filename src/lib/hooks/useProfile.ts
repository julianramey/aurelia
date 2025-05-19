import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabase';
import type { Profile } from '../types';

// Define a more specific type for the metadata we intend to update
interface UserMetadataUpdate {
  full_name?: string;
  first_name?: string;
  username?: string;
  // Add other potential metadata fields here, e.g., avatar_url?: string;
}

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
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing profile:', checkError);
        throw checkError;
      }

      const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          (acc as Record<string, unknown>)[key] = value;
        }
        return acc;
      }, {} as Partial<Profile>); 

      const profileDataToUpsert = {
        id: user.id,
        updated_at: new Date().toISOString(),
        ...(existingProfile || {}),
        ...cleanUpdates
      };

      console.log('Updating profile with:', profileDataToUpsert);
      
      const { data: updatedProfileResponse, error: updateError } = await supabase
        .from('profiles')
        .upsert(profileDataToUpsert, { onConflict: 'id' })
        .select()
        .single();

      if (updateError) {
        console.error('Supabase update error:', updateError);
        throw updateError;
      }

      if (!updatedProfileResponse) {
        console.error('No data returned from update');
        throw new Error('Failed to update profile - no data returned');
      }

      console.log('Profile updated successfully:', updatedProfileResponse);
      setProfile(updatedProfileResponse as Profile);

      const metadataToUpdate: UserMetadataUpdate = {};
      if (typeof cleanUpdates.full_name === 'string') {
        metadataToUpdate.full_name = cleanUpdates.full_name;
      }
      // Check if first_name exists on cleanUpdates and is a string
      if ('first_name' in cleanUpdates && typeof cleanUpdates.first_name === 'string') {
        metadataToUpdate.first_name = cleanUpdates.first_name;
      }
      if ('username' in cleanUpdates && typeof cleanUpdates.username === 'string') { // Example for username
        metadataToUpdate.username = cleanUpdates.username;
      }

      if (Object.keys(metadataToUpdate).length > 0) {
        const { data: userAuthUpdateData, error: authUpdateError } = await supabase.auth.updateUser({
          data: metadataToUpdate
        });

        if (authUpdateError) {
          console.error('Failed to update user_metadata on Supabase Auth:', authUpdateError.message);
        } else {
          console.log('Supabase Auth user_metadata updated successfully:', userAuthUpdateData?.user?.user_metadata);
        }
      }

      return { data: updatedProfileResponse as Profile, error: null };
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