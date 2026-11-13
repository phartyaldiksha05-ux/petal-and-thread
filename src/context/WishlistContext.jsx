import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteField,
  serverTimestamp,
  FieldPath
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase.js';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const GUEST_WISHLIST_STORAGE_KEY = 'petal_thread_wishlist';
export const MAX_WISHLIST_ITEMS = 100;

function userWishlistCacheKey(uid) {
  return `petal_thread_wishlist_${uid}`;
}

export function getSafeProductId(rawId) {
  if (rawId === null || rawId === undefined) return '';
  const idStr = String(rawId).trim();
  if (!idStr || idStr.length > 128) return '';
  if (/[\u0000-\u001F\u007F/]/.test(idStr)) return '';
  if (idStr === '__proto__' || idStr === 'constructor' || idStr === 'prototype') return '';
  return idStr;
}

function sanitizeImageUrl(product) {
  const candidate =
    Array.isArray(product?.images) && product.images[0]
      ? product.images[0]
      : (product?.image || '');
  const str = String(candidate).trim();
  if (!str || str.startsWith('data:')) return '';
  return str.slice(0, 1000);
}

export function toCompactWishlistItem(product, fallbackAddedAt) {
  if (!product || typeof product !== 'object') return null;
  const id = getSafeProductId(product.id);
  if (!id) return null;

  const parsedPrice = Number(product.price);
  const price = Number.isFinite(parsedPrice) && parsedPrice >= 0 ? parsedPrice : 0;

  const hasOrig =
    product.originalPrice !== null &&
    product.originalPrice !== undefined &&
    product.originalPrice !== '';
  const parsedOrig = hasOrig ? Number(product.originalPrice) : NaN;
  const originalPrice = Number.isFinite(parsedOrig) && parsedOrig >= 0 ? parsedOrig : null;

  return {
    id,
    name: String(product.name || 'Handcrafted Creation').trim().slice(0, 200) || 'Handcrafted Creation',
    price,
    originalPrice,
    image: sanitizeImageUrl(product),
    categoryName: String(product.categoryName || product.category || 'Handcrafted').trim().slice(0, 100),
    badge: product.badge ? String(product.badge).trim().slice(0, 60) : '',
    description: product.description ? String(product.description).trim().slice(0, 1000) : '',
    materials: product.materials ? String(product.materials).trim().slice(0, 300) : '',
    dimensions: product.dimensions ? String(product.dimensions).trim().slice(0, 150) : '',
    addedAt:
      typeof product.addedAt === 'string' && product.addedAt.trim()
        ? product.addedAt.trim().slice(0, 50)
        : (fallbackAddedAt || new Date().toISOString())
  };
}

export function readStorageArray(key) {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeStorageArray(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
}

export function normalizeItemsMap(rawItemsMap) {
  const cleanMap = {};
  if (!rawItemsMap || typeof rawItemsMap !== 'object' || Array.isArray(rawItemsMap)) {
    return cleanMap;
  }

  for (const [key, rawItem] of Object.entries(rawItemsMap)) {
    if (!rawItem || typeof rawItem !== 'object') continue;
    const itemId = getSafeProductId(rawItem.id || key);
    if (!itemId) continue;
    const compact = toCompactWishlistItem({ ...rawItem, id: itemId });
    if (compact) {
      cleanMap[itemId] = compact;
    }
  }

  return cleanMap;
}

export function buildReconciledMap(baseMap, pendingOps) {
  const reconciled = { ...(baseMap || {}) };
  if (pendingOps) {
    for (const [pid, op] of pendingOps.entries()) {
      if (op.type === 'add' && op.item) {
        reconciled[pid] = op.item;
      } else if (op.type === 'remove') {
        delete reconciled[pid];
      }
    }
  }
  return reconciled;
}

export function mapToSortedWishlistArray(itemsMap) {
  if (!itemsMap || typeof itemsMap !== 'object') return [];
  const items = Object.values(itemsMap);
  items.sort((a, b) => (a.addedAt || '').localeCompare(b.addedAt || ''));
  return items;
}

export function WishlistProvider({ children }) {
  const { firebaseUser, isLoading: authLoading } = useAuth();
  const firebaseUid = firebaseUser?.uid || null;
  const isCloudEnabled = Boolean(firebaseUid && isFirebaseConfigured && db);

  const [wishlist, setWishlist] = useState(() => readStorageArray(GUEST_WISHLIST_STORAGE_KEY));
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCustomOrderOpen, setIsCustomOrderOpen] = useState(false);
  const [customOrderPrefill, setCustomOrderPrefill] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'default' });

  // Concurrency & lifecycle refs
  const activeUidRef = useRef(firebaseUid);
  const prevUidRef = useRef(firebaseUid);
  const wishlistRef = useRef(wishlist);
  const cloudMapRef = useRef({});
  const cloudDocExistsRef = useRef(false);
  const mergedUidRef = useRef(null);
  const toastTimerRef = useRef(null);

  activeUidRef.current = firebaseUid;
  wishlistRef.current = wishlist;

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (message, type = 'default') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ visible: true, message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3200);
  };

  const getActiveStorageKey = (uid = activeUidRef.current) => {
    return uid ? userWishlistCacheKey(uid) : GUEST_WISHLIST_STORAGE_KEY;
  };

  // Synchronize auth state and Firestore listener non-destructively
  useEffect(() => {
    prevUidRef.current = firebaseUid;

    if (authLoading) {
      return;
    }

    if (!firebaseUid) {
      // Switched to Guest / Logged-out mode:
      // Activate guest storage cleanly without touching or wiping previous user's storage
      cloudMapRef.current = {};
      cloudDocExistsRef.current = false;
      const guestList = readStorageArray(GUEST_WISHLIST_STORAGE_KEY);
      wishlistRef.current = guestList;
      setWishlist(guestList);
      return;
    }

    // Authenticated Firebase Customer mode:
    // 1. Load this user's isolated local cache
    let userList = readStorageArray(userWishlistCacheKey(firebaseUid));

    // 2. Non-destructive guest-to-account merge:
    // Merge guest treasures into user's account without wiping the guest storage key
    if (mergedUidRef.current !== firebaseUid) {
      mergedUidRef.current = firebaseUid;
      const guestItems = readStorageArray(GUEST_WISHLIST_STORAGE_KEY);
      if (guestItems.length > 0) {
        const userItemIds = new Set(userList.map(i => i.id));
        const newMerged = [...userList];
        let mergedCount = 0;
        for (const raw of guestItems) {
          const compact = toCompactWishlistItem(raw);
          if (compact && !userItemIds.has(compact.id) && newMerged.length < MAX_WISHLIST_ITEMS) {
            userItemIds.add(compact.id);
            newMerged.push(compact);
            mergedCount++;
          }
        }
        if (mergedCount > 0) {
          userList = newMerged;
          writeStorageArray(userWishlistCacheKey(firebaseUid), userList);
          showToast(`Saved ${mergedCount} ${mergedCount === 1 ? 'treasure' : 'treasures'} to your account.`, 'love');
        }
      }
    }

    wishlistRef.current = userList;
    setWishlist(userList);

    // 3. Best-effort Firestore cloud listener (non-blocking, never wipes local storage)
    if (!isCloudEnabled || !db) {
      return;
    }

    let isMounted = true;
    const wishlistDocRef = doc(db, 'wishlists', firebaseUid);

    const unsubscribe = onSnapshot(
      wishlistDocRef,
      (snapshot) => {
        if (!isMounted || activeUidRef.current !== firebaseUid) return;

        cloudDocExistsRef.current = snapshot.exists();
        if (snapshot.exists()) {
          const serverMap = normalizeItemsMap(snapshot.data()?.items);
          cloudMapRef.current = serverMap;
          const serverList = mapToSortedWishlistArray(serverMap);

          // Reconcile server list with current local wishlist
          const currentLocal = wishlistRef.current;
          const combinedMap = new Map();
          for (const item of serverList) {
            combinedMap.set(item.id, item);
          }
          for (const item of currentLocal) {
            if (!combinedMap.has(item.id)) {
              combinedMap.set(item.id, item);
            }
          }
          const reconciled = mapToSortedWishlistArray(Object.fromEntries(combinedMap));
          wishlistRef.current = reconciled;
          setWishlist(reconciled);
          writeStorageArray(userWishlistCacheKey(firebaseUid), reconciled);
        }
      },
      (err) => {
        if (!isMounted || activeUidRef.current !== firebaseUid) return;
        console.warn('Firestore wishlist sync notice (persisting locally):', err?.code || err?.message);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [firebaseUid, isCloudEnabled, authLoading]);

  const isInWishlist = (productId) => {
    const safeId = getSafeProductId(productId);
    if (!safeId) return false;
    return wishlist.some(item => item.id === safeId);
  };

  const toggleWishlist = (product) => {
    const compact = toCompactWishlistItem(product);
    if (!compact) return;

    const currentList = wishlistRef.current;
    const exists = currentList.some(item => item.id === compact.id);
    const activeKey = getActiveStorageKey();

    if (exists) {
      // Remove item
      const next = currentList.filter(item => item.id !== compact.id);
      wishlistRef.current = next;
      setWishlist(next);
      writeStorageArray(activeKey, next);
      showToast(`Removed "${compact.name}" from your saved treasures.`);

      // Best-effort Firestore background deletion (never reverts local state on error)
      if (isCloudEnabled && firebaseUid && db) {
        const wishlistDocRef = doc(db, 'wishlists', firebaseUid);
        updateDoc(
          wishlistDocRef,
          new FieldPath('items', compact.id),
          deleteField(),
          new FieldPath('updatedAt'),
          serverTimestamp()
        ).catch((err) => {
          console.warn('Firestore cloud delete notice (removed locally):', err?.code || err?.message);
        });
      }
    } else {
      // Add item
      if (currentList.length >= MAX_WISHLIST_ITEMS) {
        showToast(`Wishlist limit reached (${MAX_WISHLIST_ITEMS} items max).`, 'default');
        return;
      }
      const next = [...currentList, compact];
      wishlistRef.current = next;
      setWishlist(next);
      writeStorageArray(activeKey, next);
      showToast(`Saved "${compact.name}" to your wishlist.`, 'love');

      // Best-effort Firestore background addition (never reverts local state on error)
      if (isCloudEnabled && firebaseUid && db) {
        const wishlistDocRef = doc(db, 'wishlists', firebaseUid);
        setDoc(
          wishlistDocRef,
          {
            items: { [compact.id]: compact },
            updatedAt: serverTimestamp()
          },
          { merge: true }
        ).catch((err) => {
          console.warn('Firestore cloud save notice (saved locally):', err?.code || err?.message);
        });
      }
    }
  };

  const removeFromWishlist = (productId) => {
    const safeId = getSafeProductId(productId);
    if (!safeId) return;

    const currentList = wishlistRef.current;
    const targetItem = currentList.find(item => item.id === safeId);
    if (!targetItem) return;

    const activeKey = getActiveStorageKey();
    const next = currentList.filter(item => item.id !== safeId);
    wishlistRef.current = next;
    setWishlist(next);
    writeStorageArray(activeKey, next);

    // Best-effort Firestore background deletion (never reverts local state on error)
    if (isCloudEnabled && firebaseUid && db) {
      const wishlistDocRef = doc(db, 'wishlists', firebaseUid);
      updateDoc(
        wishlistDocRef,
        new FieldPath('items', safeId),
        deleteField(),
        new FieldPath('updatedAt'),
        serverTimestamp()
      ).catch((err) => {
        console.warn('Firestore cloud delete notice (removed locally):', err?.code || err?.message);
      });
    }
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
