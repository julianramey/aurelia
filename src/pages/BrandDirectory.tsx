import React, { useState, useEffect } from 'react';
import DashboardNav from '@/components/DashboardNav';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { BookmarkIcon, FunnelIcon, XMarkIcon, ChevronDownIcon, HeartIcon } from '@heroicons/react/24/outline';
import { Popover, Disclosure } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';

const shimmerAnimation = {
  '.animate-shimmer': {
    animation: 'shimmer 1s cubic-bezier(0.4, 0, 0.2, 1) forwards'
  },
  '@keyframes shimmer': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(50%)' }
  }
};

export default function BrandDirectory() {
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

  const categories = [
    { 
      id: 'beauty', 
      name: 'Beauty', 
      query: 'beauty cosmetics makeup',
      brands: [
        { logo: 'https://logo.clearbit.com/glossier.com', name: 'Glossier' },
        { logo: 'https://logo.clearbit.com/fentybeauty.com', name: 'Fenty Beauty' },
        { logo: 'https://logo.clearbit.com/milkmakeup.com', name: 'Milk Makeup' },
        { logo: 'https://logo.clearbit.com/versedskin.com', name: 'Versed' },
        { logo: 'https://logo.clearbit.com/tatcha.com', name: 'Tatcha' },
        { logo: 'https://logo.clearbit.com/drunkelephant.com', name: 'Drunk Elephant' },
        { logo: 'https://logo.clearbit.com/rarebeauty.com', name: 'Rare Beauty' },
        { logo: 'https://logo.clearbit.com/summerfridays.com', name: 'Summer Fridays' },
        { logo: 'https://logo.clearbit.com/tower28beauty.com', name: 'Tower 28' }
      ]
    },
    { 
      id: 'skincare', 
      name: 'Skincare', 
      query: 'skincare face body',
      brands: [
        { logo: 'https://logo.clearbit.com/cerave.com', name: 'CeraVe' },
        { logo: 'https://logo.clearbit.com/laroche-posay.us', name: 'La Roche-Posay' },
        { logo: 'https://logo.clearbit.com/theordinary.deciem.com', name: 'The Ordinary' },
        { logo: 'https://logo.clearbit.com/paulaschoice.com', name: 'Paula\'s Choice' },
        { logo: 'https://logo.clearbit.com/kiehls.com', name: 'Kiehl\'s' },
        { logo: 'https://logo.clearbit.com/murad.com', name: 'Murad' },
        { logo: 'https://logo.clearbit.com/biossance.com', name: 'Biossance' },
        { logo: 'https://logo.clearbit.com/glowrecipe.com', name: 'Glow Recipe' },
        { logo: 'https://logo.clearbit.com/herbivorebotanicals.com', name: 'Herbivore' }
      ]
    },
    { 
      id: 'haircare', 
      name: 'Haircare', 
      query: 'hair products styling',
      brands: [
        { logo: 'https://logo.clearbit.com/olaplex.com', name: 'Olaplex' },
        { logo: 'https://logo.clearbit.com/bumbleandbumble.com', name: 'Bumble and bumble' },
        { logo: 'https://logo.clearbit.com/theouai.com', name: 'Ouai' },
        { logo: 'https://logo.clearbit.com/sheamoisture.com', name: 'SheaMoisture' },
        { logo: 'https://logo.clearbit.com/igkhair.com', name: 'IGK Hair' },
        { logo: 'https://logo.clearbit.com/verbproducts.com', name: 'Verb' },
        { logo: 'https://logo.clearbit.com/briogeohair.com', name: 'Briogeo' },
        { logo: 'https://logo.clearbit.com/functionofbeauty.com', name: 'Function of Beauty' },
        { logo: 'https://logo.clearbit.com/thedrybar.com', name: 'Drybar' }
      ]
    },
    { 
      id: 'fashion', 
      name: 'Fashion', 
      query: 'fashion clothing accessories',
      brands: [
        { logo: 'https://logo.clearbit.com/zara.com', name: 'Zara' },
        { logo: 'https://logo.clearbit.com/hm.com', name: 'H&M' },
        { logo: 'https://logo.clearbit.com/nike.com', name: 'Nike' },
        { logo: 'https://logo.clearbit.com/adidas.com', name: 'Adidas' },
        { logo: 'https://logo.clearbit.com/gucci.com', name: 'Gucci' },
        { logo: 'https://logo.clearbit.com/dior.com', name: 'Dior' },
        { logo: 'https://logo.clearbit.com/urbanoutfitters.com', name: 'Urban Outfitters' },
        { logo: 'https://logo.clearbit.com/prettylittlething.com', name: 'PrettyLittleThing' },
        { logo: 'https://logo.clearbit.com/fashionnova.com', name: 'Fashion Nova' }
      ]
    },
    { 
      id: 'foodAndBeverage', 
      name: 'Food & Beverage', 
      query: 'food beverage drinks',
      brands: [
        { logo: 'https://logo.clearbit.com/drinkolipop.com', name: 'Olipop' },
        { logo: 'https://logo.clearbit.com/drinkpoppi.com', name: 'Poppi' },
        { logo: 'https://logo.clearbit.com/pressedjuicery.com', name: 'Pressed Juicery' },
        { logo: 'https://logo.clearbit.com/sweetgreen.com', name: 'Sweetgreen' },
        { logo: 'https://logo.clearbit.com/daily-harvest.com', name: 'Daily Harvest' },
        { logo: 'https://logo.clearbit.com/mudwtr.com', name: 'Mud Wtr' },
        { logo: 'https://logo.clearbit.com/notco.com', name: 'NotCo' },
        { logo: 'https://logo.clearbit.com/oatly.com', name: 'Oatly' },
        { logo: 'https://www.wadesdairy.com/wp-content/uploads/2019/07/Liquid-Death-Logo.jpg', name: 'Liquid Death' }
      ]
    },
    { 
      id: 'trending', 
      name: 'Trending', 
      query: 'trending viral popular',
      brands: [
        { logo: 'https://logo.clearbit.com/apple.com', name: 'Apple' },
        { logo: 'https://logo.clearbit.com/tesla.com', name: 'Tesla' },
        { logo: 'https://logo.clearbit.com/supremenewyork.com', name: 'Supreme' },
        { logo: 'https://logo.clearbit.com/shein.com', name: 'Shein' },
        { logo: 'https://logo.clearbit.com/netflix.com', name: 'Netflix' },
        { logo: 'https://logo.clearbit.com/spotify.com', name: 'Spotify' },
        { logo: 'https://logo.clearbit.com/tiktok.com', name: 'TikTok' },
        { logo: 'https://logo.clearbit.com/roblox.com', name: 'Roblox' },
        { logo: 'https://logo.clearbit.com/coinbase.com', name: 'Coinbase' }
      ]
    }
  ];

  useEffect(() => {
    const controls = animate(count, 10261, {
      duration: 1.5,
      ease: [0.19, 1.0, 0.22, 1.0],
    });

    return controls.stop;
  }, []);

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

  const [activeFilters, setActiveFilters] = useState({
    industry: [],
    location: [],
    size: [],
    instagram: [],
    tiktok: [],
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
    instagram: ['10K-50K', '50K-200K', '200K+'],
    tiktok: ['10K-50K', '50K-200K', '200K+'],
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
      instagram: [],
      tiktok: [],
      founded: []
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).reduce((acc, curr) => acc + curr.length, 0);
  };

  const isSearchDisabled = getActiveFilterCount() > 0;

  const handleSearch = () => {
    navigate('/search-results');
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate('/search-results');
  };

  return (
    <div className="min-h-screen bg-cream">
      <DashboardNav />
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section - Moved up */}
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

          {/* Search Section with Filter */}
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
            </div>
          </motion.div>

          {/* Category Tiles */}
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
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="absolute inset-0 grid grid-cols-3 gap-0.5 p-1">
                  {category.brands.map((brand, idx) => (
                    <div 
                      key={brand.name}
                      className="relative flex items-center justify-center"
                    >
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="w-2/3 h-2/3 object-contain"
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

          {/* Saved Searches Section */}
          <motion.div
            className="max-w-4xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-medium text-charcoal">Saved Searches</h2>
              <button className="text-sm text-rose hover:text-rose/80 font-medium">
                Manage Searches
              </button>
            </div>

            {/* Empty State */}
            <div className="bg-white rounded-xl shadow-sm border border-blush/20 p-8 text-center">
              <div className="max-w-sm mx-auto">
                <BookmarkIcon className="w-8 h-8 text-taupe mx-auto mb-4" />
                <h3 className="text-lg font-medium text-charcoal mb-2">No saved searches yet</h3>
                <p className="text-taupe mb-4">
                  Save your favorite brand searches to quickly access them later.
                </p>
                <button className="text-rose hover:text-rose/80 font-medium">
                  Learn how to save searches
                </button>
              </div>
            </div>
          </motion.div>

          {/* Favorite Brands Section */}
          <motion.div
            className="max-w-4xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-medium text-charcoal">Favorite Brands</h2>
              <button className="text-sm text-rose hover:text-rose/80 font-medium">
                Manage Favorites
              </button>
            </div>

            {/* Empty State */}
            <div className="bg-white rounded-xl shadow-sm border border-blush/20 p-8 text-center">
              <div className="max-w-sm mx-auto">
                <HeartIcon className="w-8 h-8 text-taupe mx-auto mb-4" />
                <h3 className="text-lg font-medium text-charcoal mb-2">No favorite brands yet</h3>
                <p className="text-taupe mb-4">
                  Heart brands you love to keep track of them and quickly access their information.
                </p>
                <button className="text-rose hover:text-rose/80 font-medium">
                  Explore brands to favorite
                </button>
              </div>
            </div>

            {/* Example of how favorited brands will look (commented out for now) */}
            {/* 
            <div className="grid gap-4">
              <div className="bg-white rounded-xl p-4 border border-blush/20 hover:border-rose/20 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-cream/50"></div>
                    <div>
                      <h3 className="font-medium text-charcoal group-hover:text-rose transition-colors">Brand Name</h3>
                      <p className="text-sm text-taupe">Beauty & Skincare</p>
                    </div>
                  </div>
                  <button className="text-rose hover:text-rose/80">
                    <HeartIcon className="w-5 h-5 fill-current" />
                  </button>
                </div>
              </div>
            </div>
            */}
          </motion.div>
        </div>
      </main>
    </div>
  );
} 