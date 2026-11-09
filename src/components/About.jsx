import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Feather, Flower2 } from 'lucide-react';
import { brandConfig } from '../config/brandConfig';
import { FloralAccent } from './common/FloralAccent';

export function About() {
  return (
    <section id="our-story" className="py-20 md:py-28 bg-cream relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Creator Atelier Photography with Delicate Frame */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer decorative dashed frame */}
              <div className="absolute -inset-3 sm:-inset-4 border border-dashed border-rose/40 rounded-[2.5rem] pointer-events-none" />

              <div className="rounded-3xl overflow-hidden shadow-soft-lg bg-ivory border-4 border-white aspect-[4/5]">
                <img
                  src={brandConfig.meetCreator.image}
                  alt="Petal and Thread Creator Atelier Studio"
                  className="w-full h-full object-cover object-center transform hover:scale-104 transition-transform duration-700"
                />
              </div>

              {/* Floating Quote Stamp */}
              <div className="absolute -bottom-6 -right-3 sm:-right-6 bg-cream/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-delicate border border-blush/70 max-w-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Flower2 className="w-3.5 h-3.5 text-rose" />
                  <span className="text-[10px] tracking-wider uppercase font-semibold text-rose">
                    Artisan Note
                  </span>
                </div>
                <p className="font-cormorant italic text-xs sm:text-sm text-brown-dark leading-snug">
                  "Every petal and loop holds a quiet moment of care."
                </p>
              </div>

            </div>
          </motion.div>

          {/* Right Column: Narrative Story & Creator Philosophy */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-1.5 text-rose text-xs font-medium tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Meet the Creator</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-brown-dark font-medium tracking-tight">
              {brandConfig.meetCreator.headline}
            </h2>

            <div className="flex justify-center lg:justify-start">
              <FloralAccent className="w-24 h-5 text-rose/50" />
            </div>

            <div className="space-y-4 text-sm sm:text-base text-brown/80 font-light leading-relaxed">
              {brandConfig.meetCreator.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {/* Featured Quote Callout */}
            <blockquote className="p-5 sm:p-6 rounded-2xl bg-ivory border-l-2 border-rose italic font-cormorant text-base sm:text-lg text-brown-dark/90 leading-relaxed shadow-xs">
              "{brandConfig.meetCreator.quote}"
              <footer className="text-xs text-rose font-sans font-medium uppercase tracking-wider not-italic mt-2 block">
                — {brandConfig.brand.creator.name}, {brandConfig.brand.creator.role}
              </footer>
            </blockquote>

            {/* Craft Stats / Pillars */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-blush/40">
              {brandConfig.meetCreator.stats.map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="font-serif text-2xl sm:text-3xl text-rose font-medium block">
                    {stat.value}
                  </span>
                  <span className="text-[11px] sm:text-xs text-brown/70 font-light block">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
}
