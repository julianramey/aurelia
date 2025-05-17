// src/lib/sections.ts
import React from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { SectionVisibilityState, Profile, MediaKitData, ColorScheme, BrandCollaboration, Service, VideoItem, MediaKitStats } from './types';
import {
  UserIcon,
  TagIcon,
  BriefcaseIcon,
  LinkIcon,
  EnvelopeIcon,
  UserCircleIcon,
  PlayCircleIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';

// Define EditorFormData here or import from types.ts if moved
// For now, using 'any' as a placeholder to match existing formData prop type.
// Ideally: import { EditorFormData } from './types'; (if moved there)
type EditorFormDataPlaceholder = any;

// Corrected ToastFunction type for variant
type ToastFunction = (options: { title: string; description: string; variant?: 'default' | 'destructive' }) => void;

export interface EditorFormProps {
  formData: EditorFormDataPlaceholder;
  profile?: Profile | null;
  mediaKitData?: MediaKitData | null;
  colorPresets: Array<{ id: string; label: string; name: string; colors: ColorScheme }>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSocialChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMetricsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  updateCollaborations: (collaborations: Pick<BrandCollaboration, 'brand_name' | 'collaboration_type' | 'collaboration_date'>[]) => Promise<{ error: Error | null }>;
  updateServices: (services: Pick<Service, 'service_name' | 'description' | 'price_range'>[]) => Promise<{ error: Error | null }>;
  handleSkillsChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onProfilePhotoChange: (url: string) => void; // For ProfilePictureForm
  userId?: string; // For makeSafeKey in ProfilePictureForm
  
  // Props for specific forms, based on linter errors from MediaKitEditor
  handleBrandCollaborations?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; // For BrandExperienceForm
  handleServicesChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; // For ServicesSkillsForm
  // onSkillsChange is already present for ServicesSkillsForm

  // For ProfilePictureForm
  setFormData?: React.Dispatch<React.SetStateAction<EditorFormDataPlaceholder>>;
  supabase?: SupabaseClient;
  toast?: ToastFunction;

  // For TikTokVideosForm
  videoLinks: VideoItem[];
  setVideoLinks?: React.Dispatch<React.SetStateAction<VideoItem[]>>;
  handleAddVideo: () => void;
  handleRemoveVideo: (index: number) => Promise<void>;
  handleVideoUrlChange: (index: number, url: string) => Promise<void>;
  
  stats?: MediaKitStats[];
  sectionVisibility: SectionVisibilityState;
  onVisibilityChange: (section: keyof SectionVisibilityState, checked: boolean) => void;
  initialDataLoaded: boolean;
}

export interface SectionDefinition {
  key: keyof SectionVisibilityState;
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  formComponentName: string;
  tab: 'content' | 'media' | 'metrics';
}

export const SECTIONS: SectionDefinition[] = [
  {
    key: 'profileDetails',
    label: 'Profile Details',
    icon: UserIcon,
    formComponentName: 'ProfileDetailsForm',
    tab: 'content',
  },
  {
    key: 'brandExperience',
    label: 'Brand Experience',
    icon: TagIcon,
    formComponentName: 'BrandExperienceForm',
    tab: 'content',
  },
  {
    key: 'servicesSkills',
    label: 'Services & Skills',
    icon: SparklesIcon,
    formComponentName: 'ServicesSkillsForm',
    tab: 'content',
  },
  {
    key: 'socialMedia',
    label: 'Social Media',
    icon: LinkIcon,
    formComponentName: 'SocialMediaForm',
    tab: 'media',
  },
  {
    key: 'contactDetails',
    label: 'Contact Details',
    icon: EnvelopeIcon,
    formComponentName: 'ContactDetailsForm',
    tab: 'media',
  },
  {
    key: 'profilePicture',
    label: 'Profile Picture',
    icon: UserCircleIcon,
    formComponentName: 'ProfilePictureForm',
    tab: 'media',
  },
  {
    key: 'tiktokVideos',
    label: 'TikTok Videos',
    icon: VideoCameraIcon,
    formComponentName: 'TikTokVideosForm',
    tab: 'media',
  },
  {
    key: 'audienceStats',
    label: 'Audience Stats',
    icon: ChartPieIcon,
    formComponentName: 'AudienceStatsForm',
    tab: 'metrics',
  },
  {
    key: 'performance',
    label: 'Performance',
    icon: ArrowTrendingUpIcon,
    formComponentName: 'PerformanceForm',
    tab: 'metrics',
  },
]; 