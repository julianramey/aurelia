import React from 'react';
import MediaKitTemplateDefault from './MediaKitTemplateDefault';
import MediaKitTemplateAesthetic from './MediaKitTemplateAesthetic';
// Import types used by EditorPreviewData if they are not global or already imported
import type { Profile, MediaKitStats, ColorScheme, VideoItem, SectionVisibilityState, SocialPlatform } from '@/lib/types';

// Copied EditorPreviewData type from MediaKitEditor.tsx
// It's generally better to have shared types in a central location (e.g., @/lib/types)
// but for now, to resolve the immediate issue, we define it here.
export type EditorPreviewData = Omit<Profile, 'media_kit_data' | 'created_at' | 'updated_at' | 'services' | 'brand_collaborations'> & {
  brand_name: string;
  tagline: string;
  colors: ColorScheme;
  font: string;
  personal_intro: string;
  skills: string[];
  brand_collaborations: { id?: string; brand_name: string }[];
  services: { id?: string; service_name: string }[];
  instagram_handle: string;
  tiktok_handle: string;
  portfolio_images: string[];
  videos: VideoItem[];
  contact_email: string;
  section_visibility: SectionVisibilityState;
  follower_count: number;
  engagement_rate: number;
  avg_likes: number;
  reach: number;
  stats: MediaKitStats[];
  profile_photo?: string;
};

interface TemplateThumbnailProps {
  templateId: 'default' | 'aesthetic';
  data: EditorPreviewData; // Use the more specific type
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
}

const TemplateThumbnail: React.FC<TemplateThumbnailProps> = ({ templateId, data, theme }) => {
  const TemplateComponent = templateId === 'aesthetic' ? MediaKitTemplateAesthetic : MediaKitTemplateDefault;

  return (
    <div className="w-full h-full overflow-hidden">
      {/* Apply scaling and ensure content fits. This might need adjustments. */}
      <div style={{ transform: 'scale(0.3)', transformOrigin: 'top left', width: 'calc(100% / 0.3)', height: 'calc(100% / 0.3)' }}>
        {/* Ensure data prop is compatible with what templates expect or cast as any if absolutely necessary and safe */}
        <TemplateComponent data={data as any} theme={theme} />
      </div>
    </div>
  );
};

export default TemplateThumbnail;

// Basic styling for the wrapper - can be expanded in a CSS file or via Tailwind utility classes
// For now, keeping it simple.
// Ensure to add appropriate Tailwind classes or CSS for .template-thumbnail-wrapper if needed.
// For example, to ensure the inner scaled div is clipped:
// .template-thumbnail-wrapper { position: relative; overflow: hidden; } 