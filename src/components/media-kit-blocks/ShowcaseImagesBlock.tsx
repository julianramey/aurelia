import React from 'react';
import type { SectionVisibilityState } from '@/lib/types';

interface ShowcaseImagesProps {
  images: string[];
  sectionVisibility: SectionVisibilityState; // For consistency, parent controls visibility
  // title?: string;
}

const ShowcaseImagesBlock: React.FC<ShowcaseImagesProps> = ({
  images,
  // sectionVisibility, // Not directly used for item styling or internal filtering
}) => {
  if (!images || images.length === 0) {
    return <p className="text-[0.9rem]" style={{ color: 'var(--theme-foreground)' }}>No showcase images to display.</p>;
  }

  // Using similar styling to PortfolioGridBlock for now, can be customized later
  return (
    <div className="showcase-images-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
      {images.map((imageUrl, index) => (
        <div key={index} className="showcase-image-item aspect-[9/16] rounded-lg overflow-hidden shadow-lg">
          <img 
            src={imageUrl}
            alt={`Showcase image ${index + 1}`}
            className="w-full h-full object-cover transition-transform hover:scale-105"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
};

export default ShowcaseImagesBlock; 