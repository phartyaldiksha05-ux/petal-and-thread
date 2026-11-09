import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('petal_thread_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCustomOrderOpen, setIsCustomOrderOpen] = useState(false);
  const [customOrderPrefill, setCustomOrderPrefill] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'default' });

  useEffect(() => {
    try {
      localStorage.setItem('petal_thread_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [wishlist]);

  const showToast = (message, type = 'default') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3200);
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      setWishlist(prev => prev.filter(item => item.id !== product.id));
      showToast(`Removed "${product.name}" from your saved treasures.`);
    } else {
      setWishlist(prev => [...prev, product]);
      showToast(`Saved "${product.name}" to your wishlist.`, 'love');
    }
  };

  const removeFromWishlist = (productId) => {
    setWishlist(prev => prev.filter(item => item.id !== productId));
  };

  const openCustomOrderWithPrefill = (prefillText = '') => {
    setCustomOrderPrefill(prefillText);
    setIsCustomOrderOpen(true);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        isWishlistOpen,
        setIsWishlistOpen,
        selectedProduct,
        setSelectedProduct,
        isCustomOrderOpen,
        setIsCustomOrderOpen,
        customOrderPrefill,
        openCustomOrderWithPrefill,
        toast,
        showToast
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
