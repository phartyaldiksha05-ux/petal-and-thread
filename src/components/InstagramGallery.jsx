import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ArrowUpRight } from 'lucide-react';
import { brandConfig } from '../config/brandConfig';
import { FloralAccent } from './common/FloralAccent';

function InstagramIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

export function InstagramGallery() {
  return (
    <section className="py-20 md:py-28 bg-cream relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-rose text-xs font-medium tracking-widest uppercase">
            <InstagramIcon className="w-3.5 h-3.5" />
            <span>Studio Journal</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl text-brown-dark font-medium tracking-tight">
            {brandConfig.instagram.headline}
          </h2>

          <div className="flex justify-center pt-1 pb-1">
            <FloralAccent className="w-20 h-4 text-rose/50" />
          </div>

          <p className="text-xs sm:text-sm text-brown/75 font-light">
            {brandConfig.instagram.subtitle}
          </p>

          <div className="pt-1">
            <a
              href={brandConfig.contact.social.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-rose hover:text-rose-dark transition-colors tracking-wider"
            >
              <span>Follow {brandConfig.instagram.handle}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* 6 Image Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
          {brandConfig.instagram.posts.map((post, idx) => (
            <motion.a
              key={post.id}
              href={brandConfig.contact.social.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="group relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-ivory shadow-xs border border-blush/40 block"
            >
              <img
                src={post.image}
                alt="Instagram studio post"
                className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-700"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-brown-dark/65 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5 sm:p-4 text-white">
                <div className="flex justify-between items-center">
                  <InstagramIcon className="w-4 h-4 text-blush" />
                  <div className="flex items-center gap-1 text-[11px] text-cream">
                    <Heart className="w-3 h-3 fill-rose text-rose" />
                    <span>{post.likes}</span>
                  </div>
                </div>

                <p className="text-[11px] leading-snug text-cream/95 line-clamp-3 font-light">
                  {post.caption}
                </p>
              </div>
            </motion.a>
          ))}
        </div>

      </div>
    </section>
  );
}
