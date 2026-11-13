import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Store, ArrowLeft } from 'lucide-react';

export function SellerProtectedRoute({ children }) {
  const { isLoggedIn, isSeller, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-rose/30 border-t-rose animate-spin mx-auto" />
          <div className="flex items-center justify-center gap-2 text-rose">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <p className="font-serif text-lg text-brown-dark font-medium">Verifying Artisan Credentials...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  if (!isSeller && role !== 'seller') {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-6 text-brown-dark">
        <div className="max-w-md w-full bg-cream rounded-3xl p-8 border border-blush/60 shadow-soft text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-blush-light border border-blush text-rose mx-auto flex items-center justify-center shadow-xs">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-medium text-brown-dark">Artisan Portal Only</h2>
            <p className="text-xs text-brown/70 mt-2">
              Your account is registered as a customer. To access the Artisan Studio and showcase your handcrafted creations, apply for an Artisan Partner account.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-rose text-white text-xs font-medium hover:bg-rose-dark transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Boutique</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
