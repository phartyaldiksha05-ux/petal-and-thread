import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Sparkles, Clock, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { brandConfig } from '../config/brandConfig';
import { useWishlist } from '../context/WishlistContext';
import { FloralAccent } from './common/FloralAccent';

export function CustomOrders() {
  const { openCustomOrderWithPrefill } = useWishlist();

  const handleCustomCardClick = (title) => {
    openCustomOrderWithPrefill(`I'd love to request a bespoke creation for: ${title}`);
  };

  const whatsappGeneralUrl = `https://wa.me/${brandConfig.contact.whatsappNumber}?text=${encodeURIComponent(
    brandConfig.customOrders.whatsappPrompt
  )}`;

  return (
    <section id="custom-orders" className="py-20 md:py-28 bg-ivory relative overflow-hidden">
      {/* Background Decorative Circles */}
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-blush/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-80 h-80 bg-sage-light/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-rose text-xs font-medium tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bespoke Commissions</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-brown-dark font-medium tracking-tight">
            {brandConfig.customOrders.headline}
          </h2>

          <div className="flex justify-center pt-1 pb-2">
            <FloralAccent className="w-24 h-5 text-rose/50" />
          </div>

          <p className="text-sm sm:text-base text-brown/75 font-light leading-relaxed">
            {brandConfig.customOrders.description}
          </p>
        </div>

        {/* 3 Custom Creation Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-14">
          {brandConfig.customOrders.options.map((option, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              onClick={() => handleCustomCardClick(option.title)}
              className="p-8 rounded-3xl bg-cream border border-blush/60 shadow-soft hover:shadow-soft-lg hover:border-rose/50 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blush-light text-rose flex items-center justify-center group-hover:scale-105 transition-transform">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl text-brown-dark font-medium group-hover:text-rose transition-colors">
                  {option.title}
                </h3>
                <p className="text-xs sm:text-sm text-brown/75 leading-relaxed font-light">
                  {option.desc}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-blush/40 flex items-center justify-between text-xs font-medium text-rose group-hover:text-rose-dark transition-colors">
                <span>Start this commission</span>
                <span className="w-6 h-6 rounded-full bg-ivory flex items-center justify-center text-brown-dark group-hover:bg-rose group-hover:text-white transition-colors">
                  →
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Prominent Action Banner for WhatsApp Enquiries */}
        <div className="rounded-3xl bg-cream border border-blush/80 shadow-soft-lg p-8 sm:p-12 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-3 text-center lg:text-left">
              <span className="text-xs uppercase tracking-widest text-rose font-medium">
                Personalized Atelier Service
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-brown-dark font-medium">
                Chat Directly with Our Artisan on WhatsApp
              </h3>
              <p className="text-xs sm:text-sm text-brown/75 font-light max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Send us your color palette, inspiration photos, or gift deadlines. We'll share yarn swatches, discuss timelines, and craft a one-of-a-kind piece.
              </p>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs text-brown/70">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-rose" />
                  <span>{brandConfig.customOrders.estimatedTurnaround}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sage-dark" />
                  <span>Handmade gift packaging included</span>
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-3">
              <a
                href={whatsappGeneralUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-full bg-rose text-white hover:bg-rose-dark font-medium text-sm flex items-center justify-center gap-2.5 transition-all shadow-delicate hover:shadow-soft-lg"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Enquire via WhatsApp</span>
              </a>

              <button
                onClick={() => openCustomOrderWithPrefill()}
                className="w-full py-3.5 px-6 rounded-full bg-ivory border border-blush text-brown-dark hover:bg-blush-light text-xs font-medium transition-colors"
              >
                Fill Custom Order Form
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
