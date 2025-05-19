import React from 'react';

export interface SectionTitleProps {
  children: React.ReactNode;
}

/**
 * A reusable section title component with consistent styling:
 * - Text color from `var(--primary)`
 * - Underline color from `var(--accent)`
 * Uses CSS variables provided by each template's theme.
 */
export const SectionTitle: React.FC<SectionTitleProps> = ({ children }) => {
  return (
    <>
      <h2
        className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-center"
        style={{
          color: 'var(--accent)',
          fontFamily: "'Playfair Display', serif",
        }}
      >
        {children}
      </h2>
      <div
        className="w-20 h-1 mx-auto mb-12"
        style={{ backgroundColor: 'var(--accent)' }}
      ></div>
    </>
  );
}; 