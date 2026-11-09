import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, MessageCircle, Send, Check } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useSiteData } from '../../context/SiteDataContext';
import { brandConfig } from '../../config/brandConfig';

export function CustomOrderModal() {
  const { isCustomOrderOpen, setIsCustomOrderOpen, customOrderPrefill, showToast } = useWishlist();
  const { submitCustomEnquiry } = useSiteData();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Crochet Bouquet / Florals',
    details: '',
    deadline: '',
    colorPalette: ''
  });

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (customOrderPrefill) {
      setFormData(prev => ({ ...prev, details: customOrderPrefill }));
    }
  }, [customOrderPrefill]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsCustomOrderOpen(false);
    };
    if (isCustomOrderOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCustomOrderOpen, setIsCustomOrderOpen]);

  if (!isCustomOrderOpen) return null;

  // Generate WhatsApp message from form
  const getWhatsAppMessage = () => {
    const nameStr = formData.name ? `Name: ${formData.name}%0A` : '';
    const catStr = `Interest: ${formData.category}%0A`;
    const colorStr = formData.colorPalette ? `Preferred Colors: ${formData.colorPalette}%0A` : '';
    const deadlineStr = formData.deadline ? `Target Date: ${formData.deadline}%0A` : '';
    const detailsStr = formData.details ? `Details: ${formData.details}` : 'Looking to design a custom piece!';

    const text = `Hi Amelia! I'd like to request a bespoke order from ${brandConfig.brand.name}:%0A%0A${nameStr}${catStr}${colorStr}${deadlineStr}${detailsStr}`;
    return `https://wa.me/${brandConfig.contact.whatsappNumber}?text=${text}`;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    try {
      await submitCustomEnquiry({
        customerName: formData.name,
        creationType: formData.category,
        colorPalette: formData.colorPalette,
        deadline: formData.deadline,
        details: formData.details
      });
    } catch (err) {
      console.warn('Backend notification notice:', err.message);
    }
    showToast("Thank you! Your custom request has been received. Amelia will reply shortly.");
    setTimeout(() => {
      setSubmitted(false);
      setIsCustomOrderOpen(false);
    }, 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCustomOrderOpen(false)}
          className="fixed inset-0 bg-brown-dark/50 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-xl bg-cream rounded-3xl shadow-soft-lg border border-blush/60 overflow-hidden z-10 p-6 sm:p-8 my-8"
        >
          <button
            onClick={() => setIsCustomOrderOpen(false)}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-ivory text-brown-dark/70 hover:text-brown-dark hover:bg-blush-light transition-all flex items-center justify-center border border-blush/40"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-rose mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest font-medium">Bespoke Atelier</span>
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl text-brown-dark font-medium mb-2">
            Request a Custom Creation
          </h3>
          <p className="text-xs sm:text-sm text-brown/75 mb-6">
            Tell us about your dream piece. We handcraft personalized bouquets, custom keychains, bridal accessories, and made-to-measure clothing.
          </p>

          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 bg-sage-light text-sage-dark rounded-full flex items-center justify-center mx-auto">
                <Check className="w-7 h-7" />
              </div>
              <h4 className="font-serif text-xl text-brown-dark">Request Sent Beautifully!</h4>
              <p className="text-sm text-brown/70 max-w-xs mx-auto">
                We'll review your details and reach out within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-brown-dark mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Clara Evans"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-blush/60 text-sm text-brown-dark focus:outline-none focus:border-rose transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-brown-dark mb-1.5">
                    Creation Type
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-blush/60 text-sm text-brown-dark focus:outline-none focus:border-rose transition-colors"
                  >
                    <option>Crochet Bouquet / Florals</option>
                    <option>Custom Keychain / Charm</option>
                    <option>Hair Clip / Bridal Accessory</option>
                    <option>Made-to-Measure Garment</option>
                    <option>Fashion Illustration / Art Print</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-brown-dark mb-1.5">
                    Preferred Color Palette
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dusty rose, sage & cream"
                    value={formData.colorPalette}
                    onChange={(e) => setFormData({ ...formData, colorPalette: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-blush/60 text-sm text-brown-dark focus:outline-none focus:border-rose transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-brown-dark mb-1.5">
                    Target Date / Occasion
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. June 15th (Birthday gift)"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-blush/60 text-sm text-brown-dark focus:outline-none focus:border-rose transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-brown-dark mb-1.5">
                  Describe Your Vision
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share details such as flowers you love, ribbon preferences, sizing, or any inspirations..."
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-blush/60 text-sm text-brown-dark focus:outline-none focus:border-rose transition-colors resize-none"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href={getWhatsAppMessage()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-full bg-rose text-white hover:bg-rose-dark font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-delicate"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send via WhatsApp</span>
                </a>

                <button
                  type="submit"
                  className="py-3 px-6 rounded-full border border-blush bg-cream text-brown-dark hover:bg-blush-light font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Send className="w-4 h-4 text-rose" />
                  <span>Submit Note</span>
                </button>
              </div>

              <p className="text-[11px] text-center text-brown-light pt-1">
                We craft in small batches. Please allow 10–21 business days for custom creations.
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
