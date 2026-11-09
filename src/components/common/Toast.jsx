import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, CheckCircle2 } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';

export function Toast() {
  const { toast } = useWishlist();

  return (
    <AnimatePresence>
      {toast.visible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-6 right-6 z-50 max-w-sm pointer-events-none"
        >
          <div className="bg-cream/95 backdrop-blur-md border border-blush/80 px-4 py-3 rounded-2xl shadow-delicate flex items-center gap-3 text-brown-dark">
            <div className="w-8 h-8 rounded-full bg-blush-light flex items-center justify-center flex-shrink-0 text-rose">
              {toast.type === 'love' ? (
                <Heart className="w-4 h-4 fill-rose text-rose" />
              ) : (
                <Sparkles className="w-4 h-4 text-rose" />
              )}
            </div>
            <p className="text-sm font-medium leading-snug">{toast.message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
