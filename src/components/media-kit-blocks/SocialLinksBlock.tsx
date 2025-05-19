import React from 'react';

// Define the structure for individual social links
export interface SocialLinkItem {
  type: 'instagram' | 'tiktok' | 'email' | 'website' | 'phone' | 'generic';
  url: string;
  label: string; 
  icon?: React.ReactNode; // Optional icon, not used in this initial version
}

interface SocialLinksBlockProps {
  links: SocialLinkItem[];
  // sectionVisibility is not strictly needed here if the parent (ProfileHeaderBlock)
  // already decides whether to render this block at all based on socialMedia visibility.
  // We'll keep it simple and assume this block always renders if links are provided.
}

const SocialLinksBlock: React.FC<SocialLinksBlockProps> = ({
  links,
}) => {
  if (!links || links.length === 0) {
    return null;
  }

  return (
    <div className="social-links flex flex-wrap gap-4 justify-center md:justify-start mt-4">
      {links.map((link) => (
        <a
          key={link.type + '-' + link.label} // More robust key
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[0.9rem] font-medium px-4 py-2 rounded-lg transition-all"
          style={{
            backgroundColor: 'var(--theme-light)',
            color: 'var(--theme-primary)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--theme-primary)';
            e.currentTarget.style.color = 'var(--theme-bg)'; 
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--theme-light)';
            e.currentTarget.style.color = 'var(--theme-primary)';
          }}
        >
          {/* Icon could be rendered here: link.icon */}
          {link.label}
        </a>
      ))}
    </div>
  );
};

export default SocialLinksBlock; 