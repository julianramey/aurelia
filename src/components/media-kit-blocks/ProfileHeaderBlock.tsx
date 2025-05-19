import React from 'react';
import type { SectionVisibilityState } from '@/lib/types';
import SocialLinksBlock, { type SocialLinkItem } from './SocialLinksBlock';
import { cn } from '@/lib/utils'; // Import cn for conditional classes

// interface SocialLink has been replaced by importing SocialLinkItem
// interface SocialLink {
//   type: 'instagram' | 'tiktok' | 'email' | 'website' | 'phone'; 
//   url: string;
//   label?: string; 
// }

export type HeaderVariant = "default" | "centered" | "hero";

interface ProfileHeaderProps {
  avatarUrl?: string;
  name: string;
  subheading?: string;
  socialLinks?: SocialLinkItem[]; // Use imported SocialLinkItem type
  sectionVisibility: SectionVisibilityState; // To control internal parts of the header
  variant?: HeaderVariant;
  className?: string; // For custom styling of the root element
}

const ProfileHeaderBlock: React.FC<ProfileHeaderProps> = ({
  avatarUrl,
  name,
  subheading,
  socialLinks,
  sectionVisibility,
  variant = "default", // Default to "default" variant
  className,
}) => {
  // Determine if the main info part (name, subheading) should be shown
  const showProfileDetails = sectionVisibility.profileDetails;
  // Determine if social links should be shown
  const showSocialMedia = sectionVisibility.socialMedia;
  // Determine if avatar should be shown
  const showAvatar = sectionVisibility.profilePicture;

  // If no parts of the header are visible based on sectionVisibility, render nothing.
  if (!showAvatar && !showProfileDetails && !showSocialMedia) {
    return null;
  }

  // Define base and variant-specific classes
  const baseContainerClasses = "p-6 md:p-8"; // Common padding, can be overridden by className

  let variantContainerClasses = "";
  let avatarContainerClasses = "mx-auto md:mx-0"; // Default for 'default' variant
  let textContainerClasses = "text-center md:text-left"; // Default for 'default' variant
  let avatarSizeClasses = "w-36 h-36 md:w-48 md:h-48"; // Default avatar size

  switch (variant) {
    case "centered":
      variantContainerClasses = "flex flex-col items-center text-center space-y-4";
      avatarContainerClasses = "mx-auto"; // Center avatar
      textContainerClasses = "text-center"; // Center text
      avatarSizeClasses = "w-40 h-40"; // Slightly larger for centered
      break;
    case "hero":
      variantContainerClasses = "flex flex-col items-center text-center space-y-6 py-8 md:py-12"; // More vertical padding and space for hero
      avatarContainerClasses = "mx-auto";
      textContainerClasses = "text-center";
      avatarSizeClasses = "w-48 h-48 md:w-56 md:h-56"; // Larger avatar for hero
      break;
    case "default": // Current default behavior, can be adjusted if needed
    default:
      variantContainerClasses = "grid grid-cols-1 md:grid-cols-[auto,1fr] gap-6 md:gap-8 items-center";
      // avatarContainerClasses and textContainerClasses remain as their defaults
      break;
  }

  return (
    <div className={cn(
      "profile-header-block", // Base class for potential global styling
      baseContainerClasses,
      variantContainerClasses,
      className // Allow overriding all classes or adding new ones
    )}>
      {showAvatar && (
        <div className={cn("photo-container", avatarContainerClasses)}>
          <div 
            className={cn(
              "rounded-full overflow-hidden border-4 shadow-md", 
              avatarSizeClasses
            )} 
            style={{ borderColor: 'var(--accent, #ddd)' }} // Changed to use --accent directly
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={name || 'Profile'} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                <span className="text-lg">No Photo</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {(showProfileDetails || showSocialMedia) && (
        <div className={cn("info-container", textContainerClasses, variant === "default" && !showAvatar ? "md:col-span-2 text-center md:text-left" : "")}>
          {showProfileDetails && (
            <>
              <h1 
                className={cn(
                  "font-bold tracking-tight",
                  variant === "hero" ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl",
                  {"font-['Playfair_Display']": variant === "hero"} // Specific font for hero if desired
                )} 
                style={{ color: 'var(--accent)' }}
              >
                {name || 'Creator Name'}
              </h1>
              {subheading && (
                <p 
                  className={cn(
                    "italic mt-1",
                    variant === "hero" ? "text-lg md:text-xl" : "text-md md:text-lg"
                  )} 
                  style={{ color: '#000000' }}
                >
                  {subheading}
                </p>
              )}
            </>
          )}
          
          {showSocialMedia && socialLinks && socialLinks.length > 0 && (
            <div className={cn("mt-4", {"mx-auto w-fit": variant === "centered" || variant === "hero" })}>
              <SocialLinksBlock links={socialLinks} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileHeaderBlock; 