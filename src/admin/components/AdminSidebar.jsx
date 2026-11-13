import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Grid,
  Scissors,
  Palette,
  Package,
  MessageSquareQuote,
  Boxes,
  SlidersHorizontal,
  ExternalLink,
  LogOut,
  Sparkles,
  Store,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSiteData } from '../../context/SiteDataContext';

export function AdminSidebar({ mobileOpen, onCloseMobile }) {
  const { logout, user } = useAuth();
  const { settings } = useSiteData();

  const navItems = [
    { name: 'Overview', to: '/admin/overview', icon: LayoutDashboard },
    { name: 'Products & Curation', to: '/admin/products', icon: ShoppingBag },
    { name: 'Artisan Partners', to: '/admin/sellers', icon: Store },
    { name: 'Categories', to: '/admin/categories', icon: Grid },
    { name: 'Fashion Portfolio', to: '/admin/fashion', icon: Scissors },
    { name: 'Art Gallery', to: '/admin/art-gallery', icon: Palette },
    { name: 'Orders', to: '/admin/orders', icon: Package },
    { name: 'Custom Enquiries', to: '/admin/enquiries', icon: MessageSquareQuote },
    { name: 'Inventory', to: '/admin/inventory', icon: Boxes },
    { name: 'Website Settings', to: '/admin/settings', icon: SlidersHorizontal }
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-cream border-r border-blush/60 p-5 text-brown-dark">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-6 mb-4 border-b border-blush/40">
          <Link to="/admin/overview" className="block group">
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl sm:text-2xl text-brown-dark font-medium group-hover:text-rose transition-colors">
                {settings.name || 'Petal & Thread'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose" />
            </div>
            <p className="font-cormorant italic text-xs text-rose tracking-wider mt-0.5">
              Owner Atelier Portal
            </p>
          </Link>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-full hover:bg-blush-light text-brown"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-rose text-white shadow-delicate'
                      : 'text-brown-dark/80 hover:bg-blush-light/60 hover:text-rose'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Actions */}
      <div className="pt-6 border-t border-blush/40 space-y-3">
        {/* Public Storefront Link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-ivory border border-blush/60 text-xs font-medium text-brown-dark hover:bg-blush-light/50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-rose" />
            <span>View Public Boutique</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-brown/60" />
        </a>

        {/* Current Admin User card */}
        <div className="flex items-center justify-between px-2 py-1">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-semibold text-brown-dark truncate">
              {user?.name || user?.username || 'Atelier Owner'}
            </p>
            <p className="text-[10px] text-brown/60 truncate">
              {user?.email || 'owner@petalandthread.com'}
            </p>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-xl text-brown-light hover:text-rose hover:bg-rose-light/50 transition-colors"
            title="Log out from dashboard"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 flex-shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-brown-dark/50 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-xs h-full z-10 shadow-soft-lg">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
