import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { auth, db, isFirebaseConfigured } from '../config/firebase.js';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

function toFirebaseUserSnapshot(fbUser) {
  if (!fbUser) return null;
  return {
    uid: fbUser.uid,
    email: fbUser.email || '',
    displayName: fbUser.displayName || null,
    emailVerified: Boolean(fbUser.emailVerified)
  };
}

export function AuthProvider({ children }) {
  const [legacyToken, setLegacyToken] = useState(() => localStorage.getItem('petal_thread_admin_token') || null);
  // Do not trust unverified localStorage user cache as proof of authentication
  const [legacyUser, setLegacyUser] = useState(null);

  const [firebaseUser, setFirebaseUser] = useState(null);
  const [firebaseClaims, setFirebaseClaims] = useState({});
  const [sellerProfile, setSellerProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isRegisteringSellerRef = useRef(false);

  const loadSellerProfile = async (uid, claims = {}) => {
    if (!uid || claims.admin === true) {
      return null;
    }

    try {
      const profileData = await api.sellers.getMyProfile();
      return profileData?.seller || null;
    } catch (err) {
      // Only fall back to direct Firestore owner read if backend Admin SDK is unavailable (503)
      if (err?.status === 503 && isFirebaseConfigured && db) {
        try {
          const docSnap = await getDoc(doc(db, 'seller_profiles', uid));
          if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
          }
        } catch {
          // Ignore Firestore permission or offline error; fail closed (null)
        }
      }
      return null;
    }
  };

  // Synchronize both Legacy JWT verification and single Firebase Auth listener on mount
  useEffect(() => {
    let unsubscribe = () => {};
    let isMounted = true;
    let legacyDone = false;
    let firebaseDone = false;

    const checkFinish = () => {
      if (isMounted && legacyDone && firebaseDone) {
        setIsLoading(false);
      }
    };

    // 1. Verify legacy admin JWT token explicitly with server (never trust localStorage blindly)
    const savedToken = localStorage.getItem('petal_thread_admin_token');
    if (!savedToken) {
      if (isMounted) {
        setLegacyToken(null);
        setLegacyUser(null);
      }
      legacyDone = true;
      checkFinish();
    } else {
      api.auth.me(savedToken)
        .then((data) => {
          if (isMounted && data?.user) {
            setLegacyUser(data.user);
            setLegacyToken(savedToken);
            localStorage.setItem('petal_thread_admin_user', JSON.stringify(data.user));
          } else if (isMounted) {
            localStorage.removeItem('petal_thread_admin_token');
            localStorage.removeItem('petal_thread_admin_user');
            setLegacyToken(null);
            setLegacyUser(null);
          }
        })
        .catch((err) => {
          console.warn('Legacy admin session expired or invalid:', err.message);
          if (isMounted) {
            localStorage.removeItem('petal_thread_admin_token');
            localStorage.removeItem('petal_thread_admin_user');
            setLegacyToken(null);
            setLegacyUser(null);
          }
        })
        .finally(() => {
          legacyDone = true;
          checkFinish();
        });
    }

    // 2. Register authoritative Firebase onAuthStateChanged listener once per provider lifecycle
    if (isFirebaseConfigured && auth) {
      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (!isMounted) return;

        if (fbUser) {
          let claims = {};
          try {
            const tokenResult = await fbUser.getIdTokenResult();
            claims = tokenResult.claims || {};
          } catch (err) {
            console.warn('Failed to retrieve Firebase ID token claims:', err);
          }

          if (!isMounted) return;

          setFirebaseUser(toFirebaseUserSnapshot(fbUser));
          setFirebaseClaims(claims);

          if (!isRegisteringSellerRef.current && claims.admin !== true) {
            const loadedProfile = await loadSellerProfile(fbUser.uid, claims);
            if (isMounted && !isRegisteringSellerRef.current) {
              setSellerProfile(loadedProfile);
            }
          }
        } else {
          if (isMounted) {
            setFirebaseUser(null);
            setFirebaseClaims({});
            setSellerProfile(null);
          }
        }

        firebaseDone = true;
        checkFinish();
      });
    } else {
      firebaseDone = true;
      checkFinish();
    }

    // Fallback safety timeout (4 seconds) so auth verification never hangs indefinitely
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        legacyDone = true;
        firebaseDone = true;
        checkFinish();
      }
    }, 4000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  // Derive seller state strictly from verified claims and backend/Firestore profile status
  const sellerStatus = sellerProfile?.status || (firebaseClaims.seller === true ? 'active' : null);
  const isActiveSeller = Boolean(
    firebaseUser &&
    firebaseClaims.admin !== true &&
    (sellerProfile ? sellerProfile.status === 'active' : firebaseClaims.seller === true)
  );
  const isPendingSeller = Boolean(
    firebaseUser &&
    firebaseClaims.admin !== true &&
    sellerProfile?.status === 'pending'
  );
  const hasSellerAccount = Boolean(
    firebaseUser &&
    firebaseClaims.admin !== true &&
    (firebaseClaims.seller === true || sellerProfile)
  );

  // Single Source of Truth Hierarchy (Firebase precedence over legacy; Firebase customer is NEVER admin)
  const activeRole = firebaseUser
    ? (firebaseClaims.admin === true ? 'admin' : (hasSellerAccount ? 'seller' : 'customer'))
    : (legacyUser?.role === 'admin' ? 'admin' : null);

  const isAdmin = activeRole === 'admin';
  const isSeller = activeRole === 'seller';
  const isCustomer = activeRole === 'customer';

  // For backward compatibility with ProtectedRoute (admin access ONLY)
  const isAuthenticated = isAdmin;
  const isFirebaseAuthenticated = Boolean(firebaseUser);
  const isLoggedIn = Boolean(firebaseUser || legacyUser);

  // Active composite user object
  const activeUser = firebaseUser
    ? {
        uid: firebaseUser.uid,
        id: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || null,
        name: firebaseUser.displayName || sellerProfile?.storeName || firebaseUser.email || 'Member',
        role: activeRole,
        sellerStatus,
        isActiveSeller,
        isPendingSeller,
        sellerProfile
      }
    : legacyUser
    ? legacyUser
    : null;

  // Legacy Admin Login (kept strictly separate from Firebase customer/seller accounts)
  const login = async (identifier, password) => {
    const data = await api.auth.login(identifier, password);

    if (auth && auth.currentUser) {
      await signOut(auth).catch(() => {});
      setFirebaseUser(null);
      setFirebaseClaims({});
      setSellerProfile(null);
    }

    setLegacyToken(data.token);
    setLegacyUser(data.user);
    localStorage.setItem('petal_thread_admin_token', data.token);
    localStorage.setItem('petal_thread_admin_user', JSON.stringify(data.user));
    return data;
  };

  // Firebase General Login (Customer or Seller)
  const loginFirebase = async (email, password) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase authentication is not configured in this environment. Please set valid VITE_FIREBASE_* keys in .env.');
    }
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const tokenResult = await userCredential.user.getIdTokenResult(true);
    const claims = tokenResult.claims || {};

    setFirebaseUser(toFirebaseUserSnapshot(userCredential.user));
    setFirebaseClaims(claims);

    const loadedProfile = claims.admin !== true
      ? await loadSellerProfile(userCredential.user.uid, claims)
      : null;
    setSellerProfile(loadedProfile);

    return userCredential.user;
  };

  // Customer Registration
  const signupCustomer = async (email, password, displayName) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase authentication is not configured in this environment. Please set valid VITE_FIREBASE_* keys in .env.');
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const cleanDisplayName = displayName ? displayName.trim() : '';

    if (cleanDisplayName) {
      await updateProfile(userCredential.user, { displayName: cleanDisplayName });
      await userCredential.user.reload().catch(() => {});
    }

    const updatedUser = toFirebaseUserSnapshot(auth.currentUser || userCredential.user);
    if (cleanDisplayName && updatedUser) {
      updatedUser.displayName = cleanDisplayName;
    }

    setFirebaseUser(updatedUser);
    setFirebaseClaims({});
    setSellerProfile(null);
    return userCredential.user;
  };

  // Seller Registration
  const signupSeller = async ({ email, password, storeName, phone, bio, category }) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase authentication is not configured in this environment. Please set valid VITE_FIREBASE_* keys in .env.');
    }

    isRegisteringSellerRef.current = true;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const cleanStoreName = storeName ? storeName.trim() : '';

      if (cleanStoreName) {
        await updateProfile(userCredential.user, { displayName: cleanStoreName });
        await userCredential.user.reload().catch(() => {});
      }

      // Register seller profile with backend (initial status is strictly 'pending')
      const profileRes = await api.sellers.register({
        storeName: cleanStoreName,
        phone,
        bio,
        category,
        email
      });

      const updatedUser = toFirebaseUserSnapshot(auth.currentUser || userCredential.user);
      if (cleanStoreName && updatedUser) {
        updatedUser.displayName = cleanStoreName;
      }

      setFirebaseUser(updatedUser);
      setFirebaseClaims({});
      setSellerProfile(profileRes.seller);
      return userCredential.user;
    } finally {
      isRegisteringSellerRef.current = false;
    }
  };

  // Refresh active seller profile
  const refreshSellerProfile = async () => {
    if (!firebaseUser) return null;
    const loaded = await loadSellerProfile(firebaseUser.uid, firebaseClaims);
    setSellerProfile(loaded);
    return loaded;
  };

  const logout = async () => {
    try {
      await api.auth.logout().catch(() => {});
    } catch {}

    try {
      if (auth) {
        await signOut(auth);
      }
    } catch (err) {
      console.warn('Firebase signOut error:', err);
    }

    localStorage.removeItem('petal_thread_admin_token');
    localStorage.removeItem('petal_thread_admin_user');
    setLegacyToken(null);
    setLegacyUser(null);
    setFirebaseUser(null);
    setFirebaseClaims({});
    setSellerProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token: legacyToken,
        user: activeUser,
        legacyUser,
        firebaseUser,
        claims: firebaseClaims,
        sellerProfile,
        sellerStatus,
        role: activeRole,
        isAdmin,
        isSeller,
        isActiveSeller,
        isPendingSeller,
        isCustomer,
        isAuthenticated,
        isFirebaseAuthenticated,
        isLoggedIn,
        isLoading,
        login,
        loginFirebase,
        signupCustomer,
        signupSeller,
        refreshSellerProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
