import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, Sparkles, Heart, Feather } from 'lucide-react';
import { brandConfig } from '../config/brandConfig';
import { useSiteData } from '../context/SiteDataContext';
import { FloralAccent } from './common/FloralAccent';

export function Hero() {
  const { settings } = useSiteData();
  const headline = settings?.heroHeadline || brandConfig.hero.headline;
  const description = settings?.heroDescription || brandConfig.hero.description;
  const heroBadge = settings?.heroBadge || brandConfig.hero.badge;
  const heroImage = settings?.heroImage || brandConfig.hero.images.main;

  const scrollTo = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-ivory">
      {/* Delicate background gradient orbs */}
      <div className="absolute top-12 left-1/4 w-96 h-96 bg-blush/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-sage-light/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Editorial Headline & Copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-6 text-center lg:text-left"
          >
            {/* Delicate Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cream/90 border border-blush/70 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-rose" />
              <span className="font-cormorant italic text-sm tracking-wide text-brown-dark">
                {heroBadge}
              </span>
            </div>

            {/* Editorial Headline */}
            <div className="space-y-2">
              <h1 className="font-serif text-4xl sm:text-5xl xl:text-6xl text-brown-dark font-medium leading-[1.12] tracking-tight">
                Little things, made with a{' '}
                <span className="italic font-normal font-cormorant text-rose">
                  lot of love.
                </span>
              </h1>
            </div>

            {/* Floral Accent Divider */}
            <div className="flex justify-center lg:justify-start">
              <FloralAccent className="w-24 h-5 text-rose/50" />
            </div>

            {/* Description */}
            <p className="text-base sm:text-lg text-brown/80 font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
              {description}
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => scrollTo(brandConfig.hero.buttons.primary.href)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-rose text-white hover:bg-rose-dark font-medium text-sm transition-all duration-300 shadow-delicate hover:shadow-soft-lg flex items-center justify-center gap-2 group"
              >
                <span>{brandConfig.hero.buttons.primary.text}</span>
                <ArrowDownRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
              </button>

              <button
                onClick={() => scrollTo(brandConfig.hero.buttons.secondary.href)}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-cream border border-blush/80 text-brown-dark hover:bg-blush-light/60 font-medium text-sm transition-all duration-300"
              >
                <span>{brandConfig.hero.buttons.secondary.text}</span>
              </button>
            </div>

            {/* Atelier Highlights / Trust pillars */}
            <div className="pt-8 border-t border-blush/40 grid grid-cols-3 gap-4 text-center lg:text-left">
              {brandConfig.hero.stats.map((stat, idx) => (
                <div key={idx} className="space-y-0.5">
                  <p className="font-serif text-xl sm:text-2xl text-rose font-medium">
                    {stat.number}
                  </p>
                  <p className="text-[11px] sm:text-xs text-brown/70 font-light uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Editorial Campaign Visual Composition */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Primary Large Editorial Image */}
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-soft-lg border-4 border-cream">
                <img
                  src={heroImage}
                  alt="Petal and Thread Luxury Handmade Fashion & Crochet"
                  className="w-full h-[440px] sm:h-[500px] object-cover object-center transform hover:scale-102 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/35 via-transparent to-transparent pointer-events-none" />
                
                {/* Subtle Image Tag */}
                <div className="absolute bottom-5 left-5 right-5 text-white flex items-center justify-between pointer-events-none">
                  <div>
                    <span className="text-[10px] tracking-widest uppercase font-semibold text-blush">
                      Campaign 01
                    </span>
                    <p className="font-serif text-lg font-medium">
                      The Botanical Atelier
                    </p>
                  </div>
                  <span className="font-cormorant italic text-sm text-cream/90">
                    SS25 Collection
                  </span>
                </div>
              </div>

              {/* Secondary Floating Card: Crochet Flowers */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="absolute -top-6 -right-4 sm:-right-8 z-20 w-36 sm:w-44 bg-cream/95 backdrop-blur-md p-2.5 rounded-2xl shadow-delicate border border-blush/60 hidden sm:block"
              >
                <img
                  src={brandConfig.hero.images.accent1}
                  alt="Crochet Tulips"
                  className="w-full h-24 sm:h-28 object-cover rounded-xl mb-2"
                />
                <div className="flex items-center justify-between text-[11px] px-1">
                  <span className="font-medium text-brown-dark">Everlasting Bloom</span>
                  <Heart className="w-3.5 h-3.5 fill-rose text-rose" />
                </div>
              </motion.div>

              {/* Tertiary Floating Badge: Slow Fashion */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="absolute -bottom-6 -left-4 sm:-left-8 z-20 bg-cream/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-delicate border border-blush/60 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-sage-light flex items-center justify-center text-sage-dark flex-shrink-0">
                  <Feather className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-brown-dark">
                    Bespoke Tailoring
                  </p>
                  <p className="text-[11px] text-brown/70 font-cormorant italic">
                    Stitched to your measurements
                  </p>
                </div>
              </motion.div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
