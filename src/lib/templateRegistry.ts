// src/lib/templateRegistry.ts
import MediaKitTemplateDefault from '@/components/media-kit-templates/MediaKitTemplateDefault';
import MediaKitTemplateAesthetic from '@/components/media-kit-templates/MediaKitTemplateAesthetic';
import MediaKitTemplateLuxury from '@/components/media-kit-templates/MediaKitTemplateLuxury';
import MediaKitTemplateV1 from '@/components/media-kit-templates/MediaKitTemplateV1';
import MediaKitTemplateElegant from '@/components/media-kit-templates/MediaKitTemplateElegant';

// Import the actual placeholder, theme, and thumbnail data functions
import {
  DefaultGetPreviewData,
  DefaultTheme,
  DefaultGetThumbnailData,
  type DefaultSpecificData,
  // type DefaultSpecificTheme, // Not exported/used; defaults to BaseTemplateTheme
  // type MediaKitTemplateDefaultProps, // Not directly used in TEMPLATES structure
} from '@/components/media-kit-templates/MediaKitTemplateDefault';
import {
  AestheticGetPreviewData,
  AestheticTheme,
  AestheticGetThumbnailData,
  type AestheticSpecificData,
  // type AestheticSpecificTheme, // Not exported/used; defaults to BaseTemplateTheme
  // type MediaKitTemplateAestheticProps, // Not directly used in TEMPLATES structure
} from '@/components/media-kit-templates/MediaKitTemplateAesthetic';
import {
  LuxuryGetPreviewData,
  LuxuryTheme,
  LuxuryGetThumbnailData,
  type LuxurySpecificData,
  // type LuxurySpecificTheme, // Not exported/used; defaults to BaseTemplateTheme
  // type MediaKitTemplateLuxuryProps, // Not directly used in TEMPLATES structure
} from '@/components/media-kit-templates/MediaKitTemplateLuxury';
import {
  V1GetPreviewData,
  V1Theme,
  V1GetThumbnailData,
} from '@/components/media-kit-templates/MediaKitTemplateV1';
import {
  ElegantGetPreviewData,
  ElegantTheme,
  ElegantGetThumbnailData,
  // type ElegantSpecificData, // Assuming EditorPreviewData for now
} from '@/components/media-kit-templates/MediaKitTemplateElegant';

import type { EditorPreviewData, Profile, TemplateTheme as BaseTemplateTheme, SectionVisibilityState } from './types';

export interface TemplateDefinition<
  SpecificPreviewD, // This can be EditorPreviewData if no more specific type
  SpecificThemeT extends BaseTemplateTheme // All templates use BaseTemplateTheme or ImportedTemplateTheme
> {
  id: string;
  name: string;
  Component: React.FC<{ 
    data: EditorPreviewData | null; 
    theme: BaseTemplateTheme; // Use BaseTemplateTheme here
    section_visibility: SectionVisibilityState;
    loading?: boolean;
  }>;
  getPreviewData: (formData?: Partial<Profile>) => SpecificPreviewD;
  getThumbnailData: () => EditorPreviewData;
  placeholderTheme: () => SpecificThemeT; // This will resolve to BaseTemplateTheme
}

// All templates effectively use BaseTemplateTheme for their SpecificThemeT
export type AnyTemplateDefinition = 
  | TemplateDefinition<DefaultSpecificData, BaseTemplateTheme>
  | TemplateDefinition<AestheticSpecificData, BaseTemplateTheme>
  | TemplateDefinition<LuxurySpecificData, BaseTemplateTheme>
  | TemplateDefinition<EditorPreviewData, BaseTemplateTheme>; // V1 uses EditorPreviewData and BaseTemplateTheme

export const TEMPLATES: Array<AnyTemplateDefinition> = [
  {
    id: 'default',
    name: 'Classic',
    Component: MediaKitTemplateDefault as React.FC<{ 
      data: EditorPreviewData | null; 
      theme: BaseTemplateTheme;
      section_visibility: SectionVisibilityState; 
      loading?: boolean;
    }>,
    getPreviewData: DefaultGetPreviewData,
    getThumbnailData: DefaultGetThumbnailData,
    placeholderTheme: DefaultTheme, // DefaultTheme returns ImportedTemplateTheme (aliased as BaseTemplateTheme)
  },
  {
    id: 'aesthetic',
    name: 'Modern',
    Component: MediaKitTemplateAesthetic as React.FC<{ 
      data: EditorPreviewData | null; 
      theme: BaseTemplateTheme;
      section_visibility: SectionVisibilityState; 
      loading?: boolean;
    }>,
    getPreviewData: AestheticGetPreviewData,
    getThumbnailData: AestheticGetThumbnailData,
    placeholderTheme: AestheticTheme, // AestheticTheme returns ImportedTemplateTheme
  },
  {
    id: 'luxury',
    name: 'Luxury',
    Component: MediaKitTemplateLuxury as React.FC<{ 
      data: EditorPreviewData | null; 
      theme: BaseTemplateTheme;
      section_visibility: SectionVisibilityState; 
      loading?: boolean;
    }>,
    getPreviewData: LuxuryGetPreviewData,
    getThumbnailData: LuxuryGetThumbnailData,
    placeholderTheme: LuxuryTheme, // LuxuryTheme returns ImportedTemplateTheme
  },
  {
    id: 'v1',
    name: 'Minimalist',
    Component: MediaKitTemplateV1 as React.FC<{ 
      data: EditorPreviewData | null; 
      theme: BaseTemplateTheme;
      section_visibility: SectionVisibilityState; 
      loading?: boolean;
    }>,
    getPreviewData: V1GetPreviewData,
    getThumbnailData: V1GetThumbnailData,
    placeholderTheme: V1Theme, // V1Theme returns ImportedTemplateTheme
  },
  {
    id: 'elegant',
    name: 'Elegant',
    Component: MediaKitTemplateElegant as React.FC<{ 
      data: EditorPreviewData | null; 
      theme: BaseTemplateTheme;
      section_visibility: SectionVisibilityState; 
      loading?: boolean;
    }>,
    getPreviewData: ElegantGetPreviewData,
    getThumbnailData: ElegantGetThumbnailData,
    placeholderTheme: ElegantTheme,
  },
  // To add new templates, append them here.
  // Ensure the corresponding template file exports its Component, placeholderData function, and placeholderTheme function.
]; 