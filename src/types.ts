export interface Product {
  name: string;
  link: string;
  image_url: string;
  price: string;
}

// Structure from Supabase 'companies' table
export interface SupabaseBrand {
  id: number;
  brand_name: string;
  tagline?: string;
  website_url?: string;
  industry_tags?: string; // e.g., "Beauty, Skincare, Vegan"
  founded_year?: string;
  location?: string;
  instagram_url?: string; // URL to Instagram profile
  tiktok_url?: string;    // URL to TikTok profile
  favicon_url?: string;   // URL for the brand logo/favicon
  contact_email?: string;
  decision_maker_name_1?: string;
  decision_maker_role_1?: string;
  decision_maker_email_1?: string;
  decision_maker_name_2?: string;
  decision_maker_role_2?: string;
  decision_maker_email_2?: string;
  decision_maker_name_3?: string;
  decision_maker_role_3?: string;
  decision_maker_email_3?: string;
  company_size?: string; // e.g., "51-200"
  product_1_name?: string;
  product_1_link?: string;
  product_1_image_url?: string;
  product_1_price?: string;
  product_2_name?: string;
  product_2_link?: string;
  product_2_image_url?: string;
  product_2_price?: string;
  product_3_name?: string;
  product_3_link?: string;
  product_3_image_url?: string;
  product_3_price?: string;
  avg_product_price?: number;
}

// Contact interface expected by the UI
export interface Contact {
  id: number; // This is the relative ID (1, 2, or 3) within the brand's contacts
  name: string;
  title: string;
  email: string;
  profileImage?: string; // Note: Not directly available from new Supabase decision_maker fields. UI might need to adapt or use brand favicon.
  emailSent?: boolean;   // UI-specific state, likely managed locally
  emailSentDate?: string; // UI-specific state
  parentId: number; // ADD THIS LINE: ID of the parent brand (from companies.id)
}

// Normalized Brand type that components will use internally
export interface NormalizedBrand extends SupabaseBrand {
  name: string;          // Alias for SupabaseBrand.brand_name
  logo: string;          // Alias for SupabaseBrand.favicon_url
  industry: string;      // Transformed from SupabaseBrand.industry_tags
  size: string;          // Categorized from SupabaseBrand.company_size
  instagram: string;     // URL, from SupabaseBrand.instagram_url
  tiktok: string;        // URL, from SupabaseBrand.tiktok_url
  founded: string;       // Transformed from SupabaseBrand.founded_year
  website?: string;       // Alias for SupabaseBrand.website_url
  description?: string;   // Alias for SupabaseBrand.tagline
  products: Product[];
  contacts: Contact[];   // Mapped from decision_maker fields
  isFavorite?: boolean; // To maintain client-side favoriting state
} 