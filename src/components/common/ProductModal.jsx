import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageCircle, Sparkles, Feather, ShieldCheck, Ruler } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { brandConfig } from '../../config/brandConfig';
import { formatPrice } from '../../utils/currency';

export function ProductModal() {
  const { selectedProduct, setSelectedProduct, isInWishlist, toggleWishlist, openCustomOrderWithPrefill } = useWishlist();

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedProduct(null);
    };
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedProduct, setSelectedProduct]);

  if (!selectedProduct) return null;

  const inWishlist = isInWishlist(selectedProduct.id);

  // Generate WhatsApp link
  const whatsappText = encodeURIComponent(
    `Hello ${brandConfig.brand.creator.name.split(' ')[0]}! I would love to enquire about "${selectedProduct.name}" (${formatPrice(selectedProduct.price)}) from ${brandConfig.brand.name}.`
  );
  const whatsappUrl = `https://wa.me/${brandConfig.contact.whatsappNumber}?text=${whatsappText}`;

  const handleCustomVariation = () => {
    const prefill = `I'd love to request a custom variation of "${selectedProduct.name}" (e.g., custom colorway or specific size)...`;
    setSelectedProduct(null);
    openCustomOrderWithPrefill(prefill);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedProduct(null)}
          className="fixed inset-0 bg-brown-dark/50 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl bg-cream rounded-3xl shadow-soft-lg border border-blush/60 overflow-hidden z-10 my-8"
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedProduct(null)}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-cream/80 backdrop-blur-md text-brown-dark/70 hover:text-brown-dark hover:bg-blush-light transition-all flex items-center justify-center border border-blush/40 shadow-sm"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image Side */}
            <div className="relative bg-ivory aspect-square md:aspect-auto overflow-hidden">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
              />
              {selectedProduct.badge && (
                <span className="absolute top-4 left-4 bg-cream/90 backdrop-blur-md text-rose text-xs font-semibold px-3 py-1.5 rounded-full border border-blush/60 tracking-wider uppercase">
                  {selectedProduct.badge}
                </span>
              )}
            </div>

            {/* Content Side */}
            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest text-rose font-medium">
                  {selectedProduct.categoryName}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-brown-dark mt-1 mb-2 font-medium leading-tight">
                  {selectedProduct.name}
                </h3>

                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-2xl font-serif text-rose-dark font-semibold">
                    {formatPrice(selectedProduct.price)}
                  </span>
                  {selectedProduct.originalPrice && (
                    <span className="text-sm text-brown-light line-through font-light">
                      {formatPrice(selectedProduct.originalPrice)}
                    </span>
                  )}
                  <span className="text-xs text-sage-dark bg-sage-light/60 px-2 py-0.5 rounded-full font-medium ml-auto">
                    In Stock • Ready to Craft
                  </span>
                </div>

                <div className="w-full h-[1px] bg-blush/40 my-3" />

                <p className="text-brown/80 text-sm leading-relaxed mb-5">
                  {selectedProduct.description}
                </p>

                {/* Craft specs */}
                <div className="space-y-2 mb-6 text-xs text-brown/70 bg-ivory/70 p-3.5 rounded-2xl border border-blush/30">
                  {selectedProduct.materials && (
                    <div className="flex items-start gap-2">
                      <Feather className="w-4 h-4 text-rose mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-brown-dark font-medium">Materials: </strong>
                        {selectedProduct.materials}
                      </div>
                    </div>
                  )}
                  {selectedProduct.dimensions && (
                    <div className="flex items-start gap-2">
                      <Ruler className="w-4 h-4 text-rose mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-brown-dark font-medium">Size: </strong>
                        {selectedProduct.dimensions}
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-sage-dark mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-brown-dark font-medium">Authenticity: </strong>
                      100% handmade in our atelier with sustainable packaging.
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 rounded-full bg-rose text-white hover:bg-rose-dark font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-delicate"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enquire on WhatsApp</span>
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => toggleWishlist(selectedProduct)}
                    className={`py-2.5 px-4 rounded-full border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                      inWishlist
                        ? 'border-rose bg-rose-light text-rose'
                        : 'border-blush bg-transparent text-brown-dark hover:bg-blush-light'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-rose text-rose' : 'text-brown'}`} />
                    <span>{inWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                  </button>

                  <button
                    onClick={handleCustomVariation}
                    className="py-2.5 px-4 rounded-full border border-blush text-brown-dark hover:bg-blush-light text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-rose" />
                    <span>Custom Color/Size</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
