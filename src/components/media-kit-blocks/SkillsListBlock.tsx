import React from 'react';
import type { SectionVisibilityState } from '@/lib/types';

interface SkillsListProps {
  skills: string[];
  sectionVisibility: SectionVisibilityState; // For consistency, though direct use here might be minimal if parent controls visibility of the whole block
  // title?: string; // Optional title for the section, if the block should include its own title
}

const SkillsListBlock: React.FC<SkillsListProps> = ({
  skills,
  // sectionVisibility, // Not directly used for filtering/styling items here, parent handles block visibility
}) => {
  if (!skills || skills.length === 0) {
    return <p className="text-[0.9rem] italic" style={{ color: '#000000' }}>No skills to display.</p>;
  }

  return (
    <div className="skills-list flex flex-wrap gap-2">
      {skills.map((skill, index) => (
        <span 
          key={index} 
          className="skill-tag px-4 py-2 rounded-full text-sm font-medium"
          style={{
            // Using RGBA for background to mix accent with transparency
            // Assuming theme.accent is a hex, e.g., #RRGGBB
            // This approach is a bit more complex than direct opacity if theme.accent can be non-hex.
            // A simpler approach for modern CSS: backgroundColor: `color-mix(in srgb, var(--theme-accent) 20%, transparent)`
            // For broader compatibility, direct RGBA or pre-calculated variables might be better.
            // Let's try CSS color-mix for modern approach. Fallback might be needed for older browsers.
            backgroundColor: `color-mix(in srgb, var(--theme-accent, #000000) 30%, transparent)`,
            color: 'var(--theme-accent)' // Use theme-accent for text, or a calculated contrast color.
          }}
        >
          {skill}
        </span>
      ))}
    </div>
  );
};

export default SkillsListBlock; 