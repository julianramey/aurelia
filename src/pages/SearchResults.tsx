import React, { useState, useEffect, Fragment } from 'react';
import DashboardNav from '@/components/DashboardNav';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FunnelIcon, 
  XMarkIcon, 
  ChevronDownIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  EnvelopeIcon,
  HeartIcon,
  LinkIcon,
  MapPinIcon,
  UsersIcon,
  CalendarIcon,
  ChevronUpIcon,
  SparklesIcon, BoltIcon, ArrowPathRoundedSquareIcon, LightBulbIcon, MegaphoneIcon, HandThumbUpIcon,
  CurrencyDollarIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, CheckCircleIcon } from '@heroicons/react/24/solid';
import { Popover, Disclosure, Dialog, Transition } from '@headlessui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import TemplateSelectorModal, { EmailTemplate as ModalEmailTemplate } from '@/components/modals/TemplateSelectorModal';
import BrandDetailModal from '@/components/modals/BrandDetailModal';
import { supabase } from '@/lib/supabase';
import { NormalizedBrand, Product, Contact, SupabaseBrand } from '@/types';
import { getFavoritedBrandIdsFromSupabase, toggleFavoriteInSupabase, upsertOutreachStatus, UserOutreachStatus } from '@/lib/supabaseHelpers';

// Local Storage keys
// const FAVORITED_BRANDS_LS_KEY = 'favoritedBrandIds'; // REMOVED

// Local Storage helper functions
// const getStoredIds = (key: string): number[] => { // REMOVED
//   const stored = localStorage.getItem(key);
//   return stored ? JSON.parse(stored) : [];
// };

// const toggleIdInStorage = (key: string, brandId: number): number[] => { // REMOVED
//   const currentIds = getStoredIds(key);
//   let updatedIds;
//   if (currentIds.includes(brandId)) {
//     updatedIds = currentIds.filter(id => id !== brandId);
//   } else {
//     updatedIds = [...currentIds, brandId];
//   }
//   localStorage.setItem(key, JSON.stringify(updatedIds));
//   return updatedIds;
// };

// Helper function to map raw company size string to a size category bucket
const sizeCategory = (raw: string | undefined): string => {
  if (!raw) return "N/A";
  // strip out non-digits, parse to number
  const n = parseInt(raw.replace(/[^\d]/g, ""), 10);
  if (isNaN(n)) return "N/A";
  if (n <= 10)    return "1-10";
  if (n <= 50)    return "11-50";
  if (n <= 200)   return "51-200";
  if (n <= 500)   return "201-500";
  return "500+";
};

// Helper function to normalize Supabase data
const normalizeBrand = (
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
    contacts.push({ id: 1, name: supabaseBrand.decision_maker_name_1, title: supabaseBrand.decision_maker_role_1, email: supabaseBrand.decision_maker_email_1, profileImage: supabaseBrand.favicon_url, parentId: supabaseBrand.id });
  }
  if (supabaseBrand.decision_maker_name_2 && supabaseBrand.decision_maker_role_2 && supabaseBrand.decision_maker_email_2) {
    contacts.push({ id: 2, name: supabaseBrand.decision_maker_name_2, title: supabaseBrand.decision_maker_role_2, email: supabaseBrand.decision_maker_email_2, profileImage: supabaseBrand.favicon_url, parentId: supabaseBrand.id });
  }
  if (supabaseBrand.decision_maker_name_3 && supabaseBrand.decision_maker_role_3 && supabaseBrand.decision_maker_email_3) {
    contacts.push({ id: 3, name: supabaseBrand.decision_maker_name_3, title: supabaseBrand.decision_maker_role_3, email: supabaseBrand.decision_maker_email_3, profileImage: supabaseBrand.favicon_url, parentId: supabaseBrand.id });
  }
  
  return {
    ...supabaseBrand,
    name: supabaseBrand.brand_name,
    logo: supabaseBrand.favicon_url || '',
    industry: supabaseBrand.industry_tags || 'N/A',
    size: sizeCategory(supabaseBrand.company_size),
    instagram: supabaseBrand.instagram_url || '',
    tiktok: supabaseBrand.tiktok_url || '',
    founded: supabaseBrand.founded_year || 'N/A',
    website: supabaseBrand.website_url,
    description: supabaseBrand.tagline,
    products,
    contacts,
    isFavorite: favoritedBrandIds.includes(supabaseBrand.id),
  };
};

const emailTemplatesData: ModalEmailTemplate[] = [
  {
    id: 'template1',
    name: 'Initial Introduction',
    subject: 'Collaboration Inquiry: {{brandName}} x [Your Name/Brand]',
    body: `Hi {{brandName}} Team,\n\nMy name is [Your Name] and I'm a [Your Title/Niche] with a passion for [mention something relevant to the brand]. I've been a long-time admirer of {{brandName}} and how you [mention specific positive aspect].\n\nI believe my audience of [mention audience size/demographics] would resonate strongly with your products/message. I'd love to discuss potential collaboration opportunities.\n\nAre you available for a quick chat next week?\n\nBest,\n[Your Name]\n[Your Website/Social Link]`,
    icon: SparklesIcon,
  },
  {
    id: 'template2',
    name: 'Follow-Up (No Response)',
    subject: 'Following Up: Collaboration Inquiry with {{brandName}}',
    body: `Hi {{brandName}} Team,\n\nI hope this email finds you well.\n\nI recently reached out regarding a potential collaboration between {{brandName}} and myself. I understand you're busy, so I wanted to gently follow up on my previous email.\n\nI'm still very enthusiastic about the possibility of working together and believe it could be a great fit. You can see more of my work here: [Your Portfolio/Media Kit Link].\n\nWould you be open to a brief discussion?\n\nThanks,\n[Your Name]`,
    icon: ArrowPathRoundedSquareIcon,
  },
  {
    id: 'template3',
    name: 'Specific Product Pitch',
    subject: 'Idea for {{brandName}}: Featuring [Specific Product]',
    body: `Hi {{brandName}} Team,\n\nI'm particularly excited about your new [Specific Product Name] and I have a creative idea for how I could feature it to my audience. [Briefly explain your content idea].\n\nI think this would genuinely engage my followers and showcase {{brandName}}'s [Specific Product] in a unique light.\n\nLet me know if this sounds interesting!\n\nCheers,\n[Your Name]`,
    icon: LightBulbIcon,
  },
  {
    id: 'template4',
    name: 'Event/Campaign Tie-In',
    subject: '{{brandName}} x [Your Name] for your [Event/Campaign Name]?',
    body: `Hi {{brandName}} Team,\n\nI saw you're currently running the [Event/Campaign Name] and it looks fantastic! I had an idea for how I could contribute to its success by [Your Idea related to the campaign].\n\nMy audience aligns well with [mention target of campaign], and I'd be thrilled to help amplify {{brandName}}'s message.\n\nBest regards,\n[Your Name]`,
    icon: MegaphoneIcon,
  },
  {
    id: 'template5',
    name: 'Quick & Casual Check-In',
    subject: 'Quick hello from a {{brandName}} fan!',
    body: `Hey {{brandName}} Team,\n\nJust wanted to send a quick note to say I continue to be impressed by {{brandName}}'s work in [Brand's Industry/Niche].\n\nIf you ever explore collaborations with creators like me, I'd love to be considered!\n\nKeep up the great work,\n[Your Name]`,
    icon: HandThumbUpIcon,
  },
];

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

const FILTER_KEYS = ['industry', 'location', 'size', 'founded', 'instagram', 'tiktok']; // Include all filterable keys

export default function SearchResults() {
  const locationHook = useLocation(); // Renamed to avoid conflict with filter key
  const navigate = useNavigate();
  
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    FILTER_KEYS.forEach(key => initial[key] = []);
    return initial;
  });
  
  // Data State
  const [allResults, setAllResults] = useState<NormalizedBrand[]>([]);
  const [displayedResults, setDisplayedResults] = useState<NormalizedBrand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(true);
  const [favoritedBrandIds, setFavoritedBrandIds] = useState<number[]>([]);
  
  // Modal State (remains the same)
  const [selectedBrand, setSelectedBrand] = useState<NormalizedBrand | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentEmailTarget, setCurrentEmailTarget] = useState<NormalizedBrand | Contact | null>(null);
  const [selectedTemplateInModal, setSelectedTemplateInModal] = useState<ModalEmailTemplate | null>(null);
  const [isTemplateSelectorModalOpen, setIsTemplateSelectorModalOpen] = useState(false);

  const initialLoadCount = 10;
  const resultsPerLoad = 6;
  const maxResults = 50;

  // Effect 1: Sync UI state (searchTerm, activeFilters) to URL --- THIS EFFECT WILL BE REMOVED
  // useEffect(() => {
  //   const params = new URLSearchParams();
  //   if (searchTerm) {
  //     params.set('q', searchTerm);
  //   }
  //   FILTER_KEYS.forEach(cat => {
  //     if (activeFilters[cat] && activeFilters[cat].length > 0) {
  //       activeFilters[cat].forEach(v => params.append(cat, v));
  //     }
  //   });
  //   navigate(`/search-results?${params.toString()}`, { replace: true });
  // }, [searchTerm, activeFilters, navigate]);

  // Effect 2: On URL change (locationHook.search), update state and fetch/filter data
  useEffect(() => {
    const paramsFromUrl = new URLSearchParams(locationHook.search);
    const currentSearchTermFromURL = paramsFromUrl.get('q') || '';
    const currentFiltersFromURL: Record<string, string[]> = {};
    FILTER_KEYS.forEach(key => {
      const vals = paramsFromUrl.getAll(key);
      currentFiltersFromURL[key] = vals.length > 0 ? vals : [];
    });

    // Update UI state from URL (important for direct navigation / refresh / back button)
    setSearchTerm(currentSearchTermFromURL);
    setActiveFilters(currentFiltersFromURL);

    async function fetchAndFilter(termToFilter: string, filtersToApply: Record<string, string[]>) {
      setIsLoading(true);
      try {
        // const favoritedIds = getStoredIds(FAVORITED_BRANDS_LS_KEY); // OLD
        const favoritedIds = await getFavoritedBrandIdsFromSupabase(); // NEW
        setFavoritedBrandIds(favoritedIds); // Store fetched IDs in state

        const { data, error } = await supabase
          .from('companies')
          .select('*');
        if (error) throw error;
    
        let brands = (data || []).map(supaBrand => normalizeBrand(supaBrand, favoritedIds));
    
        if (termToFilter) {
          const t = termToFilter.toLowerCase();
          brands = brands.filter(b =>
            b.name.toLowerCase().includes(t) ||
            (b.description || b.tagline || '').toLowerCase().includes(t)
          );
        }
    
        if (filtersToApply.industry && filtersToApply.industry.length > 0) {
          brands = brands.filter(b =>
            filtersToApply.industry.some(raw => {
              const tag = raw.includes(':') ? raw.split(':')[1] : raw;
              return b.industry?.includes(tag);
            })
          );
        }
    
        if (filtersToApply.location && filtersToApply.location.length > 0) {
          brands = brands.filter(b =>
            filtersToApply.location.some(loc => {
              if (loc === 'United States') {
                return ['United States', 'USA', 'US']
                  .some(v => b.location?.includes(v));
              }
              return b.location?.includes(loc);
            })
          );
        }
    
        if (filtersToApply.size && filtersToApply.size.length > 0) {
          brands = brands.filter(b =>
            filtersToApply.size.includes(b.size)
          );
        }
    
        if (filtersToApply.founded && filtersToApply.founded.length > 0) {
          const now = new Date().getFullYear();
          brands = brands.filter(b => {
            if (!b.founded) return false;
            const y = parseInt(b.founded, 10);
            if (isNaN(y)) return false;
            const age = now - y;
            return filtersToApply.founded.some(r =>
              r === 'Startup (<3 years)' ? age < 3 :
              r === 'Emerging (3-10 years)' ? age >= 3 && age <= 10 :
              r === 'Established (>10 years)' ? age > 10 : false
            );
          });
        }
        
        setAllResults(brands);
        const initial = brands.slice(0, initialLoadCount);
        setDisplayedResults(initial);
        setShowLoadMore(brands.length > initial.length && initial.length < maxResults && brands.length > 0);

      } catch (err) {
        console.error('Search failed:', err);
        setAllResults([]);
        setDisplayedResults([]);
      } finally {
        setIsLoading(false);
      }
    }
    // Call fetchAndFilter with values parsed directly from the URL
    fetchAndFilter(currentSearchTermFromURL, currentFiltersFromURL);
  }, [locationHook.search, initialLoadCount, maxResults]); // Removed normalizeBrand from deps as it's stable

  useEffect(() => {
    setShowContacts(false);
  }, [selectedBrand]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value); // Only update state; URL change happens on submit
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) { // Use current local searchTerm state
      params.set('q', searchTerm);
    }
    // Use current local activeFilters state
    FILTER_KEYS.forEach(cat => {
      if (activeFilters[cat] && activeFilters[cat].length > 0) {
        activeFilters[cat].forEach(v => params.append(cat, v));
      }
    });
    navigate(`/search-results?${params.toString()}`, { replace: true });
  };

  const toggleFilter = (category: string, value: string) => {
    // Calculate new filters based on current state
    const newActiveFilters = { ...activeFilters };
    const currentCategoryFilters = newActiveFilters[category] || [];
    const updatedCategoryFilters = currentCategoryFilters.includes(value)
      ? currentCategoryFilters.filter(v => v !== value)
      : [...currentCategoryFilters, value];
    newActiveFilters[category] = updatedCategoryFilters;

    // Update local state for immediate UI feedback
    setActiveFilters(newActiveFilters);

    // Construct URL params from this new filter state and current searchTerm
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    FILTER_KEYS.forEach(cat => {
      if (newActiveFilters[cat] && newActiveFilters[cat].length > 0) {
        newActiveFilters[cat].forEach(v => params.append(cat, v));
      }
    });
    navigate(`/search-results?${params.toString()}`, { replace: true });
  };

  const clearFilters = () => {
    const clearedFiltersState: Record<string, string[]> = {};
    FILTER_KEYS.forEach(key => clearedFiltersState[key] = []);
    
    // Update local state immediately
    setActiveFilters(clearedFiltersState);
    // Optionally, decide if searchTerm should be cleared as well
    // const newSearchTerm = ''; 
    // setSearchTerm(newSearchTerm);

    const params = new URLSearchParams();
    // if (newSearchTerm) params.set('q', newSearchTerm); // If searchTerm is cleared
    if (searchTerm) params.set('q', searchTerm); // If searchTerm is preserved

    // No filters will be appended as clearedFiltersState is empty for all filter keys
    navigate(`/search-results?${params.toString()}`, { replace: true });
  };

  const removeFilter = (category: string, value: string) => {
    // Calculate new filters based on current state
    const newActiveFilters = { ...activeFilters };
    newActiveFilters[category] = (newActiveFilters[category] || []).filter(v => v !== value);

    // Update local state for immediate UI feedback
    setActiveFilters(newActiveFilters);

    // Construct URL params
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    FILTER_KEYS.forEach(cat => {
      if (newActiveFilters[cat] && newActiveFilters[cat].length > 0) {
        newActiveFilters[cat].forEach(v => params.append(cat, v));
      }
    });
    navigate(`/search-results?${params.toString()}`, { replace: true });
  };

  const handleLoadMore = () => {
    setIsLoading(true); // Optional: show loader during this brief update
    
    const currentCount = displayedResults.length;
    const remainingResults = allResults.slice(currentCount);
    
    // Calculate how many more items to load, respecting resultsPerLoad and maxResults
    const nextBatchSize = Math.min(resultsPerLoad, remainingResults.length, maxResults - currentCount);
    const nextBatch = remainingResults.slice(0, nextBatchSize);
    
    const newDisplayedResults = [...displayedResults, ...nextBatch];
    setDisplayedResults(newDisplayedResults);
    
    // Update showLoadMore based on whether there are more items to load and if maxResults is reached
    setShowLoadMore(newDisplayedResults.length < allResults.length && newDisplayedResults.length < maxResults);
    
    setIsLoading(false); // Optional: hide loader
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).reduce((acc, curr) => acc + (curr?.length || 0), 0);
  };

  const openBrandModal = (brand: NormalizedBrand) => {
    setSelectedBrand(brand);
    setIsModalOpen(true);
  };

  const toggleContacts = () => {
    setShowContacts(prev => !prev);
  };

  const openTemplateSelectorModal = (target: NormalizedBrand | Contact) => {
    setCurrentEmailTarget(target);
    setSelectedTemplateInModal(null);
    setIsTemplateSelectorModalOpen(true);
  };

  const closeTemplateSelectorModal = () => {
    setIsTemplateSelectorModalOpen(false);
  };

  const handleSendEmailWithTemplate = async (useBlankEmail: boolean = false) => {
    if (!currentEmailTarget) return;

    let recipientEmail = '';
    let brandNameForEmail = '';
    let brandIdToUpdate: number | null = null;

    if ('products' in currentEmailTarget) {
      const brandObject = currentEmailTarget as NormalizedBrand;
      brandNameForEmail = brandObject.name;
      brandIdToUpdate = brandObject.id;

      if (brandObject.contact_email) {
        recipientEmail = brandObject.contact_email;
      } else if (brandObject.contacts && brandObject.contacts.length > 0 && brandObject.contacts[0].email) {
        recipientEmail = brandObject.contacts[0].email;
      } else {
        recipientEmail = `contact@${brandObject.name.toLowerCase().replace(/\s+/g, '')}.com`;
        alert(`No contact email found for ${brandObject.name}. Using a generic fallback: ${recipientEmail}. Please verify.`);
      }
    } else {
      const contactObject = currentEmailTarget as Contact;
      recipientEmail = contactObject.email;
      brandIdToUpdate = contactObject.parentId;

      const parentBrandDetails = allResults.find(b => b.id === contactObject.parentId);
      if (parentBrandDetails) {
        brandNameForEmail = parentBrandDetails.name;
      } else {
        brandNameForEmail = contactObject.name.split(' ')[0];
        console.warn(`Parent brand details not found in allResults for contact with parentId: ${contactObject.parentId}. Using contact name part as brand name.`);
      }
    }

    if (!recipientEmail) {
        alert("No email address found for this contact/brand.");
        closeTemplateSelectorModal();
        return;
    }

    let subject = '';
    let body = '';
    const yourNamePlaceholder = "[Your Name/Brand]";

    if (!useBlankEmail && selectedTemplateInModal) {
      subject = selectedTemplateInModal.subject.replace(/{{brandName}}/g, brandNameForEmail).replace(/\[Your Name\/Brand\]/g, yourNamePlaceholder);
      body = selectedTemplateInModal.body.replace(/{{brandName}}/g, brandNameForEmail).replace(/\[Your Name\/Brand\]/g, yourNamePlaceholder);
    } else {
      subject = `Collaboration Inquiry with ${brandNameForEmail}`;
      body = `Hi ${brandNameForEmail} Team,\n\n[Write your email here]\n\nBest,\n${yourNamePlaceholder}`;
    }

    window.location.href = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    if (brandIdToUpdate !== null) {
      const currentDate = new Date().toISOString().split('T')[0];
      const outreachData: UserOutreachStatus = {
        brand_id: brandIdToUpdate,
        first_email_sent: true,
        first_email_date: currentDate,
        follow_up_1_sent: false,
        follow_up_1_date: null,
        follow_up_2_sent: false,
        follow_up_2_date: null,
        notes: null,
        outreach_email_used: recipientEmail
      };
      try {
        const result = await upsertOutreachStatus(outreachData);
        if (result) {
          console.log(`Outreach status updated in Supabase for brand ${brandIdToUpdate}:`, result);
        } else {
          console.error("Failed to update outreach status in Supabase for brand:", brandIdToUpdate);
        }
      } catch (error) {
        console.error("Error calling upsertOutreachStatus for brand:", brandIdToUpdate, error);
      }
    } else {
      console.warn("No brandIdToUpdate, skipping Supabase outreach status update.");
    }

    closeTemplateSelectorModal();
  };

  // Handler for toggling favorite status
  const handleToggleFavorite = async (brandId: number) => {
    const originalFavoritedBrandIds = [...favoritedBrandIds]; // Store original state for potential rollback

    // Optimistically update UI
    const isCurrentlyFavorite = originalFavoritedBrandIds.includes(brandId);
    const newOptimisticFavoritedBrandIds = isCurrentlyFavorite
      ? originalFavoritedBrandIds.filter(id => id !== brandId)
      : [...originalFavoritedBrandIds, brandId];

    setFavoritedBrandIds(newOptimisticFavoritedBrandIds);

    const updateIsFavoriteInBrandOptimistic = (brand: NormalizedBrand): NormalizedBrand => ({
      ...brand,
      isFavorite: newOptimisticFavoritedBrandIds.includes(brand.id),
    });

    if (selectedBrand && selectedBrand.id === brandId) {
      setSelectedBrand(prev => prev ? updateIsFavoriteInBrandOptimistic(prev) : null);
    }
    setAllResults(prevAllResults => prevAllResults.map(updateIsFavoriteInBrandOptimistic));
    setDisplayedResults(prevDisplayedResults => prevDisplayedResults.map(updateIsFavoriteInBrandOptimistic));

    try {
      // Call Supabase to toggle favorite status
      const finalFavoritedIds = await toggleFavoriteInSupabase(brandId, originalFavoritedBrandIds);
      
      // If Supabase returns a state different from optimistic (e.g. due to race condition or error during toggleFavoriteInSupabase that it handled gracefully by returning originalFavoritedBrandIds),
      // re-sync the UI with the actual state from Supabase.
      if (JSON.stringify(finalFavoritedIds.sort()) !== JSON.stringify(newOptimisticFavoritedBrandIds.sort())) {
        setFavoritedBrandIds(finalFavoritedIds);
        const updateIsFavoriteInBrandServer = (brand: NormalizedBrand): NormalizedBrand => ({
          ...brand,
          isFavorite: finalFavoritedIds.includes(brand.id),
        });
        if (selectedBrand && selectedBrand.id === brandId) {
          setSelectedBrand(prev => prev ? updateIsFavoriteInBrandServer(prev) : null);
        }
        setAllResults(prevAllResults => prevAllResults.map(updateIsFavoriteInBrandServer));
        setDisplayedResults(prevDisplayedResults => prevDisplayedResults.map(updateIsFavoriteInBrandServer));
      }
    } catch (error) {
      console.error("Failed to toggle favorite in Supabase, reverting UI:", error);
      // Rollback UI to original state on error
      setFavoritedBrandIds(originalFavoritedBrandIds);
      const updateIsFavoriteInBrandRollback = (brand: NormalizedBrand): NormalizedBrand => ({
        ...brand,
        isFavorite: originalFavoritedBrandIds.includes(brand.id),
      });
      if (selectedBrand && selectedBrand.id === brandId) {
        setSelectedBrand(prev => prev ? updateIsFavoriteInBrandRollback(prev) : null);
      }
      setAllResults(prevAllResults => prevAllResults.map(updateIsFavoriteInBrandRollback));
      setDisplayedResults(prevDisplayedResults => prevDisplayedResults.map(updateIsFavoriteInBrandRollback));
      // Optionally, show a user-facing error message here
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <DashboardNav />
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-display font-medium text-charcoal mb-2">
              Search Results
            </h1>
            <p className="text-taupe">
              {allResults.length} results found
            </p>
          </div>

          <div className="mb-6">
            <form onSubmit={handleSearch} className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search brands..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="flex-1 px-6 py-4 rounded-lg border border-blush/20 focus:outline-none focus:ring-2 focus:ring-rose/20 text-lg bg-cream/50"
              />
              <button 
                type="submit"
                className="h-[52px] px-8 bg-rose text-white rounded-lg hover:bg-rose/90 transition-colors text-lg font-medium"
              >
                Search
              </button>
            </form>
          </div>

          {getActiveFilterCount() > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-sm text-taupe">Active filters:</span>
              {Object.entries(activeFilters).map(([category, values]) => 
                values.map((value: string) => {
                  const displayValue = value.includes(':') ? value.split(':')[1] : value;
                  return (
                    <button 
                      key={`${category}-${value}`}
                      className="px-3 py-1.5 rounded-lg text-sm bg-rose/10 text-rose border border-rose/20 flex items-center gap-2"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        removeFilter(category, value); 
                      }}
                    >
                      {displayValue}
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  );
                })
              )}
              <button 
                className="px-3 py-1.5 rounded-lg text-sm text-rose hover:bg-rose/5 transition-colors"
                onClick={clearFilters}
              >
                Clear all
              </button>
            </div>
          )}

          <div className="mb-6">
            <Popover className="relative">
              {({ open }) => (
                <>
                  <Popover.Button
                    className={`h-[52px] px-6 rounded-lg border border-blush/20 flex items-center gap-2 transition-colors focus:outline-none ${
                      open ? 'bg-rose text-white' : 'bg-white hover:bg-rose/5'
                    }`}
                  >
                    <FunnelIcon className="w-5 h-5" />
                    <span>Filters</span>
                    {getActiveFilterCount() > 0 && (
                      <span className="bg-rose text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {getActiveFilterCount()}
                      </span>
                    )}
                  </Popover.Button>
                  <Popover.Panel className="absolute left-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-blush/20 p-4 z-50">
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
                                              onClick={(e) => { 
                                                e.stopPropagation(); 
                                                toggleFilter('industry', `${category}:${subcategory}`); 
                                              }}
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
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      toggleFilter('location', location); 
                                    }}
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
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      toggleFilter('size', size); 
                                    }}
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
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      toggleFilter('founded', range); 
                                    }}
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

          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose"></div>
            </div>
          )}

          {!isLoading && (
            <div className="grid grid-cols-12 gap-4">
              {displayedResults.map((brand, index) => {
                const pattern = index % 11;
                let gridClass = '';
                
                switch(pattern) {
                  case 0:
                    gridClass = 'col-span-4 row-span-2';
                    break;
                  case 1:
                  case 2:
                    gridClass = 'col-span-3';
                    break;
                  case 3:
                    gridClass = 'col-span-6';
                    break;
                  case 4:
                    gridClass = 'col-span-3 row-span-2';
                    break;
                  case 5:
                  case 6:
                    gridClass = 'col-span-4';
                    break;
                  case 7:
                    gridClass = 'col-span-5';
                    break;
                  case 8:
                  case 9:
                    gridClass = 'col-span-3';
                    break;
                  case 10:
                    gridClass = 'col-span-6 row-span-2';
                    break;
                  default:
                    gridClass = 'col-span-4';
                }
                
                const isTall = gridClass.includes('row-span-2');
                const isWide = parseInt(gridClass.split('-')[2]) > 4;

                const firstContact = brand.contacts && brand.contacts.length > 0 ? brand.contacts[0] : null;
                const hasEmailedFirstContact = firstContact?.emailSent || false;
                
                return (
                  <motion.div
                    key={brand.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-xl p-6 border-[3px] border-[rgb(229,218,248)] hover:border-[5px] hover:border-[rgb(229,218,248)] hover:shadow-lg transition-all duration-200 relative ${gridClass} cursor-pointer`}
                    onClick={() => openBrandModal(brand)}
                  >
                    <button 
                      className={`absolute top-4 right-4 p-1.5 rounded-lg border border-transparent transition-all ${
                        hasEmailedFirstContact 
                          ? 'bg-green-100 text-green-600 cursor-default' 
                          : 'bg-[rgb(229,218,248)] text-rose hover:bg-[rgb(229,218,248)]/80 hover:border-rose/20'
                      }`}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if (hasEmailedFirstContact) return; 
                        openTemplateSelectorModal(brand); 
                      }}
                      title={hasEmailedFirstContact ? `Email sent on ${firstContact?.emailSentDate}` : `Email ${brand.name}`}
                      disabled={hasEmailedFirstContact}
                    >
                      {hasEmailedFirstContact ? <CheckCircleIcon className="w-4 h-4" /> : <EnvelopeIcon className="w-4 h-4" />}
                    </button>
                    <div className={`flex items-start gap-4 ${isTall ? 'flex-col' : ''} ${isWide ? 'md:flex-row' : ''}`}>
                      <div className={`
                        ${isTall ? 'w-24 h-24' : 'w-16 h-16'} 
                        ${isWide ? 'md:w-20 md:h-20' : ''} 
                        rounded-lg bg-cream/50 flex items-center justify-center
                      `}>
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className={`
                            ${isTall ? 'w-20 h-20' : 'w-12 h-12'} 
                            ${isWide ? 'md:w-16 md:h-16' : ''} 
                            object-contain
                          `}
                          onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/100?text=Logo')}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`
                          ${isTall ? 'text-xl' : 'text-lg'} 
                          ${isWide ? 'md:text-xl' : ''} 
                          font-medium text-charcoal mb-1
                        `}>
                          {brand.name}
                        </h3>
                        <div className="space-y-1">
                          <p className="text-sm text-taupe">
                            {brand.industry} • {brand.location}
                          </p>
                          <p className="text-sm text-taupe">
                            {brand.size} employees • Founded {brand.founded}
                          </p>
                          {(brand.instagram || brand.tiktok) && (
                            <div className="flex gap-4 text-sm text-taupe">
                              {brand.instagram && <span>Instagram</span>}
                              {brand.tiktok && <span>TikTok</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {!isLoading && displayedResults.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-charcoal mb-2">
                No results found
              </h3>
              <p className="text-taupe">
                Try adjusting your search criteria or filters
              </p>
            </div>
          )}

          {!isLoading && showLoadMore && displayedResults.length > 0 && displayedResults.length < maxResults && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleLoadMore}
                className="px-6 py-3 bg-white text-rose border border-rose rounded-lg hover:bg-rose/5 transition-colors"
              >
                Load More
              </button>
            </div>
          )}

          <BrandDetailModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            brand={selectedBrand}
            onToggleFavorite={handleToggleFavorite}
            onToggleContacts={toggleContacts}
            showContacts={showContacts}
            onOpenEmailTemplateSelector={openTemplateSelectorModal}
          />
        </div>
      </main>
      
      <TemplateSelectorModal 
        isOpen={isTemplateSelectorModalOpen}
        onClose={closeTemplateSelectorModal}
        templates={emailTemplatesData}
        selectedTemplate={selectedTemplateInModal}
        onSelectTemplate={setSelectedTemplateInModal}
        onUseSelectedTemplate={() => handleSendEmailWithTemplate(false)}
        onUseBlankEmail={() => handleSendEmailWithTemplate(true)}
      />
    </div>
  );
} 