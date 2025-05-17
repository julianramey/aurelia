import React from 'react';
import MediaKitTemplateDefault from './MediaKitTemplateDefault';
import MediaKitTemplateAesthetic from './MediaKitTemplateAesthetic';
import MediaKitTemplateLuxury from './MediaKitTemplateLuxury';
// Import types used by EditorPreviewData if they are not global or already imported
import type { EditorPreviewData, SectionVisibilityState, TemplateTheme } from '@/lib/types';

interface TemplateThumbnailProps {
  templateId: 'default' | 'aesthetic' | 'luxury';
  data: EditorPreviewData;
  theme: TemplateTheme;
  section_visibility: SectionVisibilityState;
}

const TemplateThumbnail: React.FC<TemplateThumbnailProps> = ({ templateId, data, theme, section_visibility }) => {
  let TemplateComponent;
  switch (templateId) {
    case 'aesthetic':
      TemplateComponent = MediaKitTemplateAesthetic;
      break;
    case 'luxury':
      TemplateComponent = MediaKitTemplateLuxury;
      break;
    default:
      TemplateComponent = MediaKitTemplateDefault;
      break;
  }

  return (
    <div className="w-full h-full overflow-hidden">
      {/* Apply scaling and ensure content fits. This might need adjustments. */}
      <div style={{ transform: 'scale(0.3)', transformOrigin: 'top left', width: 'calc(100% / 0.3)', height: 'calc(100% / 0.3)' }}>
        {/* Ensure data prop is compatible with what templates expect or cast as any if absolutely necessary and safe */}
        <TemplateComponent data={data} theme={theme} section_visibility={section_visibility} />
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