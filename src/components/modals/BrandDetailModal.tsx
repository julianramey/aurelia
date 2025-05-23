import React, { Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  HeartIcon as HeartIconOutline,
  EnvelopeIcon,
  MapPinIcon,
  UsersIcon,
  CalendarIcon,
  LinkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, CheckCircleIcon } from '@heroicons/react/24/solid';
import type { NormalizedBrand, Product, Contact } from '@/types'; // Assuming types are in src/types.ts

export interface BrandDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: NormalizedBrand | null;
  onToggleFavorite: (brandId: number) => void;
  onToggleContacts?: () => void;
  showContacts?: boolean;
  onOpenEmailTemplateSelector?: (target: NormalizedBrand | Contact) => void;
}

const BrandDetailModal: React.FC<BrandDetailModalProps> = ({
  isOpen,
  onClose,
  brand,
  onToggleFavorite,
  onToggleContacts,
  showContacts,
  onOpenEmailTemplateSelector,
}) => {
  if (!brand) {
    return null;
  }

  const displayableProducts = brand.products?.filter(p => p.image_url && p.image_url.trim() !== '') || [];

  let avgPriceDisplayValue = 'N/A';
  if (typeof brand.avg_product_price === 'number' && !isNaN(brand.avg_product_price)) {
    avgPriceDisplayValue = `$${brand.avg_product_price.toFixed(2)}`;
  } else if (displayableProducts.length > 0) {
    const prices = displayableProducts.map(p => parseFloat(p.price?.replace('$', ''))).filter(price => !isNaN(price));
    if (prices.length > 0) {
      const sum = prices.reduce((acc, price) => acc + price, 0);
      avgPriceDisplayValue = `$${(sum / prices.length).toFixed(2)}`;
    }
  }
  const shouldShowAvgPriceSection = avgPriceDisplayValue !== 'N/A';


  return (
    <AnimatePresence>
      {isOpen && brand && (
        <div className="fixed inset-0 z-[100] pointer-events-none">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-black/30 pointer-events-auto"
              onClick={onClose}
            />
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="inline-block w-full max-w-3xl p-6 my-8 overflow-y-auto max-h-[90vh] text-left align-middle bg-white shadow-xl rounded-2xl border-[3px] border-[rgb(229,218,248)] transform transition-all pointer-events-auto relative z-[101]"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-xl bg-cream/50 flex items-center justify-center">
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="w-20 h-20 object-contain"
                      onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/100?text=Logo')}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-display font-medium text-charcoal">
                        {brand.name}
                      </h3>
                      <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(brand.id);
                        }}
                        className="p-1.5 hover:bg-rose/5 rounded-full transition-colors"
                        aria-label={brand.isFavorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        {brand.isFavorite ? (
                          <HeartIconSolid className="w-6 h-6 text-rose" />
                        ) : (
                          <HeartIconOutline className="w-6 h-6 text-rose" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-lg text-taupe">
                        {brand.industry}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  className="p-2 text-taupe hover:text-charcoal"
                  onClick={onClose}
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
                      <p className="text-charcoal">{brand.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <UsersIcon className="w-5 h-5 text-rose" />
                    <div>
                      <h4 className="text-sm font-medium text-taupe mb-1">Company Size</h4>
                      <p className="text-charcoal">{brand.size} employees</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-rose" />
                    <div>
                      <h4 className="text-sm font-medium text-taupe mb-1">Founded</h4>
                      <p className="text-charcoal">{brand.founded}</p>
                    </div>
                  </div>
                  {brand.website && (
                    <div className="flex items-center gap-3">
                      <LinkIcon className="w-5 h-5 text-rose" />
                      <div>
                        <h4 className="text-sm font-medium text-taupe mb-1">Website</h4>
                        <a
                          href={brand.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-charcoal hover:text-rose transition-colors break-all"
                        >
                          {brand.website.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-taupe mb-1">Social Media</h4>
                    <div className="space-y-1.5">
                      {brand.instagram && (
                        <a
                          href={brand.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 py-1 px-2 hover:bg-cream/30 rounded-md transition-all group"
                        >
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-rose">
                            <path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.947-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                          <span className="text-xs text-charcoal group-hover:text-rose transition-colors">Instagram</span>
                        </a>
                      )}
                      {brand.tiktok && (
                        <a
                          href={brand.tiktok}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 py-1 px-2 hover:bg-cream/30 rounded-md transition-all group"
                        >
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-rose">
                            <path fill="currentColor" d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0011.14-4.02v-7a8.16 8.16 0 004.65 1.48V7.1a4.79 4.79 0 01-1.2-.41z" />
                          </svg>
                          <span className="text-xs text-charcoal group-hover:text-rose transition-colors">TikTok</span>
                        </a>
                      )}
                    </div>
                    {brand.description && (
                      <div className="mt-2 pt-2 border-t border-blush/10">
                        <h4 className="text-xs font-medium text-taupe mb-1">About</h4>
                        <p className="text-charcoal text-sm leading-normal italic">{brand.description}</p>
                      </div>
                    )}
                  </div>

                  {displayableProducts.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-blush/10">
                      <div className="flex justify-between items-center mb-1.5">
                          <h4 className="text-xs font-medium text-taupe">Featured Products</h4>
                      </div>
                      <div className={`flex flex-wrap ${ displayableProducts.slice(0,3).length === 1 && !shouldShowAvgPriceSection ? 'justify-center' : 'justify-start -ml-1 -mr-1'} items-stretch`}>
                        {displayableProducts.slice(0, 3).map(product => (
                          <a
                            href={product.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={product.name}
                            className="flex flex-col items-center text-center p-1.5 m-1 bg-cream/30 rounded-md hover:bg-cream/50 transition-colors group w-[calc(25%-0.5rem)] max-w-[72px] flex-shrink-0"
                          >
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-[70px] object-cover rounded mb-1 border border-blush/20"
                              onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/80x64?text=Img')}
                            />
                            <h5 className="text-[10px] font-medium text-charcoal truncate w-full group-hover:text-rose leading-tight mt-auto">{product.name}</h5>
                            <p className="text-[9px] text-taupe w-full">{product.price}</p>
                          </a>
                        ))}
                        {shouldShowAvgPriceSection && (
                            <div className="flex flex-col items-center text-center p-1.5 m-1 bg-cream/30 rounded-md w-[calc(25%-0.5rem)] max-w-[72px] flex-shrink-0">
                                <div className="w-full h-[70px] flex flex-col justify-center items-center text-rose">
                                    <CurrencyDollarIcon className="w-7 h-7" />
                                </div>
                                <h5 className="text-[10px] font-medium text-charcoal truncate w-full leading-tight mt-auto">Avg. Price</h5>
                                <p className="text-[9px] text-taupe w-full">{avgPriceDisplayValue}</p>
                            </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  className="flex-1 py-3 px-6 bg-[rgb(229,218,248)] text-rose rounded-lg hover:bg-[rgb(229,218,248)]/80 transition-colors flex items-center justify-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenEmailTemplateSelector) {
                       const target = brand.contacts && brand.contacts.length > 0 ? brand.contacts[0] : brand;
                       onOpenEmailTemplateSelector(target);
                    } else {
                        alert("Email functionality not available here.");
                    }
                  }}
                  disabled={!onOpenEmailTemplateSelector}
                >
                  <EnvelopeIcon className="w-5 h-5" />
                  <span>Contact Brand</span>
                </button>
                <button
                  className="flex-1 py-3 px-6 bg-rose text-white rounded-lg hover:bg-rose/90 transition-colors flex items-center justify-center gap-2"
                  onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleContacts) onToggleContacts();
                  }}
                  disabled={!onToggleContacts || !brand.contacts || brand.contacts.length === 0}
                >
                  <EnvelopeIcon className="w-5 h-5" />
                  <span>View Decision Makers</span>
                  {showContacts ? (
                    <ChevronUpIcon className="w-4 h-4 ml-1" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 ml-1" />
                  )}
                </button>
              </div>

              <AnimatePresence>
                {showContacts && brand.contacts && brand.contacts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 border-t border-blush/20 pt-4"
                  >
                    <h4 className="text-sm font-medium text-charcoal mb-3">Decision Makers at {brand.name}</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {brand.contacts.map(contact => (
                        <div
                          key={contact.id}
                          className="flex items-center justify-between p-3 bg-cream/20 rounded-lg hover:bg-cream/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-cream/50 overflow-hidden flex-shrink-0 flex items-center justify-center border border-blush/10">
                              <img
                                src={contact.profileImage || brand.logo}
                                alt={contact.name}
                                className="w-7 h-7 object-contain"
                                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/40?text=P')}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-charcoal truncate">{contact.name}</p>
                              <p className="text-xs text-taupe truncate">{contact.title}</p>
                            </div>
                          </div>
                          <button
                            className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1 flex-shrink-0 ml-2 ${
                              contact.emailSent
                                ? 'bg-green-100 text-green-600 cursor-default'
                                : 'bg-rose text-white hover:bg-rose/90'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (contact.emailSent) return;
                              if (onOpenEmailTemplateSelector) onOpenEmailTemplateSelector(contact);
                              else alert("Email functionality not available here.");
                            }}
                            title={contact.emailSent ? `Email sent on ${contact.emailSentDate}` : `Email ${contact.name}`}
                            disabled={contact.emailSent || !onOpenEmailTemplateSelector}
                          >
                            {contact.emailSent ? <CheckCircleIcon className="w-3 h-3" /> : <EnvelopeIcon className="w-3 h-3" />}
                            <span>{contact.emailSent ? 'Sent' : 'Email'}</span>
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
  );
};

export default BrandDetailModal; 