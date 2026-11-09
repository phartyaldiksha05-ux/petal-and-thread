import React from 'react';
import { motion } from 'framer-motion';
import { Scissors, Sparkles, Ruler, Feather, ArrowRight, MessageCircle } from 'lucide-react';
import { brandConfig } from '../config/brandConfig';
import { useWishlist } from '../context/WishlistContext';
import { FloralAccent } from './common/FloralAccent';

export function FashionStudio() {
  const { setIsCustomOrderOpen } = useWishlist();

  const handleExploreDesigns = () => {
    const el = document.querySelector('#art-gallery');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="fashion-studio" className="py-20 md:py-28 bg-cream relative overflow-hidden">
      {/* Background Accent glow */}
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-blush/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Editorial Top Headline Banner */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ivory border border-blush/80 text-rose text-xs font-medium tracking-widest uppercase shadow-xs">
            <Scissors className="w-3.5 h-3.5" />
            <span>The Slow Fashion Atelier</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-brown-dark font-medium tracking-tight">
            Wear something made{' '}
            <span className="italic font-normal font-cormorant text-rose">
              just for you.
            </span>
          </h2>

          <div className="flex justify-center pt-1 pb-1">
            <FloralAccent className="w-24 h-5 text-rose/50" />
          </div>

          <p className="text-base sm:text-lg text-brown/80 font-light leading-relaxed">
            {brandConfig.fashionStudio.description}
          </p>
        </div>

        {/* Editorial Imagery Collage: High fashion photography + clothing sketches */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
          
          {/* Main Lookbook Photography */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 relative"
          >
            <div className="rounded-3xl overflow-hidden shadow-soft-lg border-4 border-white bg-ivory relative aspect-[4/3] sm:aspect-[16/11]">
              <img
                src={brandConfig.fashionStudio.editorialImages[0].url}
                alt="Slow Fashion Handcrafted Dress"
                className="w-full h-full object-cover object-center transform hover:scale-103 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-blush">
                  Atelier Silhouette No. 12
                </span>
                <p className="font-serif text-xl sm:text-2xl font-medium mt-1">
                  The Scalloped Linen Reverie Dress
                </p>
                <p className="text-xs font-cormorant italic text-cream/80 mt-0.5">
                  Natural unbleached flax • Hand-crocheted picot lace borders
                </p>
              </div>
            </div>
          </motion.div>

          {/* Secondary Sketches & Worktable Column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6"
          >
            {/* Sketchbook Card */}
            <div className="p-5 rounded-3xl bg-ivory border border-blush/60 shadow-soft flex items-center gap-4">
              <img
                src={brandConfig.fashionStudio.editorialImages[1].url}
                alt="Fashion sketches"
                className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-2xl flex-shrink-0"
              />
              <div>
                <span className="text-[10px] font-semibold text-rose uppercase tracking-widest">
                  Sketchbook Study
                </span>
                <h4 className="font-serif text-base text-brown-dark font-medium mt-0.5">
                  Original Hand Illustrations
                </h4>
                <p className="text-xs text-brown/70 mt-1 leading-relaxed">
                  Every silhouette starts with hand-drawn pencil & watercolor concepts.
                </p>
              </div>
            </div>

            {/* Atelier Worktable Card */}
            <div className="p-5 rounded-3xl bg-ivory border border-blush/60 shadow-soft flex items-center gap-4">
              <img
                src={brandConfig.fashionStudio.editorialImages[2].url}
                alt="Atelier fabric draping"
                className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-2xl flex-shrink-0"
              />
              <div>
                <span className="text-[10px] font-semibold text-rose uppercase tracking-widest">
                  Custom Stitching
                </span>
                <h4 className="font-serif text-base text-brown-dark font-medium mt-0.5">
                  Made to Your Measurements
                </h4>
                <p className="text-xs text-brown/70 mt-1 leading-relaxed">
                  Tailored specifically to your height, bust, waist, and personal drape.
                </p>
              </div>
            </div>

            {/* Action Buttons Box */}
            <div className="p-6 rounded-3xl bg-blush-light/50 border border-blush/60 flex flex-col sm:flex-row lg:flex-row gap-3">
              <button
                onClick={() => setIsCustomOrderOpen(true)}
                className="flex-1 py-3 px-5 rounded-full bg-rose text-white hover:bg-rose-dark font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-delicate"
              >
                <Ruler className="w-4 h-4" />
                <span>Request Custom Outfit</span>
              </button>

              <button
                onClick={handleExploreDesigns}
                className="py-3 px-5 rounded-full bg-cream border border-blush/80 text-brown-dark hover:bg-white font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Explore Designs</span>
                <ArrowRight className="w-3.5 h-3.5 text-rose" />
              </button>
            </div>
          </motion.div>

        </div>

        {/* 4-Step Bespoke Process Flow */}
        <div className="pt-8 border-t border-blush/40">
          <div className="text-center mb-10">
            <h3 className="font-serif text-2xl sm:text-3xl text-brown-dark font-medium">
              How Our Custom Tailoring Works
            </h3>
            <p className="text-xs sm:text-sm text-brown/70 mt-1 font-light">
              From first sketch to finished heirloom garment in four thoughtful steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {brandConfig.fashionStudio.steps.map((step, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-ivory/80 border border-blush/50 relative space-y-3 group hover:border-rose/60 transition-colors"
              >
                <span className="font-serif text-3xl sm:text-4xl text-rose/30 font-medium group-hover:text-rose/50 transition-colors">
                  {step.step}
                </span>
                <h4 className="font-serif text-base text-brown-dark font-medium">
                  {step.name}
                </h4>
                <p className="text-xs text-brown/75 leading-relaxed font-light">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
