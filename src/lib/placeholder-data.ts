import type { MediaKitData, ColorScheme, VideoItem, Service, BrandCollaboration, MediaKitStats, SocialPlatform } from './types';

// Default color scheme to be used if a template doesn't specify its own.
export const DEFAULT_COLORS: ColorScheme = {
  background: "#F5F5F5", // Light gray, good general background
  text: "#1A1F2C",       // Dark charcoal for text
  secondary: "#8E9196",  // Medium gray for secondary text
  accent_light: "#E5DAF8",// Light purple
  accent: "#7E69AB",     // Main purple
  primary: "#7E69AB",    // Main purple (often same as accent)
};

// Common placeholder image URLs - using purple themed ones
const placeholderImagePurple1 = 'https://via.placeholder.com/600x400/A084E8/FFFFFF?text=Placeholder+Image+1';
const placeholderImagePurple2 = 'https://via.placeholder.com/600x400/C59DF2/FFFFFF?text=Placeholder+Image+2';
const placeholderImagePurple3 = 'https://via.placeholder.com/600x400/D0B0FF/000000?text=Placeholder+Image+3';
const placeholderProfilePicPurple = 'https://via.placeholder.com/300x300/A084E8/FFFFFF?text=Profile';


export function getPlaceholderData(templateId: string): Partial<MediaKitData> {
  const baseData: Partial<MediaKitData> = {
    type: 'media_kit_data',
    brand_name: "Your Name",
    tagline: "Captivating Tagline Here",
    colors: { ...DEFAULT_COLORS },
    font: "Inter, sans-serif",
    profile_photo: placeholderProfilePicPurple,
    personal_intro: "Welcome to my media kit! I'm a passionate creator specializing in [Your Niche]. I love connecting with audiences and partnering with innovative brands.",
    skills: ["Content Creation", "Social Media Marketing", "Video Editing", "Photography"],
    instagram_handle: "your_insta",
    tiktok_handle: "your_tiktok",
    contact_email: "hello@example.com",
    portfolio_images: [
      placeholderImagePurple1,
      placeholderImagePurple2,
      placeholderImagePurple3,
    ],
    videos: [
      { url: "https://www.tiktok.com/@tiktok/video/7060271196999605506", thumbnail_url: "https://via.placeholder.com/300x400/A084E8/FFFFFF?text=TikTok+Vid+1" },
      { url: "https://www.tiktok.com/@tiktok/video/7060271196999605506", thumbnail_url: "https://via.placeholder.com/300x400/C59DF2/FFFFFF?text=TikTok+Vid+2" },
    ],
    section_visibility: {
      profileDetails: true,
      brandExperience: true,
      servicesSkills: true,
      socialMedia: true,
      contactDetails: true,
      profilePicture: true,
      tiktokVideos: true,
      audienceStats: true,
      performance: true,
    },
    last_updated: new Date().toISOString(),
    // General stats - can be overridden by template-specific data
    instagram_followers: "10k",
    tiktok_followers: "25k",
    youtube_followers: "5k",
    audience_age_range: "18-34",
    audience_location_main: "United States",
    audience_gender_female: "60%",
    avg_video_views: "15k",
    avg_ig_reach: "30k",
    ig_engagement_rate: "5%",
  };

  switch (templateId) {
    case 'default':
      return {
        ...baseData,
        brand_name: "Creative Pro",
        tagline: "Innovative Digital Experiences",
        // Default template specific overrides can go here
        // For example, if default template uses specific image aspect ratios or content types
        colors: { // Example: Default template uses a slightly different shade or primary color
            ...DEFAULT_COLORS,
            primary: "#6A1B9A", // A deeper purple for default
            accent: "#6A1B9A",
        },
        portfolio_images: [
          'https://via.placeholder.com/400x300/9C27B0/FFFFFF?text=Default+Project+1',
          'https://via.placeholder.com/400x300/BA68C8/FFFFFF?text=Default+Project+2',
          'https://via.placeholder.com/400x300/CE93D8/000000?text=Default+Project+3',
        ],
      };
    case 'aesthetic':
      return {
        ...baseData,
        brand_name: "Aesthetic Vibes Creator",
        tagline: "Curating Beauty & Lifestyle",
        font: "'Playfair Display', serif", // A more stylistic font
        colors: { // Aesthetic template might prefer pastels or a specific palette
          background: "#FFF5F7", // Soft Blush background
          text: "#4A3640",      // Dark pink/brown text
          secondary: "#A67F8E",  // Muted secondary
          accent_light: "#FADADD",// Light pink accent
          accent: "#E4A7B6",     // Main pink accent
          primary: "#E4A7B6",
        },
        profile_photo: 'https://via.placeholder.com/300x300/E4A7B6/FFFFFF?text=Aesthetic+Profile',
        portfolio_images: [
          'https://via.placeholder.com/400x500/E4A7B6/FFFFFF?text=Aesthetic+Mood+1', // Portrait-oriented
          'https://via.placeholder.com/400x500/FADADD/4A3640?text=Aesthetic+Mood+2',
          'https://via.placeholder.com/400x500/A67F8E/FFFFFF?text=Aesthetic+Mood+3',
        ],
        personal_intro: "Hello! I craft visually stunning content focused on lifestyle, beauty, and minimalist aesthetics. Let's create something beautiful together.",
        skills: ["Visual Storytelling", "Brand Aesthetics", "Product Styling", "Lightroom Editing"],
      };
    case 'luxury':
      return {
        ...baseData,
        brand_name: "Luxury Lifestyle Influencer",
        tagline: "Elegance. Excellence. Experience.",
        font: "'Cormorant Garamond', serif", // Elegant serif font
        colors: { // Luxury template might use deep, rich colors or metallics
          background: "#1A1A1A", // Dark, near-black background
          text: "#E0E0E0",       // Off-white text
          secondary: "#A0A0A0",  // Light gray secondary text
          accent_light: "#D4AF37",// Gold accent light (placeholder for a gold tone)
          accent: "#B08D57",     // Muted gold/bronze accent
          primary: "#B08D57",
        },
        profile_photo: 'https://via.placeholder.com/300x300/B08D57/FFFFFF?text=Luxury+Profile',
        personal_intro: "Dedicated to showcasing the finest in luxury living, travel, and style. I partner with premium brands to deliver exceptional content to a discerning audience.",
        skills: ["High-End Brand Collaboration", "Luxury Product Reviews", "Eloquent Communication", "Event Curation"],
        // Luxury specific fields often involve more detailed stats
        instagram_followers: "500k",
        tiktok_followers: "1M",
        youtube_followers: "200k",
        audience_age_range: "25-54",
        audience_location_main: "Global Metropolises",
        audience_gender_female: "55%",
        avg_video_views: "100k+",
        avg_ig_reach: "250k+",
        ig_engagement_rate: "3.5%",
        showcase_images: [ // Specific showcase for luxury
          'https://via.placeholder.com/800x600/B08D57/FFFFFF?text=Luxury+Showcase+1',
          'https://via.placeholder.com/800x600/1A1A1A/E0E0E0?text=Luxury+Showcase+2&stroke=B08D57',
          'https://via.placeholder.com/800x600/D4AF37/000000?text=Luxury+Showcase+3',
        ],
        past_brands_text: "Collaborated with Dior, Rolex, Four Seasons",
        past_brands_image_url: 'https://via.placeholder.com/1200x200/1A1A1A/B08D57?text=Brand+Logos+Here', // Placeholder for brand logos strip
        next_steps_text: "Let's discuss how we can elevate your brand. Reach out for bespoke collaboration opportunities.",
      };
    default:
      // Fallback to baseData or a generic default if templateId is unknown
      return {
        ...baseData,
        brand_name: "General Creator",
        tagline: "Versatile Content & Collaboration"
      };
  }
} 