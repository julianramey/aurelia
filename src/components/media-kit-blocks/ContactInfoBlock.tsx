import React from 'react';
import type { SectionVisibilityState } from '@/lib/types';
import type { SocialLinkItem } from './SocialLinksBlock';

interface ContactInfoProps {
  email?: string;
  phone?: string;
  website?: string;
  socialLinks?: SocialLinkItem[];
  sectionVisibility: SectionVisibilityState;
}

const ContactInfoBlock: React.FC<ContactInfoProps> = ({
  email,
  phone,
  website,
  socialLinks,
  // sectionVisibility, // Not directly used for styling items here
}) => {
  const hasData = email || phone || website || (socialLinks && socialLinks.length > 0);

  if (!hasData) {
    return null; // If no contact info, don't render the grid
  }

  // Helper to format website URL if it doesn't include a protocol
  const formatWebsiteUrl = (url: string): string => {
    if (!url.match(/^https?:\/\//)) {
      return `https://${url}`;
    }
    return url;
  };

  return (
    <div className="contact-info grid grid-cols-1 md:grid-cols-3 gap-6">
      {email && (
        <div className="p-4 rounded-[0.75rem] border" style={{ backgroundColor: 'var(--theme-accent-light)', borderColor: 'var(--border)' }}>
          <h4 className="text-[0.9rem] mb-2" style={{ color: 'var(--theme-foreground)' }}>Email</h4>
          <p>
            <a 
              href={`mailto:${email}`}
              className="contact-info-text font-medium hover:underline block"
              style={{ color: 'var(--theme-accent)' }}
            >
              {email}
            </a>
          </p>
        </div>
      )}
      {phone && (
        <div className="p-4 rounded-[0.75rem] border" style={{ backgroundColor: 'var(--theme-accent-light)', borderColor: 'var(--border)' }}>
          <h4 className="text-[0.9rem] mb-2" style={{ color: 'var(--theme-foreground)' }}>Phone</h4>
          <p>
            <a 
              href={`tel:${phone}`}
              className="contact-info-text font-medium hover:underline block"
              style={{ color: 'var(--theme-accent)' }}
            >
              {phone}
            </a>
          </p>
        </div>
      )}
      {website && (
        <div className="p-4 rounded-[0.75rem] border" style={{ backgroundColor: 'var(--theme-accent-light)', borderColor: 'var(--border)' }}>
          <h4 className="text-[0.9rem] mb-2" style={{ color: 'var(--theme-foreground)' }}>Website</h4>
          <p>
            <a 
              href={formatWebsiteUrl(website)}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-info-text font-medium hover:underline block"
              style={{ color: 'var(--theme-accent)' }}
            >
              {website}
            </a>
          </p>
        </div>
      )}
      {/* Render Social Links */}
      {socialLinks && socialLinks.map(link => {
        // Do not render email, website again if already handled above
        if (link.type === 'email' && email) return null;
        if (link.type === 'website' && website) return null;
        // Also skip phone if we decide to handle it separately or if it's not in SocialLinkItem type

        let href = link.url;
        if (link.type === 'instagram') href = `https://instagram.com/${link.url.replace(/^@/, '')}`;
        if (link.type === 'tiktok') href = `https://tiktok.com/@${link.url.replace(/^@/, '')}`;
        if (link.type === 'email') href = `mailto:${link.url}`;

        return (
          <div key={link.type} className="p-4 rounded-[0.75rem] border" style={{ backgroundColor: 'var(--theme-accent-light)', borderColor: 'var(--border)' }}>
            <h4 className="text-[0.9rem] mb-2 capitalize" style={{ color: 'var(--theme-foreground)' }}>{link.type}</h4>
            <p>
              <a 
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-info-text font-medium hover:underline block"
                style={{ color: 'var(--theme-accent)' }}
              >
                {link.label || link.url} 
              </a>
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default ContactInfoBlock; 