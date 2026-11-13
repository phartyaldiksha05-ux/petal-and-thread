import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, Heart, Sparkles, MessageCircle, Lock, User, LogOut, Store, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { brandConfig } from '../config/brandConfig';
import { useWishlist } from '../context/WishlistContext';
import { useSiteData } from '../context/SiteDataContext';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './common/AuthModal';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { wishlistCount, setIsWishlistOpen, setIsCustomOrderOpen } = useWishlist();
  const { settings } = useSiteData();
  const {
    user,
    isSeller,
    isActiveSeller,
    isPendingSeller,
    isLoggedIn,
    isLoading,
    logout
  } = useAuth();
  const brandName = settings?.name || brandConfig.brand.name;
  const accountLabel = user?.displayName || user?.name || user?.email || 'Member';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 24) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'glass-nav py-3.5 shadow-soft'
            : 'bg-ivory/80 backdrop-blur-xs py-5 border-b border-blush/30'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-brown-dark hover:bg-blush-light transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex-1 lg:flex-initial text-center lg:text-left">
              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('#home');
                }}
                className="inline-flex flex-col items-center lg:items-start group"
              >
                <div className="flex items-center gap-2">
                  <span className="font-serif text-2xl sm:text-3xl tracking-tight text-brown-dark font-medium group-hover:text-rose transition-colors">
                    {brandName}
                  </span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose transform group-hover:scale-125 transition-transform" />
                </div>
                <span className="hidden sm:inline-block font-cormorant italic text-xs tracking-widest text-brown/70 -mt-0.5">
                  Handcrafted Atelier
                </span>
              </a>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-8">
              {brandConfig.navigation.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }}
                  className="text-xs uppercase tracking-widest text-brown-dark/85 hover:text-rose font-medium transition-colors relative py-1 group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-rose transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Bespoke Order Trigger */}
              <button
                onClick={() => setIsCustomOrderOpen(true)}
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blush-light border border-blush text-rose-dark hover:bg-rose-light text-xs font-medium transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose" />
                <span>Custom Order</span>
              </button>

              {/* Shopping Bag / Wishlist Trigger */}
              <button
                onClick={() => setIsWishlistOpen(true)}
                className="relative p-2.5 rounded-full text-brown-dark hover:bg-blush-light hover:text-rose transition-colors group"
                aria-label="View Saved Treasures"
                title="Saved Treasures"
              >
                <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-105" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-rose text-white text-[10px] font-semibold flex items-center justify-center shadow-xs animate-scale-in">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Seller Portal Status / Studio Link */}
              {!isLoading && isLoggedIn && isActiveSeller && (
                <Link
                  to="/seller/dashboard"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose text-white text-xs font-medium shadow-xs hover:bg-rose-dark transition-all"
                  title="Artisan Studio Dashboard"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Artisan Studio</span>
                </Link>
              )}

              {!isLoading && isLoggedIn && isPendingSeller && (
                <Link
                  to="/seller/dashboard"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium hover:bg-amber-100/80 transition-colors shadow-xs"
                  title="Your artisan application is pending curation approval"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Pending Seller</span>
                </Link>
              )}

              {!isLoading && isLoggedIn && isSeller && !isActiveSeller && !isPendingSeller && (
                <Link
                  to="/seller/dashboard"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ivory border border-blush text-brown-dark text-xs font-medium hover:bg-blush-light transition-colors shadow-xs"
                  title="View Artisan Application Status"
                >
                  <Store className="w-3.5 h-3.5 text-rose" />
                  <span>Seller Status</span>
                </Link>
              )}

              {/* User Account / Loading / Sign In */}
              {isLoading ? (
                <div
                  className="w-24 h-8 rounded-full bg-blush-light/60 border border-blush/40 animate-pulse"
                  aria-label="Checking session"
                />
              ) : isLoggedIn ? (
                <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-cream border border-blush/60 px-2.5 sm:px-3 py-1.5 rounded-full text-xs text-brown-dark shadow-xs">
                  <User className="w-3.5 h-3.5 text-rose flex-shrink-0" />
                  <span className="font-medium max-w-[75px] sm:max-w-[115px] truncate" title={accountLabel}>
                    {accountLabel}
                  </span>
                  <button
                    onClick={logout}
                    className="text-brown-light/80 hover:text-rose transition-colors pl-1 border-l border-blush/50"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cream border border-blush/80 text-brown-dark hover:text-rose hover:border-rose text-xs font-medium transition-colors shadow-xs"
                >
                  <User className="w-3.5 h-3.5 text-rose" />
                  <span>Sign In / Join</span>
                </button>
              )}

              {/* Owner Portal Link */}
              <Link
                to="/admin/login"
                className="p-2 rounded-full text-brown-light/70 hover:text-rose hover:bg-blush-light transition-colors"
                title="Owner Portal / Admin Dashboard"
                aria-label="Owner Portal"
              >
                <Lock className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-30 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-brown-dark/40 backdrop-blur-xs"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
              className="relative w-4/5 max-w-sm h-full bg-cream border-r border-blush/60 shadow-soft-lg flex flex-col justify-between p-6 pt-24"
            >
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-2xl text-brown-dark font-medium">
                    {brandName}
                  </h3>
                  <p className="font-cormorant italic text-sm text-brown/70 mt-1">
                    {brandConfig.brand.taglineShort}
                  </p>
                </div>

                <div className="w-12 h-[1px] bg-rose/40" />

                <nav className="flex flex-col space-y-4">
                  {brandConfig.navigation.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(item.href);
                      }}
                      className="text-base text-brown-dark hover:text-rose font-medium py-1 transition-colors flex items-center justify-between"
                    >
                      <span>{item.label}</span>
                      <span className="text-xs text-rose/70 font-cormorant italic">explore</span>
                    </a>
                  ))}
                </nav>

                {/* Mobile Auth Actions */}
                <div className="pt-2 space-y-2">
                  {isLoading ? (
                    <div className="w-full h-10 rounded-full bg-ivory border border-blush/50 animate-pulse" />
                  ) : isLoggedIn ? (
                    <div className="p-3 rounded-2xl bg-ivory border border-blush/60 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <User className="w-4 h-4 text-rose flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-brown-dark truncate">
                              {accountLabel}
                            </p>
                            {user?.email && user.email !== accountLabel && (
                              <p className="text-[10px] text-brown/60 truncate">{user.email}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            logout();
                            setMobileMenuOpen(false);
                          }}
                          className="text-xs text-rose hover:text-rose-dark font-medium flex-shrink-0"
                        >
                          Sign Out
                        </button>
                      </div>

                      {isActiveSeller && (
                        <Link
                          to="/seller/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                          className="w-full py-2 px-3 rounded-xl bg-rose text-white text-xs font-medium flex items-center justify-center gap-2 shadow-xs hover:bg-rose-dark transition-colors"
                        >
                          <Store className="w-3.5 h-3.5" />
                          <span>Enter Artisan Studio</span>
                        </Link>
                      )}

                      {isPendingSeller && (
                        <Link
                          to="/seller/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                          className="w-full py-2 px-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center justify-center gap-2 hover:bg-amber-100/70 transition-colors"
                        >
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Application Pending Review</span>
                        </Link>
                      )}

                      {isSeller && !isActiveSeller && !isPendingSeller && (
                        <Link
                          to="/seller/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                          className="w-full py-2 px-3 rounded-xl bg-cream border border-blush text-brown-dark text-xs font-medium flex items-center justify-center gap-2 hover:bg-blush-light transition-colors"
                        >
                          <Store className="w-3.5 h-3.5 text-rose" />
                          <span>View Seller Application Status</span>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full py-2.5 px-4 rounded-full bg-cream border border-blush/80 text-brown-dark text-xs font-medium flex items-center justify-center gap-2 shadow-xs"
                    >
                      <User className="w-3.5 h-3.5 text-rose" />
                      <span>Sign In / Join Community</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsCustomOrderOpen(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-full bg-blush-light border border-blush text-rose-dark text-xs font-medium flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-rose" />
                    <span>Request Custom Order</span>
                  </button>
                </div>
              </div>

              {/* Mobile Drawer Footer */}
              <div className="border-t border-blush/40 pt-4 space-y-2">
                <p className="text-xs text-brown/60">
                  Direct WhatsApp studio enquiries:
                </p>
                <a
                  href={`https://wa.me/${brandConfig.contact.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-medium text-rose hover:text-rose-dark"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{brandConfig.contact.whatsappDisplay}</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
