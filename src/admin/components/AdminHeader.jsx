import React from 'react';
import { Menu, ExternalLink, Bell, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function AdminHeader({ onOpenMobile, title, subtitle }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 bg-cream/90 backdrop-blur-md border-b border-blush/60 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-brown-dark hover:bg-blush-light transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="font-serif text-xl sm:text-2xl text-brown-dark font-medium leading-tight">
            {title || 'Atelier Dashboard'}
          </h1>
          {subtitle && (
            <p className="text-xs text-brown/70 font-light hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ivory border border-blush/60 text-xs font-medium text-brown-dark hover:bg-blush-light transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-rose" />
          <span>Live Storefront</span>
          <ExternalLink className="w-3 h-3 text-brown-light" />
        </a>

        <div className="flex items-center gap-2 pl-2 border-l border-blush/40">
          <div className="w-8 h-8 rounded-full bg-rose-light border border-rose/30 flex items-center justify-center text-rose font-serif font-medium text-sm">
            {user?.name ? user.name[0] : 'A'}
          </div>
          <span className="text-xs font-medium text-brown-dark hidden sm:inline">
            {user?.name || 'Amelia'}
          </span>
        </div>
      </div>
    </header>
  );
}
