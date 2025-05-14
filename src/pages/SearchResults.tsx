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
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { Popover, Disclosure, Dialog, Transition } from '@headlessui/react';
import { useLocation, useNavigate } from 'react-router-dom';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

const emailTemplatesData: EmailTemplate[] = [
  {
    id: 'template1',
    name: 'Initial Introduction',
    subject: 'Collaboration Inquiry: {{brandName}} x [Your Name/Brand]',
    body: `Hi {{brandName}} Team,\n\nMy name is [Your Name] and I'm a [Your Title/Niche] with a passion for [mention something relevant to the brand]. I've been a long-time admirer of {{brandName}} and how you [mention specific positive aspect].\n\nI believe my audience of [mention audience size/demographics] would resonate strongly with your products/message. I'd love to discuss potential collaboration opportunities.\n\nAre you available for a quick chat next week?\n\nBest,\n[Your Name]\n[Your Website/Social Link]`
  },
  {
    id: 'template2',
    name: 'Follow-Up (No Response)',
    subject: 'Following Up: Collaboration Inquiry with {{brandName}}',
    body: `Hi {{brandName}} Team,\n\nI hope this email finds you well.\n\nI recently reached out regarding a potential collaboration between {{brandName}} and myself. I understand you're busy, so I wanted to gently follow up on my previous email.\n\nI'm still very enthusiastic about the possibility of working together and believe it could be a great fit. You can see more of my work here: [Your Portfolio/Media Kit Link].\n\nWould you be open to a brief discussion?\n\nThanks,\n[Your Name]`
  },
  {
    id: 'template3',
    name: 'Specific Product Pitch',
    subject: 'Idea for {{brandName}}: Featuring [Specific Product]',
    body: `Hi {{brandName}} Team,\n\nI'm particularly excited about your new [Specific Product Name] and I have a creative idea for how I could feature it to my audience. [Briefly explain your content idea].\n\nI think this would genuinely engage my followers and showcase {{brandName}}'s [Specific Product] in a unique light.\n\nLet me know if this sounds interesting!\n\nCheers,\n[Your Name]`
  },
  {
    id: 'template4',
    name: 'Event/Campaign Tie-In',
    subject: '{{brandName}} x [Your Name] for your [Event/Campaign Name]?',
    body: `Hi {{brandName}} Team,\n\nI saw you're currently running the [Event/Campaign Name] and it looks fantastic! I had an idea for how I could contribute to its success by [Your Idea related to the campaign].\n\nMy audience aligns well with [mention target of campaign], and I'd be thrilled to help amplify {{brandName}}'s message.\n\nBest regards,\n[Your Name]`
  },
  {
    id: 'template5',
    name: 'Quick & Casual Check-In',
    subject: 'Quick hello from a {{brandName}} fan!',
    body: `Hey {{brandName}} Team,\n\nJust wanted to send a quick note to say I continue to be impressed by {{brandName}}'s work in [Brand's Industry/Niche].\n\nIf you ever explore collaborations with creators like me, I'd love to be considered!\n\nKeep up the great work,\n[Your Name]`
  },
];

interface Brand {
  id: number;
  name: string;
  logo: string;
  industry: string;
  location: string;
  size: string;
  instagram: string;
  tiktok: string;
  founded: string;
  website?: string;
  description?: string;
  tagline?: string;
  isFavorite?: boolean;
  contacts?: Contact[];
}

interface Contact {
  id: number;
  name: string;
  title: string;
  email: string;
  profileImage?: string;
}

// Mock data for demonstration
const mockBrands = [
  {
    id: 1,
    name: 'Glossier',
    logo: 'https://logo.clearbit.com/glossier.com',
    industry: 'Beauty',
    location: 'United States',
    size: '201-500',
    instagram: '2.8M',
    tiktok: '1.2M',
    founded: '2014',
    tagline: 'Skin first, makeup second. Beauty products inspired by real life.',
    contacts: [
      {
        id: 1,
        name: 'Emily Weiss',
        title: 'Founder & CEO',
        email: 'emily@glossier.com',
        profileImage: 'https://randomuser.me/api/portraits/women/44.jpg'
      },
      {
        id: 2,
        name: 'Sarah Brown',
        title: 'VP of Marketing',
        email: 'sarah@glossier.com',
        profileImage: 'https://randomuser.me/api/portraits/women/67.jpg'
      },
      {
        id: 3,
        name: 'Michael Johnson',
        title: 'Partnerships Director',
        email: 'michael@glossier.com',
        profileImage: 'https://randomuser.me/api/portraits/men/32.jpg'
      }
    ]
  },
  {
    id: 2,
    name: 'Fenty Beauty',
    logo: 'https://logo.clearbit.com/fentybeauty.com',
    industry: 'Beauty',
    location: 'United States',
    size: '201-500',
    instagram: '3.1M',
    tiktok: '1.5M',
    founded: '2017',
    tagline: 'Beauty for all. Makeup for everyone, in shades made for all skin tones.',
    contacts: [
      {
        id: 1,
        name: 'Robyn Fenty',
        title: 'Founder',
        email: 'robyn@fentybeauty.com',
        profileImage: 'https://randomuser.me/api/portraits/women/10.jpg'
      },
      {
        id: 2,
        name: 'Jessica Williams',
        title: 'Marketing Director',
        email: 'jessica@fentybeauty.com',
        profileImage: 'https://randomuser.me/api/portraits/women/22.jpg'
      }
    ]
  },
  {
    id: 3,
    name: 'Milk Makeup',
    logo: 'https://logo.clearbit.com/milkmakeup.com',
    industry: 'Beauty',
    location: 'United States',
    size: '51-200',
    instagram: '1.5M',
    tiktok: '800K',
    founded: '2016',
    tagline: 'High-performance, clean, vegan, cruelty-free products for all.'
  },
  {
    id: 4,
    name: 'Rare Beauty',
    logo: 'https://logo.clearbit.com/rarebeauty.com',
    industry: 'Beauty',
    location: 'United States',
    size: '51-200',
    instagram: '2.2M',
    tiktok: '1.1M',
    founded: '2020',
    tagline: 'Makeup made to feel good in, without hiding what makes you unique.'
  },
  {
    id: 5,
    name: 'Summer Fridays',
    logo: 'https://logo.clearbit.com/summerfridays.com',
    industry: 'Skincare',
    location: 'United States',
    size: '11-50',
    instagram: '1.8M',
    tiktok: '950K',
    founded: '2018',
    tagline: 'Skincare essentials created to simplify your routine and transform your skin.'
  },
  {
    id: 6,
    name: 'Tower 28',
    logo: 'https://logo.clearbit.com/tower28beauty.com',
    industry: 'Beauty',
    location: 'United States',
    size: '11-50',
    instagram: '1.3M',
    tiktok: '700K',
    founded: '2019',
    tagline: 'Clean, non-toxic makeup that\'s made for sensitive skin and won\'t cause irritation.'
  },
  {
    id: 7,
    name: 'Biossance',
    logo: 'https://logo.clearbit.com/biossance.com',
    industry: 'Skincare',
    location: 'United States',
    size: '51-200',
    instagram: '1.1M',
    tiktok: '500K',
    founded: '2015',
    tagline: 'Clean skincare that combines science and sustainability without compromise.'
  },
  {
    id: 8,
    name: 'Function of Beauty',
    logo: 'https://logo.clearbit.com/functionofbeauty.com',
    industry: 'Haircare',
    location: 'United States',
    size: '51-200',
    instagram: '1.7M',
    tiktok: '900K',
    founded: '2015',
    tagline: 'Custom hair, skin, and body care designed specifically for your unique needs.'
  },
  {
    id: 9,
    name: 'Olaplex',
    logo: 'https://logo.clearbit.com/olaplex.com',
    industry: 'Haircare',
    location: 'United States',
    size: '201-500',
    instagram: '2.5M',
    tiktok: '1.3M',
    founded: '2014',
    tagline: 'Professional haircare brand focused on repairing and preventing hair damage.'
  },
  {
    id: 10,
    name: 'Drunk Elephant',
    logo: 'https://logo.clearbit.com/drunkelephant.com',
    industry: 'Skincare',
    location: 'United States',
    size: '51-200',
    instagram: '2.1M',
    tiktok: '1.0M',
    founded: '2012',
    tagline: 'Clean-compatible skincare free from the Suspicious Six™ that\'s good for all skin types.'
  },
  {
    id: 11,
    name: 'Glow Recipe',
    logo: 'https://logo.clearbit.com/glowrecipe.com',
    industry: 'Skincare',
    location: 'United States',
    size: '51-200',
    instagram: '1.9M',
    tiktok: '950K',
    founded: '2014',
    tagline: 'Fruit-powered skincare blending powerful actives with sensorial innovation.'
  },
  {
    id: 12,
    name: 'Herbivore',
    logo: 'https://logo.clearbit.com/herbivorebotanicals.com',
    industry: 'Skincare',
    location: 'United States',
    size: '11-50',
    instagram: '1.2M',
    tiktok: '600K',
    founded: '2011',
    tagline: 'Natural, non-toxic skincare made with therapeutic-grade actives and botanical ingredients.'
  },
  {
    id: 13,
    name: 'Ouai',
    logo: 'https://logo.clearbit.com/theouai.com',
    industry: 'Haircare',
    location: 'United States',
    size: '11-50',
    instagram: '1.4M',
    tiktok: '750K',
    founded: '2016',
    tagline: 'Haircare for real life, created to look, smell, and feel so good you can\'t help but compliment.'
  },
  {
    id: 14,
    name: 'SheaMoisture',
    logo: 'https://logo.clearbit.com/sheamoisture.com',
    industry: 'Haircare',
    location: 'United States',
    size: '201-500',
    instagram: '1.6M',
    tiktok: '850K',
    founded: '1991',
    tagline: 'Natural, sustainable products for hair, face and body crafted with certified organic Shea Butter.'
  },
  {
    id: 15,
    name: 'IGK Hair',
    logo: 'https://logo.clearbit.com/igkhair.com',
    industry: 'Haircare',
    location: 'United States',
    size: '11-50',
    instagram: '950K',
    tiktok: '500K',
    founded: '2015',
    tagline: 'Salon-crafted haircare infused with innovative ingredients, developed by professional stylists.'
  }
];

// Filter options
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
  instagram: ['10K-50K', '50K-200K', '200K+'],
  tiktok: ['10K-50K', '50K-200K', '200K+'],
  founded: ['Startup (<3 years)', 'Emerging (3-10 years)', 'Established (>10 years)']
};

// Make sure all brands have contacts
// Add contacts to the remaining brands to ensure they all have data to display
mockBrands.forEach(brand => {
  if (!brand.contacts) {
    brand.contacts = [
      {
        id: 1,
        name: `Alex Johnson`,
        title: 'Marketing Director',
        email: `alex@${brand.name.toLowerCase().replace(/\s+/g, '')}.com`,
        profileImage: undefined // Explicitly set optional field
      },
      {
        id: 2,
        name: `Taylor Smith`,
        title: 'Partnerships Manager',
        email: `taylor@${brand.name.toLowerCase().replace(/\s+/g, '')}.com`,
        profileImage: undefined // Explicitly set optional field
      }
    ];
  } else {
    brand.contacts.forEach(contact => {
      // Ensuring profileImage is optional if deleted, or handling existing ones
      if (contact.profileImage === '') delete contact.profileImage; 
    });
  }
});

export default function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({
    industry: [],
    location: [],
    size: [],
    instagram: [],
    tiktok: [],
    founded: []
  });
  const [displayedResults, setDisplayedResults] = useState<Brand[]>([]);
  const [allResults, setAllResults] = useState<Brand[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(true);
  const initialLoadCount = 10; // Number of results to show initially
  const resultsPerLoad = 6; // Number of results to load each time
  const resultsPerPage = 30; // Number of results before pagination
  const maxResults = 50;
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentEmailTarget, setCurrentEmailTarget] = useState<Brand | Contact | null>(null);
  const [selectedTemplateInModal, setSelectedTemplateInModal] = useState<EmailTemplate | null>(null);

  // NEW: Separate state for Template Selector Modal
  const [isTemplateSelectorModalOpen, setIsTemplateSelectorModalOpen] = useState(false);

  // Reset showContacts when a new brand is selected
  useEffect(() => {
    setShowContacts(false);
  }, [selectedBrand]);

  // Parse URL parameters on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('q') || '';
    setSearchTerm(search);
    
    // Parse filters from URL
    const filters: Record<string, string[]> = {};
    Object.keys(activeFilters).forEach(key => {
      const filterValues = params.getAll(key);
      if (filterValues.length > 0) {
        filters[key] = filterValues;
      }
    });
    
    if (Object.keys(filters).length > 0) {
      setActiveFilters(filters);
    }
    
    // Parse page from URL
    const page = parseInt(params.get('page') || '1');
    setCurrentPage(page);
    
    // Perform initial search
    performSearch(search, filters, page);
  }, [location.search]);

  // Perform search with filters
  const performSearch = (term: string, filters: Record<string, string[]>, page: number) => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Filter results based on search term and filters
      let results = [...mockBrands];
      
      // Filter by search term
      if (term) {
        results = results.filter(brand => 
          brand.name.toLowerCase().includes(term.toLowerCase()) ||
          brand.industry.toLowerCase().includes(term.toLowerCase())
        );
      }
      
      // Filter by industry
      if (filters.industry && filters.industry.length > 0) {
        results = results.filter(brand => 
          filters.industry.some((filter: string) => {
            const [category] = filter.split(':');
            return brand.industry === category;
          })
        );
      }
      
      // Filter by location
      if (filters.location && filters.location.length > 0) {
        results = results.filter(brand => 
          filters.location.includes(brand.location)
        );
      }
      
      // Filter by size
      if (filters.size && filters.size.length > 0) {
        results = results.filter(brand => 
          filters.size.includes(brand.size)
        );
      }
      
      // Filter by Instagram followers
      if (filters.instagram && filters.instagram.length > 0) {
        results = results.filter(brand => {
          const followers = parseInt(brand.instagram.replace(/[^0-9]/g, ''));
          return filters.instagram.some((range: string) => {
            if (range === '10K-50K') return followers >= 10000 && followers < 50000;
            if (range === '50K-200K') return followers >= 50000 && followers < 200000;
            if (range === '200K+') return followers >= 200000;
            return false;
          });
        });
      }
      
      // Filter by TikTok followers
      if (filters.tiktok && filters.tiktok.length > 0) {
        results = results.filter(brand => {
          const followers = parseInt(brand.tiktok.replace(/[^0-9]/g, ''));
          return filters.tiktok.some((range: string) => {
            if (range === '10K-50K') return followers >= 10000 && followers < 50000;
            if (range === '50K-200K') return followers >= 50000 && followers < 200000;
            if (range === '200K+') return followers >= 200000;
            return false;
          });
        });
      }
      
      // Filter by founding year
      if (filters.founded && filters.founded.length > 0) {
        results = results.filter(brand => {
          const foundedYear = parseInt(brand.founded);
          const currentYear = new Date().getFullYear();
          const age = currentYear - foundedYear;
          
          return filters.founded.some((range: string) => {
            if (range === 'Startup (<3 years)') return age < 3;
            if (range === 'Emerging (3-10 years)') return age >= 3 && age <= 10;
            if (range === 'Established (>10 years)') return age > 10;
            return false;
          });
        });
      }
      
      // Set all results
      setAllResults(results);
      
      // For initial load, randomly select first batch
      const initialBatchSize = Math.min(initialLoadCount, results.length);
      const randomIndices = Array.from({ length: results.length }, (_, i) => i)
        .sort(() => Math.random() - 0.5)
        .slice(0, initialBatchSize);
      
      const initialResults = randomIndices.map(i => results[i]);
      setDisplayedResults(initialResults);
      
      // Show load more button if there are more results
      setShowLoadMore(results.length > initialBatchSize && results.length <= maxResults);
      
      // Calculate total pages for when we switch to pagination
      const totalPages = Math.ceil((results.length - resultsPerPage) / resultsPerPage);
      setTotalPages(Math.max(1, totalPages));
      
      setIsLoading(false);
    }, 500);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlAndSearch(searchTerm, activeFilters, 1);
  };

  // Toggle filter
  const toggleFilter = (category: string, value: string) => {
    setActiveFilters(prev => {
      const current = prev[category as keyof typeof prev];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters({
      industry: [],
      location: [],
      size: [],
      instagram: [],
      tiktok: [],
      founded: []
    });
    updateUrlAndSearch(searchTerm, {}, 1);
  };

  // Remove a specific filter
  const removeFilter = (category: string, value: string) => {
    setActiveFilters(prev => {
      const updated = { ...prev };
      updated[category as keyof typeof prev] = prev[category as keyof typeof prev].filter(v => v !== value);
      return updated;
    });
    updateUrlAndSearch(searchTerm, activeFilters, currentPage);
  };

  // Update URL and perform search
  const updateUrlAndSearch = (term: string, filters: Record<string, string[]>, page: number) => {
    const params = new URLSearchParams();
    
    // Add search term
    if (term) {
      params.set('q', term);
    }
    
    // Add filters
    Object.entries(filters).forEach(([key, values]) => {
      if (Array.isArray(values) && values.length > 0) {
        values.forEach(value => {
          params.append(key, value);
        });
      }
    });
    
    // Add page
    if (page > 1) {
      params.set('page', page.toString());
    }
    
    // Update URL
    navigate(`/search-results?${params.toString()}`);
    
    // Perform search
    performSearch(term, filters, page);
  };

  // Load more results
  const handleLoadMore = () => {
    setIsLoading(true);
    
    // Get the next batch of results
    const currentCount = displayedResults.length;
    const remainingResults = allResults.slice(currentCount);
    
    // Randomly select next batch of results
    const nextBatchSize = Math.min(resultsPerLoad, remainingResults.length);
    const randomIndices = Array.from({ length: remainingResults.length }, (_, i) => i)
      .sort(() => Math.random() - 0.5)
      .slice(0, nextBatchSize);
    
    const nextBatch = randomIndices.map(i => remainingResults[i]);
    
    // Add new results to displayed results
    const newDisplayedResults = [...displayedResults, ...nextBatch];
    setDisplayedResults(newDisplayedResults);
    
    // Check if we should show load more button or switch to pagination
    if (newDisplayedResults.length >= resultsPerPage) {
      setShowLoadMore(false);
      const totalPages = Math.ceil((allResults.length - resultsPerPage) / resultsPerPage);
      setTotalPages(Math.max(1, totalPages));
      setCurrentPage(1);
    } else {
      setShowLoadMore(newDisplayedResults.length < Math.min(allResults.length, maxResults));
    }
    
    setIsLoading(false);
  };

  // Navigate to previous/next page (only used after 30 results)
  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      
      const startIndex = resultsPerPage + (prevPage - 1) * resultsPerPage;
      const endIndex = startIndex + resultsPerPage;
      setDisplayedResults(allResults.slice(0, resultsPerPage).concat(allResults.slice(startIndex, endIndex)));
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      
      const startIndex = resultsPerPage + (nextPage - 1) * resultsPerPage;
      const endIndex = startIndex + resultsPerPage;
      setDisplayedResults(allResults.slice(0, resultsPerPage).concat(allResults.slice(startIndex, endIndex)));
    }
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    return Object.values(activeFilters).reduce((acc, curr) => acc + curr.length, 0);
  };

  const openBrandModal = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsModalOpen(true);
  };

  // Toggle contacts dropdown
  const toggleContacts = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowContacts(prev => !prev);
  };

  // MODIFIED: Handlers for the template selection modal
  const openTemplateSelectorModal = (target: Brand | Contact) => {
    setCurrentEmailTarget(target);
    setSelectedTemplateInModal(null);
    setIsTemplateSelectorModalOpen(true); // Controls Template Selector Modal
  };

  const closeTemplateSelectorModal = () => {
    setIsTemplateSelectorModalOpen(false); // Controls Template Selector Modal
    setCurrentEmailTarget(null);
    setSelectedTemplateInModal(null);
  };

  const handleSendEmailWithTemplate = (useBlankEmail: boolean = false) => {
    if (!currentEmailTarget) return;

    let recipientEmail = '';
    let brandNameForEmail = '';

    if ('contacts' in currentEmailTarget) { // It's a Brand object
      brandNameForEmail = currentEmailTarget.name;
      if (currentEmailTarget.contacts && currentEmailTarget.contacts.length > 0 && currentEmailTarget.contacts[0].email) {
        recipientEmail = currentEmailTarget.contacts[0].email;
      } else {
        recipientEmail = `contact@${currentEmailTarget.name.toLowerCase().replace(/\s+/g, '')}.com`;
        alert(`No primary contact email found for ${currentEmailTarget.name}. Using a generic one. Please verify.`);
      }
    } else { // It's a Contact object
      recipientEmail = (currentEmailTarget as Contact).email; // Type assertion
      // If you need brand name for contact, it should be passed along or fetched.
      // For now, using a generic placeholder or the contact's name if suitable.
      brandNameForEmail = currentEmailTarget.name.split(' ')[0]; // Example: use contact's first name or a generic 'Brand'
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
    closeTemplateSelectorModal();
  };

  return (
    <div className="min-h-screen bg-cream">
      <DashboardNav />
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-display font-medium text-charcoal mb-2">
              Search Results
            </h1>
            <p className="text-taupe">
              {allResults.length} results found
            </p>
          </div>

          {/* Search Bar */}
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

          {/* Active Filters */}
          {getActiveFilterCount() > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-sm text-taupe">Active filters:</span>
              {Object.entries(activeFilters).map(([category, values]) => 
                values.map((value: string) => {
                  // Extract subcategory if the value contains a colon
                  const displayValue = value.includes(':') ? value.split(':')[1] : value;
                  return (
                    <button 
                      key={`${category}-${value}`}
                      className="px-3 py-1.5 rounded-lg text-sm bg-rose/10 text-rose border border-rose/20 flex items-center gap-2"
                      onClick={() => removeFilter(category, value)}
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

          {/* Filter Button */}
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
                      {/* Industry Filters */}
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

                      {/* Location Filters */}
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

                      {/* Size Filters */}
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

                      {/* Social Media Filters */}
                      <Disclosure>
                        {({ open }) => (
                          <div className="border border-blush/20 rounded-lg overflow-hidden">
                            <Disclosure.Button className="w-full px-4 py-3 flex justify-between items-center bg-cream/50 hover:bg-cream/70 transition-colors">
                              <span className="font-medium text-charcoal">Social Media</span>
                              <ChevronDownIcon
                                className={`w-5 h-5 text-taupe transition-transform ${open ? 'transform rotate-180' : ''}`}
                              />
                            </Disclosure.Button>
                            <Disclosure.Panel className="p-4 space-y-4">
                              <div>
                                <h5 className="text-sm text-taupe mb-2">Instagram Followers</h5>
                                <div className="flex flex-wrap gap-2">
                                  {filterOptions.instagram.map(range => (
                                    <button
                                      key={range}
                                      onClick={() => toggleFilter('instagram', range)}
                                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${
                                        activeFilters.instagram.includes(range)
                                          ? 'bg-rose border-rose text-white'
                                          : 'bg-white border-blush/20 text-charcoal hover:bg-rose/5'
                                      }`}
                                    >
                                      {range}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h5 className="text-sm text-taupe mb-2">TikTok Followers</h5>
                                <div className="flex flex-wrap gap-2">
                                  {filterOptions.tiktok.map(range => (
                                    <button
                                      key={range}
                                      onClick={() => toggleFilter('tiktok', range)}
                                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${
                                        activeFilters.tiktok.includes(range)
                                          ? 'bg-rose border-rose text-white'
                                          : 'bg-white border-blush/20 text-charcoal hover:bg-rose/5'
                                      }`}
                                    >
                                      {range}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </Disclosure.Panel>
                          </div>
                        )}
                      </Disclosure>

                      {/* Year Founded Filters */}
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

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose"></div>
            </div>
          )}

          {/* Results Grid */}
          {!isLoading && (
            <div className="grid grid-cols-12 gap-4">
              {displayedResults.map((brand, index) => {
                // Create more dynamic layout patterns
                const pattern = index % 11; // Create a longer pattern cycle
                let gridClass = '';
                
                // More varied size patterns
                switch(pattern) {
                  case 0:
                    gridClass = 'col-span-4 row-span-2'; // Tall and medium width
                    break;
                  case 1:
                  case 2:
                    gridClass = 'col-span-3'; // Regular cards
                    break;
                  case 3:
                    gridClass = 'col-span-6'; // Extra wide
                    break;
                  case 4:
                    gridClass = 'col-span-3 row-span-2'; // Tall and narrow
                    break;
                  case 5:
                  case 6:
                    gridClass = 'col-span-4'; // Medium width
                    break;
                  case 7:
                    gridClass = 'col-span-5'; // Slightly wider
                    break;
                  case 8:
                  case 9:
                    gridClass = 'col-span-3'; // Regular cards
                    break;
                  case 10:
                    gridClass = 'col-span-6 row-span-2'; // Large card
                    break;
                  default:
                    gridClass = 'col-span-4'; // Default medium width
                }
                
                const isTall = gridClass.includes('row-span-2');
                const isWide = parseInt(gridClass.split('-')[2]) > 4;
                
                return (
                  <motion.div
                    key={brand.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-xl p-6 border-[3px] border-[rgb(229,218,248)] hover:border-[5px] hover:border-[rgb(229,218,248)] hover:shadow-lg transition-all duration-200 relative ${gridClass} cursor-pointer`}
                    onClick={() => openBrandModal(brand)}
                  >
                    <button 
                      className="absolute top-4 right-4 p-1.5 bg-[rgb(229,218,248)] text-rose rounded-lg border border-transparent hover:bg-[rgb(229,218,248)]/80 hover:border-rose/20 transition-all"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        const target = brand.contacts && brand.contacts.length > 0 ? brand.contacts[0] : brand;
                        openTemplateSelectorModal(target); 
                      }}
                      title={`Email ${brand.name}`}
                    >
                      <EnvelopeIcon className="w-4 h-4" />
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
                        />
                      </div>
                      <div className="flex-1">
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
                          <div className="flex gap-4 text-sm text-taupe">
                            <span>Instagram: {brand.instagram}</span>
                            <span>TikTok: {brand.tiktok}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* No Results State */}
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

          {/* Load More Button */}
          {!isLoading && showLoadMore && displayedResults.length > 0 && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleLoadMore}
                className="px-6 py-3 bg-white text-rose border border-rose rounded-lg hover:bg-rose/5 transition-colors"
              >
                Load More
              </button>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && !showLoadMore && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg border ${
                  currentPage === 1
                    ? 'border-blush/20 text-taupe/50 cursor-not-allowed'
                    : 'border-blush/20 text-charcoal hover:bg-rose/5'
                }`}
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <span className="text-charcoal">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg border ${
                  currentPage === totalPages
                    ? 'border-blush/20 text-taupe/50 cursor-not-allowed'
                    : 'border-blush/20 text-charcoal hover:bg-rose/5'
                }`}
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Brand Modal - uses isModalOpen */}
          <AnimatePresence>
            {isModalOpen && selectedBrand && (
              <div className="fixed inset-0 z-[100] pointer-events-none">
                <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                  <div 
                    className="fixed inset-0 transition-opacity bg-black/30 pointer-events-auto" 
                    onClick={() => setIsModalOpen(false)}
                  />
                  
                  <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="inline-block w-full max-w-3xl p-6 my-8 overflow-hidden text-left align-middle bg-white shadow-xl rounded-2xl border-[3px] border-[rgb(229,218,248)] transform transition-all pointer-events-auto relative z-[101]"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-xl bg-cream/50 flex items-center justify-center">
                          <img
                            src={selectedBrand.logo}
                            alt={selectedBrand.name}
                            className="w-20 h-20 object-contain"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-display font-medium text-charcoal">
                              {selectedBrand.name}
                            </h3>
                            <button 
                              onClick={() => {
                                setSelectedBrand(prev => prev ? {...prev, isFavorite: !prev.isFavorite} : null);
                              }}
                              className="p-1.5 hover:bg-rose/5 rounded-full transition-colors"
                            >
                              {selectedBrand.isFavorite ? (
                                <HeartIconSolid className="w-6 h-6 text-rose" />
                              ) : (
                                <HeartIcon className="w-6 h-6 text-rose" />
                              )}
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-lg text-taupe">
                              {selectedBrand.industry}
                            </p>
                            {selectedBrand.website && (
                              <>
                                <span className="text-blush/20">•</span>
                                <a 
                                  href={selectedBrand.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-rose hover:text-rose/80 transition-colors flex items-center gap-1"
                                >
                                  <LinkIcon className="w-4 h-4" />
                                  <span>Website</span>
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        className="p-2 text-taupe hover:text-charcoal"
                        onClick={() => setIsModalOpen(false)}
                      >
                        <XMarkIcon className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <MapPinIcon className="w-5 h-5 text-rose" />
                          <div>
                            <h4 className="text-sm font-medium text-taupe mb-1">Location</h4>
                            <p className="text-charcoal">{selectedBrand.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <UsersIcon className="w-5 h-5 text-rose" />
                          <div>
                            <h4 className="text-sm font-medium text-taupe mb-1">Company Size</h4>
                            <p className="text-charcoal">{selectedBrand.size} employees</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <CalendarIcon className="w-5 h-5 text-rose" />
                          <div>
                            <h4 className="text-sm font-medium text-taupe mb-1">Founded</h4>
                            <p className="text-charcoal">{selectedBrand.founded}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-taupe mb-1">Social Media</h4>
                          <div className="space-y-1.5">
                            <a 
                              href={`https://instagram.com/${selectedBrand.name.toLowerCase()}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 py-1 px-2 hover:bg-cream/30 rounded-md transition-all group"
                            >
                              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-rose">
                                <path
                                  fill="currentColor"
                                  d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                                />
                              </svg>
                              <span className="text-xs text-charcoal group-hover:text-rose transition-colors">Instagram</span>
                              <span className="text-xs font-medium text-charcoal ml-auto">{selectedBrand.instagram}</span>
                            </a>
                            <a 
                              href={`https://tiktok.com/@${selectedBrand.name.toLowerCase()}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 py-1 px-2 hover:bg-cream/30 rounded-md transition-all group"
                            >
                              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-rose">
                                <path
                                  fill="currentColor"
                                  d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0011.14-4.02v-7a8.16 8.16 0 004.65 1.48V7.1a4.79 4.79 0 01-1.2-.41z"
                                />
                              </svg>
                              <span className="text-xs text-charcoal group-hover:text-rose transition-colors">TikTok</span>
                              <span className="text-xs font-medium text-charcoal ml-auto">{selectedBrand.tiktok}</span>
                            </a>
                          </div>
                          
                          {selectedBrand.tagline && (
                            <div className="mt-2 pt-2 border-t border-blush/10">
                              <h4 className="text-xs font-medium text-taupe mb-1">About</h4>
                              <p className="text-charcoal text-sm leading-normal italic">{selectedBrand.tagline}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedBrand.description && (
                      <div className="mb-8">
                        <h4 className="text-sm font-medium text-taupe mb-2">About</h4>
                        <p className="text-charcoal">{selectedBrand.description}</p>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button
                        className="flex-1 py-3 px-6 bg-[rgb(229,218,248)] text-rose rounded-lg hover:bg-[rgb(229,218,248)]/80 transition-colors flex items-center justify-center gap-2"
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            const target = selectedBrand.contacts && selectedBrand.contacts.length > 0 ? selectedBrand.contacts[0] : selectedBrand;
                            openTemplateSelectorModal(target); 
                        }}
                      >
                        <EnvelopeIcon className="w-5 h-5" />
                        <span>Contact Brand</span>
                      </button>
                      <button
                        className="flex-1 py-3 px-6 bg-rose text-white rounded-lg hover:bg-rose/90 transition-colors flex items-center justify-center gap-2"
                        onClick={toggleContacts} // This shows/hides the contact list
                      >
                        <EnvelopeIcon className="w-5 h-5" />
                        <span>Email Decision Makers</span>
                        {showContacts ? (
                          <ChevronUpIcon className="w-4 h-4 ml-1" />
                        ) : (
                          <ChevronDownIcon className="w-4 h-4 ml-1" />
                        )}
                      </button>
                    </div>
                    
                    <AnimatePresence>
                      {showContacts && selectedBrand && selectedBrand.contacts && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-4 border-t border-blush/20 pt-4 overflow-hidden"
                        >
                          <h4 className="text-sm font-medium text-charcoal mb-3">Decision Makers at {selectedBrand.name}</h4>
                          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {selectedBrand.contacts.map(contact => (
                              <div 
                                key={contact.id} 
                                className="flex items-center justify-between p-3 bg-cream/20 rounded-lg hover:bg-cream/30 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-cream/50 overflow-hidden flex-shrink-0 flex items-center justify-center border border-blush/10">
                                    <img 
                                      src={selectedBrand.logo} 
                                      alt={selectedBrand.name} 
                                      className="w-7 h-7 object-contain"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-charcoal truncate">{contact.name}</p>
                                    <p className="text-xs text-taupe truncate">{contact.title}</p>
                                  </div>
                                </div>
                                <button 
                                  className="px-3 py-1.5 bg-rose text-white text-xs rounded-lg hover:bg-rose/90 transition-colors flex items-center gap-1 flex-shrink-0 ml-2"
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    openTemplateSelectorModal(contact); 
                                  }}
                                  title={`Email ${contact.name}`}
                                >
                                  <EnvelopeIcon className="w-3 h-3" />
                                  <span>Email</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Template Selection Modal - uses isTemplateSelectorModalOpen */}
      <Transition appear show={isTemplateSelectorModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[100]" onClose={closeTemplateSelectorModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-charcoal flex justify-between items-center">
                    Choose an Email Template
                    <button onClick={closeTemplateSelectorModal} className="p-1 rounded-md hover:bg-blush/50">
                        <XMarkIcon className="h-5 w-5 text-taupe"/>
                    </button>
                  </Dialog.Title>
                  <div className="mt-4 space-y-3 max-h-96 overflow-y-auto pr-2">
                    {emailTemplatesData.map((template) => (
                      <div 
                        key={template.id}
                        onClick={() => setSelectedTemplateInModal(template)}
                        className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${
                            selectedTemplateInModal?.id === template.id ? 'border-rose ring-2 ring-rose bg-rose/5' : 'border-blush/30 bg-cream/30'
                        }`}
                      >
                        <p className="font-semibold text-charcoal">{template.name}</p>
                        <p className="text-sm text-taupe mt-1">Subject: {template.subject.substring(0, 100) + (template.subject.length > 100 ? '...' : '')}</p>
                        {selectedTemplateInModal?.id === template.id && (
                            <p className="text-xs text-charcoal mt-2 whitespace-pre-line bg-cream p-2 rounded-md">{template.body.substring(0,200) + (template.body.length > 200 ? '...':'')}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blush/20 px-4 py-2 text-sm font-medium text-rose hover:bg-blush/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-offset-2"
                      onClick={closeTemplateSelectorModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-taupe/20 px-4 py-2 text-sm font-medium text-charcoal hover:bg-taupe/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-taupe focus-visible:ring-offset-2"
                      onClick={() => handleSendEmailWithTemplate(true)}
                    >
                      Use Blank Email
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-rose px-4 py-2 text-sm font-medium text-white hover:bg-rose/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-offset-2 disabled:opacity-50"
                      onClick={() => handleSendEmailWithTemplate(false)}
                      disabled={!selectedTemplateInModal}
                    >
                      Use Selected Template
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
} 