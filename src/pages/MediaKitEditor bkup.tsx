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
import MediaKitTemplateDefault from '@/components/media-kit-templates/MediaKitTemplateDefault';
import MediaKitTemplateAesthetic from '@/components/media-kit-templates/MediaKitTemplateAesthetic';
import MediaKitTemplateLuxury from '@/components/media-kit-templates/MediaKitTemplateLuxury'; // Import the new Luxury template
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
  SectionVisibilityState
} from '@/lib/types';
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
import type { MediaKitTemplateDefaultProps, TemplateData as DefaultTemplateData } from '@/components/media-kit-templates/MediaKitTemplateDefault'; 
import type { MediaKitTemplateAestheticProps, ExtendedProfilePreview as AestheticTemplateData } from '@/components/media-kit-templates/MediaKitTemplateAesthetic'; 
import type { MediaKitTemplateLuxuryProps, LuxuryTemplateData } from '@/components/media-kit-templates/MediaKitTemplateLuxury'; // Import props and LuxuryTemplateTheme for Luxury template
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import TemplateThumbnail from '@/components/media-kit-templates/TemplateThumbnail'; // Import the new thumbnail component
import { getPlaceholderData, DEFAULT_COLORS } from '@/lib/placeholder-data'; // ADD THIS IMPORT

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

// Interface for the theme styles (matching TemplateTheme in default template)
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

// Refined EditorPreviewData type
// CORRECTED Omit: Add back 'created_at' and 'updated_at' to Omit, as they are not typically part of preview data.
// media_kit_data is now an explicit property, not omitted from Profile here.
type EditorPreviewData = Omit<Profile, 'created_at' | 'updated_at' | 'services' | 'brand_collaborations'> & {
  // Directly include fields derived from formData for live preview
  brand_name: string;
  tagline: string;
  colors: ColorScheme;
  font: string;
  personal_intro: string;
  skills: string[];
  brand_collaborations: BrandCollaboration[];
  services: Service[];
  instagram_handle: string;
  tiktok_handle: string;
  portfolio_images: string[];
  videos: VideoItem[];
  contact_email: string;
  section_visibility: SectionVisibilityState;
  // Metrics
  follower_count: number; // This is a general one, Luxury also has platform-specific string versions
  engagement_rate: number; // General, Luxury has platform-specific string version
  avg_likes: number; // General
  reach: number; // General, Luxury has platform-specific string version
  stats: MediaKitStats[];
  profile_photo?: string;
  selected_template_id?: string;

  // Luxury Template Specific Fields (for comprehensive preview)
  instagram_followers?: string | number;
  tiktok_followers?: string | number;
  youtube_followers?: string | number;
  audience_age_range?: string;
  audience_location_main?: string;
  audience_gender_female?: string;
  avg_video_views?: string | number;
  avg_ig_reach?: string | number;
  ig_engagement_rate?: string | number;
  showcase_images?: string[];
  past_brands_text?: string;
  past_brands_image_url?: string;
  next_steps_text?: string;

  // ADDED: Explicit media_kit_data to satisfy Profile-based types, even if templates primarily use flattened fields.
  // Templates should ideally not rely on this nested structure for preview data if flattened data is available.
  media_kit_data: MediaKitData | null; 
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

  let TemplateComponent;
  switch (templateId) {
    case 'aesthetic':
      TemplateComponent = MediaKitTemplateAesthetic;
      break;
    case 'luxury': // Add luxury case
      TemplateComponent = MediaKitTemplateLuxury;
      break;
    default: // Default case
      TemplateComponent = MediaKitTemplateDefault;
      break;
  }

  // Ensure the props passed match what the selected component expects.
  // This might require a more sophisticated props mapping or ensuring all templates 
  // can handle a superset of props, or a union type for props.
  // For now, assuming MediaKitTemplateLuxuryProps is compatible with the shape of 'data' and 'theme'.
  return <TemplateComponent data={data as any} theme={theme} />; 
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
  
  // --- Add State for Detailed Preview --- 
  const [detailedPreviewTemplateId, setDetailedPreviewTemplateId] = useState<string | null>(null);
  
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
  
  // --- Add State for Color Picker --- 
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  // State to hold colors being edited in the dialog
  const [currentCustomColors, setCurrentCustomColors] = useState<ColorScheme>(formData.colors);
  // --- State for Saved Themes Dialog --- 
  const [isSavedThemesOpen, setIsSavedThemesOpen] = useState(false);

  const [templateLibraryOpen, setTemplateLibraryOpen] = useState(false);
  const [selectedTemplateForDialog, setSelectedTemplateForDialog] = useState<string | null>(null);
  
  const availableTemplates = [
    { id: 'default', name: 'Default', component: MediaKitTemplateDefault, propsType: {} as MediaKitTemplateDefaultProps },
    { id: 'aesthetic', name: 'Aesthetic', component: MediaKitTemplateAesthetic, propsType: {} as MediaKitTemplateAestheticProps },
    { id: 'luxury', name: 'Luxury', component: MediaKitTemplateLuxury, propsType: {} as MediaKitTemplateLuxuryProps }, // Add Luxury here
  ];

  // Add a loading state for initial data fetch
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
    let initialData: Partial<MediaKitData & { email: string, profile_photo: string, video_links: string }> = {};
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

  // --- Helper Functions for Template Library --- 
  const getTemplateComponent = (templateId: string | null) => {
    if (templateId === 'aesthetic') return MediaKitTemplateAesthetic;
    if (templateId === 'luxury') return MediaKitTemplateLuxury;
    return MediaKitTemplateDefault;
  };

  const getPlaceholderTheme = (templateId: string | null): TemplateTheme | LuxuryTemplateTheme => {
    const placeholder = getPlaceholderData(templateId);
    // Use placeholder.colors if available, otherwise DEFAULT_COLORS from placeholder-data.ts
    const colors = placeholder.colors || DEFAULT_COLORS; 
    const primary = colors.accent || '#7E69AB';

    const baseTheme: TemplateTheme = {
      background: colors.background,
      foreground: colors.text, 
      primary: primary,
      primaryLight: colors.accent_light,
      secondary: colors.secondary, 
      accent: colors.accent || '#7E69AB',
      neutral: colors.secondary, 
      border: `${primary}33`
    };

    if (templateId === 'luxury') {
      // For luxury, placeholder.colors should ideally conform to LuxuryTemplateTheme's color part if specific
      // or we map from baseTheme and add luxury specifics.
      // Let's assume placeholder.colors for luxury includes all necessary fields or they default well from baseTheme.
      const luxurySpecificColors = placeholder.colors as Partial<LuxuryTemplateTheme>; // Cast for easier access
      return {
        ...baseTheme, // Start with base mapped colors
        cardBackground: luxurySpecificColors?.cardBackground || '#1F1F1F', // Darker default for luxury card
        textPrimary: luxurySpecificColors?.textPrimary || colors.text,
        textSecondary: luxurySpecificColors?.textSecondary || colors.secondary,
        textMuted: luxurySpecificColors?.textMuted || '#909090',
        borderLight: luxurySpecificColors?.borderLight || '#3A3A3A',
        // Ensure all other TemplateTheme fields are present from baseTheme if not overridden by luxurySpecifics
      } as LuxuryTemplateTheme;
    }
    return baseTheme;
  };

  // Helper to create a base EditorPreviewData structure from placeholder for THUMBNAILS
  const getThumbnailPreviewData = (templateId: string): EditorPreviewData => {
    const placeholder = getPlaceholderData(templateId);
    return {
      id: `thumb-profile-${templateId}`,
      user_id: `thumb-user-${templateId}`,
      username: placeholder.brand_name || 'Template User',
      full_name: placeholder.brand_name || "Template Preview",
      avatar_url: placeholder.profile_photo || 'https://via.placeholder.com/150',
      type: 'media_kit_data',
      brand_name: placeholder.brand_name || "Template Preview",
      tagline: placeholder.tagline || "Sample Tagline for Preview",
      colors: placeholder.colors || DEFAULT_COLORS, // Use DEFAULT_COLORS
      font: placeholder.font || "Inter, sans-serif",
      personal_intro: placeholder.personal_intro || "This is a sample introduction for the template preview.",
      skills: placeholder.skills || ['Skill 1', 'Skill 2'],
      instagram_handle: placeholder.instagram_handle || "@insta_preview",
      tiktok_handle: placeholder.tiktok_handle || "@tiktok_preview",
      portfolio_images: placeholder.portfolio_images || [],
      videos: placeholder.videos || [],
      contact_email: placeholder.contact_email || 'preview@example.com',
      section_visibility: placeholder.section_visibility || defaultSectionVisibility,
      // Safely access stats, defaulting to 0 or empty strings
      follower_count: parseFloat(String(placeholder.instagram_followers || '0')) || 0,
      engagement_rate: parseFloat(String(placeholder.ig_engagement_rate || '0')) || 0,
      avg_likes: parseFloat(String(placeholder.avg_likes || '0')) || 0, // avg_likes might not be in all placeholders
      reach: parseFloat(String(placeholder.avg_ig_reach || '0')) || 0,
      stats: [], 
      brand_collaborations: [], 
      services: [], 
      selected_template_id: templateId,
      profile_photo: placeholder.profile_photo || 'https://via.placeholder.com/150',
      media_kit_data: null, 
      instagram_followers: String(placeholder.instagram_followers || ''),
      tiktok_followers: String(placeholder.tiktok_followers || ''),
      youtube_followers: String(placeholder.youtube_followers || ''),
      audience_age_range: String(placeholder.audience_age_range || ''),
      audience_location_main: String(placeholder.audience_location_main || ''),
      audience_gender_female: String(placeholder.audience_gender_female || ''),
      avg_video_views: String(placeholder.avg_video_views || ''),
      avg_ig_reach: String(placeholder.avg_ig_reach || ''),
      ig_engagement_rate: String(placeholder.ig_engagement_rate || ''),
      showcase_images: placeholder.showcase_images || [],
      past_brands_text: placeholder.past_brands_text || '',
      past_brands_image_url: placeholder.past_brands_image_url || '',
      next_steps_text: placeholder.next_steps_text || '',
    } as EditorPreviewData;
  };
  
  // Type for the return of getDetailedPreviewTemplateData
  type DetailedPreviewDataType = DefaultTemplateData | AestheticTemplateData | LuxuryTemplateData | Profile;

  const getDetailedPreviewTemplateData = (templateId: string): DetailedPreviewDataType => {
    const placeholder = getPlaceholderData(templateId);
    const baseData = {
      id: `detail-profile-${templateId}`,
      user_id: `detail-user-${templateId}`,
      username: placeholder.brand_name || 'Template User',
      full_name: placeholder.brand_name || "Detailed Preview",
      avatar_url: placeholder.profile_photo || 'https://via.placeholder.com/300',
      email: placeholder.contact_email || 'detail@example.com',
      ...placeholder,
      media_kit_data: placeholder as MediaKitData, // Cast placeholder to MediaKitData for this field
    };

    // Ensure the returned object matches one of the types in DetailedPreviewDataType
    // This might mean adding/removing fields or casting, depending on the templateId
    // For simplicity, we can cast to 'any' here if structures are too different to reconcile easily in this step
    // or ensure baseData + placeholder is compatible enough.
    // The specific templates will ultimately determine if the data is usable.
    return baseData as any; // Keeping 'as any' for now due to complexity of specific template data shapes
  };
  // --- End Helper Functions for Template Library ---

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

  // --- useEffect to update currentCustomColors when dialog opens or formData.colors changes --- 
  useEffect(() => {
    // Reset custom colors to current form data when dialog opens
    // or if the main form data colors change externally
    setCurrentCustomColors(formData.colors);
  }, [formData.colors, isColorPickerOpen]); // Add isColorPickerOpen dependency

  // --- Handler for Color Input Change in Dialog --- 
  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentCustomColors(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // --- Handler to Apply Custom Colors from Dialog --- 
  const handleApplyCustomColors = () => {
    setFormData(prev => ({
      ...prev,
      colors: { ...currentCustomColors }
    }));
    setIsColorPickerOpen(false); // Close dialog
  };

  // --- Handler for Swatch Click --- 
  const handleSwatchClick = (key: keyof ColorScheme, hex: string) => {
    // Directly update the specific color key
    setCurrentCustomColors(prev => ({
      ...prev,
      [key]: hex
    }));
    // We could also directly update the main formData here if preferred,
    // but updating currentCustomColors keeps the dialog state consistent
  };

  // --- Handler for visibility toggle ---
  const handleVisibilityChange = (section: EditableSection, checked: boolean) => {
    setSectionVisibility(prev => ({
      ...prev,
      [section]: checked,
    }));
  };

  // ... (rest of handlers: handleTaglineChange etc.) ...

  // --- Loading / Error States --- 
  if (profileLoading || mediaKitLoading) {
     // ... loading skeleton ...
  }
  if (profileError || mediaKitError) {
     // ... error message ...
  }

  // --- ADD MISSING VIDEO HANDLERS (should be placed before they are used in JSX) ---
  const handleAddVideo = () => {
    if (videoLinks.length < 5) {
      setVideoLinks(prev => [...prev, { url: '', thumbnail_url: '' }]);
    } else {
      toast({ title: "Limit Reached", description: "You can add a maximum of 5 videos.", variant: "default" });
    }
  };

  const handleRemoveVideo = async (idx: number) => {
    setVideoLinks(prev => prev.filter((_, i) => i !== idx));
    // If these videos are also stored in a separate DB table and need to be deleted on removal:
    // const videoToRemove = videoLinks[idx];
    // if (profile?.id && videoToRemove.url) { /* ... supabase.delete logic ... */ }
  };

  const handleVideoUrlChange = async (idx: number, url: string) => {
    const newVideoLinks = [...videoLinks];
    const oldVideoData = newVideoLinks[idx];
    newVideoLinks[idx] = { ...oldVideoData, url };
    
    if (url && (url.includes('tiktok.com') || url.includes('youtube.com') || url.includes('youtu.be'))) {
      if (url.includes('tiktok.com')) { // Only try to fetch thumbnail for TikTok for now
         try {
            const thumbnailUrl = await fetchTikTokThumbnail(url);
            newVideoLinks[idx].thumbnail_url = thumbnailUrl || 'https://via.placeholder.com/150/000000/FFFFFF?text=Video';
        } catch (e) {
            console.error("Error fetching TikTok thumbnail:", e);
            newVideoLinks[idx].thumbnail_url = 'https://via.placeholder.com/150/000000/FFFFFF?text=Error';
        }
      } else {
        // For other platforms or if thumbnail fetch is not desired/fails, use a generic or keep old if present
        newVideoLinks[idx].thumbnail_url = oldVideoData.thumbnail_url || 'https://via.placeholder.com/150/000000/FFFFFF?text=Video';
      }
    } else if (!url) {
      newVideoLinks[idx].thumbnail_url = ''; // Clear thumbnail if URL is cleared
    }
    setVideoLinks(newVideoLinks);
  };
  // --- END MISSING VIDEO HANDLERS ---

  // --- DEFINE mediaKitPreviewData --- (Should be after all state setters it depends on, before return)
  const mediaKitPreviewData = useMemo((): EditorPreviewData | null => {
    if (!profile) return null;

    const placeholderForSpecifics = getPlaceholderData(selectedTemplateId);
    const skillsArray = formData.skills_text ? formData.skills_text.split(',').map(s => s.trim()).filter(Boolean) : [];
    const previewBrandCollaborations: BrandCollaboration[] = formData.brand_collaborations_text
      ? formData.brand_collaborations_text.split(',').map((name, index) => ({
          id: `preview-collab-${index}`,
          profile_id: profile.id,
          brand_name: name.trim(),
        })).filter(c => c.brand_name)
      : [];
    const previewServices: Service[] = formData.services_text
      ? formData.services_text.split(',').map((name, index) => ({
          id: `preview-service-${index}`,
          profile_id: profile.id,
          service_name: name.trim(),
        })).filter(s => s.service_name)
      : [];

    return {
      id: profile.id,
      user_id: profile.user_id,
      username: profile.username || '',
      avatar_url: profile.avatar_url,
      website: profile.website,
      full_name: profile.full_name || formData.brand_name,
      niche: profile.niche,
      media_kit_url: profile.media_kit_url,
      onboarding_complete: profile.onboarding_complete,
      type: 'media_kit_data',
      brand_name: formData.brand_name,
      tagline: formData.tagline,
      colors: formData.colors,
      font: formData.font,
      personal_intro: formData.personal_intro,
      skills: skillsArray,
      instagram_handle: formData.instagram_handle,
      tiktok_handle: formData.tiktok_handle,
      portfolio_images: formData.portfolio_images,
      videos: videoLinks,
      contact_email: formData.email,
      section_visibility: sectionVisibility,
      selected_template_id: selectedTemplateId,
      profile_photo: formData.profile_photo,
      follower_count: parseFloat(String(formData.follower_count)) || 0,
      engagement_rate: parseFloat(String(formData.engagement_rate)) || 0,
      avg_likes: parseFloat(String(formData.avg_likes)) || 0,
      reach: parseFloat(String(formData.reach)) || 0,
      stats: stats || [],
      brand_collaborations: previewBrandCollaborations,
      services: previewServices,
      // Luxury Template Specific Fields - Sourced from placeholder only for preview consistency
      instagram_followers: placeholderForSpecifics.instagram_followers,
      tiktok_followers: placeholderForSpecifics.tiktok_followers,
      youtube_followers: placeholderForSpecifics.youtube_followers,
      audience_age_range: placeholderForSpecifics.audience_age_range,
      audience_location_main: placeholderForSpecifics.audience_location_main,
      audience_gender_female: placeholderForSpecifics.audience_gender_female,
      avg_video_views: placeholderForSpecifics.avg_video_views,
      avg_ig_reach: placeholderForSpecifics.avg_ig_reach,
      ig_engagement_rate: placeholderForSpecifics.ig_engagement_rate,
      showcase_images: placeholderForSpecifics.showcase_images,
      past_brands_text: placeholderForSpecifics.past_brands_text,
      past_brands_image_url: placeholderForSpecifics.past_brands_image_url,
      next_steps_text: placeholderForSpecifics.next_steps_text,
      media_kit_data: null,
    } as EditorPreviewData;
  }, [
    profile, 
    formData, 
    videoLinks, 
    sectionVisibility, 
    selectedTemplateId, 
    stats,
  ]);
  // --- END DEFINE mediaKitPreviewData ---

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
        <Dialog 
           open={isLibraryOpen} 
           onOpenChange={(open) => {
             setIsLibraryOpen(open);
             if (!open) setDetailedPreviewTemplateId(null); // Reset detail view on close
           }}
         >
          <DialogTrigger asChild>
            <Button variant="outline" className="mb-6 w-full md:w-auto">
               Choose Template
             </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[80vw] h-[90vh] flex flex-col bg-white">
            <DialogHeader>
              <DialogTitle>Template Library</DialogTitle>
              <DialogDescription>
                {detailedPreviewTemplateId ? 'Previewing template. Click Apply to use it.' : 'Select a template for your media kit. Click Preview for details.'}
              </DialogDescription>
            </DialogHeader>

            {/* --- Conditional Rendering --- */} 
            {(() => { // Wrap in IIFE to add log
              console.log('Rendering DialogContent, detailedPreviewTemplateId:', detailedPreviewTemplateId);
              return detailedPreviewTemplateId ? (
                // --- Detailed Preview View --- 
                <div className="flex-1 flex flex-col overflow-hidden"> 
                  {/* --- Controls Header --- */} 
                  <div className="flex justify-between items-center p-4 bg-white"> 
                    {/* Back Button */} 
                    <button 
                      onClick={() => setDetailedPreviewTemplateId(null)} 
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                    >
                      <ArrowLeftIcon className="w-4 h-4" />
                      Back to Library
                    </button>
                    
                    {/* Apply Button */} 
                    <Button 
                      size="sm" 
                      className="bg-charcoal hover:bg-charcoal/90 text-white rounded-md"
                      onClick={() => {
                        setSelectedTemplateId(detailedPreviewTemplateId);
                        setDetailedPreviewTemplateId(null);
                        setIsLibraryOpen(false);
                      }}
                    >
                      Apply Template
                    </Button>
                  </div>

                  {/* --- Template Rendering Area --- */} 
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-100"> 
                    {(() => {
                      const ActualTemplateComponent = getTemplateComponent(detailedPreviewTemplateId);
                      const actualTheme = getPlaceholderTheme(detailedPreviewTemplateId);
                      const templateDataForDetailView = getDetailedPreviewTemplateData(detailedPreviewTemplateId);

                      if (detailedPreviewTemplateId === 'luxury' && ActualTemplateComponent === MediaKitTemplateLuxury) {
                        // Corrected prop type for luxury template data
                        return <MediaKitTemplateLuxury data={templateDataForDetailView as LuxuryTemplateData} theme={actualTheme as LuxuryTemplateTheme} />;
                        return <MediaKitTemplateLuxury data={templateDataForDetailView as LuxuryTemplateLuxuryProps['data']} theme={actualTheme as LuxuryTemplateTheme} />;
                      } else if (detailedPreviewTemplateId === 'aesthetic' && ActualTemplateComponent === MediaKitTemplateAesthetic) {
                        return <MediaKitTemplateAesthetic data={templateDataForDetailView as MediaKitTemplateAestheticProps['data']} theme={actualTheme as TemplateTheme} />;
                      } else if (ActualTemplateComponent === MediaKitTemplateDefault) { 
                        return <MediaKitTemplateDefault data={templateDataForDetailView as MediaKitTemplateDefaultProps['data']} theme={actualTheme as TemplateTheme} />;
                      }
                      // Fallback or error display if component doesn't match, though getTemplateComponent should handle defaults
                      return <div>Error: Could not determine template to render.</div>;
                    })()}
                  </div>
                </div>
              ) : (
                // --- Grid View --- 
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4 overflow-y-auto flex-1">
                  {/* Template 1: Default */}
                  <div 
                    className="relative border rounded-lg shadow-md hover:shadow-lg transition-shadow h-80 cursor-pointer overflow-hidden hover:[box-shadow:0_0_0_2px_rgba(126,105,171,0.3),0_0_20px_2px_rgba(126,105,171,0.3),0_0_40px_2px_rgba(126,105,171,0.2)] duration-300 ease-in-out"
                    onClick={() => setDetailedPreviewTemplateId('default')}
                  >
                    <TemplateThumbnail 
                      templateId="default" 
                      data={getThumbnailPreviewData('default')} 
                      theme={getPlaceholderTheme('default') as TemplateTheme} 
                    />
                    <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/70 via-black/50 to-transparent text-center">
                      <h3 className="font-semibold text-xl text-white mb-4">Classic Minimal</h3>
                      {/* Layered Pill Button Group - Centered */}
                      <div className="relative flex justify-center items-center h-10">
                         {/* Select Button (Back Layer - Wider) */}
                         <Button 
                           size="sm" 
                           className="absolute bg-rose hover:bg-rose/90 text-white font-semibold pl-6 pr-14 py-2 rounded-full shadow-md z-0 transform -translate-x-8"
                           onClick={(e) => { 
                             e.stopPropagation();
                             setSelectedTemplateId('default');
                             setIsLibraryOpen(false);
                           }}
                          >
                             Select
                           </Button>
                         {/* Preview Button (Front Layer - Standard Oval) */}
                         <Button 
                           size="sm" 
                           className="absolute bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-2 rounded-full shadow-md z-10 transform translate-x-10"
                           onClick={(e) => { e.stopPropagation(); setDetailedPreviewTemplateId('default'); }} 
                          >
                             Preview
                           </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Template 2: Aesthetic */}
                  <div 
                    className="relative border rounded-lg shadow-md hover:shadow-lg transition-shadow h-80 cursor-pointer overflow-hidden hover:[box-shadow:0_0_0_2px_rgba(126,105,171,0.3),0_0_20px_2px_rgba(126,105,171,0.3),0_0_40px_2px_rgba(126,105,171,0.2)] duration-300 ease-in-out"
                    onClick={() => setDetailedPreviewTemplateId('aesthetic')}
                   >
                     <TemplateThumbnail 
                       templateId="aesthetic" 
                       data={getThumbnailPreviewData('aesthetic')} 
                       theme={getPlaceholderTheme('aesthetic') as TemplateTheme} 
                     />
                     <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/70 via-black/50 to-transparent text-center">
                       <h3 className="font-semibold text-xl text-white mb-4">Modern Aesthetic</h3>
                       {/* Layered Pill Button Group - Centered */}
                       <div className="relative flex justify-center items-center h-10">
                         {/* Select Button (Back Layer - Wider) */}
                         <Button 
                           size="sm" 
                           className="absolute bg-rose hover:bg-rose/90 text-white font-semibold pl-6 pr-14 py-2 rounded-full shadow-md z-0 transform -translate-x-8"
                           onClick={(e) => { 
                             e.stopPropagation();
                             setSelectedTemplateId('aesthetic');
                             setIsLibraryOpen(false);
                           }}
                          >
                             Select
                           </Button>
                           {/* Preview Button (Front Layer - Standard Oval) */}
                         <Button 
                           size="sm" 
                           className="absolute bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-2 rounded-full shadow-md z-10 transform translate-x-10"
                           onClick={(e) => { e.stopPropagation(); setDetailedPreviewTemplateId('aesthetic'); }}
                          >
                             Preview
                           </Button>
                       </div>
                    </div>
                  </div>

                  {/* Template 3: Luxury */}
                  <div 
                    className="relative border rounded-lg shadow-md hover:shadow-lg transition-shadow h-80 cursor-pointer overflow-hidden hover:[box-shadow:0_0_0_2px_rgba(169,131,199,0.3),0_0_20px_2px_rgba(169,131,199,0.3),0_0_40px_2px_rgba(169,131,199,0.2)] duration-300 ease-in-out" // Adjusted shadow color slightly for luxury
                    onClick={() => setDetailedPreviewTemplateId('luxury')}
                  >
                    <TemplateThumbnail 
                      templateId="luxury" 
                      data={getPlaceholderData('luxury')}
                      theme={getPlaceholderTheme('luxury')} 
                    />
                    <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/70 via-black/50 to-transparent text-center">
                      <h3 className="font-semibold text-xl text-white mb-4">Elegant Luxury</h3>
                      {/* Layered Pill Button Group - Centered */}
                      <div className="relative flex justify-center items-center h-10">
                         {/* Select Button (Back Layer - Wider) */}
                         <Button 
                           size="sm" 
                           className="absolute bg-purple-600 hover:bg-purple-700 text-white font-semibold pl-6 pr-14 py-2 rounded-full shadow-md z-0 transform -translate-x-8" // Changed select button color for Luxury
                           onClick={(e) => { 
                             e.stopPropagation();
                             setSelectedTemplateId('luxury');
                             setIsLibraryOpen(false);
                           }}
                          >
                             Select
                           </Button>
                         {/* Preview Button (Front Layer - Standard Oval) */}
                         <Button 
                           size="sm" 
                           className="absolute bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-2 rounded-full shadow-md z-10 transform translate-x-10"
                           onClick={(e) => { e.stopPropagation(); setDetailedPreviewTemplateId('luxury'); }} 
                          >
                             Preview
                           </Button>
                      </div>
                    </div>
                  </div>
                  {/* Add more template entries here */}
                </div>
              );
            })()} 
          </DialogContent>
        </Dialog>
        {/* --- End Template Library --- */}

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
                <Card>
                  <CardHeader>
                    <CardTitle>Theme Colors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 mb-4"> {/* Add margin bottom */} 
                      {COLOR_PRESETS.map(preset => (
                        <button
                          key={preset.id}
                          onClick={() => handleColorPresetChange(preset)}
                          // Add a check: highlight if formData matches this preset
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

                    {/* Custom Colors Trigger + Dialog */}
                    <Dialog open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
                      <DialogTrigger asChild>
                        {/* Original Button/Card to trigger custom color picker */}
                        {(() => {
                          const isPresetActive = COLOR_PRESETS.some(p => JSON.stringify(p.colors) === JSON.stringify(formData.colors));
                          return (
                            <button
                              onClick={() => {
                                // Ensure current colors are loaded into dialog state on open
                                setCurrentCustomColors(formData.colors);
                                setIsColorPickerOpen(true);
                              }}
                              className={`w-full bg-white rounded-lg p-3 border transition-all ${ 
                                !isPresetActive // Highlight if custom
                                  ? 'border-rose shadow-lg scale-[1.02]'
                                  : 'border-blush/20 hover:border-rose/40 hover:scale-[1.02]'
                              }`}
                            >
                              <h3 className="text-sm font-medium text-charcoal mb-2 text-left">Custom Colors</h3>
                              <div className="grid grid-cols-5 gap-2">
                                {(['background', 'text', 'secondary', 'accent_light', 'accent'] as (keyof ColorScheme)[]).map(key => (
                                  <div
                                    key={key}
                                    title={key}
                                    className="h-5 rounded border border-gray-200"
                                    style={{ backgroundColor: formData.colors[key] || '#ffffff' }} 
                                  />
                                ))}
                              </div>
                              <p className="text-xs text-taupe mt-2 text-left">Click to edit</p>
                            </button>
                          );
                        })()}
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] bg-white">
                        <DialogHeader>
                          <DialogTitle>Edit Custom Colors</DialogTitle>
                          <DialogDescription>
                             Choose colors or select a swatch for quick suggestions.
                          </DialogDescription>
                        </DialogHeader>
                          
                        {/* --- Color Inputs with Swatches Below --- */}
                        <div className="grid gap-4 py-4"> 
                          {(Object.keys(currentCustomColors) as Array<keyof ColorScheme>).map(key => (
                            <div key={key} className="space-y-2"> 
                              {/* Label and Picker Row */} 
                              <div className="flex items-center justify-between">
                                <Label htmlFor={key} className="capitalize font-medium">
                                  {key.replace('_', ' ')}
                                </Label>
                                <div className="flex items-center gap-2">
                                  <input
                                    id={key}
                                    name={key}
                                    type="color"
                                    value={currentCustomColors[key] || '#ffffff'}
                                    onChange={handleCustomColorChange}
                                    className="p-0 h-7 w-7 border-none rounded cursor-pointer"
                                  />
                                  <span className="text-sm text-gray-500 font-mono w-16" title={currentCustomColors[key]}>{currentCustomColors[key]}</span>
                                </div>
                              </div>
                              {/* Swatch Row - Reduce gap and size */} 
                              <div className="grid grid-cols-6 gap-1"> 
                                {(swatchMap[key] || []).map(swatch => (
                                  <button
                                    key={swatch.hex}
                                    title={`${swatch.name} (${swatch.hex})`}
                                    onClick={() => handleSwatchClick(key, swatch.hex)} 
                                    className={`h-6 w-6 rounded-full border border-gray-300 transition-transform hover:scale-110 ${currentCustomColors[key]?.toLowerCase() === swatch.hex.toLowerCase() ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
                                    style={{ backgroundColor: swatch.hex }}
                                  >
                                    <span className="sr-only">{swatch.name}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        <DialogFooter>
                           <Button type="button" variant="outline" onClick={() => setIsColorPickerOpen(false)}>Cancel</Button>
                           <Button type="button" onClick={handleApplyCustomColors} className="border">Apply Colors</Button>
                         </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    {/* --- End Custom Colors Section --- */}

                    {/* --- Saved Themes Section --- */}
                    <Dialog open={isSavedThemesOpen} onOpenChange={setIsSavedThemesOpen}>
                      <DialogTrigger asChild>
                        {/* Similar button style, but not highlighted based on active colors */} 
                        <Button 
                          variant="outline"
                          className="w-full justify-start text-left font-normal mt-3" // Add margin-top
                        >
                           <div className="flex items-center justify-between w-full">
                             <span>Saved Color Themes</span>
                             {/* Optional: Add icon or indicator */}
                           </div>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] bg-white">
                        <DialogHeader>
                          <DialogTitle>Saved Color Themes</DialogTitle>
                           <DialogDescription>
                             Select one of your previously saved themes.
                           </DialogDescription>
                        </DialogHeader>
                        {/* Placeholder Content for Saved Themes */} 
                        <div className="py-10 text-center text-gray-500">
                          Saved themes library coming soon!
                        </div>
                         <DialogFooter>
                           <Button type="button" variant="outline" onClick={() => setIsSavedThemesOpen(false)}>Close</Button>
                         </DialogFooter>
                       </DialogContent>
                     </Dialog>
                     {/* --- End Saved Themes Section --- */}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between py-4">
                    <CardTitle>Profile Details</CardTitle>
                    <Switch
                      checked={sectionVisibility.profileDetails}
                      onCheckedChange={checked => handleVisibilityChange("profileDetails", checked)}
                      className={TRACK}
                    >
                      <span
                        className={THUMB}
                        style={{ backgroundColor: "white" }}
                      />
                    </Switch>
                  </CardHeader>
                  {sectionVisibility.profileDetails && (
                    <CardContent className="space-y-4 pt-4"> {/* Add padding-top if header pb removed */}
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
                  )}
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between py-4">
                    <CardTitle>Brand Experience</CardTitle>
                    <Switch
                      checked={sectionVisibility.brandExperience}
                      onCheckedChange={checked => handleVisibilityChange("brandExperience", checked)}
                      className={TRACK}
                    >
                       <span
                         className={THUMB}
                         style={{ backgroundColor: "white" }}
                       />
                    </Switch>
                  </CardHeader>
                  {sectionVisibility.brandExperience && (
                    <CardContent className="pt-4">
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
                            
                            updateCollaborations(collabsArray.map(brand => ({ profile_id: profile.id, brand_name: brand })));
                          }
                        }}
                        placeholder="Enter brand names separated by commas"
                        className="h-24"
                      />
                      <p className="text-sm text-taupe mt-2">
                        Example: Nike, Adidas, Puma
                      </p>
                    </CardContent>
                  )}
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between py-4">
                    <CardTitle>Services & Skills</CardTitle>
                     <Switch
                      checked={sectionVisibility.servicesSkills}
                      onCheckedChange={checked => handleVisibilityChange("servicesSkills", checked)}
                      className={TRACK}
                    >
                       <span
                         className={THUMB}
                         style={{ backgroundColor: "white" }}
                       />
                    </Switch>
                  </CardHeader>
                  {sectionVisibility.servicesSkills && (
                    <CardContent className="space-y-4 pt-4">
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
                              
                              updateServices(servicesArray.map(service => ({ profile_id: profile.id, service_name: service })));
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
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="media" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between py-4">
                    <CardTitle>Social Media</CardTitle>
                    <Switch
                      checked={sectionVisibility.socialMedia}
                      onCheckedChange={checked => handleVisibilityChange("socialMedia", checked)}
                      className={TRACK}
                    >
                      <span
                        className={THUMB}
                        style={{ backgroundColor: "white" }}
                      />
                    </Switch>
                  </CardHeader>
                  {sectionVisibility.socialMedia && (
                    <CardContent className="space-y-4 pt-4">
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
                  )}
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between py-4">
                    <CardTitle>Contact Details</CardTitle>
                     <Switch
                      checked={sectionVisibility.contactDetails}
                      onCheckedChange={checked => handleVisibilityChange("contactDetails", checked)}
                      className={TRACK}
                    >
                      <span
                        className={THUMB}
                        style={{ backgroundColor: "white" }}
                      />
                    </Switch>
                  </CardHeader>
                  {sectionVisibility.contactDetails && (
                    <CardContent className="space-y-4 pt-4">
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
                  )}
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between py-4">
                    <CardTitle>Profile Picture</CardTitle>
                    <Switch
                      checked={sectionVisibility.profilePicture}
                      onCheckedChange={checked => handleVisibilityChange("profilePicture", checked)}
                      className={TRACK}
                    >
                       <span
                         className={THUMB}
                         style={{ backgroundColor: "white" }}
                       />
                    </Switch>
                  </CardHeader>
                  {sectionVisibility.profilePicture && (
                    <CardContent className="pt-4">
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
                    </CardContent>
                  )}
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between py-4">
                    <CardTitle>TikTok Videos</CardTitle>
                     <Switch
                      checked={sectionVisibility.tiktokVideos}
                      onCheckedChange={checked => handleVisibilityChange("tiktokVideos", checked)}
                      className={TRACK}
                    >
                       <span
                         className={THUMB}
                         style={{ backgroundColor: "white" }}
                       />
                    </Switch>
                  </CardHeader>
                  {sectionVisibility.tiktokVideos && (
                    <CardContent className="space-y-4 pt-4">
                      {videoLinks.map((video, idx) => (
                        <div
                          key={idx}
                          className="relative border-2 rounded-lg overflow-hidden"
                          style={{ borderColor: formData.colors.accent }}
                        >
                          {/* url input + remove */}
                          <div className="flex items-center p-2">
                            <Input
                              placeholder="https://www.tiktok.com/…"
                              value={video.url}
                              onChange={e => handleVideoUrlChange(idx, e.target.value)}
                            />
                            <button
                              onClick={() => handleRemoveVideo(idx)}
                              className="ml-2 p-1 text-gray-500 hover:text-red-500"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {videoLinks.length < 5 && (
                        <>
                          <Button variant="outline" onClick={handleAddVideo} className="w-full">
                            + Add another TikTok
                          </Button>
                          <p className="mt-1 text-sm text-gray-500">3+ videos recommended</p>
                        </>
                      )}
                    </CardContent>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between py-4">
                    <CardTitle>Audience Stats</CardTitle>
                    <Switch
                      checked={sectionVisibility.audienceStats}
                      onCheckedChange={checked => handleVisibilityChange("audienceStats", checked)}
                      className={TRACK}
                    >
                      <span
                        className={THUMB}
                        style={{ backgroundColor: "white" }}
                      />
                    </Switch>
                  </CardHeader>
                  {sectionVisibility.audienceStats && (
                    <CardContent className="space-y-4 pt-4">
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
                  )}
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between py-4">
                    <CardTitle>Performance</CardTitle>
                    <Switch
                      checked={sectionVisibility.performance}
                      onCheckedChange={checked => handleVisibilityChange("performance", checked)}
                      className={TRACK}
                    >
                      <span
                        className={THUMB}
                        style={{ backgroundColor: "white" }}
                      />
                    </Switch>
                  </CardHeader>
                  {sectionVisibility.performance && (
                    <CardContent className="space-y-4 pt-4">
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
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview - make wider */}
          <div className="w-full md:w-3/5 md:sticky md:top-20 h-fit">
            <MediaKitPreview
              key={`preview-${selectedTemplateId}-${formData.brand_name}-${formData.profile_photo}-${formData.tagline}`}
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