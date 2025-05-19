import React from 'react';
import type { SectionVisibilityState } from '@/lib/types';

interface PortfolioGridProps {
  images: string[];
  sectionVisibility: SectionVisibilityState;
}

const PortfolioGridBlock: React.FC<PortfolioGridProps> = ({
  images,
  // sectionVisibility, // Not directly used for styling items here
}) => {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map((image, index) => (
        <img
          key={index}
          src={image}
          alt={`Portfolio ${index + 1}`}
          className="w-full h-[200px] object-cover rounded-[0.75rem] border-2 transition-transform hover:scale-[1.02]"
          // The border color will come from Tailwind's default or could be var(--theme-border) if class is added
          // For now, adhering to the explicit classes from original template.
        />
      ))}
    </div>
  );
};

export default PortfolioGridBlock; 