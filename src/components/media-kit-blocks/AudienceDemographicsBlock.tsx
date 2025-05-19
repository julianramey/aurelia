import React from 'react';
import type { SectionVisibilityState } from '@/lib/types';
import { formatNumber } from '@/lib/utils'; // Import formatNumber
// import { UsersIcon } from '@heroicons/react/24/outline'; // Icons were in the original template but not in the block props, can add later if needed

interface AudienceDemographicsProps {
  ageRange?: string;
  location?: string;
  femalePct?: string | number | undefined; // Updated type
  sectionVisibility: SectionVisibilityState; // Passed by parent
}

const AudienceDemographicsBlock: React.FC<AudienceDemographicsProps> = ({
  ageRange,
  location,
  femalePct,
  // sectionVisibility,
}) => {
  const hasData = ageRange || location || (femalePct !== undefined && femalePct !== null && femalePct !== '');

  if (!hasData) {
    // Provide a more informative fallback, or let parent handle it.
    // For consistency with StatsGridBlock, let's add a small message.
    return <p className="text-[0.9rem]" style={{ color: 'var(--theme-foreground)' }}>No audience demographics data to display.</p>; 
  }

  return (
    <div className="flex flex-row flex-wrap justify-around items-stretch gap-4 md:gap-6">
      {ageRange && (
        <div className="stats-item flex flex-col items-center text-center p-3 md:p-4 rounded-lg flex-1 min-w-[100px]" style={{ flexBasis: 'calc(33% - 1rem)'}}>
          {/* <UsersIcon className="h-8 w-8 mx-auto mb-2 stats-icon" /> Re-add if icons become part of this block */}
          <h3 className="text-xl md:text-2xl font-semibold mb-1">{ageRange}</h3>
          <p className="text-xs sm:text-sm">Age Range</p>
        </div>
      )}
      {location && (
        <div className="stats-item flex flex-col items-center text-center p-3 md:p-4 rounded-lg flex-1 min-w-[100px]" style={{ flexBasis: 'calc(33% - 1rem)'}}>
          {/* <UsersIcon className="h-8 w-8 mx-auto mb-2 stats-icon" /> */}
          <h3 className="text-xl md:text-2xl font-semibold mb-1">{location}</h3>
          <p className="text-xs sm:text-sm">Primary Location</p>
        </div>
      )}
      {(femalePct !== undefined && femalePct !== null && femalePct !== '') && (
        <div className="stats-item flex flex-col items-center text-center p-3 md:p-4 rounded-lg flex-1 min-w-[100px]" style={{ flexBasis: 'calc(33% - 1rem)'}}>
          {/* <UsersIcon className="h-8 w-8 mx-auto mb-2 stats-icon" /> */}
          <h3 className="text-xl md:text-2xl font-semibold mb-1">
            {formatNumber(femalePct)}%
          </h3>
          <p className="text-xs sm:text-sm">Female Audience</p>
        </div>
      )}
    </div>
  );
};

export default AudienceDemographicsBlock; 