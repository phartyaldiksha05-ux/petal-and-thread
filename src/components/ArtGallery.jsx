import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Maximize2, X, MessageCircle, Sparkles } from 'lucide-react';
import { brandConfig } from '../config/brandConfig';
import { useSiteData } from '../context/SiteDataContext';
import { FloralAccent } from './common/FloralAccent';

export function ArtGallery() {
  const { artGallery: liveArt } = useSiteData();
  const artworkList = (liveArt && liveArt.length > 0) ? liveArt : brandConfig.artGallery.artworks;
  const [activeArtwork, setActiveArtwork] = useState(null);

  return (
    <section id="art-gallery" className="py-20 md:py-28 bg-ivory relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-rose text-xs font-medium tracking-widest uppercase">
            <Palette className="w-3.5 h-3.5" />
            <span>Artist Portfolio</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-brown-dark font-medium tracking-tight">
            Art Gallery & Illustrations
          </h2>
          <div className="flex justify-center pt-1 pb-2">
            <FloralAccent className="w-20 h-4 text-rose/50" />
          </div>
          <p className="text-sm sm:text-base text-brown/75 font-light leading-relaxed">
            {brandConfig.artGallery.intro}
          </p>
        </div>

        {/* Asymmetrical Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Card 1: Large Featured Artwork (7 cols) */}
          {artworkList[0] && (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-7 group cursor-pointer relative rounded-3xl overflow-hidden bg-cream border border-blush/60 shadow-soft"
              onClick={() => setActiveArtwork(artworkList[0])}
            >
              <div className="aspect-[4/3] sm:aspect-[16/12] overflow-hidden">
                <img
                  src={artworkList[0].image}
                  alt={artworkList[0].title}
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/70 via-brown-dark/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                
                <div className="absolute bottom-6 left-6 right-6 text-white flex items-end justify-between">
                  <div>
                    <span className="text-[10px] tracking-widest uppercase text-blush font-medium">
                      {artworkList[0].medium || artworkList[0].category}
                    </span>
                    <h3 className="font-serif text-2xl font-medium mt-1">
                      {artworkList[0].title}
                    </h3>
                    <p className="text-xs font-cormorant italic text-cream/90 mt-0.5">
                      {artworkList[0].dimensions} • {artworkList[0].year}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-cream/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-rose transition-colors">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Card 2: Vertical Portrait Artwork (5 cols) */}
          {artworkList[1] && (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="md:col-span-5 group cursor-pointer relative rounded-3xl overflow-hidden bg-cream border border-blush/60 shadow-soft"
              onClick={() => setActiveArtwork(artworkList[1])}
            >
              <div className="aspect-[4/3] md:aspect-[4/5] overflow-hidden">
                <img
                  src={artworkList[1].image}
                  alt={artworkList[1].title}
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/70 via-brown-dark/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                
                <div className="absolute bottom-6 left-6 right-6 text-white flex items-end justify-between">
                  <div>
                    <span className="text-[10px] tracking-widest uppercase text-blush font-medium">
                      {artworkList[1].medium || artworkList[1].category}
                    </span>
                    <h3 className="font-serif text-xl font-medium mt-1">
                      {artworkList[1].title}
                    </h3>
                    <p className="text-xs font-cormorant italic text-cream/90 mt-0.5">
                      {artworkList[1].dimensions}
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-cream/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-rose transition-colors">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Bottom 3 Asymmetrical Cards */}
          {artworkList.slice(2, 5).map((art, idx) => (
            <motion.div
              key={art.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="md:col-span-4 group cursor-pointer relative rounded-3xl overflow-hidden bg-cream border border-blush/60 shadow-soft"
              onClick={() => setActiveArtwork(art)}
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={art.image}
                  alt={art.title}
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/70 via-transparent to-transparent opacity-75 group-hover:opacity-90 transition-opacity" />
                
                <div className="absolute bottom-5 left-5 right-5 text-white flex items-end justify-between">
                  <div>
                    <span className="text-[9px] tracking-widest uppercase text-blush font-medium">
                      {art.medium}
                    </span>
                    <h4 className="font-serif text-lg font-medium mt-0.5">
                      {art.title}
                    </h4>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-cream/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-rose transition-colors">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

        </div>

        {/* Commission an Illustration Banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-cream border border-blush/70 shadow-soft text-center max-w-2xl mx-auto space-y-3">
          <Sparkles className="w-5 h-5 text-rose mx-auto" />
          <h4 className="font-serif text-xl sm:text-2xl text-brown-dark font-medium">
            Custom Fashion Illustrations & Wedding Keepsakes
          </h4>
          <p className="text-xs sm:text-sm text-brown/75 font-light leading-relaxed">
            Commemorate your wedding gown, custom heirloom bouquet, or personal styling with an original watercolor and gouache study.
          </p>
          <div className="pt-2">
            <a
              href={`https://wa.me/${brandConfig.contact.whatsappNumber}?text=Hi%20Amelia!%20I'd%20love%20to%20enquire%20about%20a%20custom%20fashion%20illustration%20from%20Petal%20%26%20Thread.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-rose text-white hover:bg-rose-dark text-xs sm:text-sm font-medium transition-colors shadow-delicate"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enquire for Art Commissions</span>
            </a>
          </div>
        </div>

      </div>

      {/* Artwork Lightbox Modal */}
      <AnimatePresence>
        {activeArtwork && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveArtwork(null)}
              className="fixed inset-0 bg-brown-dark/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-3xl w-full bg-cream rounded-3xl shadow-soft-lg border border-blush/70 overflow-hidden z-10"
            >
              <button
                onClick={() => setActiveArtwork(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-cream/90 text-brown-dark hover:bg-blush-light flex items-center justify-center border border-blush/40"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="bg-ivory aspect-square md:aspect-auto">
                  <img
                    src={activeArtwork.image}
                    alt={activeArtwork.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-rose font-medium">
                      {activeArtwork.medium}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl text-brown-dark font-medium mt-1 mb-2">
                      {activeArtwork.title}
                    </h3>
                    <p className="text-xs text-brown/70 font-cormorant italic mb-4">
                      {activeArtwork.dimensions} • {activeArtwork.year}
                    </p>
                    <div className="w-full h-[1px] bg-blush/40 my-3" />
                    <p className="text-sm text-brown/80 leading-relaxed font-light mb-6">
                      {activeArtwork.note}
                    </p>
                  </div>

                  <a
                    href={`https://wa.me/${brandConfig.contact.whatsappNumber}?text=Hi%20Amelia!%20I'm%20interested%20in%20an%20art%20print%20of%20"${encodeURIComponent(activeArtwork.title)}"%20from%20Petal%20%26%20Thread.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-full bg-rose text-white hover:bg-rose-dark text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-delicate"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Enquire About Archival Prints</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
