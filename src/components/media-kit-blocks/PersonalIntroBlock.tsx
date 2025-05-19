import React from 'react';
import type { SectionVisibilityState } from '@/lib/types';

interface PersonalIntroProps {
  text: string;
  sectionVisibility: SectionVisibilityState; // Though likely used by parent
  // theme: TemplateTheme;
}

const PersonalIntroBlock: React.FC<PersonalIntroProps> = ({
  text,
  sectionVisibility,
}) => {
  if (!text) {
    return null; // If there's no text, don't render anything
  }
  return (
    <p className="intro-text text-base mb-6">
      {text}
    </p>
  );
};

export default PersonalIntroBlock; 