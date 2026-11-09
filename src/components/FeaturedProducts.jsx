import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Eye, MessageCircle, Sparkles, Filter } from 'lucide-react';
import { brandConfig } from '../config/brandConfig';
import { useWishlist } from '../context/WishlistContext';
import { useSiteData } from '../context/SiteDataContext';
import { FloralAccent } from './common/FloralAccent';

export function FeaturedProducts({ selectedCategoryFilter, onClearFilter }) {
  const { isInWishlist, toggleWishlist, setSelectedProduct } = useWishlist();
  const { products: liveProducts } = useSiteData();
  const productCatalog = (liveProducts && liveProducts.length > 0) ? liveProducts : brandConfig.products;
  const [activeFilter, setActiveFilter] = useState(selectedCategoryFilter || 'all');

  const filterOptions = [
    { id: 'all', label: 'All Treasures' },
    { id: 'crochet-treasures', label: 'Crochet Keychains & Charms' },
    { id: 'floral-creations', label: 'Crochet Flowers & Bouquets' },
    { id: 'hair-accessories', label: 'Hair Clips & Bows' },
    { id: 'fashion-studio', label: 'Fashion & Collars' }
  ];

  // If parent changed filter
  React.useEffect(() => {
    if (selectedCategoryFilter) {
      setActiveFilter(selectedCategoryFilter);
    }
  }, [selectedCategoryFilter]);

  const filteredProducts = activeFilter === 'all'
    ? productCatalog
    : productCatalog.filter(p => p.category === activeFilter || p.categorySlug === activeFilter);

  return (
    <section id="shop" className="py-20 md:py-28 bg-ivory relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-rose text-xs font-medium tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Handmade with Devotion</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-brown-dark font-medium tracking-tight">
            Featured Creations
          </h2>
          <div className="flex justify-center pt-1 pb-2">
            <FloralAccent className="w-20 h-4 text-rose/50" />
          </div>
          <p className="text-sm sm:text-base text-brown/75 font-light leading-relaxed">
            Each creation is sculpted stitch by stitch using fine organic cottons, European linens, and thoughtful botanical details.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3 mb-12">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                setActiveFilter(option.id);
                if (onClearFilter && option.id === 'all') onClearFilter();
              }}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                activeFilter === option.id
                  ? 'bg-rose text-white shadow-delicate'
                  : 'bg-cream border border-blush/60 text-brown-dark/80 hover:bg-blush-light/50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          <AnimatePresence>
            {filteredProducts.map((product) => {
              const inWishlist = isInWishlist(product.id);
              const whatsappUrl = `https://wa.me/${brandConfig.contact.whatsappNumber}?text=Hi%20Amelia!%20I'm%20interested%20in%20the%20${encodeURIComponent(product.name)}%20($${product.price})%20from%20Petal%20%26%20Thread.`;

              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4 }}
                  className="group bg-cream rounded-3xl overflow-hidden border border-blush/60 shadow-soft hover:shadow-soft-lg transition-all duration-500 flex flex-col justify-between"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden bg-ivory">
                    <img
                      src={product.image}
                      alt={product.name}
                      onClick={() => setSelectedProduct(product)}
                      className="w-full h-full object-cover object-center cursor-pointer transform group-hover:scale-106 transition-transform duration-700"
                    />

                    {/* Badge */}
                    {product.badge && (
                      <span className="absolute top-3.5 left-3.5 bg-cream/95 backdrop-blur-md text-rose text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full border border-blush/50 shadow-xs">
                        {product.badge}
                      </span>
                    )}

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product);
                      }}
                      className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-cream/90 backdrop-blur-md border border-blush/50 text-brown flex items-center justify-center hover:bg-cream hover:text-rose transition-all shadow-xs"
                      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart
                        className={`w-4 h-4 transition-transform duration-300 ${
                          inWishlist ? 'fill-rose text-rose scale-110' : 'text-brown/70 group-hover:text-rose'
                        }`}
                      />
                    </button>

                    {/* Quick View Overlay Button on Hover */}
                    <div className="absolute inset-x-4 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="flex-1 py-2.5 px-3 rounded-full bg-cream/95 backdrop-blur-md border border-blush/80 text-brown-dark hover:bg-white text-xs font-medium shadow-delicate flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-rose" />
                        <span>Quick View</span>
                      </button>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] tracking-widest uppercase font-semibold text-rose block mb-1">
                        {product.categoryName}
                      </span>
                      <h3
                        onClick={() => setSelectedProduct(product)}
                        className="font-serif text-lg text-brown-dark font-medium leading-snug cursor-pointer hover:text-rose transition-colors line-clamp-2"
                      >
                        {product.name}
                      </h3>
                      <p className="text-xs text-brown/70 line-clamp-2 mt-1.5 font-light leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-3 border-t border-blush/40 flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif text-lg font-semibold text-brown-dark">
                          {brandConfig.brand.currency}{product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-brown-light line-through font-light">
                            {brandConfig.brand.currency}{product.originalPrice}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full bg-blush-light text-rose hover:bg-rose hover:text-white flex items-center justify-center transition-colors"
                          title="Quick WhatsApp Enquiry"
                          aria-label="Enquire on WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="px-3 py-1.5 rounded-full bg-ivory border border-blush text-brown-dark hover:bg-blush-light text-[11px] font-medium transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Custom Order Callout Bar below products */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-cream border border-blush/70 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-serif text-xl text-brown-dark font-medium">
              Looking for a specific flower, colorway or bridal set?
            </h4>
            <p className="text-xs sm:text-sm text-brown/75 font-light">
              We specialize in custom crochet bouquets, matching hair combs, and bespoke colorways.
            </p>
          </div>
          <a
            href={`https://wa.me/${brandConfig.contact.whatsappNumber}?text=Hi%20Amelia!%20I'd%20love%20to%20ask%20about%20a%20custom%20order%20from%20Petal%20%26%20Thread.`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-full bg-rose text-white hover:bg-rose-dark text-xs sm:text-sm font-medium flex items-center gap-2 flex-shrink-0 transition-colors shadow-delicate"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Enquire on WhatsApp</span>
          </a>
        </div>

      </div>
    </section>
  );
}
