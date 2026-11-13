import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Mail, Lock, User, Store, Phone, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { Link } from 'react-router-dom';

const FIREBASE_AUTH_ERROR_MESSAGES = {
  'auth/invalid-credential': 'Invalid email or password. Please check your credentials and try again.',
  'auth/wrong-password': 'Incorrect password. Please check your password and try again.',
  'auth/user-not-found': 'No account was found with this email address. Please check your email or sign up.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/too-many-requests': 'Too many unsuccessful attempts. Please wait a few minutes and try again.',
  'auth/network-request-failed': 'Network error while connecting to the authentication service. Please check your internet connection, VPN, or browser extensions and try again.',
  'auth/email-already-in-use': 'An account with this email address already exists. Please sign in instead.',
  'auth/weak-password': 'Password is too weak. Please choose a password with at least 6 characters.',
  'auth/user-disabled': 'This account has been disabled. Please contact support for assistance.',
  'auth/operation-not-allowed': 'Email and password sign-in is currently disabled for this project.'
};

/**
 * Maps Firebase Auth error codes to user-friendly UI messages while preserving
 * non-Firebase validation/API error messages and keeping network errors distinct.
 */
function getAuthErrorMessage(err) {
  const code = err?.code;
  if (code && FIREBASE_AUTH_ERROR_MESSAGES[code]) {
    return FIREBASE_AUTH_ERROR_MESSAGES[code];
  }
  if (typeof code === 'string' && code.startsWith('auth/')) {
    return 'Authentication could not be completed. Please verify your details and try again.';
  }
  return err?.message || 'Authentication failed. Please verify your details.';
}

export function AuthModal({ isOpen, onClose }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register_customer' | 'register_seller'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [category, setCategory] = useState('Crochet & Floral Crafts');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginFirebase, signupCustomer, signupSeller } = useAuth();
  const { showToast } = useWishlist();

  if (!isOpen) return null;

  const isSignupTab = tab === 'register_customer' || tab === 'register_seller';

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setStoreName('');
    setPhone('');
    setBio('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError('');
    setLoading(false);
  };

  const handleTabChange = (nextTab) => {
    setTab(nextTab);
    setConfirmPassword('');
    setShowConfirmPassword(false);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'register_seller' && !storeName.trim()) {
        throw new Error('Artisan / Store Name is required.');
      }
      if (isSignupTab && password !== confirmPassword) {
        throw new Error('Passwords do not match. Please make sure both password fields match.');
      }

      if (tab === 'login') {
        await loginFirebase(email, password);
        showToast('Welcome back to Petal & Thread!');
        handleClose();
      } else if (tab === 'register_customer') {
        await signupCustomer(email, password, displayName);
        showToast('Welcome to Petal & Thread! Your account is created.');
        handleClose();
      } else if (tab === 'register_seller') {
        await signupSeller({
          email,
          password,
          storeName,
          phone,
          bio,
          category
        });
        showToast('Application submitted! Your artisan profile is awaiting boutique curation.');
        handleClose();
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-brown-dark/50 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-cream rounded-3xl shadow-soft-lg border border-blush/60 overflow-hidden z-10 p-6 sm:p-8 my-8"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-ivory text-brown-dark/70 hover:text-brown-dark hover:bg-blush-light transition-all flex items-center justify-center border border-blush/40"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="text-center space-y-1 mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blush-light text-rose text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Petal & Thread Marketplace</span>
            </div>
            <h2 className="font-serif text-2xl text-brown-dark font-medium pt-1">
              {tab === 'login' && 'Welcome Back'}
              {tab === 'register_customer' && 'Join the Boutique'}
              {tab === 'register_seller' && 'Artisan Partner Application'}
            </h2>
            <p className="text-xs text-brown/70 font-light">
              {tab === 'login' && 'Sign in to access your bespoke orders, wishlist & account'}
              {tab === 'register_customer' && 'Create your customer account to save custom creations'}
              {tab === 'register_seller' && 'Showcase your handcrafted creations in our curated boutique'}
            </p>
          </div>

          {/* Tab Selection */}
          <div className="flex rounded-2xl bg-ivory p-1 border border-blush/50 mb-5 text-xs font-medium">
            {[
              { id: 'login', label: 'Sign In' },
              { id: 'register_customer', label: 'Customer Sign Up' },
              { id: 'register_seller', label: 'Artisan Partner' }
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleTabChange(id)}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  tab === id
                    ? 'bg-rose text-white shadow-xs'
                    : 'text-brown-dark/70 hover:text-brown-dark'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-light/70 border border-rose/30 text-rose-dark text-xs font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Customer Display Name */}
            {tab === 'register_customer' && (
              <div>
                <label className="block text-xs font-medium text-brown-dark mb-1">Your Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-brown-light pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Charlotte Rose"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-blush/60 text-sm text-brown-dark focus:outline-none focus:border-rose transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Seller Fields */}
            {tab === 'register_seller' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-brown-dark mb-1">Artisan / Brand Name</label>
                  <div className="relative">
                    <Store className="absolute left-3.5 top-3 w-4 h-4 text-brown-light pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Meadow & Twig Atelier"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-blush/60 text-sm text-brown-dark focus:outline-none focus:border-rose transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-brown-dark mb-1">Craft Specialty</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-2xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose transition-colors"
                    >
                      <option>Crochet & Floral Crafts</option>
                      <option>Bespoke Tailoring & Collars</option>
                      <option>Botanical Hair Accessories</option>
                      <option>Romantic Fashion Illustration</option>
                      <option>Handmade Keepsakes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brown-dark mb-1">Phone / WhatsApp</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 w-4 h-4 text-brown-light pointer-events-none" />
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-brown-dark mb-1">Artisan Bio / Story</label>
                  <textarea
                    rows={2}
                    placeholder="Tell us about your craft, inspiration, and small-batch handiwork..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-2xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose transition-colors resize-none"
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-brown-dark mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-brown-light pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-blush/60 text-sm text-brown-dark focus:outline-none focus:border-rose transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-brown-dark mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-brown-light pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white border border-blush/60 text-sm text-brown-dark focus:outline-none focus:border-rose transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-brown-light hover:text-rose transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Customer & Artisan Sign Up only) */}
            {isSignupTab && (
              <div>
                <label
                  htmlFor="auth-confirm-password"
                  className="block text-xs font-medium text-brown-dark mb-1"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-brown-light pointer-events-none" />
                  <input
                    id="auth-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white border border-blush/60 text-sm text-brown-dark focus:outline-none focus:border-rose transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3.5 top-3 text-brown-light hover:text-rose transition-colors"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-rose text-white hover:bg-rose-dark transition-all text-xs sm:text-sm font-medium shadow-delicate flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>
                      {tab === 'login' && 'Sign In to Atelier'}
                      {tab === 'register_customer' && 'Create Customer Account'}
                      {tab === 'register_seller' && 'Submit Artisan Application'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer note & Admin portal link */}
          <div className="mt-5 pt-4 border-t border-blush/40 text-center space-y-1.5">
            <p className="text-[11px] text-brown/70">
              Are you the boutique owner?{' '}
              <Link
                to="/admin/login"
                onClick={handleClose}
                className="text-rose font-medium hover:underline inline-flex items-center gap-1"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Atelier Administration</span>
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
