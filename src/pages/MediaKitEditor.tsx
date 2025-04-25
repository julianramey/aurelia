import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';
import { useProfile } from '@/lib/hooks/useProfile';
import { useMediaKitData } from '@/lib/hooks/useMediaKitData';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MediaKit from './MediaKit';
import type { Profile, MediaKitStats, Service, BrandCollaboration, SocialPlatform } from '@/lib/types';
import {
  ArrowLeftIcon,
  SwatchIcon,
  UserIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import DashboardNav from '@/components/DashboardNav';
import { supabase } from '@/lib/supabase';

/**
 * Turn any filename into a Storage-safe key:
 */
function makeSafeKey(userId: string, originalName: string) {
  const parts = originalName.split('.')
  const ext   = parts.length > 1 ? parts.pop() : ''
  const name  = parts.join('.')
  const safeBase = name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, '_')
  return `${userId}/${safeBase}_${Date.now()}${ext ? `.${ext}` : ''}`
}

interface ColorScheme {
  background: string;
  text: string;
  secondary: string;
  accent_light: string;
  accent: string;
}

interface BaseMediaKitData {
  type: 'media_kit_data';
  brand_name: string;
  tagline: string;
  colors: ColorScheme;
  font: string;
}

interface MediaKitData extends BaseMediaKitData {
  personal_intro?: string;
  instagram_handle?: string;
  tiktok_handle?: string;
  portfolio_images?: string[];
  brand_collaborations_text?: string;
  services_text?: string;
  skills_text?: string;
  brand_collaborations?: string[];
  services?: string[];
  skills?: string[];
  follower_count?: number;
  engagement_rate?: number;
  avg_likes?: number;
  reach?: number;
  contact_email?: string;
}

const COLOR_PRESETS = [
  {
    id: "default",
    label: "Default Purple",
    name: "Default Purple",
    colors: {
      background: "#F5F5F5",
      text: "#1A1F2C",
      secondary: "#8E9196",
      accent_light: "#E5DAF8",
      accent: "#7E69AB"
    }
  },
  {
    id: "softBlush",
    label: "Soft Blush",
    name: "Soft Blush",
    colors: {
      background: "#FFF5F7",
      text: "#4A3640",
      secondary: "#A67F8E",
      accent_light: "#FADADD",
      accent: "#E4A7B6"
    }
  },
  {
    id: "oceanMist",
    label: "Ocean Mist",
    name: "Ocean Mist",
    colors: {
      background: "#EAF6F6",
      text: "#1F3B4D",
      secondary: "#557A95",
      accent_light: "#AED9E0",
      accent: "#3A8EAE"
    }
  },
  {
    id: "sageSands",
    label: "Sage Sands",
    name: "Sage Sands",
    colors: {
      background: "#F1F5EF",
      text: "#333C38",
      secondary: "#7C8B82",
      accent_light: "#D8E3D1",
      accent: "#A3B18A"
    }
  },
  {
    id: "sunsetCoral",
    label: "Sunset Coral",
    name: "Sunset Coral",
    colors: {
      background: "#FFF3F0",
      text: "#3C2A21",
      secondary: "#A26A57",
      accent_light: "#FAD4C0",
      accent: "#FF8A65"
    }
  },
  {
    id: "minimalSlate",
    label: "Minimal Slate",
    name: "Minimal Slate",
    colors: {
      background: "#FFFFFF",
      text: "#212121",
      secondary: "#757575",
      accent_light: "#F5F5F5",
      accent: "#424242"
    }
  }
];

const getCompleteTheme = (preset) => preset.colors;

// New helper: getContrast returns a contrasting color (black or white) based on the input hex color
const getContrast = (hex: string): string => {
  const normalizedHex = hex.replace('#', '');
  const r = parseInt(normalizedHex.substring(0, 2), 16);
  const g = parseInt(normalizedHex.substring(2, 4), 16);
  const b = parseInt(normalizedHex.substring(4, 6), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq >= 128 ? '#000000' : '#ffffff';
};

// Add a separate Preview component to isolate and force re-renders
interface MediaKitPreviewProps {
  previewData: Profile | null;
  theme: {
    background: string;
    foreground: string;
    primary: string;
    primaryLight: string;
    secondary: string;
    accent: string;
    neutral: string;
    border: string;
  };
  tagline: string;
}

// Extended profile type for preview with profile_photo
interface PreviewProfile extends Profile {
  profile_photo?: string;
  colors?: ColorScheme;
  font?: string;
  contact_email?: string;
}

const MediaKitPreview = ({ previewData, theme, tagline }: MediaKitPreviewProps) => {
  if (!previewData) return null;
  
  // Cast to extended profile type
  const previewDataWithPhoto = previewData as PreviewProfile;
    
  // Handle media_kit_data safely
  const existingMediaKitData = typeof previewDataWithPhoto.media_kit_data === 'object' 
    ? previewDataWithPhoto.media_kit_data 
    : {};
    
  const completePreviewData = {
    ...previewDataWithPhoto,
    // Add avatar_url at the top level where MediaKit looks for it
    avatar_url: previewDataWithPhoto.profile_photo,
    media_kit_data: {
      ...existingMediaKitData,
      
      // overwrite with our live values:
      brand_name: previewDataWithPhoto.full_name,
      tagline: tagline,
      colors: previewDataWithPhoto.colors,
      font: previewDataWithPhoto.font,
      personal_intro: previewDataWithPhoto.personal_intro,
      instagram_handle: previewDataWithPhoto.instagram_handle,
      tiktok_handle: previewDataWithPhoto.tiktok_handle,
      contact_email: previewDataWithPhoto.contact_email,
      
      // Also include the profile_photo in the media_kit_data
      profile_photo: previewDataWithPhoto.profile_photo,
    },
    id: 'preview-id',
    user_id: 'preview-user-id',
    username: 'preview-username',
  };
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <MediaKit 
        isPreview={true} 
        previewData={completePreviewData} 
        theme={theme} 
      />
    </div>
  );
};

export default function MediaKitEditor() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, loading: profileLoading, error: profileError, updateProfile } = useProfile();
  const { 
    stats, 
    collaborations, 
    services, 
    portfolio,
    loading: mediaKitLoading,
    error: mediaKitError,
    updateStats,
    updateCollaborations,
    updateServices,
    refetch
  } = useMediaKitData();
  
  const [activeTab, setActiveTab] = useState('branding');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<MediaKitData & { email: string, profile_photo: string, video_links: string }>({
    type: 'media_kit_data',
    brand_name: profile?.full_name || '',
    tagline: '',
    colors: COLOR_PRESETS[0].colors,
    font: 'Inter',
    personal_intro: profile?.personal_intro || '',
    instagram_handle: profile?.instagram_handle || '',
    tiktok_handle: profile?.tiktok_handle || '',
    portfolio_images: [],
    brand_collaborations_text: '',
    services_text: '',
    skills_text: '',
    brand_collaborations: [],
    services: [],
    skills: [],
    follower_count: 0,
    engagement_rate: 0,
    avg_likes: 0,
    reach: 0,
    email: profile?.email || '',
    profile_photo: '',
    video_links: '',
    contact_email: profile?.email || ''
  });

  // Create a stable memoized version of the preview data to prevent unnecessary rerenders
  const mediaKitPreviewData = useMemo(() => {
    if (!formData) return null;
    
    console.log("MediaKitEditor: Updating preview data with tagline:", formData.tagline);
    console.log("MediaKitEditor: Including profile photo:", formData.profile_photo);
    
    // Only include properties that should trigger a preview refresh
    const previewData = {
      // Required Profile fields
      id: 'preview-id',
      user_id: 'preview-user-id',
      username: 'preview-username',
      
      // Content fields
      full_name: formData.brand_name,
      personal_intro: formData.personal_intro,
      tagline: formData.tagline || 'Your Tagline', // Make sure tagline is never empty
      profile_photo: formData.profile_photo, // Explicitly include profile_photo
      portfolio_images: formData.portfolio_images,
      font: formData.font,
      skills: formData.skills,
      services: formData.services,
      brand_collaborations: formData.brand_collaborations,
      colors: formData.colors,
      instagram_handle: formData.instagram_handle,
      tiktok_handle: formData.tiktok_handle,
      email: formData.email,
      contact_email: formData.email,
      follower_count: formData.follower_count,
      engagement_rate: formData.engagement_rate,
      avg_likes: formData.avg_likes,
      reach: formData.reach,
    };
    
    // Log the final preview data
    console.log("PREVIEW DATA - Profile photo included:", previewData.profile_photo);
    
    return previewData;
  }, [
    formData?.brand_name, 
    formData?.personal_intro, 
    formData?.tagline,
    formData?.profile_photo, // Already included in dependency array
    formData?.portfolio_images, 
    formData?.font, 
    formData?.skills, 
    formData?.services, 
    formData?.brand_collaborations, 
    formData?.colors, 
    formData?.instagram_handle, 
    formData?.tiktok_handle, 
    formData?.email, 
    formData?.follower_count,
    formData?.engagement_rate, 
    formData?.avg_likes, 
    formData?.reach
  ]);

  // Add a loading state for initial data fetch
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  useEffect(() => {
    if (formData && !initialDataLoaded) {
      setInitialDataLoaded(true);
    }
  }, [formData, initialDataLoaded]);

  // Helper to map formData.colors into the shape MediaKit preview expects
  const getPreviewTheme = () => ({
    background: formData.colors.background,
    foreground: formData.colors.text,
    primary:    formData.colors.accent,
    primaryLight: formData.colors.accent_light,
    secondary:  formData.colors.secondary,
    accent:     formData.colors.accent,
    neutral:    formData.colors.secondary,
    border:     `${formData.colors.accent}33`,
  });

  useEffect(() => {
    console.log('Updated colors:', formData.colors);
  }, [formData.colors]);

  const debouncedUpdateStatsRef = useRef<ReturnType<typeof debounce> | null>(null);
  const debouncedUpdateCollaborationsRef = useRef<ReturnType<typeof debounce> | null>(null);
  const debouncedUpdateServicesRef = useRef<ReturnType<typeof debounce> | null>(null);

  useEffect(() => {
    let initialData: Partial<MediaKitData & { email: string, profile_photo: string, video_links: string }> = {};
    if (profile) {
      // Get media_kit_data properly parsed
      const mediaKitData = typeof profile.media_kit_data === 'string' 
        ? JSON.parse(profile.media_kit_data) 
        : profile.media_kit_data || {};
        
      console.log("LOADING TAGLINE - Data sources:", {
        media_kit_data_type: typeof profile.media_kit_data,
        parsed_media_kit_data: mediaKitData,
        tagline_from_media_kit: mediaKitData?.tagline,
      });
        
      initialData = {
        ...initialData,
        brand_name: profile.full_name || '',
        personal_intro: profile.personal_intro || '',
        instagram_handle: profile.instagram_handle ? `@${profile.instagram_handle}` : '',
        tiktok_handle: profile.tiktok_handle ? `@${profile.tiktok_handle}` : '',
        skills: mediaKitData?.skills || [],
        skills_text: mediaKitData?.skills ? mediaKitData.skills.join(', ') : '',
        tagline: mediaKitData?.tagline || '',
        colors: mediaKitData?.colors || COLOR_PRESETS[0].colors,
        font: mediaKitData?.font || 'Inter',
        // Directly get contact_email from media_kit_data
        email: mediaKitData?.contact_email || profile.email || '',
        // Load the profile photo URL from media_kit_data or avatar_url
        profile_photo: mediaKitData?.profile_photo || profile.avatar_url || ''
      };
    }
    if (stats.length > 0) {
      const instagramStats = stats.find(s => s.platform === 'instagram');
      if (instagramStats) {
        initialData = {
          ...initialData,
          follower_count: instagramStats.follower_count,
          engagement_rate: instagramStats.engagement_rate,
          avg_likes: instagramStats.avg_likes,
          reach: instagramStats.weekly_reach
        };
      }
    }
    if (collaborations.length > 0) {
      const collabNames = collaborations.map(c => c.brand_name);
      initialData = {
        ...initialData,
        brand_collaborations: collabNames,
        brand_collaborations_text: collabNames.join(', ')
      };
    }
    if (services.length > 0) {
      const serviceNames = services.map(s => s.service_name);
      initialData = {
        ...initialData,
        services: serviceNames,
        services_text: serviceNames.join(', ')
      };
    }
    
    setFormData(prev => ({ 
      ...prev, 
      ...initialData,
      // Ensure tagline is explicitly pulled from mediaKitData 
      tagline: initialData.tagline || prev.tagline,
      colors: prev.colors 
    }));

  }, [profile, stats, collaborations, services, refetch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log(`Updating field ${name} to value: ${value}`);
    
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: value
      };
      
      // If brand_name is being updated, ensure it's reflected in the preview
      if (name === 'brand_name') {
        console.log(`Updating brand_name to: ${value}`);
      }
      
      // For tagline changes, ensure they're reflected in the preview
      if (name === 'tagline') {
        console.log(`Updating tagline to: ${value}`);
      }
      
      return updated;
    });
  };

  const handleColorPresetChange = (preset: typeof COLOR_PRESETS[0]) => {
    setFormData(prev => ({
      ...prev,
      colors: { ...preset.colors }
    }));
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const cleanValue = value === '' ? '' : (value.startsWith('@') ? value : `@${value}`);
    setFormData(prev => ({
      ...prev,
      [name]: cleanValue
    }));
  };

  useEffect(() => {
    debouncedUpdateStatsRef.current = debounce(async (platform, data) => {
      if (profile?.id) await updateStats(platform, data);
    }, 500);

    debouncedUpdateCollaborationsRef.current = debounce(async (collabs) => {
      if (profile?.id) await updateCollaborations(collabs);
    }, 500);

    debouncedUpdateServicesRef.current = debounce(async (servicesList) => {
      if (profile?.id) await updateServices(servicesList);
    }, 500);

    return () => {
      debouncedUpdateStatsRef.current?.cancel();
      debouncedUpdateCollaborationsRef.current?.cancel();
      debouncedUpdateServicesRef.current?.cancel();
    };
  }, [profile?.id, updateStats, updateCollaborations, updateServices]);

  const handleMetricsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Immediately update formData with the raw string value so live preview reflects exactly what you type
    setFormData(prev => ({ ...prev, [name]: value }));

    // For backend stats update, convert the value to a number
    const numValue = parseFloat(value) || 0;
    const updated = { ...formData, [name]: value };
    const statsData = {
      follower_count: name === 'follower_count' ? numValue : (parseFloat(String(updated.follower_count)) || 0),
      engagement_rate: name === 'engagement_rate' ? numValue : (parseFloat(String(updated.engagement_rate)) || 0),
      avg_likes: name === 'avg_likes' ? numValue : (parseFloat(String(updated.avg_likes)) || 0),
      weekly_reach: name === 'reach' ? numValue : (parseFloat(String(updated.reach)) || 0),
      avg_comments: stats.find(s => s.platform === 'instagram')?.avg_comments || 0,
      monthly_impressions: stats.find(s => s.platform === 'instagram')?.monthly_impressions || 0
    };
    debouncedUpdateStatsRef.current?.('instagram' as SocialPlatform, statsData);
  };

  const handleBrandCollaborations = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      brand_collaborations_text: text,
      brand_collaborations: text ? text.split(',').map(item => item.trim()).filter(Boolean) : []
    }));
  };

  const handleServicesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      services_text: text,
      services: text ? text.split(',').map(item => item.trim()).filter(Boolean) : []
    }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setFormData(prev => ({
      ...prev,
      skills_text: text,
      skills: text ? text.split(',').map(item => item.trim()).filter(Boolean) : []
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const skillsArray = formData.skills_text 
        ? formData.skills_text.split(',').map(item => item.trim()).filter(Boolean) 
        : [];
      
      const servicesArray = formData.services_text 
        ? formData.services_text.split(',').map(item => item.trim()).filter(Boolean) 
        : [];
      
      const collabsArray = formData.brand_collaborations_text 
        ? formData.brand_collaborations_text.split(',').map(item => item.trim()).filter(Boolean) 
        : [];

      // Log actual values to confirm what we're saving
      console.log("SAVING MEDIA KIT - Current values:", {
        brand_name: formData.brand_name,
        tagline: formData.tagline,
        personal_intro: formData.personal_intro,
        colors: formData.colors
      });

      // 1. Get current profile data to preserve any fields we're not updating
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('media_kit_data')
        .eq('id', profile?.id)
        .single();
      
      if (fetchError) throw fetchError;
      if (!profileData) throw new Error("Profile not found");
      
      console.log("Current media_kit_data:", profileData.media_kit_data);
      
      // 2. Parse media_kit_data if it's a string
      const mediaKitData = typeof profileData.media_kit_data === 'string'
        ? JSON.parse(profileData.media_kit_data)
        : profileData.media_kit_data || {};
      
      // 3. Create a properly structured color scheme
      const colorScheme = {
        background: formData.colors?.background || "#F5F5F5",
        text: formData.colors?.text || "#1A1F2C",
        secondary: formData.colors?.secondary || "#8E9196",
        accent_light: formData.colors?.accent_light || "#E5DAF8", 
        accent: formData.colors?.accent || "#7E69AB"
      };
      
      // 4. Create updated media kit data with only the essential fields
      const updatedMediaKitData = {
        ...mediaKitData,
        type: 'media_kit_data',
        brand_name: formData.brand_name,
        tagline: formData.tagline || "",
        personal_intro: formData.personal_intro || "",
        colors: colorScheme,
        font: formData.font || 'Inter',
        contact_email: formData.email || "",
        last_updated: new Date().toISOString()
      };
      
      console.log("Updating media_kit_data to:", updatedMediaKitData);
      
      // 5. Update the profile table directly
      const updates: Partial<Profile> = {
        full_name: formData.brand_name,
        personal_intro: formData.personal_intro,
        instagram_handle: formData.instagram_handle?.replace('@', '') || null,
        tiktok_handle: formData.tiktok_handle?.replace('@', '') || null,
        media_kit_data: JSON.stringify(updatedMediaKitData),
        updated_at: new Date().toISOString(),
        
        // ← new line to persist the avatar URL
        avatar_url: formData.profile_photo,
      };
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile?.id);
      
      if (updateError) throw updateError;
      
      console.log("Successfully updated media_kit_data in the database");

      // Get latest profile data to ensure we have the most current media_kit_url
      const { data: latestProfile } = await supabase
        .from('profiles')
        .select('username, media_kit_url, id, media_kit_data')
        .eq('id', profile?.id)
        .single();
        
      // Check if the update was successful
      console.log("DEBUGGING COLORS - Fetched latest profile with media_kit_data:", 
        latestProfile?.media_kit_data);

      if (profile?.id) {
        await updateStats('instagram' as SocialPlatform, {
          follower_count: formData.follower_count || 0,
          engagement_rate: formData.engagement_rate || 0,
          avg_likes: formData.avg_likes || 0,
          weekly_reach: formData.reach || 0,
          avg_comments: stats.find(s => s.platform === 'instagram')?.avg_comments || 0,
          monthly_impressions: stats.find(s => s.platform === 'instagram')?.monthly_impressions || 0
        });

        const collabsToSave = collabsArray.map(brand => ({ brand_name: brand }));
        await updateCollaborations(collabsToSave);
        
        const servicesToSave = servicesArray.map(service => ({ service_name: service }));
        await updateServices(servicesToSave);
      }

      // Store the public page URL for the success message
      const publicPageUrl = latestProfile?.media_kit_url || latestProfile?.username || '';

      toast({
        title: 'Success',
        description: 'Your media kit has been saved.',
        action: publicPageUrl ? (
          <Button 
            variant="outline"
            onClick={() => window.open(`/${publicPageUrl}`, '_blank')}
          >
            View Public Page
          </Button>
        ) : undefined
      });

      // Clear any localStorage caches that might be used
      localStorage.removeItem('updatedMediaKit');
      
      // Create a more complete updatedMediaKit object to pass to the MediaKit component
      const updatedMediaKitData2 = {
        ...formData,
        full_name: formData.brand_name,
        tagline: formData.tagline,
        personal_intro: formData.personal_intro,
        contact_email: formData.email
      };
      
      console.log("Navigating to media-kit with updated data:", {
        brand_name: formData.brand_name,
        tagline: formData.tagline
      });
      
      navigate('/media-kit', { 
        state: { 
          updatedMediaKit: updatedMediaKitData2
        }, 
        replace: true 
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your media kit. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Add a specific handler for tagline to ensure real-time updates
  const handleTaglineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    
    // Update formData immediately with the raw input value
    setFormData(prev => ({
      ...prev,
      tagline: value
    }));
  };

  // Return loading state with proper sizing to prevent layout shift
  if (!initialDataLoaded) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        <div className="container mx-auto p-4 md:p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Form area placeholder */}
            <div className="w-full md:w-1/2 space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-sm animate-pulse h-24"></div>
              <div className="bg-white rounded-lg p-6 shadow-sm space-y-4">
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            
            {/* Preview area placeholder - maintains proper dimensions */}
            <div className="w-full md:w-1/2 md:sticky md:top-20 h-fit">
              <div className="bg-white rounded-lg p-8 shadow-sm h-[600px] animate-pulse">
                <div className="flex justify-center items-center h-full">
                  <svg className="animate-spin h-12 w-12 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (profileLoading || mediaKitLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="sticky top-0 z-50 bg-white border-b border-blush/20 shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse"></div>
                <div className="w-36 h-6 bg-gray-100 animate-pulse rounded"></div>
              </div>
              <div className="flex gap-4">
                <div className="w-16 h-10 bg-gray-100 animate-pulse rounded"></div>
                <div className="w-32 h-10 bg-gray-100 animate-pulse rounded"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-73px)]">
          <div className="w-2/5 p-6 border-r border-blush/20">
            <div className="max-w-md mx-auto">
              <div className="w-full h-12 bg-gray-100 animate-pulse rounded mb-6"></div>
              <div className="space-y-4">
                <div className="w-full h-64 bg-gray-100 animate-pulse rounded"></div>
              </div>
            </div>
          </div>
          <div className="w-3/5 bg-white flex justify-center items-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto border-4 border-rose/20 border-t-rose rounded-full animate-spin"></div>
              <p className="mt-4 text-taupe">Loading your media kit...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (profileError || mediaKitError) {
    return <div>Error loading profile</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      
      {/* Navigation bar - moved outside of columns to span full width */}
      <div className="sticky top-0 z-50 bg-white border-b border-blush/20 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/media-kit')}
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-medium text-charcoal">
                Edit Media Kit
              </h1>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await refetch();
                    setTimeout(() => {
                      navigate('/media-kit');
                    }, 500);
                  } catch (err) {
                    navigate('/media-kit');
                  }
                }}
                disabled={isSaving}
              >
                Exit
              </Button>
              <Button
                onClick={handleSave}
                className="bg-charcoal hover:bg-charcoal/90 text-white px-4 py-2 rounded-md"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Editor form - make narrower */}
          <div className="w-full md:w-2/5 space-y-6">
            <Tabs defaultValue="branding" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="branding" className="flex items-center gap-2">
                  <SwatchIcon className="h-4 w-4" />
                  Branding
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  Content
                </TabsTrigger>
                <TabsTrigger value="metrics" className="flex items-center gap-2">
                  <ChartBarIcon className="h-4 w-4" />
                  Metrics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="branding" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Theme Colors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {COLOR_PRESETS.map(preset => (
                        <button
                          key={preset.id}
                          onClick={() => handleColorPresetChange(preset)}
                          className={`bg-white rounded-lg p-3 border transition-all ${
                            JSON.stringify(formData.colors) === JSON.stringify(preset.colors)
                              ? 'border-rose shadow-lg scale-[1.02]'
                              : 'border-blush/20 hover:border-rose/40 hover:scale-[1.02]'
                          }`}
                        >
                          <h3 className="text-sm font-medium text-charcoal mb-2">{preset.name}</h3>
                          <div className="grid grid-cols-5 gap-2">
                            {( ['background','text','secondary','accent_light','accent'] as (keyof ColorScheme)[] ).map(key => (
                              <div
                                key={key}
                                className="h-5 rounded"
                                style={{ backgroundColor: preset.colors[key] }}
                              />
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="brand_name">Name</Label>
                      <Input
                        id="brand_name"
                        name="brand_name"
                        value={formData.brand_name}
                        onChange={handleInputChange}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tagline">Tagline</Label>
                      <Input
                        id="tagline"
                        name="tagline"
                        value={formData.tagline}
                        onChange={handleInputChange}
                        placeholder="Your brand tagline"
                      />
                    </div>
                    <div>
                      <Label htmlFor="personal_intro">About You</Label>
                      <Textarea
                        id="personal_intro"
                        name="personal_intro"
                        value={formData.personal_intro}
                        onChange={handleInputChange}
                        placeholder="Tell your story"
                        className="h-24"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Social Media</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="instagram_handle">Instagram</Label>
                      <Input
                        id="instagram_handle"
                        name="instagram_handle"
                        value={formData.instagram_handle}
                        onChange={handleSocialChange}
                        placeholder="@yourusername"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tiktok_handle">TikTok</Label>
                      <Input
                        id="tiktok_handle"
                        name="tiktok_handle"
                        value={formData.tiktok_handle}
                        onChange={handleSocialChange}
                        placeholder="@yourusername"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Brand Experience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Label htmlFor="brand_collaborations_text">Past Collaborations</Label>
                    <Textarea
                      id="brand_collaborations_text"
                      name="brand_collaborations_text"
                      value={formData.brand_collaborations_text || ''}
                      onChange={handleBrandCollaborations}
                      onBlur={() => {
                        if (profile?.id && formData.brand_collaborations_text) {
                          const collabsArray = formData.brand_collaborations_text
                            .split(',')
                            .map(item => item.trim())
                            .filter(Boolean);
                          
                          updateCollaborations(collabsArray.map(brand => ({ brand_name: brand })));
                        }
                      }}
                      placeholder="Enter brand names separated by commas"
                      className="h-24"
                    />
                    <p className="text-sm text-taupe mt-2">
                      Example: Nike, Adidas, Puma
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Services & Skills</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="services_text">Services Offered</Label>
                      <Textarea
                        id="services_text"
                        name="services_text"
                        value={formData.services_text || ''}
                        onChange={handleServicesChange}
                        onBlur={() => {
                          if (profile?.id && formData.services_text) {
                            const servicesArray = formData.services_text
                              .split(',')
                              .map(item => item.trim())
                              .filter(Boolean);
                            
                            updateServices(servicesArray.map(service => ({ service_name: service })));
                          }
                        }}
                        placeholder="Enter services separated by commas"
                        className="h-24"
                      />
                      <p className="text-sm text-taupe mt-2">
                        Example: Content Creation, Brand Photography, Social Media Management
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="skills_text">Key Skills</Label>
                      <Textarea
                        id="skills_text"
                        name="skills_text"
                        value={formData.skills_text || ''}
                        onChange={handleSkillsChange}
                        placeholder="Enter skills separated by commas"
                        className="h-24"
                      />
                      <p className="text-sm text-taupe mt-2">
                        Example: Adobe Photoshop, Video Editing, Copywriting
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Contact Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="text"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="you@example.com"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Additional Media</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="avatar" className="mb-2 block">Profile Picture</Label>
                      
                      <div className="flex items-center gap-4">
                        {formData.profile_photo && (
                          <img
                            src={formData.profile_photo}
                            alt="Profile preview"
                            className="w-16 h-16 rounded-full object-cover border border-blush/20"
                          />
                        )}
                        
                        <div className="flex flex-col">
                          <div className="relative">
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="relative overflow-hidden"
                              onClick={() => document.getElementById('avatar')?.click()}
                            >
                              {formData.profile_photo ? 'Change picture' : 'Upload picture'}
                            </Button>
                            <input
                              id="avatar"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={async e => {
                                const file = e.target.files?.[0];
                                if (!file || !profile?.id) return;

                                // Show loading state
                                toast({ title: 'Uploading...', description: 'Please wait while we process your image.' });
                                
                                // 1) Upload to your avatars bucket
                                const key = makeSafeKey(profile.id, file.name);
                                const { data, error } = await supabase
                                  .storage
                                  .from('avatars')
                                  .upload(key, file, { upsert: true });
                                if (error) {
                                  return toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
                                }

                                // 2) Get the public URL
                                const publicUrl = supabase
                                  .storage
                                  .from('avatars')
                                  .getPublicUrl(data.path)
                                  .data.publicUrl;

                                // 3) Store in local formData
                                setFormData(prev => ({ ...prev, profile_photo: publicUrl }));

                                toast({ title: 'Uploaded!', description: 'Profile picture ready.' });
                              }}
                            />
                          </div>
                          <p className="text-xs text-taupe mt-2">
                            Recommended: Square image, 500×500px or larger
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="video_links">Social Video Links</Label>
                      <Textarea
                        id="video_links"
                        name="video_links"
                        value={formData.video_links}
                        onChange={handleInputChange}
                        placeholder="Enter video URLs separated by commas"
                        className="h-24"
                      />
                      <p className="text-sm text-taupe mt-2">Example: https://youtube.com/xxx, https://tiktok.com/xxx</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Audience Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="follower_count">Total Followers</Label>
                      <Input
                        id="follower_count"
                        name="follower_count"
                        type="text"
                        value={formData.follower_count}
                        onChange={handleMetricsChange}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="engagement_rate">Engagement Rate</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="engagement_rate"
                          name="engagement_rate"
                          type="text"
                          value={formData.engagement_rate}
                          onChange={handleMetricsChange}
                          placeholder="0.0"
                        />
                        <span className="text-sm text-taupe">%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="avg_likes">Average Likes</Label>
                      <Input
                        id="avg_likes"
                        name="avg_likes"
                        type="text"
                        value={formData.avg_likes}
                        onChange={handleMetricsChange}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reach">Average Reach</Label>
                      <Input
                        id="reach"
                        name="reach"
                        type="text"
                        value={formData.reach}
                        onChange={handleMetricsChange}
                        placeholder="0"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview - make wider */}
          <div className="w-full md:w-3/5 md:sticky md:top-20 h-fit">
            <MediaKitPreview
              key={`preview-${formData.profile_photo}-${formData.tagline}`}
              previewData={mediaKitPreviewData}
              theme={getPreviewTheme()}
              tagline={formData.tagline || "Your Tagline"}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 