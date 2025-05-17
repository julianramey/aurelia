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
import type { 
  Profile, 
  MediaKitData,
  MediaKitStats, 
  Service, 
  BrandCollaboration, 
  SocialPlatform, 
  ColorScheme,
  VideoItem, 
  EditableSection,
  SectionVisibilityState,
  TemplateTheme,      // Import from types.ts
  EditorPreviewData   // Import from types.ts
} from '@/lib/types';
import type { DefaultSpecificData } from '@/components/media-kit-templates/MediaKitTemplateDefault';
import type { AestheticSpecificData } from '@/components/media-kit-templates/MediaKitTemplateAesthetic';
import type { LuxurySpecificData } from '@/components/media-kit-templates/MediaKitTemplateLuxury';
import {
  ArrowLeftIcon,
  SwatchIcon,
  UserIcon,
  ChartBarIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import { TrashIcon, XMarkIcon } from '@heroicons/react/24/solid';
import DashboardNav from '@/components/DashboardNav';
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { AtSymbolIcon, PhoneIcon } from '@heroicons/react/24/solid';
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import TemplateThumbnail from '@/components/media-kit-templates/TemplateThumbnail';
import { TEMPLATES } from '@/lib/templateRegistry';
import { SECTIONS, type EditorFormProps } from '@/lib/sections'; // <-- IMPORT SECTIONS and EditorFormProps
import PerformanceForm from '@/components/media-kit-editor-forms/PerformanceForm';
import { DEFAULT_COLORS } from '@/lib/placeholder-data';

// Ensure all form components are imported here:
import ProfileDetailsForm from '@/components/media-kit-editor-forms/ProfileDetailsForm';
import BrandExperienceForm from '@/components/media-kit-editor-forms/BrandExperienceForm';
import ServicesSkillsForm from '@/components/media-kit-editor-forms/ServicesSkillsForm';
import SocialMediaForm from '@/components/media-kit-editor-forms/SocialMediaForm';
import ContactDetailsForm from '@/components/media-kit-editor-forms/ContactDetailsForm';
import ProfilePictureForm from '@/components/media-kit-editor-forms/ProfilePictureForm';
import TikTokVideosForm from '@/components/media-kit-editor-forms/TikTokVideosForm';
import AudienceStatsForm from '@/components/media-kit-editor-forms/AudienceStatsForm';
import TemplateLibraryDialog from '@/components/media-kit-editor/TemplateLibraryDialog'; // +++ ADD IMPORT
import ThemeEditorCard from '@/components/media-kit-editor/ThemeEditorCard'; // +++ IMPORT ThemeEditorCard

// TRACK (the pill background)
const TRACK = [
  "relative inline-flex h-6 w-11 rounded-full p-1 transition-colors",
  "bg-gray-300",                        // OFF
  "data-[state=checked]:bg-black",      // ON
].join(" ");

// THUMB (the little circle)
const THUMB = [
  "block h-4 w-4 rounded-full bg-white shadow",      // base
  "transition-transform duration-200",                // animation
  "data-[state=checked]:translate-x-5",               // move it
].join(" ");

// Define the default visibility state
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

// fetch TikTok oEmbed thumbnail URL
async function fetchTikTokThumbnail(url: string): Promise<string> {
  try {
    const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`)
    const { thumbnail_url } = await res.json()
    return thumbnail_url
  } catch {
    return ''
  }
}

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

// Update MediaKitPreviewProps to use the new preview data type
interface MediaKitPreviewProps {
  data: EditorPreviewData | null; // Use the new preview type
  theme: TemplateTheme;
  templateId: string; 
}

// Add a separate Preview component to isolate and force re-renders
// --- Update MediaKitPreview component to render dynamically ---
const MediaKitPreview = ({ data, theme, templateId }: MediaKitPreviewProps) => {
  if (!data) return null;

  const template = TEMPLATES.find(t => t.id === templateId);

  if (!template) {
    const defaultTemplateEntry = TEMPLATES.find(t => t.id === 'default');
    if (defaultTemplateEntry) {
      return <defaultTemplateEntry.Component data={data} theme={theme} section_visibility={data.section_visibility} />;
    }
    return <div>Error: Template not found and default template missing.</div>;
  }

  // template.Component expects { data: SpecificData | null, theme: SpecificTheme }
  // We are passing { data: EditorPreviewData | null, theme: TemplateTheme }
  // This is now okay because individual template components props were changed to accept EditorPreviewData.
  // And SpecificTheme extends TemplateTheme.
  return <template.Component data={data} theme={theme} section_visibility={data.section_visibility} />;
};

// --- Define Equalized Individual Color Swatches (12 each) --- 
const backgroundSwatches = [
  { name: 'Cloud White', hex: '#FFFFFF' }, { name: 'Snow Drift', hex: '#F9FAFB' },
  { name: 'Soft Linen', hex: '#F8F8F4' }, { name: 'Pale Stone', hex: '#F0F0F0' },
  { name: 'Oyster Gray', hex: '#EAEAEA' }, { name: 'Cool Concrete', hex: '#DCDCDC' },
  { name: 'Light Beige', hex: '#F5F5DC' }, { name: 'Creamy Ivory', hex: '#FFFDD0' },
  { name: 'Rose Quartz Tint', hex: '#FAF0E6' }, { name: 'Mint Whisper', hex: '#F0FFF4' },
  { name: 'Sky Tint', hex: '#F0F8FF' }, { name: 'Light Lilac', hex: '#E6E6FA' },
];
const textSwatches = [
  { name: 'Obsidian', hex: '#000000' }, { name: 'Ink Black', hex: '#1A202C' },
  { name: 'Midnight', hex: '#222222' }, { name: 'Deep Slate', hex: '#2D3748' },
  { name: 'Charcoal', hex: '#333333' }, { name: 'Graphite', hex: '#555555' },
  { name: 'Espresso Brown', hex: '#4A2E2E' }, { name: 'Navy Depth', hex: '#000080' },
  { name: 'Forest Green', hex: '#228B22' }, { name: 'Burgundy', hex: '#800020' },
  { name: 'Plum Velvet', hex: '#5A2D5A' }, { name: 'Dark Teal', hex: '#005050' },
];
const secondarySwatches = [
  { name: 'Silver Mist', hex: '#C0C0C0' }, { name: 'Stone Gray', hex: '#A0AEC0' },
  { name: 'Cool Metal', hex: '#718096' }, { name: 'Warm Taupe', hex: '#8A837C' },
  { name: 'Dusty Blue', hex: '#8C9BAB' }, { name: 'Steel Blue', hex: '#4682B4' },
  { name: 'Sage Green', hex: '#9DC183' }, { name: 'Olive Drab', hex: '#6B8E23' },
  { name: 'Clay Brown', hex: '#B87333' }, { name: 'Lavender Gray', hex: '#BDB0D0' },
  { name: 'Rose Dust', hex: '#B28484' }, { name: 'Muted Teal', hex: '#66A5AD' },
];
const accentLightSwatches = [
  { name: 'Lavender Mist', hex: '#EAE6FF' }, { name: 'Blush Pink', hex: '#FFF0F5' },
  { name: 'Peach Puff', hex: '#FFF0DB' }, { name: 'Butter Yellow', hex: '#FFFACD' },
  { name: 'Seafoam Hint', hex: '#E6FFFA' }, { name: 'Mint Cream', hex: '#F5FFFA' },
  { name: 'Baby Blue', hex: '#ADD8E6' }, { name: 'Powder Blue', hex: '#B0E0E6' },
  { name: 'Lilac Breeze', hex: '#D8BFD8' }, { name: 'Coral Tint', hex: '#FFE4E1' },
  { name: 'Champagne', hex: '#F7E7CE' }, { name: 'Vanilla Cream', hex: '#FFF8DC' },
];
const accentSwatches = [
  { name: 'Royal Purple', hex: '#7E69AB' }, { name: 'Amethyst', hex: '#9966CC' },
  { name: 'Deep Indigo', hex: '#4C51BF' }, { name: 'Ocean Blue', hex: '#0077CC' },
  { name: 'Emerald Green', hex: '#38A169' }, { name: 'Teal Burst', hex: '#008080' },
  { name: 'Ruby Red', hex: '#DC143C' }, { name: 'Magenta Pop', hex: '#FF00FF' },
  { name: 'Sunset Orange', hex: '#DD6B20' }, { name: 'Golden Yellow', hex: '#FFDA63' },
  { name: 'Chocolate Brown', hex: '#7B3F00' }, { name: 'Slate Gray', hex: '#708090' },
];

// Map keys to their swatch arrays
const swatchMap: Record<keyof ColorScheme, { name: string; hex: string }[]> = {
  background: backgroundSwatches,
  text: textSwatches,
  secondary: secondarySwatches,
  accent_light: accentLightSwatches,
  accent: accentSwatches,
  primary: accentSwatches, // Add primary, maybe reuse accent or create specific primary swatches
};

// Add this near the top, perhaps after imports
// TRACK (background)
const switchTrackClass =
  "relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 p-1 " +
  "data-[state=checked]:bg-black transition-colors";

// THUMB (circle)
const switchThumbClass =
  "block h-4 w-4 rounded-full bg-white shadow transform " +
  "transition-transform duration-200 data-[state=checked]:translate-x-5";

// --- Define a specific type for the form state --- 
interface EditorFormData {
  brand_name: string;
  tagline: string;
  colors: ColorScheme;
  font: string;
  personal_intro: string;
  instagram_handle: string;
  tiktok_handle: string;
  portfolio_images: string[];
  brand_collaborations_text: string; // Raw text
  services_text: string; // Raw text
  skills_text: string; // Raw text
  follower_count: string | number;
  engagement_rate: string | number;
  avg_likes: string | number;
  reach: string | number;
  email: string; // Contact email
  profile_photo: string; // URL
}

export default function MediaKitEditor() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, loading: profileLoading, error: profileError, updateProfile } = useProfile();
  const { 
    stats, 
    collaborations, 
    services, 
    portfolio,
    videos: dbVideos, // Rename fetched videos to avoid conflict
    loading: mediaKitLoading,
    error: mediaKitError,
    updateStats,
    updateCollaborations,
    updateServices,
    refetch
  } = useMediaKitData();
  
  // State for selected template
  const [selectedTemplateId, setSelectedTemplateId] = useState('default'); 
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [templateLibraryOpen, setTemplateLibraryOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState('branding');
  const [isSaving, setIsSaving] = useState(false);
  // Define sectionVisibility state *before* useMemo
  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibilityState>(defaultSectionVisibility);
  
  // --- Use the specific type for formData state --- 
  const [formData, setFormData] = useState<EditorFormData>({
    brand_name: '',
    tagline: '',
    colors: COLOR_PRESETS[0].colors,
    font: 'Inter',
    personal_intro: '', 
    instagram_handle: '',
    tiktok_handle: '',
    portfolio_images: [], 
    brand_collaborations_text: '', 
    services_text: '', 
    skills_text: '', 
    follower_count: '',
    engagement_rate: '',
    avg_likes: '',
    reach: '',
    email: '',
    profile_photo: '', 
  });
  
  // hold up to 5 TikTok links + thumbnails
  const [videoLinks, setVideoLinks] = useState<VideoItem[]>([]);
  
  // Map formComponentName strings to actual components
  const formComponentMap: Record<string, React.FC<EditorFormProps>> = {
    ProfileDetailsForm: ProfileDetailsForm,
    BrandExperienceForm: BrandExperienceForm,
    ServicesSkillsForm: ServicesSkillsForm,
    SocialMediaForm: SocialMediaForm,
    ContactDetailsForm: ContactDetailsForm,
    ProfilePictureForm: ProfilePictureForm,
    TikTokVideosForm: TikTokVideosForm,
    AudienceStatsForm: AudienceStatsForm,
    PerformanceForm: PerformanceForm,
  };

  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  useEffect(() => {
    if (formData && !initialDataLoaded) {
      setInitialDataLoaded(true);
    }
  }, [formData, initialDataLoaded]);

  // --- Update getPreviewTheme to match TemplateTheme structure --- 
  const getPreviewTheme = (): TemplateTheme => ({
    background: formData.colors.background || '#F5F5F5',
    foreground: formData.colors.text || '#1A1F2C',
    primary:    formData.colors.accent || '#7E69AB',
    primaryLight: formData.colors.accent_light || '#E5DAF8',
    secondary:  formData.colors.secondary || '#6E59A5',
    accent:     formData.colors.accent || '#7E69AB', // Often same as primary
    neutral:    formData.colors.secondary || '#8E9196', // Often use secondary
    border:     `${formData.colors.accent || '#7E69AB'}33`, // Primary with opacity
  });

  useEffect(() => {
    console.log('Updated colors:', formData.colors);
  }, [formData.colors]);

  const debouncedUpdateStatsRef = useRef<ReturnType<typeof debounce> | null>(null);
  const debouncedUpdateCollaborationsRef = useRef<ReturnType<typeof debounce> | null>(null);
  const debouncedUpdateServicesRef = useRef<ReturnType<typeof debounce> | null>(null);

  useEffect(() => {
    let initialData: Partial<EditorFormData> = {};
    if (profile) {
      // Get media_kit_data properly parsed
      const mediaKitData = typeof profile.media_kit_data === 'string' 
        ? JSON.parse(profile.media_kit_data) 
        : profile.media_kit_data || {};
        
      console.log("LOADING DATA - Data sources:", {
        media_kit_data_type: typeof profile.media_kit_data,
        parsed_media_kit_data: mediaKitData,
        colors_from_media_kit: mediaKitData?.colors,
        tagline_from_media_kit: mediaKitData?.tagline,
      });
        
      initialData = {
        ...initialData,
        brand_name: profile.full_name || '',
        personal_intro: profile.personal_intro || '',
        instagram_handle: profile.instagram_handle ? `@${profile.instagram_handle}` : '',
        tiktok_handle: profile.tiktok_handle ? `@${profile.tiktok_handle}` : '',
        skills_text: mediaKitData?.skills ? mediaKitData.skills.join(', ') : '',
        tagline: mediaKitData?.tagline || '',
        colors: mediaKitData?.colors || COLOR_PRESETS[0].colors,
        font: mediaKitData?.font || 'Inter',
        email: mediaKitData?.contact_email || profile.email || '',
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
        brand_collaborations_text: collabNames.join(', ')
      };
    }
    if (services.length > 0) {
      const serviceNames = services.map(s => s.service_name);
      initialData = {
        ...initialData,
        services_text: serviceNames.join(', ')
      };
    }
    
    // IMPORTANT: Load the colors from initialData, not prev.colors!
    setFormData(prev => ({ 
      ...prev, 
      ...initialData,
      // Ensure tagline is explicitly pulled from mediaKitData 
      tagline: initialData.tagline || prev.tagline,
      // Use the colors from mediaKitData, not prev.colors
      colors: initialData.colors || prev.colors 
    }));

    // Set selectedTemplateId from saved data if available
    if (profile?.media_kit_data) {
      try {
        const mediaKitDataObj = typeof profile.media_kit_data === 'string'
          ? JSON.parse(profile.media_kit_data)
          : profile.media_kit_data;
        
        // Use optional chaining for safer access
        const savedTemplateId = mediaKitDataObj?.selected_template_id;
        
        if (savedTemplateId) {
          console.log("Loading previously saved template ID:", savedTemplateId);
          setSelectedTemplateId(savedTemplateId);
        }
      } catch (error) {
        console.error("Error parsing saved template ID:", error);
      }
    }

  }, [profile, stats, collaborations, services, refetch]);

  // Add debug logging for colors changes
  useEffect(() => {
    console.log("Colors updated in formData:", formData.colors);
  }, [formData.colors]);

  useEffect(() => {
    if (!profile?.id) return;
    supabase
      .from('media_kit_videos')
      .select('url, thumbnail_url')
      .eq('profile_id', profile.id)
      .then(({ data, error }) => {
        if (error) {
          console.error('Error loading TikTok videos:', error);
        } else {
          setVideoLinks(data || []);
        }
      });
  }, [profile?.id]);

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
    }));
  };

  // +++ RESTORED handleVisibilityChange +++
  const handleVisibilityChange = (section: EditableSection, checked: boolean) => {
    setSectionVisibility(prev => ({ ...prev, [section]: checked }));
  };

  // +++ RESTORED Video Handlers +++
  const handleAddVideo = () => {
    if (videoLinks.length < 5) { 
      setVideoLinks(prev => [...prev, { url: '', thumbnail_url: '' }]); 
    } else { 
      toast({ title: "Limit Reached", description: "You can add a maximum of 5 videos.", variant: "default" }); 
    }
  };

  const handleRemoveVideo = async (idx: number) => { 
    setVideoLinks(prev => prev.filter((_, i) => i !== idx)); 
    // If direct DB deletion is needed on remove, add logic here, e.g.:
    // const videoToRemove = videoLinks[idx]; // Get before state update
    // if (profile?.id && videoToRemove?.url) { /* supabase.delete logic */ }
  };

  const handleVideoUrlChange = async (idx: number, url: string) => {
    const newVideoLinks = [...videoLinks]; 
    const oldVideoData = newVideoLinks[idx];
    newVideoLinks[idx] = { ...oldVideoData, url };
    
    if (url && (url.includes('tiktok.com') || url.includes('youtube.com') || url.includes('youtu.be'))) {
      if (url.includes('tiktok.com')) { 
         try { 
            const thumbnailUrl = await fetchTikTokThumbnail(url); 
            newVideoLinks[idx].thumbnail_url = thumbnailUrl || 'https://via.placeholder.com/150/000000/FFFFFF?text=Video';
        } catch (e) { 
            console.error("Error fetching TikTok thumbnail:", e); 
            newVideoLinks[idx].thumbnail_url = 'https://via.placeholder.com/150/000000/FFFFFF?text=Error';
        }
      } else { 
        newVideoLinks[idx].thumbnail_url = oldVideoData.thumbnail_url || 'https://via.placeholder.com/150/000000/FFFFFF?text=Video';
      }
    } else if (!url) { 
      newVideoLinks[idx].thumbnail_url = ''; 
    }
    setVideoLinks(newVideoLinks);
  };
  // --- End Restored Video Handlers ---
  
  // --- Updated handleSave function ---
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Parse arrays from formData text inputs
      const skillsArray = formData.skills_text ? formData.skills_text.split(',').map(item => item.trim()).filter(Boolean) : [];
      const servicesArray = formData.services_text ? formData.services_text.split(',').map(item => item.trim()).filter(Boolean) : [];
      const collabsArray = formData.brand_collaborations_text ? formData.brand_collaborations_text.split(',').map(item => item.trim()).filter(Boolean) : [];

      // Construct the MediaKitData object to save
      // Ensure it matches the MediaKitData interface from types.ts
      const dataToSave: MediaKitData = {
        type: 'media_kit_data',
        brand_name: formData.brand_name,
        tagline: formData.tagline || '',
        colors: formData.colors, // Use current colors state
        font: formData.font || 'Inter',
        selected_template_id: selectedTemplateId,
        profile_photo: formData.profile_photo || undefined,
        personal_intro: formData.personal_intro || '',
        skills: skillsArray,
        // Save handles without the '@' prefix
        instagram_handle: formData.instagram_handle?.replace('@', '') || undefined,
        tiktok_handle: formData.tiktok_handle?.replace('@', '') || undefined,
        portfolio_images: formData.portfolio_images || [],
        videos: videoLinks, // Use current videoLinks state
        contact_email: formData.email || '',
        section_visibility: sectionVisibility, // Use current visibility state
        last_updated: new Date().toISOString(),
      };
      
      console.log("💾 Saving MediaKitData:", dataToSave);

      // Prepare profile updates 
      const updates: Partial<Profile> = {
        full_name: dataToSave.brand_name, // Sync top-level name
        avatar_url: dataToSave.profile_photo || profile?.avatar_url || undefined, // Sync avatar
        // Sync top-level handles for potential direct use/querying
        instagram_handle: dataToSave.instagram_handle,
        tiktok_handle: dataToSave.tiktok_handle,
        // Sync personal intro at top level?
        // personal_intro: dataToSave.personal_intro, 
        selected_template_id: dataToSave.selected_template_id,
        media_kit_data: dataToSave, // Save the whole blob
        updated_at: new Date().toISOString(),
      };
      
      console.log("💾 Updating Profile with:", updates);

      // --- Perform Updates --- 
      // 1. Update Profile table
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile?.id);
      if (updateError) {
        console.error("Profile update error:", updateError);
        throw updateError; // Throw to trigger catch block
      }
      console.log("✅ Profile updated successfully.");

      // 2. Update separate related tables (Stats, Collabs, Services, Videos)
      if (profile?.id) {
        const profileId = profile.id;
        console.log("🔄 Updating related tables for profile:", profileId);
        
        // Stats
        const statsData = {
           follower_count: parseFloat(String(formData.follower_count)) || 0,
           engagement_rate: parseFloat(String(formData.engagement_rate)) || 0,
           avg_likes: parseFloat(String(formData.avg_likes)) || 0,
           weekly_reach: parseFloat(String(formData.reach)) || 0,
           // Use existing values from stats hook as fallback if needed
           avg_comments: stats.find(s => s.platform === 'instagram')?.avg_comments || 0,
           monthly_impressions: stats.find(s => s.platform === 'instagram')?.monthly_impressions || 0
         };
         console.log("💾 Saving Stats:", statsData);
        await updateStats('instagram', statsData);
        
        // Collaborations (map to expected hook format)
        const collabsToSave = collabsArray.map(brand => ({ profile_id: profileId, brand_name: brand }));
        console.log("💾 Saving Collaborations:", collabsToSave);
        await updateCollaborations(collabsToSave);
        
        // Services (map to expected hook format)
        const servicesToSave = servicesArray.map(service => ({ profile_id: profileId, service_name: service }));
        console.log("💾 Saving Services:", servicesToSave);
        await updateServices(servicesToSave);
        
        // Videos (upsert logic)
        // 1. Filter out videos with blank URLs (User's Fix #1 preamble)
        const nonEmptyVideos = videoLinks.filter(v => v.url && v.url.trim() !== '');

        if (nonEmptyVideos.length > 0) {
          // Fix 1: Only upsert non-empty videos
          console.log("💾 Upserting non-empty Videos:", nonEmptyVideos);
          const { error: upsertError } = await supabase
            .from('media_kit_videos')
            .upsert(
              nonEmptyVideos.map(v => ({ 
                profile_id: profileId, 
                url: v.url, 
                thumbnail_url: v.thumbnail_url 
              })),
              { onConflict: 'profile_id,url' }
            );
          if (upsertError) {
            console.error("Error upserting videos:", upsertError);
            // Optionally throw error or display a more specific toast
          }
        } else {
          // If there are no non-empty videos, it means the user intends to clear all videos.
          // This handles cases where videoLinks was initially empty, or all URLs were cleared.
          console.log("ℹ️ No non-empty videos to save. Clearing all videos for profile:", profileId);
          const { error: deleteAllError } = await supabase
            .from('media_kit_videos')
            .delete()
            .eq('profile_id', profileId);
          if (deleteAllError) {
            console.error("Error deleting all videos for profile:", deleteAllError);
          }
        }

        // Fix 2: Explicitly delete any remaining blank-URL rows for this profile.
        // This acts as a cleanup for any legacy data or edge cases where url might be ''.
        console.log("🧹 Cleaning up any blank URL video rows for profile:", profileId);
        const { error: deleteBlankError } = await supabase
          .from('media_kit_videos')
          .delete()
          .match({ profile_id: profileId, url: '' }); 
        if (deleteBlankError) {
            console.error("Error cleaning up blank URL videos:", deleteBlankError);
        }
      } else {
         console.warn("No profile ID available for updating related tables.");
      }

      // --- Post-Save Actions --- 
       toast({ title: 'Success', description: 'Media kit saved.' });
       localStorage.removeItem('updatedMediaKit'); 
       // Refetch data on the media kit page after saving
       // The navigate call might trigger a remount/refetch anyway depending on setup
       navigate('/media-kit', { replace: true }); 

    } catch (error) {
       console.error('Save error details:', error);
       toast({ title: 'Error', description: `Failed to save media kit: ${error.message || 'Unknown error'}`, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  // +++ RESTORED handleApplyTemplateFromDialog +++
  const handleApplyTemplateFromDialog = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setIsLibraryOpen(false); 
  };
  
  // UPDATED: mediaKitPreviewData now uses the registry for base data
  const mediaKitPreviewData = useMemo((): EditorPreviewData | null => {
    if (!profile) return null;

    const template = TEMPLATES.find(t => t.id === selectedTemplateId);
    // basePreviewData is SpecificData | {}
    const basePreviewData = template ? template.getPreviewData() : {}; 
    
    // getBaseProp now takes keyof EditorPreviewData
    const getBaseProp = <K extends keyof EditorPreviewData>(
      propName: K
    ): EditorPreviewData[K] | undefined => {
      if (template && basePreviewData && propName in basePreviewData) {
        // We trust that SpecificData fields align with EditorPreviewData fields
        return (basePreviewData as Partial<EditorPreviewData>)[propName] as EditorPreviewData[K];
      }
      return undefined;
    };
    
    const skillsArray = formData.skills_text 
      ? formData.skills_text.split(',').map(s => s.trim()).filter(Boolean) 
      : (getBaseProp('skills') || []);

    const previewBrandCollaborations: BrandCollaboration[] = formData.brand_collaborations_text
      ? formData.brand_collaborations_text.split(',').map((name, index) => ({
          id: `preview-collab-${index}`,
          profile_id: profile.id,
          brand_name: name.trim(),
        })).filter(c => c.brand_name)
      : (getBaseProp('brand_collaborations') || []);

    const previewServices: Service[] = formData.services_text
      ? formData.services_text.split(',').map((name, index) => ({
          id: `preview-service-${index}`,
          profile_id: profile.id,
          service_name: name.trim(),
        })).filter(s => s.service_name)
      : (getBaseProp('services') || []);

    return {
      id: profile.id,
      user_id: profile.user_id,
      username: profile.username || getBaseProp('username') || '', 
      avatar_url: formData.profile_photo || profile.avatar_url || getBaseProp('avatar_url') || '', 
      website: profile.website || getBaseProp('website') || '', 
      full_name: formData.brand_name || profile.full_name || getBaseProp('full_name') || '', 
      niche: profile.niche || getBaseProp('niche') || '', 
      media_kit_url: profile.media_kit_url || getBaseProp('media_kit_url') || '', 
      onboarding_complete: profile.onboarding_complete ?? getBaseProp('onboarding_complete') ?? false,
      email: profile.email || getBaseProp('email') || '',

      brand_name: formData.brand_name || getBaseProp('brand_name') || '',
      tagline: formData.tagline || getBaseProp('tagline') || '',
      colors: formData.colors, 
      font: formData.font || getBaseProp('font') || 'Inter',
      personal_intro: formData.personal_intro || getBaseProp('personal_intro') || '',
      skills: skillsArray, 
      instagram_handle: formData.instagram_handle || getBaseProp('instagram_handle') || '',
      tiktok_handle: formData.tiktok_handle || getBaseProp('tiktok_handle') || '', 
      portfolio_images: formData.portfolio_images?.length ? formData.portfolio_images : (getBaseProp('portfolio_images') || []), 
      videos: videoLinks?.length ? videoLinks : (getBaseProp('videos') || []), 
      contact_email: formData.email || getBaseProp('contact_email') || '',
      profile_photo: formData.profile_photo || getBaseProp('profile_photo') || profile.avatar_url || '',
      section_visibility: sectionVisibility, 
      selected_template_id: selectedTemplateId,
      
      follower_count: parseFloat(String(formData.follower_count)) || (getBaseProp('follower_count') as number) || 0,
      engagement_rate: parseFloat(String(formData.engagement_rate)) || (getBaseProp('engagement_rate') as number) || 0,
      avg_likes: parseFloat(String(formData.avg_likes)) || (getBaseProp('avg_likes') as number) || 0,
      reach: parseFloat(String(formData.reach)) || (getBaseProp('reach') as number) || 0,
      
      stats: stats?.length ? stats : (getBaseProp('stats') || []),
      brand_collaborations: previewBrandCollaborations, 
      services: previewServices,
      
      instagram_followers: getBaseProp('instagram_followers'),
      tiktok_followers: getBaseProp('tiktok_followers'),
      youtube_followers: getBaseProp('youtube_followers'),
      audience_age_range: getBaseProp('audience_age_range'),
      audience_location_main: getBaseProp('audience_location_main'),
      audience_gender_female: getBaseProp('audience_gender_female'),
      avg_video_views: getBaseProp('avg_video_views'),
      avg_ig_reach: getBaseProp('avg_ig_reach'),
      ig_engagement_rate: getBaseProp('ig_engagement_rate'),
      showcase_images: getBaseProp('showcase_images') || [],
      past_brands_text: getBaseProp('past_brands_text'),
      past_brands_image_url: getBaseProp('past_brands_image_url'),
      next_steps_text: getBaseProp('next_steps_text'),
      contact_phone: getBaseProp('contact_phone'),

      media_kit_data: null, 
    } as EditorPreviewData;
  }, [profile, formData, videoLinks, sectionVisibility, selectedTemplateId, stats, TEMPLATES]); 

  if (profileLoading || mediaKitLoading) { return <div>Loading...</div>; }
  
  if (profileError || mediaKitError) {
    let errorMessage = 'An unknown error occurred.';
    const errorToProcess = profileError || mediaKitError;

    if (typeof errorToProcess === 'string') {
      errorMessage = errorToProcess;
    } else if (errorToProcess && typeof errorToProcess === 'object' && 'message' in errorToProcess && typeof (errorToProcess as { message: unknown }).message === 'string') {
      // Now we know errorToProcess is an object and has a message property.
      // We still need to check if message is a string.
      errorMessage = (errorToProcess as { message: string }).message;
    }
    // If errorToProcess is an object without a string message, or some other type, it defaults to 'An unknown error occurred.'
    return <div>Error loading data: {errorMessage}</div>;
  }

  // --- Main Render --- 
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      {/* --- Re-add Navigation bar --- */}
      <div className="sticky top-0 z-50 bg-white border-b border-blush/20 shadow-sm">
         <div className="container mx-auto px-6 py-4">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-4">
               {/* Back Arrow Button */}
               <Button
                 variant="ghost"
                 size="icon"
                 onClick={() => navigate('/media-kit')} // Navigate back
               >
                 <ArrowLeftIcon className="h-5 w-5" />
               </Button>
               <h1 className="text-xl font-medium text-charcoal">
                 Edit Media Kit
               </h1>
             </div>
             <div className="flex gap-4">
               {/* Exit Button */}
               <Button
                 variant="outline"
                 onClick={async () => {
                   try {
                     await refetch(); // Refetch data before exiting
                     setTimeout(() => {
                       navigate('/media-kit');
                     }, 300); // Short delay
                   } catch (err) {
                     navigate('/media-kit'); // Navigate even if refetch fails
                   }
                 }}
                 disabled={isSaving}
               >
                 Exit
               </Button>
               {/* Save Changes Button */}
               <Button
                 onClick={handleSave}
                 className="bg-charcoal hover:bg-charcoal/90 text-white px-4 py-2 rounded-md" // Original styles
                 disabled={isSaving}
               >
                 {isSaving ? 'Saving...' : 'Save Changes'}
               </Button>
             </div>
           </div>
         </div>
      </div>
      {/* --- End Navigation bar --- */}
      
      <div className="container mx-auto p-4 md:p-8">
        {/* --- Template Library Trigger --- */} 
        {/* <DialogTrigger asChild> */}
          <Button 
            variant="outline" 
            className="mb-6 w-full md:w-auto"
            onClick={() => setIsLibraryOpen(true)} // Open the dialog
          >
              Choose Template
            </Button>
        {/* </DialogTrigger> */}
        
        <TemplateLibraryDialog
          open={isLibraryOpen}
          onOpenChange={setIsLibraryOpen}
          templatesRegistry={TEMPLATES}
          onApplyTemplate={handleApplyTemplateFromDialog}
        />

        {/* Editor Form and Live Preview Pane */} 
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-2/5 space-y-6">
            <Tabs defaultValue="branding" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="branding" className="flex items-center gap-2">
                  <SwatchIcon className="h-4 w-4" />
                  Branding
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  Content
                </TabsTrigger>
                <TabsTrigger value="media" className="flex items-center gap-2">
                  <PhotoIcon className="h-4 w-4" />
                  Media
                </TabsTrigger>
                <TabsTrigger value="metrics" className="flex items-center gap-2">
                  <ChartBarIcon className="h-4 w-4" />
                  Metrics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="branding" className="space-y-4">
                <ThemeEditorCard 
                  currentFormDataColors={formData.colors}
                  onFormDataColorsChange={(newColors) => setFormData(prev => ({ ...prev, colors: newColors }))}
                  colorPresetsConstant={COLOR_PRESETS} 
                  swatchMapConstant={swatchMap}
                />
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                {SECTIONS.filter(sec => sec.tab === 'content').map(section => {
                  const FormComponent = formComponentMap[section.formComponentName]; if (!FormComponent) return null;
                  const formProps: EditorFormProps = {
                    formData: formData,
                    profile: profile,
                    mediaKitData: profile?.media_kit_data || null,
                    colorPresets: COLOR_PRESETS,
                    handleInputChange: handleInputChange,
                    handleSocialChange: handleSocialChange,
                    handleMetricsChange: handleMetricsChange,
                    updateCollaborations: updateCollaborations,
                    updateServices: updateServices,
                    handleSkillsChange: handleSkillsChange,
                    onProfilePhotoChange: (url) => setFormData(prev => ({...prev, profile_photo: url})),
                    userId: profile?.id,
                    videoLinks: videoLinks,
                    handleAddVideo: handleAddVideo,
                    handleRemoveVideo: handleRemoveVideo,
                    handleVideoUrlChange: handleVideoUrlChange,
                    stats: stats,
                    sectionVisibility: sectionVisibility,
                    onVisibilityChange: handleVisibilityChange,
                    initialDataLoaded: initialDataLoaded,
                    handleBrandCollaborations: handleBrandCollaborations,
                    handleServicesChange: handleServicesChange,
                    setFormData: setFormData,
                    supabase: supabase,
                    toast: toast,
                    setVideoLinks: setVideoLinks
                  };
                  return (
                    <Card key={section.key}>
                      <CardHeader className="flex flex-row items-center justify-between py-4">
                        <div className="flex items-center gap-2"><section.icon className="h-5 w-5 text-gray-500" /><CardTitle>{section.label}</CardTitle></div>
                        <Switch checked={sectionVisibility[section.key]} onCheckedChange={checked => handleVisibilityChange(section.key, checked)} className={switchTrackClass}><span className={switchThumbClass} style={{ backgroundColor: "white" }} /></Switch>
                      </CardHeader>
                      {sectionVisibility[section.key] && <CardContent className="pt-4"><FormComponent {...formProps} /></CardContent>}
                    </Card>
                  );
                })}
              </TabsContent>

              <TabsContent value="media" className="space-y-4">
                {SECTIONS.filter(sec => sec.tab === 'media').map(section => {
                  const FormComponent = formComponentMap[section.formComponentName]; if (!FormComponent) return null;
                  const formProps: EditorFormProps = {
                    formData,
                    profile,
                    mediaKitData: profile?.media_kit_data || null,
                    colorPresets: COLOR_PRESETS,
                    handleInputChange,
                    handleSocialChange,
                    handleMetricsChange,
                    updateCollaborations,
                    updateServices,
                    handleSkillsChange,
                    onProfilePhotoChange: (url) => setFormData(prev => ({...prev, profile_photo: url})),
                    userId: profile?.id,
                    videoLinks,
                    handleAddVideo,
                    handleRemoveVideo,
                    handleVideoUrlChange,
                    stats,
                    sectionVisibility,
                    onVisibilityChange: handleVisibilityChange,
                    initialDataLoaded,
                    setFormData,
                    supabase,
                    toast,
                    setVideoLinks
                  };
                  return (
                    <Card key={section.key}>
                      <CardHeader className="flex flex-row items-center justify-between py-4">
                        <div className="flex items-center gap-2"><section.icon className="h-5 w-5 text-gray-500" /><CardTitle>{section.label}</CardTitle></div>
                        <Switch checked={sectionVisibility[section.key]} onCheckedChange={checked => handleVisibilityChange(section.key, checked)} className={switchTrackClass}><span className={switchThumbClass} style={{ backgroundColor: "white" }} /></Switch>
                      </CardHeader>
                      {sectionVisibility[section.key] && <CardContent className="pt-4"><FormComponent {...formProps} /></CardContent>}
                    </Card>
                  );
                })}
              </TabsContent>

              <TabsContent value="metrics" className="space-y-4">
                 {SECTIONS.filter(sec => sec.tab === 'metrics').map(section => {
                  const FormComponent = formComponentMap[section.formComponentName]; if (!FormComponent) return null;
                  const formProps: EditorFormProps = {
                    formData,
                    profile,
                    mediaKitData: profile?.media_kit_data || null,
                    colorPresets: COLOR_PRESETS,
                    handleInputChange,
                    handleSocialChange,
                    handleMetricsChange,
                    updateCollaborations,
                    updateServices,
                    handleSkillsChange,
                    onProfilePhotoChange: (url) => setFormData(prev => ({...prev, profile_photo: url})),
                    userId: profile?.id,
                    videoLinks,
                    handleAddVideo,
                    handleRemoveVideo,
                    handleVideoUrlChange,
                    stats,
                    sectionVisibility,
                    onVisibilityChange: handleVisibilityChange,
                    initialDataLoaded,
                    toast
                  };
                  return (
                    <Card key={section.key}>
                      <CardHeader className="flex flex-row items-center justify-between py-4">
                        <div className="flex items-center gap-2"><section.icon className="h-5 w-5 text-gray-500" /><CardTitle>{section.label}</CardTitle></div>
                        <Switch checked={sectionVisibility[section.key]} onCheckedChange={checked => handleVisibilityChange(section.key, checked)} className={switchTrackClass}><span className={switchThumbClass} style={{ backgroundColor: "white" }} /></Switch>
                      </CardHeader>
                      {sectionVisibility[section.key] && <CardContent className="pt-4"><FormComponent {...formProps} /></CardContent>}
                    </Card>
                  );
                })}
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview - make wider */}
          <div className="w-full md:w-3/5 md:sticky md:top-20 h-fit">
            <MediaKitPreview
              key={`preview-${selectedTemplateId}-${formData.brand_name}-${formData.profile_photo}-${formData.tagline}-${JSON.stringify(formData.colors)}`} // Added colors to key for re-render
              data={mediaKitPreviewData}
              theme={getPreviewTheme()}
              templateId={selectedTemplateId}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 