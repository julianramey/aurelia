import React from 'react';
import type { SectionVisibilityState, BrandCollaboration } from '@/lib/types';

interface BrandCollaborationProps {
  brands: BrandCollaboration[];
  sectionVisibility: SectionVisibilityState;
}

const BrandCollaborationBlock: React.FC<BrandCollaborationProps> = ({
  brands,
  // sectionVisibility, // Not directly used for styling items here
}) => {
  if (!brands || brands.length === 0) {
    return null; // Parent template handles the "no collaborations" message
  }

  const getCollabName = (collab: BrandCollaboration): string => {
    return collab.brand_name || 'Unnamed Brand';
  };

  return (
    <div className="brands-grid flex flex-wrap gap-4">
      {brands.map((brand, index) => (
        <div
          key={brand.id || index} // Use brand.id if available, otherwise index as a fallback key
          className="brand-tag font-medium px-5 py-3 rounded-lg"
        >
          {getCollabName(brand)}
        </div>
      ))}
    </div>
  );
};

export default BrandCollaborationBlock; 