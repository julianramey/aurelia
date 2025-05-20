import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import type { AnyTemplateDefinition } from '@/lib/templateRegistry';
import TemplateThumbnail from '@/components/media-kit-templates/TemplateThumbnail';
import { useEditorTheme } from '@/contexts/ThemeContext';
import type { 
  EditorPreviewData, 
  TemplateTheme, 
  SectionVisibilityState, 
  ColorScheme, 
  VideoItem, 
  MediaKitStats, 
  BrandCollaboration, 
  Service,
  SocialPlatform
} from '@/lib/types';

export interface TemplateLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templatesRegistry: ReadonlyArray<AnyTemplateDefinition>;
  onApplyTemplate: (templateId: string) => void;
}

// Default section visibility for library previews
const defaultLibrarySectionVisibility: SectionVisibilityState = {
  profileDetails: true,
  brandExperience: true,
  servicesSkills: true,
  socialMedia: true,
  contactDetails: true,
  profilePicture: true,
  tiktokVideos: true,
  audienceStats: true,
  performance: true,
  audienceDemographics: true,
};

// Default Purple Color Scheme (consistent with app's default from MediaKitEditor.tsx)
const DEFAULT_PURPLE_COLORS: ColorScheme = {
  background: "#F5F5F5",
  text: "#1A1F2C",
  secondary: "#8E9196",
  accent_light: "#E5DAF8",
  accent: "#7E69AB",
  primary: "#7E69AB", 
};

// Derived Default Purple Theme for templates
const DEFAULT_PURPLE_THEME: TemplateTheme = {
  background: DEFAULT_PURPLE_COLORS.background,
  foreground: DEFAULT_PURPLE_COLORS.text,
  primary: DEFAULT_PURPLE_COLORS.accent,
  primaryLight: DEFAULT_PURPLE_COLORS.accent_light,
  secondary: DEFAULT_PURPLE_COLORS.secondary,
  accent: DEFAULT_PURPLE_COLORS.accent,
  neutral: DEFAULT_PURPLE_COLORS.secondary, 
  border: `${DEFAULT_PURPLE_COLORS.accent}33`,
};

// Standardized Placeholder Data for all library previews
const LIBRARY_PLACEHOLDER_DATA: EditorPreviewData = {
  id: 'lib-preview-profile',
  user_id: 'lib-preview-user',
  username: 'yourusername',
  avatar_url: 'https://placehold.co/150/EEEEEE/757575?text=',
  website: 'yourwebsite.com',
  full_name: 'Your Name Here',
  email: 'youremail@example.com',
  niche: 'Lifestyle Creator',
  media_kit_url: 'yourusername-media-kit',
  onboarding_complete: true,
  personal_intro: 'Passionate influencer sharing my journey and connecting with amazing brands. Let\'s collaborate!',
  brand_name: 'Your Name Here',
  tagline: 'Your Catchy Tagline Here',
  colors: DEFAULT_PURPLE_COLORS, 
  font: 'Inter',
  skills: ['Content Creation', 'Brand Storytelling', 'Community Engagement'],
  brand_collaborations: [
    { id: 'lib-collab-1', profile_id: 'lib-preview-user', brand_name: 'Awesome Brand' },
    { id: 'lib-collab-2', profile_id: 'lib-preview-user', brand_name: 'Cool Product Co.' },
  ] as BrandCollaboration[],
  services: [
    { id: 'lib-service-1', profile_id: 'lib-preview-user', service_name: 'Sponsored Posts' },
    { id: 'lib-service-2', profile_id: 'lib-preview-user', service_name: 'UGC Creation' },
  ] as Service[],
  instagram_handle: '@yourinsta',
  tiktok_handle: '@yourtiktok',
  youtube_handle: '@youryoutube',
  portfolio_images: [
    'https://placehold.co/600x400/E5DAF8/1A1F2C?text=Portfolio+Image+1',
    'https://placehold.co/600x400/E5DAF8/1A1F2C?text=Portfolio+Image+2',
    'https://placehold.co/600x400/E5DAF8/1A1F2C?text=Portfolio+Image+3',
  ],
  videos: [
    { url: '#video1', thumbnail_url: 'https://placehold.co/300x400/EEEEEE/757575?text=Video' },
    { url: '#video2', thumbnail_url: 'https://placehold.co/300x400/EEEEEE/757575?text=Video' },
  ] as VideoItem[],
  contact_email: 'contact@yourbrand.com',
  section_visibility: defaultLibrarySectionVisibility,
  follower_count: 10500,
  engagement_rate: 4.2,
  avg_likes: 680,
  reach: 25000,
  stats: [{
    id: 'lib-stats-ig', 
    profile_id: 'lib-preview-user', 
    platform: 'instagram' as SocialPlatform,
    follower_count: 10500, 
    engagement_rate: 4.2, 
    avg_likes: 680, 
    avg_comments: 45, 
    weekly_reach: 25000, 
    monthly_impressions: 100000
  }] as MediaKitStats[],
  profile_photo: 'https://placehold.co/150/EEEEEE/757575?text=',
  selected_template_id: 'default',
  instagram_followers: 10500,
  tiktok_followers: 5000,
  youtube_followers: 2000,
  audience_age_range: '18-34',
  audience_location_main: 'United States',
  audience_gender_female: '65%',
  avg_video_views: 15000,
  avg_ig_reach: 20000,
  ig_engagement_rate: 4.2,
  showcase_images: [
    'https://placehold.co/400x300/E5DAF8/1A1F2C?text=Showcase+1',
    'https://placehold.co/400x300/E5DAF8/1A1F2C?text=Showcase+2'
  ],
  past_brands_text: 'Collaborated with leading lifestyle and tech brands.',
  past_brands_image_url: 'https://placehold.co/800x200/CDB4DB/1A1F2C?text=Past+Brands+Banner',
  next_steps_text: 'Ready to elevate your brand? Let\'s chat about your next campaign!',
  contact_phone: '555-123-4567',
  media_kit_data: null, 
};

const TemplateLibraryDialog: React.FC<TemplateLibraryDialogProps> = ({
  open,
  onOpenChange,
  templatesRegistry,
  onApplyTemplate,
}) => {
  const [detailedPreviewTemplateId, setDetailedPreviewTemplateId] = useState<string | null>(null);
  const editorTheme = useEditorTheme();

  useEffect(() => {
    if (open) {
      setDetailedPreviewTemplateId(null); 
    }
  }, [open]);

  const handleApplyAndClose = (templateId: string) => {
    onApplyTemplate(templateId);
    onOpenChange(false);
    setDetailedPreviewTemplateId(null);
  };

  const currentDetailedTemplate = detailedPreviewTemplateId 
    ? templatesRegistry.find(t => t.id === detailedPreviewTemplateId) 
    : null;

  const availableTemplates = templatesRegistry || [];

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
          setDetailedPreviewTemplateId(null); 
        }
      }}
    >
      <DialogContent className="sm:max-w-[80vw] h-[90vh] flex flex-col bg-white p-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle>Template Library</DialogTitle>
          <DialogDescription>
            {detailedPreviewTemplateId ? 'Previewing template. Click Apply to use it.' : 'Select a template for your media kit. Click Preview for details.'}
          </DialogDescription>
        </DialogHeader>

        {detailedPreviewTemplateId && currentDetailedTemplate ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 bg-white">
              <button
                onClick={() => setDetailedPreviewTemplateId(null)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Library
              </button>
              <Button
                size="sm"
                className="bg-charcoal hover:bg-charcoal/90 text-white rounded-md"
                onClick={() => handleApplyAndClose(currentDetailedTemplate.id)}
              >
                Apply Template
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
              <currentDetailedTemplate.Component 
                data={LIBRARY_PLACEHOLDER_DATA}
                theme={editorTheme || (currentDetailedTemplate.placeholderTheme ? currentDetailedTemplate.placeholderTheme() : DEFAULT_PURPLE_THEME)}
                section_visibility={defaultLibrarySectionVisibility}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6 overflow-y-auto flex-1">
            {availableTemplates.map((template) => (
              <div 
                key={template.id}
                className="relative border rounded-lg shadow-md hover:shadow-lg transition-shadow h-80 cursor-pointer overflow-hidden hover:[box-shadow:0_0_0_2px_rgba(126,105,171,0.3),0_0_20px_2px_rgba(126,105,171,0.3),0_0_40px_2px_rgba(126,105,171,0.2)] duration-300 ease-in-out"
                onClick={() => setDetailedPreviewTemplateId(template.id)}
              >
                <TemplateThumbnail 
                  templateId={template.id as 'default' | 'aesthetic' | 'luxury'}
                  data={LIBRARY_PLACEHOLDER_DATA} 
                  theme={template.placeholderTheme ? template.placeholderTheme() : DEFAULT_PURPLE_THEME}   
                  section_visibility={defaultLibrarySectionVisibility}
                />
                <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/70 via-black/50 to-transparent text-center">
                  <h3 className="font-semibold text-xl text-white mb-4">{template.name}</h3>
                  <div className="relative flex justify-center items-center h-10">
                     <Button 
                       size="sm" 
                       className="absolute bg-rose hover:bg-rose/90 text-white font-semibold pl-6 pr-14 py-2 rounded-full shadow-md z-0 transform -translate-x-8"
                       onClick={(e) => { 
                         e.stopPropagation();
                         handleApplyAndClose(template.id);
                       }}
                      >
                         Select
                       </Button>
                     <Button 
                       size="sm" 
                       className="absolute bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-2 rounded-full shadow-md z-10 transform translate-x-10"
                       onClick={(e) => { 
                         e.stopPropagation(); 
                         setDetailedPreviewTemplateId(template.id); 
                        }} 
                      >
                         Preview
                       </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TemplateLibraryDialog; 