import React from 'react';
import { Mail, Phone, MapPin, Clock, MessageCircle, Heart, ArrowUp, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { brandConfig } from '../config/brandConfig';
import { useSiteData } from '../context/SiteDataContext';
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

export function Footer({ onCategoryClick }) {
  const { settings, categories: liveCats } = useSiteData();
  const brandName = settings?.name || brandConfig.brand.name;
  const brandTagline = settings?.tagline || brandConfig.brand.tagline;
  const brandDesc = settings?.description || brandConfig.brand.description;
  const whatsappNum = settings?.whatsappNumber || brandConfig.contact.whatsappNumber;
  const whatsappDisp = settings?.whatsappDisplay || brandConfig.contact.whatsappDisplay;
  const contactEmail = settings?.contactEmail || brandConfig.contact.email;
  const categoriesList = (liveCats && liveCats.length > 0) ? liveCats : brandConfig.categories;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (href) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="bg-ivory border-t border-blush/60 pt-16 pb-12 text-brown-dark relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-blush/40">
          
          {/* Brand Info & Mission (Col 1-4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl sm:text-3xl text-brown-dark font-medium">
                {brandName}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose" />
            </div>

            <p className="font-cormorant italic text-sm text-brown/70">
              {brandTagline}
            </p>

            <FloralAccent className="w-20 h-4 text-rose/50" />

            <p className="text-xs sm:text-sm text-brown/80 font-light leading-relaxed max-w-sm">
              {brandDesc}
            </p>

            {/* Social Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={brandConfig.contact.social.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-cream border border-blush/60 text-brown hover:text-rose hover:bg-blush-light flex items-center justify-center transition-colors shadow-2xs"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>

              <a
                href={`https://wa.me/${brandConfig.contact.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-cream border border-blush/60 text-brown hover:text-rose hover:bg-blush-light flex items-center justify-center transition-colors shadow-2xs"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>

              <a
                href={brandConfig.contact.social.pinterest.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-cream border border-blush/60 text-brown hover:text-rose hover:bg-blush-light flex items-center justify-center transition-colors shadow-2xs"
                aria-label="Pinterest"
              >
                <Heart className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Navigation Links (Col 5-6) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-rose">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {brandConfig.navigation.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(item.href);
                    }}
                    className="text-brown/80 hover:text-rose transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#custom-orders"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick('#custom-orders');
                  }}
                  className="text-brown/80 hover:text-rose transition-colors"
                >
                  Custom Orders
                </a>
              </li>
            </ul>
          </div>

          {/* Shop Categories (Col 7-9) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-rose">
              Shop Categories
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {categoriesList.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      if (onCategoryClick) onCategoryClick(cat.id);
                      handleNavClick('#shop');
                    }}
                    className="text-brown/80 hover:text-rose transition-colors text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Studio Contact Info Placeholders (Col 10-12) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-rose">
              Atelier & Contact
            </h4>
            <div className="space-y-2.5 text-xs sm:text-sm text-brown/80 font-light">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose mt-0.5 flex-shrink-0" />
                <span>
                  {brandConfig.contact.address.line1}, {brandConfig.contact.address.city}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-rose flex-shrink-0" />
                <a
                  href={`mailto:${contactEmail}`}
                  className="hover:text-rose transition-colors"
                >
                  {contactEmail}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-rose flex-shrink-0" />
                <a
                  href={`tel:${brandConfig.contact.phone}`}
                  className="hover:text-rose transition-colors"
                >
                  {brandConfig.contact.phone}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-rose flex-shrink-0" />
                <a
                  href={`https://wa.me/${whatsappNum}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-rose transition-colors"
                >
                  WhatsApp: {whatsappDisp}
                </a>
              </div>

              <div className="flex items-start gap-2.5 text-brown/70 pt-1">
                <Clock className="w-4 h-4 text-rose mt-0.5 flex-shrink-0" />
                <span>{brandConfig.contact.hours}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brown/70">
          <div className="flex items-center gap-2">
            <p>
              © {new Date().getFullYear()} {brandName}. All rights reserved. Handcrafted with love.
            </p>
            <span>•</span>
            <Link
              to="/admin/login"
              className="text-brown-light hover:text-rose transition-colors flex items-center gap-1 font-medium"
            >
              <Lock className="w-3 h-3" />
              <span>Owner Portal</span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <span className="font-cormorant italic text-sm text-rose">
              Designed for slow living & thoughtful beauty
            </span>

            <button
              onClick={scrollToTop}
              className="w-8 h-8 rounded-full bg-cream border border-blush/60 text-brown hover:text-rose hover:bg-blush-light flex items-center justify-center transition-colors"
              aria-label="Scroll to top"
              title="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
