import React, { useState, useEffect } from 'react';
// import DashboardNav from '../components/DashboardNav'; // Removed: Handled by withPreview HOC
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { 
  CalculatorIcon, 
  CurrencyDollarIcon, 
  HashtagIcon,
  ChartBarIcon,
  VideoCameraIcon,
  PhotoIcon,
  DocumentTextIcon 
} from '@heroicons/react/24/outline';
import { withPreview } from '@/lib/withPreview'; // Added HOC import

// Renamed from RateCalculator to RateCalculatorComponent
const RateCalculatorComponent = ({ isPreview = false }: { isPreview?: boolean }) => {
  const [followerCount, setFollowerCount] = useState<string>('');
  const [engagementRate, setEngagementRate] = useState<string>('');
  const [contentType, setContentType] = useState<string>('photo');
  const [calculatedRate, setCalculatedRate] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Animation values for the rate number
  const rate = useMotionValue(0);
  const roundedRate = useTransform(rate, value => 
    value === 0 ? '0' : value.toLocaleString('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  );

  // Glow animation for the rate
  const glowIntensity = useMotionValue(0);
  const textShadow = useTransform(
    glowIntensity,
    [0, 0.3, 0.6, 1],
    [
      '0 0 0px rgba(126, 105, 171, 0)',
      '0 0 15px rgba(126, 105, 171, 0.3)',
      '0 0 25px rgba(126, 105, 171, 0.5)',
      '0 0 35px rgba(126, 105, 171, 0.7)'
    ]
  );

  // Calculate the rate based on inputs
  const calculateRate = () => {
    if (!followerCount || !engagementRate) return;
    
    setIsCalculating(true);
    
    // Parse input values
    const followers = parseInt(followerCount.replace(/,/g, ''));
    const engagement = parseFloat(engagementRate);
    
    // Determine base rate multiplier based on content type
    let multiplier = 10; // default for photo
    if (contentType === 'video') multiplier = 15;
    else if (contentType === 'story') multiplier = 5;
    else if (contentType === 'reel') multiplier = 20;
    
    // Calculate final rate
    const finalRate = (followers / 1000) * (engagement / 100) * multiplier;
    
    // Animate to the calculated value
    setTimeout(() => {
      setCalculatedRate(finalRate);
      animate(rate, finalRate, { 
        duration: 1.5,
        ease: [0.19, 1.0, 0.22, 1.0]
      });
      animate(glowIntensity, 1, { 
        duration: 1,
        ease: [0.4, 0, 0.2, 1]
      });
      setIsCalculating(false);
    }, 800);
  };

  const contentTypeOptions = [
    { value: 'photo', label: 'Photo Post', icon: PhotoIcon },
    { value: 'video', label: 'Video Content', icon: VideoCameraIcon },
    { value: 'story', label: 'Story', icon: DocumentTextIcon },
    { value: 'reel', label: 'Reel', icon: VideoCameraIcon }
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* <DashboardNav /> */}{/* Removed: Handled by withPreview HOC */}
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <motion.div 
            className="text-center mb-12 pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1 
              className="text-[2.75rem] md:text-[3.5rem] lg:text-[4rem] font-display font-medium text-charcoal leading-tight mb-2"
            >
              Calculate Your{' '}
              <motion.span
                className="inline-block text-rose relative z-10"
              >
                Rate
              </motion.span>
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-taupe font-display"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Know your value. Charge accordingly.
            </motion.p>
          </motion.div>

          {/* Calculator Card */}
          <motion.div 
            className="max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="bg-white rounded-xl shadow-sm border border-blush/20 p-8">
              <h2 className="text-2xl font-display font-medium text-charcoal mb-6 text-center">Rate Calculator</h2>
              
              <div className="space-y-6">
                {/* Follower Count Input */}
                <div>
                  <label htmlFor="followerCount" className="block text-sm font-medium text-taupe mb-2">
                    Follower Count
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <HashtagIcon className="h-5 w-5 text-taupe/60" />
                    </div>
                    <input
                      type="text"
                      id="followerCount"
                      value={followerCount}
                      onChange={(e) => setFollowerCount(e.target.value)}
                      placeholder="e.g. 10,000"
                      className="w-full pl-12 p-4 border border-blush/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/40 bg-cream/50 text-lg"
                    />
                  </div>
                </div>

                {/* Engagement Rate Input */}
                <div>
                  <label htmlFor="engagementRate" className="block text-sm font-medium text-taupe mb-2">
                    Engagement Rate (%)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <ChartBarIcon className="h-5 w-5 text-taupe/60" />
                    </div>
                    <input
                      type="text"
                      id="engagementRate"
                      value={engagementRate}
                      onChange={(e) => setEngagementRate(e.target.value)}
                      placeholder="e.g. 3.5"
                      className="w-full pl-12 p-4 border border-blush/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose/40 bg-cream/50 text-lg"
                    />
                  </div>
                </div>

                {/* Content Type Selection */}
                <div>
                  <label htmlFor="contentType" className="block text-sm font-medium text-taupe mb-2">
                    Content Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {contentTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setContentType(option.value)}
                        className={`p-4 rounded-lg border text-sm flex flex-col items-center justify-center gap-2 transition-all ${
                          contentType === option.value
                            ? 'bg-rose text-white border-rose'
                            : 'bg-white border-blush/20 text-taupe hover:bg-rose/5'
                        }`}
                      >
                        <option.icon className="h-6 w-6" />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculate Button */}
                <motion.button
                  onClick={calculateRate}
                  disabled={isCalculating || !followerCount || !engagementRate}
                  className={`w-full h-14 bg-rose text-cream p-4 rounded-lg font-medium text-lg transition-colors ${
                    isCalculating || !followerCount || !engagementRate
                      ? 'opacity-70 cursor-not-allowed'
                      : 'hover:bg-rose/90'
                  }`}
                  whileTap={{ scale: isCalculating ? 1 : 0.98 }}
                >
                  {isCalculating ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Calculating...
                    </span>
                  ) : (
                    'Calculate Your Rate'
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Result Section */}
          <motion.div
            className="max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="bg-white rounded-xl shadow-sm border border-blush/20 p-8">
              <div className="text-center">
                <h2 className="text-xl font-medium text-taupe mb-6">Your Recommended Rate</h2>
                
                {calculatedRate !== null ? (
                  <div className="relative">
                    <motion.div 
                      className="text-5xl sm:text-6xl font-display font-medium text-rose/90"
                      style={{ textShadow }}
                    >
                      <motion.span>{roundedRate}</motion.span>
                    </motion.div>
                    <div className="mt-2 text-charcoal font-medium">per collaboration</div>
                    <div className="mt-6 px-4 py-4 bg-cream/50 rounded-lg border border-blush/10">
                      <p className="text-sm text-taupe">
                        This suggested rate is based on industry standards for creators with similar metrics.
                        Consider adjusting based on your niche expertise, content quality, and relationship with the brand.
                      </p>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-3 bg-white border border-rose text-rose rounded-lg hover:bg-rose/5 transition-colors text-sm font-medium"
                      >
                        Save to Media Kit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-3 bg-rose text-cream rounded-lg hover:bg-rose/90 transition-colors text-sm font-medium"
                      >
                        Share Rate
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <CalculatorIcon className="h-12 w-12 text-taupe/30 mx-auto mb-4" />
                    <p className="text-taupe">Enter your details above to calculate your rate.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          
          {/* Tips Section */}
          <motion.div
            className="max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <h2 className="text-2xl font-display font-medium text-charcoal mb-6 text-center">Rate Negotiation Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-blush/20 p-6">
                <h3 className="text-lg font-medium text-charcoal mb-3">Know Your Value</h3>
                <p className="text-sm text-taupe">
                  Don't undersell yourself. Consider your production costs, time investment, and the value your content brings to brands.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-blush/20 p-6">
                <h3 className="text-lg font-medium text-charcoal mb-3">Package Deals</h3>
                <p className="text-sm text-taupe">
                  Offer discounts for multiple content pieces or extended partnerships to incentivize longer collaborations.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-blush/20 p-6">
                <h3 className="text-lg font-medium text-charcoal mb-3">Usage Rights</h3>
                <p className="text-sm text-taupe">
                  Charge more for extended usage rights, exclusivity clauses, or if the brand wants to repurpose your content.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-blush/20 p-6">
                <h3 className="text-lg font-medium text-charcoal mb-3">Be Professional</h3>
                <p className="text-sm text-taupe">
                  Have a media kit ready, respond promptly, and maintain a professional approach to negotiations.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

// Export the HOC-wrapped component as the default
export default withPreview(RateCalculatorComponent); 