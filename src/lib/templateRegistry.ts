// src/lib/templateRegistry.ts
import MediaKitTemplateDefault from '@/components/media-kit-templates/MediaKitTemplateDefault';
import MediaKitTemplateAesthetic from '@/components/media-kit-templates/MediaKitTemplateAesthetic';
import MediaKitTemplateLuxury from '@/components/media-kit-templates/MediaKitTemplateLuxury';

// Import the actual placeholder, theme, and thumbnail data functions
import {
  DefaultGetPreviewData,
  DefaultTheme,
  DefaultGetThumbnailData,
  type DefaultSpecificData,
  type DefaultSpecificTheme,
  type MediaKitTemplateDefaultProps,
} from '@/components/media-kit-templates/MediaKitTemplateDefault';
import {
  AestheticGetPreviewData,
  AestheticTheme,
  AestheticGetThumbnailData,
  type AestheticSpecificData,
  type AestheticSpecificTheme,
  type MediaKitTemplateAestheticProps,
} from '@/components/media-kit-templates/MediaKitTemplateAesthetic';
import {
  LuxuryGetPreviewData,
  LuxuryTheme,
  LuxuryGetThumbnailData,
  type LuxurySpecificData,
  type LuxurySpecificTheme,
  type MediaKitTemplateLuxuryProps,
} from '@/components/media-kit-templates/MediaKitTemplateLuxury';

import type { EditorPreviewData, Profile, TemplateTheme as BaseTemplateTheme, SectionVisibilityState } from './types';

export interface TemplateDefinition<
  SpecificPreviewD,
  SpecificThemeT extends BaseTemplateTheme
> {
  id: string;
  name: string;
  Component: React.FC<{ 
    data: EditorPreviewData | null; 
    theme: BaseTemplateTheme;
    section_visibility: SectionVisibilityState;
    loading?: boolean;
  }>;
  getPreviewData: (formData?: Partial<Profile>) => SpecificPreviewD;
  getThumbnailData: () => EditorPreviewData;
  placeholderTheme: () => SpecificThemeT;
}

export type AnyTemplateDefinition = 
  | TemplateDefinition<DefaultSpecificData, DefaultSpecificTheme>
  | TemplateDefinition<AestheticSpecificData, AestheticSpecificTheme>
  | TemplateDefinition<LuxurySpecificData, LuxurySpecificTheme>;

export const TEMPLATES: Array<AnyTemplateDefinition> = [
  {
    id: 'default',
    name: 'Classic Minimal',
    Component: MediaKitTemplateDefault as React.FC<{ 
      data: EditorPreviewData | null; 
      theme: BaseTemplateTheme;
      section_visibility: SectionVisibilityState; 
      loading?: boolean;
    }>,
    getPreviewData: DefaultGetPreviewData,
    getThumbnailData: DefaultGetThumbnailData,
    placeholderTheme: DefaultTheme,
  },
  {
    id: 'aesthetic',
    name: 'Modern Aesthetic',
    Component: MediaKitTemplateAesthetic as React.FC<{ 
      data: EditorPreviewData | null; 
      theme: BaseTemplateTheme;
      section_visibility: SectionVisibilityState; 
      loading?: boolean;
    }>,
    getPreviewData: AestheticGetPreviewData,
    getThumbnailData: AestheticGetThumbnailData,
    placeholderTheme: AestheticTheme,
  },
  {
    id: 'luxury',
    name: 'Elegant Luxury',
    Component: MediaKitTemplateLuxury as React.FC<{ 
      data: EditorPreviewData | null; 
      theme: BaseTemplateTheme;
      section_visibility: SectionVisibilityState; 
      loading?: boolean;
    }>,
    getPreviewData: LuxuryGetPreviewData,
    getThumbnailData: LuxuryGetThumbnailData,
    placeholderTheme: LuxuryTheme,
  },
  // To add new templates, append them here.
  // Ensure the corresponding template file exports its Component, placeholderData function, and placeholderTheme function.
]; 