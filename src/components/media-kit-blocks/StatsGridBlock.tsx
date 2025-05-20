import React, { ReactNode } from 'react';
import type { SectionVisibilityState } from '@/lib/types';
import { formatNumber } from '@/lib/utils';

// Assuming StatItem might be moved here or imported if it becomes a shared component itself
// For now, the structure implies StatsGridBlock will render its own items based on props.stats

interface StatItemProps {
  label: string;
  value: string | number | undefined;
  icon?: ReactNode; 
  // Add a category or type to help with filtering if labels are not fixed
  // For now, we rely on specific labels for filtering as done in the template.
}

interface StatsGridProps {
  stats: Array<StatItemProps>; // This will be the unfiltered list from the parent
  sectionVisibility: SectionVisibilityState; // Keep for potential future use, but filtering might move
  title?: string; // Optional title for the section, to be displayed by this block
}

const StatsGridBlock: React.FC<StatsGridProps> = ({
  stats, 
  sectionVisibility, // Keep for now, though direct filtering here is reduced
  title,
}) => {
  // Simplified filtering: The parent component should ideally pass the exact stats to display.
  // For now, let's assume `stats` prop contains what's intended for this instance of the block.
  // The old filtering logic is removed to avoid it hiding newly added stats.
  const displayStats = stats.filter(stat => stat.value !== undefined && stat.value !== null && String(stat.value).trim() !== '');

  if (!displayStats || displayStats.length === 0) {
    return <p className="text-[0.9rem] italic text-gray-400">No analytics data available.</p>; 
  }

  return (
    <div className="stats-grid-container space-y-3">
      {title && <h4 className="text-lg font-medium text-center" style={{ color: 'var(--theme-accent)' }}>{title}</h4>}
      <div className="stats-grid grid grid-cols-2 gap-3 sm:gap-4">
        {displayStats.map((stat, index) => {
          let displayValue = formatNumber(stat.value);
          const labelLower = stat.label.toLowerCase();

          if (labelLower.includes('engagement rate') && stat.value !== undefined && stat.value !== null) {
            const numericValue = parseFloat(String(stat.value));
            if (!isNaN(numericValue)) {
              displayValue = `${numericValue.toFixed(1)}%`; // Ensure one decimal place for percentages
            }
          }
          
          return (
            <div 
              key={index} 
              className="stats-item flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg shadow-sm text-center overflow-hidden"
              style={{
                backgroundColor: 'var(--theme-accent-light)', 
                border: '1px solid var(--theme-border, #E5E7EB)',
              }}
            >
              <h3 
                className="stats-number text-lg sm:text-xl font-semibold mb-0.5 min-w-0"
                style={{ color: 'var(--theme-foreground)', overflowWrap: 'break-word' }}
              >
                {displayValue}
              </h3>
              <p 
                className="stats-label text-[0.7rem] sm:text-xs min-w-0"
                style={{ color: 'var(--theme-secondary)', overflowWrap: 'break-word' }}
              >
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatsGridBlock; 