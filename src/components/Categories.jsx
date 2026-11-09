import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { brandConfig } from '../config/brandConfig';
import { useSiteData } from '../context/SiteDataContext';
import { FloralAccent } from './common/FloralAccent';

export function Categories({ activeCategory, onSelectCategory }) {
  const { categories: liveCategories } = useSiteData();
  const categoryList = (liveCategories && liveCategories.length > 0) ? liveCategories : brandConfig.categories;

  const handleCategoryClick = (categoryId) => {
    if (onSelectCategory) {
      onSelectCategory(categoryId);
    }
    const target = categoryId === 'fashion-studio' 
      ? document.querySelector('#fashion-studio')
      : categoryId === 'custom-creations'
      ? document.querySelector('#custom-orders')
      : document.querySelector('#shop');

    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="categories" className="py-20 md:py-28 bg-cream relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-rose text-xs font-medium tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Collections</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-brown-dark font-medium tracking-tight">
            Shop by Category
          </h2>
          <div className="flex justify-center pt-1 pb-2">
            <FloralAccent className="w-20 h-4 text-rose/50" />
          </div>
          <p className="text-sm sm:text-base text-brown/75 font-light leading-relaxed">
            From heirloom crochet blooms to custom tailored dresses, explore our distinct worlds of handmade wonder.
          </p>
        </div>

        {/* 5 Categories Layout: 3 on top row, 2 featured on bottom row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {categoryList.slice(0, 3).map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.12 }}
              onClick={() => handleCategoryClick(category.id)}
              className="group cursor-pointer rounded-3xl overflow-hidden bg-ivory border border-blush/60 shadow-soft hover:shadow-soft-lg transition-all duration-500 flex flex-col justify-between"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover object-center transform group-hover:scale-108 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/45 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                <span className="absolute top-4 left-4 bg-cream/90 backdrop-blur-md text-brown-dark text-[11px] font-medium px-3 py-1 rounded-full border border-blush/50">
                  {category.tag}
                </span>
                <span className="absolute bottom-4 right-4 text-cream/90 text-xs font-cormorant italic">
                  {category.itemCount}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl text-brown-dark font-medium group-hover:text-rose transition-colors flex items-center justify-between">
                    <span>{category.name}</span>
                    <span className="w-8 h-8 rounded-full bg-blush-light text-rose flex items-center justify-center transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </h3>
                  <p className="text-xs sm:text-sm text-brown/75 leading-relaxed mt-2 font-light">
                    {category.shortDescription}
                  </p>
                </div>

                <div className="pt-2 border-t border-blush/30 flex items-center text-xs font-medium text-rose group-hover:text-rose-dark transition-colors">
                  <span>Explore {category.name}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom 2 Featured Categories: Wide Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mt-6 lg:mt-8">
          {categoryList.slice(3, 5).map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.12 }}
              onClick={() => handleCategoryClick(category.id)}
              className="group cursor-pointer rounded-3xl overflow-hidden bg-ivory border border-blush/60 shadow-soft hover:shadow-soft-lg transition-all duration-500 grid grid-cols-1 sm:grid-cols-2 items-stretch"
            >
              <div className="relative aspect-[4/3] sm:aspect-auto sm:h-full overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover object-center transform group-hover:scale-108 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/35 via-transparent to-transparent pointer-events-none" />
                <span className="absolute top-4 left-4 bg-cream/90 backdrop-blur-md text-brown-dark text-[11px] font-medium px-3 py-1 rounded-full border border-blush/50">
                  {category.tag}
                </span>
              </div>

              <div className="p-6 sm:p-7 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-rose font-medium">
                    Atelier Exclusive
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl text-brown-dark font-medium group-hover:text-rose transition-colors mt-1">
                    {category.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-brown/75 leading-relaxed mt-2 font-light">
                    {category.shortDescription}
                  </p>
                </div>

                <div className="pt-3 border-t border-blush/30 flex items-center justify-between">
                  <span className="text-xs font-medium text-rose group-hover:text-rose-dark transition-colors">
                    Explore Collection
                  </span>
                  <span className="w-8 h-8 rounded-full bg-blush-light text-rose flex items-center justify-center transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
