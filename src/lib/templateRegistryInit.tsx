/**
 * Initialize the template registry with default templates
 * This file should be imported by templateRegistry.ts to avoid circular dependencies
 */
import React, { lazy, Suspense } from 'react';
import { registerTemplate } from './templateRegistry';
import type { EditorPreviewData, TemplateTheme, ColorScheme, SectionVisibilityState } from './types';
import { debug } from '@/lib/utils/debug';

// Lazy load template components for code splitting
const MediaKitTemplateDefault = lazy(() => 
  import('@/components/media-kit-templates/MediaKitTemplateDefault')
);

const MediaKitTemplateAesthetic = lazy(() => 
  import('@/components/media-kit-templates/MediaKitTemplateAesthetic')
);

const MediaKitTemplateLuxury = lazy(() => 
  import('@/components/media-kit-templates/MediaKitTemplateLuxury')
);

// LoadingFallback for templates while they're loading
const TemplateLoadingFallback: React.FC = () => (
  <div className="p-8 flex flex-col items-center justify-center min-h-[300px] bg-gray-50">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mb-3"></div>
    <p className="text-gray-600">Loading template...</p>
  </div>
);

// Helper to create a component wrapper with suspense
const createSuspenseWrapper = (LazyComponent: React.LazyExoticComponent<any>) => {
  return ({ data, theme, section_visibility }: any) => (
    <Suspense fallback={<TemplateLoadingFallback />}>
      <LazyComponent 
        data={data} 
        theme={theme} 
        section_visibility={section_visibility} 
      />
    </Suspense>
  );
};

// Register initial templates
const initialTemplates = [
  {
    id: 'default',
    label: 'Classic',
    description: 'A professional and clean layout highlighting your key stats and experience.',
    Component: createSuspenseWrapper(MediaKitTemplateDefault),
    getPreviewData: () => ({
      full_name: 'Your Name',
      tagline: 'Content Creator & Influencer',
      personal_intro: 'I create authentic lifestyle content for brands looking to connect with Gen Z audiences.',
      skills: ['Photography', 'Video Editing', 'Social Media Strategy'],
      follower_count: 25000,
      engagement_rate: 4.5,
      avg_likes: 1500
    }),
    defaultColors: {
      background: "#F5F5F5",
      text: "#1A1F2C",
      secondary: "#8E9196",
      accent_light: "#E5DAF8",
      accent: "#7E69AB",
      primary: "#7E69AB"
    },
    thumbnail: '/assets/templates/default-thumbnail.jpg'
  },
  {
    id: 'aesthetic',
    label: 'Aesthetic',
    description: 'A visually appealing template with a focus on your portfolio and aesthetic.',
    Component: createSuspenseWrapper(MediaKitTemplateAesthetic),
    getPreviewData: () => ({
      full_name: 'Your Name',
      tagline: 'Creative Director & Content Creator',
      personal_intro: 'Crafting visual stories that resonate with conscious consumers.',
      skills: ['Brand Storytelling', 'Content Creation', 'Art Direction'],
      follower_count: 35000,
      engagement_rate: 5.2,
      avg_likes: 2200
    }),
    defaultColors: {
      background: "#FFF5F7",
      text: "#4A3640",
      secondary: "#A67F8E",
      accent_light: "#FADADD",
      accent: "#E4A7B6",
      primary: "#E4A7B6"
    },
    thumbnail: '/assets/templates/aesthetic-thumbnail.jpg'
  },
  {
    id: 'luxury',
    label: 'Luxury',
    description: 'An elegant, high-end template for premium brand collaborations.',
    Component: createSuspenseWrapper(MediaKitTemplateLuxury),
    getPreviewData: () => ({
      full_name: 'Your Name',
      tagline: 'Luxury Lifestyle Curator',
      personal_intro: 'Partnering with premium brands to showcase exceptional experiences.',
      skills: ['Luxury Branding', 'High-End Content', 'Sophisticated Aesthetics'],
      follower_count: 50000,
      engagement_rate: 3.8,
      avg_likes: 3000
    }),
    defaultColors: {
      background: "#FFFFFF",
      text: "#212121",
      secondary: "#757575",
      accent_light: "#F5F5F5",
      accent: "#D4AF37",
      primary: "#D4AF37"
    },
    thumbnail: '/assets/templates/luxury-thumbnail.jpg'
  }
];

// Register all initial templates
initialTemplates.forEach(template => {
  debug('TemplateRegistryInit', 'Registering template', { id: template.id, name: template.label });
  registerTemplate(template);
}); 