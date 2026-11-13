import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Trash2, MessageCircle, ArrowRight, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { brandConfig } from '../../config/brandConfig';
import { formatPrice } from '../../utils/currency';

export function WishlistDrawer() {
  const { wishlist, isWishlistOpen, setIsWishlistOpen, removeFromWishlist, setSelectedProduct } = useWishlist();

  const totalEstimate = wishlist.reduce((acc, item) => acc + (item.price || 0), 0);

  // WhatsApp enquiry for all wishlist items
  const wishlistItemsText = wishlist.map((item, idx) => `${idx + 1}. ${encodeURIComponent(item.name)} (${encodeURIComponent(formatPrice(item.price))})`).join('%0A');
  const whatsappUrl = `https://wa.me/${brandConfig.contact.whatsappNumber}?text=Hi%20Amelia!%20I'm%20interested%20in%20these%20items%20from%20Petal%20%26%20Thread:%0A${wishlistItemsText}%0A%0ACould%20you%20let%20me%20know%20availability%20and%20crafting%20times?`;

  return (
    <AnimatePresence>
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsWishlistOpen(false)}
            className="fixed inset-0 bg-brown-dark/40 backdrop-blur-xs"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-screen max-w-md bg-cream border-l border-blush/60 shadow-soft-lg flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-6 border-b border-blush/40 flex items-center justify-between bg-ivory/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-blush-light flex items-center justify-center text-rose">
                    <Heart className="w-4 h-4 fill-rose" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-medium text-brown-dark">
                      Saved Treasures
                    </h3>
                    <p className="text-xs text-brown/70">
                      {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in your boutique bag
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsWishlistOpen(false)}
                  className="w-9 h-9 rounded-full text-brown-dark/60 hover:text-brown-dark hover:bg-blush-light flex items-center justify-center transition-colors"
                  aria-label="Close drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {wishlist.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <div className="w-16 h-16 rounded-full bg-blush-light/80 text-rose flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="w-7 h-7 stroke-1" />
                    </div>
                    <h4 className="font-serif text-xl text-brown-dark mb-2">
                      Your bag is empty
                    </h4>
                    <p className="text-sm text-brown/70 leading-relaxed max-w-xs mx-auto mb-6">
                      Explore our handcrafted crochet pieces and hair accessories to save your favorites here.
                    </p>
                    <button
                      onClick={() => {
                        setIsWishlistOpen(false);
                        const el = document.getElementById('shop');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-rose text-white text-xs font-medium hover:bg-rose-dark transition-colors shadow-sm"
                    >
                      <span>Explore Collection</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  wishlist.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-3 bg-white/70 border border-blush/40 rounded-2xl hover:border-blush transition-colors"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        onClick={() => {
                          setSelectedProduct(item);
                          setIsWishlistOpen(false);
                        }}
                        className="w-20 h-20 object-cover rounded-xl cursor-pointer hover:opacity-90 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <p className="text-xs text-rose font-medium uppercase tracking-wider">
                            {item.categoryName}
                          </p>
                          <h5
                            onClick={() => {
                              setSelectedProduct(item);
                              setIsWishlistOpen(false);
                            }}
                            className="text-sm font-medium text-brown-dark truncate cursor-pointer hover:text-rose transition-colors"
                          >
                            {item.name}
                          </h5>
                          <p className="text-sm font-serif font-semibold text-rose-dark mt-0.5">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={() => {
                              setSelectedProduct(item);
                              setIsWishlistOpen(false);
                            }}
                            className="text-xs text-brown hover:text-rose underline underline-offset-2"
                          >
                            View details
                          </button>
                          <button
                            onClick={() => removeFromWishlist(item.id)}
                            className="text-xs text-brown-light hover:text-rose flex items-center gap-1 transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer CTA */}
              {wishlist.length > 0 && (
                <div className="p-6 border-t border-blush/40 bg-ivory/60 space-y-3">
                  <div className="flex justify-between items-baseline text-sm">
                    <span className="text-brown/80">Estimated Total:</span>
                    <span className="font-serif text-xl font-bold text-brown-dark">
                      {formatPrice(totalEstimate)}
                    </span>
                  </div>
                  <p className="text-[11px] text-brown-light leading-normal">
                    Items are handcrafted on order. Enquire to confirm current crafting times and custom options.
                  </p>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-full bg-rose text-white hover:bg-rose-dark font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-delicate"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Enquire All on WhatsApp</span>
                  </a>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
