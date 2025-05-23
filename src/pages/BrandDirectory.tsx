import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { FunnelIcon, XMarkIcon, ChevronDownIcon, HeartIcon } from '@heroicons/react/24/outline';
import { Popover, Disclosure } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { withPreview } from '@/lib/withPreview';
import { supabase } from '@/lib/supabase';
import { NormalizedBrand, Product, Contact, SupabaseBrand } from '@/types';
import BrandDetailModal from '@/components/modals/BrandDetailModal';

// Local Storage key for favorites (must match SearchResults.tsx)
const FAVORITED_BRANDS_LS_KEY = 'favoritedBrandIds';

// --- Helper functions (copied from SearchResults.tsx or should be moved to shared utils) ---
const getStoredIds = (key: string): number[] => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
};

// Function to toggle favorite status in local storage (Ensure this is present)
const toggleIdInStorage = (key: string, brandId: number): number[] => {
  const currentIds = getStoredIds(key);
  let updatedIds;
  if (currentIds.includes(brandId)) {
    updatedIds = currentIds.filter(id => id !== brandId);
  } else {
    updatedIds = [...currentIds, brandId];
  }
  localStorage.setItem(key, JSON.stringify(updatedIds));
  return updatedIds;
};

const sizeCategory = (raw: string | undefined): string => {
  if (!raw) return "N/A";
  const n = parseInt(raw.replace(/[^\d]/g, ""), 10);
  if (isNaN(n)) return "N/A";
  if (n <= 10)    return "1-10";
  if (n <= 50)    return "11-50";
  if (n <= 200)   return "51-200";
  if (n <= 500)   return "201-500";
  return "500+";
};

// Full normalization function (similar to SearchResults.tsx)
const normalizeSupabaseBrand = (
  supabaseBrand: SupabaseBrand,
  favoritedBrandIds: number[]
): NormalizedBrand => {
  const products: Product[] = [];
  if (supabaseBrand.product_1_name && supabaseBrand.product_1_link && supabaseBrand.product_1_image_url && supabaseBrand.product_1_price) {
    products.push({ name: supabaseBrand.product_1_name, link: supabaseBrand.product_1_link, image_url: supabaseBrand.product_1_image_url, price: supabaseBrand.product_1_price });
  }
  if (supabaseBrand.product_2_name && supabaseBrand.product_2_link && supabaseBrand.product_2_image_url && supabaseBrand.product_2_price) {
    products.push({ name: supabaseBrand.product_2_name, link: supabaseBrand.product_2_link, image_url: supabaseBrand.product_2_image_url, price: supabaseBrand.product_2_price });
  }
  if (supabaseBrand.product_3_name && supabaseBrand.product_3_link && supabaseBrand.product_3_image_url && supabaseBrand.product_3_price) {
    products.push({ name: supabaseBrand.product_3_name, link: supabaseBrand.product_3_link, image_url: supabaseBrand.product_3_image_url, price: supabaseBrand.product_3_price });
  }

  const contacts: Contact[] = [];
  if (supabaseBrand.decision_maker_name_1 && supabaseBrand.decision_maker_role_1 && supabaseBrand.decision_maker_email_1) {
    contacts.push({ id: 1, name: supabaseBrand.decision_maker_name_1, title: supabaseBrand.decision_maker_role_1, email: supabaseBrand.decision_maker_email_1, profileImage: supabaseBrand.favicon_url });
  }
  if (supabaseBrand.decision_maker_name_2 && supabaseBrand.decision_maker_role_2 && supabaseBrand.decision_maker_email_2) {
    contacts.push({ id: 2, name: supabaseBrand.decision_maker_name_2, title: supabaseBrand.decision_maker_role_2, email: supabaseBrand.decision_maker_email_2, profileImage: supabaseBrand.favicon_url });
  }
  if (supabaseBrand.decision_maker_name_3 && supabaseBrand.decision_maker_role_3 && supabaseBrand.decision_maker_email_3) {
    contacts.push({ id: 3, name: supabaseBrand.decision_maker_name_3, title: supabaseBrand.decision_maker_role_3, email: supabaseBrand.decision_maker_email_3, profileImage: supabaseBrand.favicon_url });
  }
  
  return {
    ...supabaseBrand,
    name: supabaseBrand.brand_name,
    logo: supabaseBrand.favicon_url || '',
    industry: supabaseBrand.industry_tags || 'N/A',
    size: sizeCategory(supabaseBrand.company_size),
    instagram: supabaseBrand.instagram_url || '', // Ensure these match NormalizedBrand in types.ts
    tiktok: supabaseBrand.tiktok_url || '',     // Ensure these match NormalizedBrand in types.ts
    founded: supabaseBrand.founded_year || 'N/A',
    website: supabaseBrand.website_url,
    description: supabaseBrand.tagline, // Matches NormalizedBrand in types.ts
    products,
    contacts,
    isFavorite: favoritedBrandIds.includes(supabaseBrand.id),
    // avg_product_price will be inherited from SupabaseBrand if present
  };
};

const shimmerAnimation = {
  '.animate-shimmer': {
    animation: 'shimmer 1s cubic-bezier(0.4, 0, 0.2, 1) forwards'
  },
  '@keyframes shimmer': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(50%)' }
  }
};

// Define industry filter options locally for BrandDirectory, similar to SearchResults
const brandDirectoryIndustryFilters = {
  'Beauty': ['Makeup', 'Cosmetics', 'Beauty Tools'],
  'Skincare': ['Cleansers', 'Serums', 'Masks'],
  'Haircare': ['Shampoo', 'Styling', 'Treatment'],
  'Fashion': ['Clothing', 'Accessories', 'Footwear'],
  'Food & Beverage': ['Drinks', 'Snacks', 'Supplements'],
  'Trending': ['Tech', 'Entertainment', 'Lifestyle'] // Assuming 'Trending' might map to these if used as a filter
};

const BrandDirectoryComponent = ({ isPreview = false }: { isPreview?: boolean }) => {
  const navigate = useNavigate();
  const glowIntensity = useMotionValue(0);
  const textShadow = useTransform(
    glowIntensity,
    [0, 0.2, 0.4, 0.6, 0.8, 1],
    [
      '0 0 0px rgba(126, 105, 171, 0)',
      '0 0 15px rgba(126, 105, 171, 0.2)',
      '0 0 20px rgba(126, 105, 171, 0.3)',
      '0 0 25px rgba(126, 105, 171, 0.4)',
      '0 0 30px rgba(126, 105, 171, 0.5)',
      '0 0 35px rgba(126, 105, 171, 0.6)'
    ]
  );
  
  const count = useMotionValue(1000);
  const rounded = useTransform(count, value => Math.round(value).toLocaleString());
  const [searchInputValue, setSearchInputValue] = useState('');
  const [_fetchedBrandsForTiles, setFetchedBrandsForTiles] = useState<SupabaseBrand[]>([]);
  const [favoritedBrandsList, setFavoritedBrandsList] = useState<NormalizedBrand[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

  // Modal State
  const [selectedBrandForModal, setSelectedBrandForModal] = useState<NormalizedBrand | null>(null);
  const [isDirectoryModalOpen, setIsDirectoryModalOpen] = useState(false);
  const [showDirectoryContactsInModal, setShowDirectoryContactsInModal] = useState(false);

  const categories = [
    { 
      id: 'beauty', 
      name: 'Beauty', 
      // query: 'beauty cosmetics makeup', // This specific query prop might be less relevant now
      brands: [
        { favicon_url: 'https://logo.clearbit.com/glossier.com', brand_name: 'Glossier' },
        { favicon_url: 'https://logo.clearbit.com/fentybeauty.com', brand_name: 'Fenty Beauty' },
        { favicon_url: 'https://logo.clearbit.com/milkmakeup.com', brand_name: 'Milk Makeup' },
        { favicon_url: 'https://logo.clearbit.com/versedskin.com', brand_name: 'Versed' },
        { favicon_url: 'https://logo.clearbit.com/tatcha.com', brand_name: 'Tatcha' },
        { favicon_url: 'https://logo.clearbit.com/drunkelephant.com', brand_name: 'Drunk Elephant' },
        { favicon_url: 'https://logo.clearbit.com/rarebeauty.com', brand_name: 'Rare Beauty' },
        { favicon_url: 'https://logo.clearbit.com/summerfridays.com', brand_name: 'Summer Fridays' },
        { favicon_url: 'https://logo.clearbit.com/tower28beauty.com', brand_name: 'Tower 28' }
      ]
    },
    { 
      id: 'skincare', 
      name: 'Skincare', 
      query: 'skincare face body',
      brands: [
        { favicon_url: 'https://logo.clearbit.com/cerave.com', brand_name: 'CeraVe' },
        { favicon_url: 'https://logo.clearbit.com/laroche-posay.us', brand_name: 'La Roche-Posay' },
        { favicon_url: 'https://logo.clearbit.com/theordinary.deciem.com', brand_name: 'The Ordinary' },
        { favicon_url: 'https://logo.clearbit.com/paulaschoice.com', brand_name: 'Paula\'s Choice' },
        { favicon_url: 'https://logo.clearbit.com/kiehls.com', brand_name: 'Kiehl\'s' },
        { favicon_url: 'https://logo.clearbit.com/murad.com', brand_name: 'Murad' },
        { favicon_url: 'https://logo.clearbit.com/biossance.com', brand_name: 'Biossance' },
        { favicon_url: 'https://logo.clearbit.com/glowrecipe.com', brand_name: 'Glow Recipe' },
        { favicon_url: 'https://logo.clearbit.com/herbivorebotanicals.com', brand_name: 'Herbivore' }
      ]
    },
    { 
      id: 'haircare', 
      name: 'Haircare', 
      query: 'hair products styling',
      brands: [
        { favicon_url: 'https://logo.clearbit.com/olaplex.com', brand_name: 'Olaplex' },
        { favicon_url: 'https://logo.clearbit.com/bumbleandbumble.com', brand_name: 'Bumble and bumble' },
        { favicon_url: 'https://logo.clearbit.com/theouai.com', brand_name: 'Ouai' },
        { favicon_url: 'https://logo.clearbit.com/sheamoisture.com', brand_name: 'SheaMoisture' },
        { favicon_url: 'https://logo.clearbit.com/igkhair.com', brand_name: 'IGK Hair' },
        { favicon_url: 'https://logo.clearbit.com/verbproducts.com', brand_name: 'Verb' },
        { favicon_url: 'https://logo.clearbit.com/briogeohair.com', brand_name: 'Briogeo' },
        { favicon_url: 'https://logo.clearbit.com/functionofbeauty.com', brand_name: 'Function of Beauty' },
        { favicon_url: 'https://logo.clearbit.com/thedrybar.com', brand_name: 'Drybar' }
      ]
    },
    { 
      id: 'fashion', 
      name: 'Fashion', 
      query: 'fashion clothing accessories',
      brands: [
        { favicon_url: 'https://logo.clearbit.com/zara.com', brand_name: 'Zara' },
        { favicon_url: 'https://logo.clearbit.com/hm.com', brand_name: 'H&M' },
        { favicon_url: 'https://logo.clearbit.com/nike.com', brand_name: 'Nike' },
        { favicon_url: 'https://logo.clearbit.com/adidas.com', brand_name: 'Adidas' },
        { favicon_url: 'https://logo.clearbit.com/gucci.com', brand_name: 'Gucci' },
        { favicon_url: 'https://logo.clearbit.com/dior.com', brand_name: 'Dior' },
        { favicon_url: 'https://logo.clearbit.com/urbanoutfitters.com', brand_name: 'Urban Outfitters' },
        { favicon_url: 'https://logo.clearbit.com/prettylittlething.com', brand_name: 'PrettyLittleThing' },
        { favicon_url: 'https://logo.clearbit.com/fashionnova.com', brand_name: 'Fashion Nova' }
      ]
    },
    { 
      id: 'foodAndBeverage', 
      name: 'Food & Beverage', 
      query: 'food beverage drinks',
      brands: [
        { favicon_url: 'https://logo.clearbit.com/drinkolipop.com', brand_name: 'Olipop' },
        { favicon_url: 'https://logo.clearbit.com/drinkpoppi.com', brand_name: 'Poppi' },
        { favicon_url: 'https://logo.clearbit.com/pressedjuicery.com', brand_name: 'Pressed Juicery' },
        { favicon_url: 'https://logo.clearbit.com/sweetgreen.com', brand_name: 'Sweetgreen' },
        { favicon_url: 'https://logo.clearbit.com/daily-harvest.com', brand_name: 'Daily Harvest' },
        { favicon_url: 'https://logo.clearbit.com/mudwtr.com', brand_name: 'Mud Wtr' },
        { favicon_url: 'https://logo.clearbit.com/notco.com', brand_name: 'NotCo' },
        { favicon_url: 'https://logo.clearbit.com/oatly.com', brand_name: 'Oatly' },
        { favicon_url: 'https://www.wadesdairy.com/wp-content/uploads/2019/07/Liquid-Death-Logo.jpg', brand_name: 'Liquid Death' }
      ]
    },
    { 
      id: 'trending', 
      name: 'Trending', 
      query: 'trending viral popular',
      brands: [
        { favicon_url: 'https://logo.clearbit.com/apple.com', brand_name: 'Apple' },
        { favicon_url: 'https://logo.clearbit.com/tesla.com', brand_name: 'Tesla' },
        { favicon_url: 'https://logo.clearbit.com/supremenewyork.com', brand_name: 'Supreme' },
        { favicon_url: 'https://logo.clearbit.com/shein.com', brand_name: 'Shein' },
        { favicon_url: 'https://logo.clearbit.com/netflix.com', brand_name: 'Netflix' },
        { favicon_url: 'https://logo.clearbit.com/spotify.com', brand_name: 'Spotify' },
        { favicon_url: 'https://logo.clearbit.com/tiktok.com', brand_name: 'TikTok' },
        { favicon_url: 'https://logo.clearbit.com/roblox.com', brand_name: 'Roblox' },
        { favicon_url: 'https://logo.clearbit.com/coinbase.com', brand_name: 'Coinbase' }
      ]
    }
  ];

  const [activeFilters, setActiveFilters] = useState({
    industry: [],
    location: [],
    size: [],
    founded: []
  });

  const filterOptions = {
    industry: {
      'Beauty': ['Makeup', 'Cosmetics', 'Beauty Tools'],
      'Skincare': ['Cleansers', 'Serums', 'Masks'],
      'Haircare': ['Shampoo', 'Styling', 'Treatment'],
      'Fashion': ['Clothing', 'Accessories', 'Footwear'],
      'Food & Beverage': ['Drinks', 'Snacks', 'Supplements'],
      'Trending': ['Tech', 'Entertainment', 'Lifestyle']
    },
    location: ['United States', 'Europe', 'Asia', 'Other'],
    size: ['1-10', '11-50', '51-200', '201-500', '500+'],
    founded: ['Startup (<3 years)', 'Emerging (3-10 years)', 'Established (>10 years)']
  };

  const toggleFilter = (category: string, value: string) => {
    setActiveFilters(prev => {
      const current = prev[category as keyof typeof prev];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const clearFilters = () => {
    setActiveFilters({
      industry: [],
      location: [],
      size: [],
      founded: []
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).reduce((acc, curr) => acc + curr.length, 0);
  };

  const isSearchDisabled = getActiveFilterCount() > 0;

  const handleSearch = () => {
    if (isPreview) return;

    const params = new URLSearchParams();
    if (searchInputValue.trim()) {
      params.set('q', searchInputValue.trim());
    }

    Object.entries(activeFilters).forEach(([key, values]) => {
      // Ensure activeFilters[key] is treated as string[] for iteration
      const filterValues = values as string[]; 
      if (Array.isArray(filterValues) && filterValues.length > 0) {
        filterValues.forEach(value => {
          params.append(key, value);
        });
      }
    });

    if (params.toString()) {
      navigate(`/search-results?${params.toString()}`);
    } else if (searchInputValue.trim()) {
      // Fallback for when only search input is used without popover filters
      navigate(`/search-results?q=${encodeURIComponent(searchInputValue.trim())}`);
    }
  };

  const handleCategoryClick = (categoryClicked: { id: string, name: string }) => {
    if (isPreview) return;
    const params = new URLSearchParams();
    const categoryName = categoryClicked.name as keyof typeof brandDirectoryIndustryFilters;

    // Check if the category exists in our defined filters
    if (brandDirectoryIndustryFilters[categoryName]) {
      const subcategories = brandDirectoryIndustryFilters[categoryName];
      subcategories.forEach(subcategory => {
        params.append('industry', `${categoryName}:${subcategory}`);
      });
    } else {
      // Fallback: if category not in our detailed list, or has no defined subcategories,
      // send the category name itself. This matches the old behavior for safety,
      // but ideally all categories clicked would map to subcategories.
      params.set('industry', categoryName);
      console.warn(`Category '${categoryName}' not found in brandDirectoryIndustryFilters or has no subcategories. Sending category name directly.`);
    }
    
    navigate(`/search-results?${params.toString()}`);
  };

  useEffect(() => {
    const controls = animate(count, 10261, {
      duration: 1.5,
      ease: [0.19, 1.0, 0.22, 1.0],
    });

    if (!isPreview) {
      const fetchInitialData = async () => {
        try {
          // Fetch for category tiles (existing logic)
          const { data: allCompanyData, error: allCompanyError } = await supabase
            .from('companies')
            .select('*'); 

          if (allCompanyError) {
            console.error('Error fetching brands for directory tiles:', allCompanyError);
            setFetchedBrandsForTiles([]);
          } else if (allCompanyData) {
            setFetchedBrandsForTiles(allCompanyData as SupabaseBrand[]);
          }

          // Fetch and process favorited brands
          setIsLoadingFavorites(true);
          const favoritedIds = getStoredIds(FAVORITED_BRANDS_LS_KEY);
          if (favoritedIds.length > 0) {
            const { data: favData, error: favError } = await supabase
              .from('companies')
              .select('*')
              .in('id', favoritedIds);
            
            if (favError) {
              console.error('Error fetching favorited brands:', favError);
              setFavoritedBrandsList([]);
            } else if (favData) {
              // Use the new full normalization function
              const normalizedFavorites = favData.map(brand => normalizeSupabaseBrand(brand as SupabaseBrand, favoritedIds));
              setFavoritedBrandsList(normalizedFavorites);
            }
          } else {
            setFavoritedBrandsList([]); 
          }
        } catch (error) {
          console.error('Supabase fetch failed for directory:', error);
          setFetchedBrandsForTiles([]);
          setFavoritedBrandsList([]);
        } finally {
          setIsLoadingFavorites(false);
        }
      };
      fetchInitialData();
    }
    return controls.stop;
  }, [count, isPreview, navigate]);

  const handleHoverStart = () => {
    glowIntensity.set(0);
    animate(glowIntensity, 1, { 
      duration: 3,
      ease: [0.4, 0, 0.2, 1]
    });
  };

  const handleHoverEnd = () => {
    animate(glowIntensity, 0, { 
      duration: 1,
      ease: "easeOut"
    });
  };

  const cardVariants = {
    initial: {
      scale: 1,
      boxShadow: "0 0 0 1px rgba(126, 105, 171, 0.1)",
    },
    hover: {
      scale: 1.02,
      boxShadow: "0 0 0 2px rgba(126, 105, 171, 0.3), 0 0 20px 2px rgba(126, 105, 171, 0.3), 0 0 40px 2px rgba(126, 105, 171, 0.2)",
    }
  };

  const overlayVariants = {
    initial: { opacity: 0 },
    hover: { opacity: 1 }
  };

  // Modal Handlers
  const openDirectoryBrandModal = (brand: NormalizedBrand) => {
    setSelectedBrandForModal(brand);
    setIsDirectoryModalOpen(true);
    setShowDirectoryContactsInModal(false); // Reset contacts visibility on new modal open
  };

  const closeDirectoryBrandModal = () => {
    setIsDirectoryModalOpen(false);
    setSelectedBrandForModal(null); // Clear selected brand
  };

  const toggleDirectoryContactsInModal = () => {
    setShowDirectoryContactsInModal(prev => !prev);
  };

  const handleToggleFavoriteOnDirectoryPage = (brandId: number) => {
    toggleIdInStorage(FAVORITED_BRANDS_LS_KEY, brandId);
    const newFavoritedIds = getStoredIds(FAVORITED_BRANDS_LS_KEY);

    // Update the main list of favorited brands
    setFavoritedBrandsList(prevList => 
      prevList
        .map(b => (b.id === brandId ? { ...b, isFavorite: !b.isFavorite } : b))
        .filter(b => newFavoritedIds.includes(b.id)) // Keep only currently favorited items
    );

    // If the currently opened modal brand is the one being toggled, update its state
    if (selectedBrandForModal && selectedBrandForModal.id === brandId) {
      setSelectedBrandForModal(prevModalBrand => 
        prevModalBrand ? { ...prevModalBrand, isFavorite: !prevModalBrand.isFavorite } : null
      );
    }
  };
  
  const openEmailTemplateSelectorForDirectory = (target: NormalizedBrand | Contact) => {
    // Placeholder: In a real app, this would open the TemplateSelectorModal
    // For now, it can be a simple alert or no-op if TemplateSelectorModal is not being integrated here yet.
    alert(`Email template functionality for ${target_name(target)} is not yet implemented on this page.`);
  };

  // Helper to get name for alert
  const target_name = (target: NormalizedBrand | Contact) => {
    return ('brand_name' in target || 'name' in target) ? (target as NormalizedBrand).name : (target as Contact).name;
  };

  return (
    <div className="min-h-screen bg-cream">
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-12 pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1 
              className="text-[2.75rem] md:text-[3.5rem] lg:text-[4rem] font-display font-medium text-charcoal leading-tight mb-2"
            >
              Over{' '}
              <motion.span
                className="inline-block text-rose relative z-10"
                onHoverStart={handleHoverStart}
                onHoverEnd={handleHoverEnd}
                style={{ textShadow }}
              >
                <motion.span style={{ display: 'inline-block' }}>
                  {rounded}
                </motion.span>
              </motion.span>
              {' '}Brands.
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-taupe font-display"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Updated Daily.
            </motion.p>
          </motion.div>

          <motion.div 
            className="max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="bg-white rounded-xl shadow-sm border border-blush/20 p-4">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Search brands..."
                  value={searchInputValue}
                  onChange={(e) => setSearchInputValue(e.target.value)}
                  className={`flex-1 px-6 py-4 rounded-lg border border-blush/20 focus:outline-none focus:ring-2 focus:ring-rose/20 text-lg bg-cream/50 ${isSearchDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isSearchDisabled}
                />
                <button 
                  className="h-[52px] px-8 bg-rose text-white rounded-lg hover:bg-rose/90 transition-colors text-lg font-medium"
                  onClick={handleSearch}
                >
                  Search
                </button>
                <Popover className="relative">
                  {({ open }) => (
                    <>
                      <Popover.Button
                        className={`h-[52px] w-[52px] rounded-lg border border-blush/20 flex items-center justify-center transition-colors focus:outline-none ${
                          open ? 'bg-rose text-white' : 'bg-white hover:bg-rose/5'
                        }`}
                      >
                        <FunnelIcon className="w-6 h-6" />
                        {getActiveFilterCount() > 0 && (
                          <span className="absolute -top-1 -right-1 bg-rose text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                            {getActiveFilterCount()}
                          </span>
                        )}
                      </Popover.Button>
                      <Popover.Panel className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-blush/20 p-4 z-50">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium text-charcoal">Filters</h3>
                          <button
                            onClick={clearFilters}
                            className="text-sm text-rose hover:text-rose/80"
                          >
                            Clear all
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          <Disclosure>
                            {({ open }) => (
                              <div className="border border-blush/20 rounded-lg overflow-hidden">
                                <Disclosure.Button className="w-full px-4 py-3 flex justify-between items-center bg-cream/50 hover:bg-cream/70 transition-colors">
                                  <span className="font-medium text-charcoal">Industry</span>
                                  <ChevronDownIcon
                                    className={`w-5 h-5 text-taupe transition-transform ${open ? 'transform rotate-180' : ''}`}
                                  />
                                </Disclosure.Button>
                                <Disclosure.Panel className="p-4 space-y-2">
                                  {Object.entries(filterOptions.industry).map(([category, subcategories]) => (
                                    <Disclosure key={category}>
                                      {({ open: subOpen }) => (
                                        <div className="border border-blush/10 rounded-lg overflow-hidden bg-white">
                                          <Disclosure.Button className="w-full px-3 py-2 flex justify-between items-center hover:bg-cream/30 transition-colors">
                                            <span className="text-sm font-medium text-charcoal">{category}</span>
                                            <ChevronDownIcon
                                              className={`w-4 h-4 text-taupe transition-transform ${subOpen ? 'transform rotate-180' : ''}`}
                                            />
                                          </Disclosure.Button>
                                          <Disclosure.Panel className="px-3 py-2 bg-cream/10">
                                            <div className="flex flex-wrap gap-2">
                                              {subcategories.map(subcategory => (
                                                <button
                                                  key={subcategory}
                                                  onClick={() => toggleFilter('industry', `${category}:${subcategory}`)}
                                                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${
                                                    activeFilters.industry.includes(`${category}:${subcategory}`)
                                                      ? 'bg-rose border-rose text-white'
                                                      : 'bg-white border-blush/20 text-charcoal hover:bg-rose/5'
                                                  }`}
                                                >
                                                  {subcategory}
                                                </button>
                                              ))}
                                            </div>
                                          </Disclosure.Panel>
                                        </div>
                                      )}
                                    </Disclosure>
                                  ))}
                                </Disclosure.Panel>
                              </div>
                            )}
                          </Disclosure>

                          <Disclosure>
                            {({ open }) => (
                              <div className="border border-blush/20 rounded-lg overflow-hidden">
                                <Disclosure.Button className="w-full px-4 py-3 flex justify-between items-center bg-cream/50 hover:bg-cream/70 transition-colors">
                                  <span className="font-medium text-charcoal">Location</span>
                                  <ChevronDownIcon
                                    className={`w-5 h-5 text-taupe transition-transform ${open ? 'transform rotate-180' : ''}`}
                                  />
                                </Disclosure.Button>
                                <Disclosure.Panel className="p-4">
                                  <div className="flex flex-wrap gap-2">
                                    {filterOptions.location.map(location => (
                                      <button
                                        key={location}
                                        onClick={() => toggleFilter('location', location)}
                                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${
                                          activeFilters.location.includes(location)
                                            ? 'bg-rose border-rose text-white'
                                            : 'bg-white border-blush/20 text-charcoal hover:bg-rose/5'
                                        }`}
                                      >
                                        {location}
                                      </button>
                                    ))}
                                  </div>
                                </Disclosure.Panel>
                              </div>
                            )}
                          </Disclosure>

                          <Disclosure>
                            {({ open }) => (
                              <div className="border border-blush/20 rounded-lg overflow-hidden">
                                <Disclosure.Button className="w-full px-4 py-3 flex justify-between items-center bg-cream/50 hover:bg-cream/70 transition-colors">
                                  <span className="font-medium text-charcoal">Company Size</span>
                                  <ChevronDownIcon
                                    className={`w-5 h-5 text-taupe transition-transform ${open ? 'transform rotate-180' : ''}`}
                                  />
                                </Disclosure.Button>
                                <Disclosure.Panel className="p-4">
                                  <div className="flex flex-wrap gap-2">
                                    {filterOptions.size.map(size => (
                                      <button
                                        key={size}
                                        onClick={() => toggleFilter('size', size)}
                                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${
                                          activeFilters.size.includes(size)
                                            ? 'bg-rose border-rose text-white'
                                            : 'bg-white border-blush/20 text-charcoal hover:bg-rose/5'
                                        }`}
                                      >
                                        {size} employees
                                      </button>
                                    ))}
                                  </div>
                                </Disclosure.Panel>
                              </div>
                            )}
                          </Disclosure>

                          <Disclosure>
                            {({ open }) => (
                              <div className="border border-blush/20 rounded-lg overflow-hidden">
                                <Disclosure.Button className="w-full px-4 py-3 flex justify-between items-center bg-cream/50 hover:bg-cream/70 transition-colors">
                                  <span className="font-medium text-charcoal">Year Founded</span>
                                  <ChevronDownIcon
                                    className={`w-5 h-5 text-taupe transition-transform ${open ? 'transform rotate-180' : ''}`}
                                  />
                                </Disclosure.Button>
                                <Disclosure.Panel className="p-4">
                                  <div className="flex flex-wrap gap-2">
                                    {filterOptions.founded.map(range => (
                                      <button
                                        key={range}
                                        onClick={() => toggleFilter('founded', range)}
                                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${
                                          activeFilters.founded.includes(range)
                                            ? 'bg-rose border-rose text-white'
                                            : 'bg-white border-blush/20 text-charcoal hover:bg-rose/5'
                                        }`}
                                      >
                                        {range}
                                      </button>
                                    ))}
                                  </div>
                                </Disclosure.Panel>
                              </div>
                            )}
                          </Disclosure>
                        </div>

                        <div className="mt-6 pt-4 border-t border-blush/20 space-y-3">
                          <button
                            className="w-full px-6 py-3 bg-white text-rose border border-rose rounded-lg hover:bg-rose/5 transition-colors"
                            onClick={() => {}}
                          >
                            Apply Filters
                          </button>
                          <button
                            className="w-full px-6 py-3 bg-rose text-white rounded-lg hover:bg-rose/90 transition-colors"
                            onClick={handleSearch}
                          >
                            Search
                          </button>
                        </div>
                      </Popover.Panel>
                    </>
                  )}
                </Popover>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="max-w-4xl mx-auto grid grid-cols-3 gap-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                className="relative group overflow-hidden rounded-xl aspect-[3/2] bg-white"
                variants={cardVariants}
                initial="initial"
                whileHover="hover"
                animate="initial"
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                  mass: 1
                }}
                onClick={() => handleCategoryClick(category)}
              >
                <div className="absolute inset-0 grid grid-cols-3 gap-0.5 p-1">
                  {category.brands.map((brand, idx) => (
                    <div 
                      key={brand.brand_name}
                      className="relative flex items-center justify-center"
                    >
                      <img
                        src={brand.favicon_url}
                        alt={brand.brand_name}
                        className="w-2/3 h-2/3 object-contain"
                        onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/64?text=Error')}
                      />
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(260,30%,35%)]/75 via-[hsl(260,30%,35%)]/65 via-[hsl(260,30%,35%)]/40 via-[hsl(260,30%,35%)]/10 to-transparent transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-3xl font-display font-medium text-white">
                    {category.name}
                  </h3>
                </div>
                <motion.div
                  className="absolute inset-0 rounded-xl bg-rose/5"
                  variants={overlayVariants}
                  initial="initial"
                  whileHover="hover"
                  animate="initial"
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                    mass: 1
                  }}
                />
              </motion.button>
            ))}
          </motion.div>

          <motion.div
            className="max-w-4xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-medium text-charcoal">Favorite Brands</h2>
              {/* Optional: Manage Favorites button - can link to search results or a dedicated page later */}
              {/* <button className="text-sm text-rose hover:text-rose/80 font-medium">Manage Favorites</button> */}
            </div>

            {isLoadingFavorites ? (
              <div className="bg-white rounded-xl shadow-sm border border-blush/20 p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose mx-auto"></div>
                <p className="text-taupe mt-4">Loading favorites...</p>
              </div>
            ) : favoritedBrandsList.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-blush/20 p-8 text-center">
                <HeartIcon className="w-8 h-8 text-taupe mx-auto mb-4" />
                <h3 className="text-lg font-medium text-charcoal mb-2">No favorite brands yet</h3>
                <p className="text-taupe mb-4">
                  Heart brands you love to keep track of them. You can favorite brands from the search results page.
                </p>
                <button 
                  onClick={() => navigate('/search-results')}
                  className="text-rose hover:text-rose/80 font-medium"
                >
                  Explore brands to favorite
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoritedBrandsList.map(brand => (
                  <motion.div
                    key={brand.id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-blush/20 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => openDirectoryBrandModal(brand)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-cream/50 flex items-center justify-center flex-shrink-0">
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="w-10 h-10 object-contain"
                          onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/40?text=Logo')}
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-md font-medium text-charcoal truncate">{brand.name}</h4>
                        <p className="text-sm text-taupe truncate">{brand.industry}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
      {/* Render the BrandDetailModal */}
      <BrandDetailModal 
        isOpen={isDirectoryModalOpen}
        onClose={closeDirectoryBrandModal}
        brand={selectedBrandForModal}
        onToggleFavorite={handleToggleFavoriteOnDirectoryPage}
        onToggleContacts={toggleDirectoryContactsInModal}
        showContacts={showDirectoryContactsInModal}
        onOpenEmailTemplateSelector={openEmailTemplateSelectorForDirectory} 
      />
    </div>
  );
};

export default withPreview(BrandDirectoryComponent); 