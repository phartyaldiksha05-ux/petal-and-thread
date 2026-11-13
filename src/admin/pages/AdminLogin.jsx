import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, User, Eye, EyeOff, Sparkles, ArrowLeft, ShieldCheck } from 'lucide-react';
import { FloralAccent } from '../../components/common/FloralAccent';

export function AdminLogin() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin/overview';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(identifier, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid administrator credentials. Please check your username/password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Soft Glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blush/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-sage-light/40 rounded-full blur-3xl pointer-events-none" />

      {/* Top Back Link */}
      <div className="relative z-10 max-w-md mx-auto w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-brown-dark/70 hover:text-rose transition-colors py-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Public Boutique</span>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 max-w-md mx-auto w-full my-auto">
        <div className="bg-cream rounded-3xl p-8 sm:p-10 shadow-soft-lg border border-blush/70 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blush-light text-rose flex items-center justify-center mx-auto shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div className="pt-2">
              <h2 className="font-serif text-2xl sm:text-3xl text-brown-dark font-medium">
                Atelier Administration
              </h2>
              <p className="font-cormorant italic text-sm text-brown/70 mt-0.5">
                Petal & Thread Owner Portal
              </p>
            </div>

            <div className="flex justify-center pt-1 pb-1">
              <FloralAccent className="w-20 h-4 text-rose/50" />
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-light/70 border border-rose/30 text-rose-dark text-xs font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-brown-dark mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brown-light">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter username or email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-blush/60 text-sm text-brown-dark placeholder-brown-light/50 focus:outline-none focus:border-rose transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-brown-dark mb-1.5">
                Administrator Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brown-light">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white border border-blush/60 text-sm text-brown-dark placeholder-brown-light/50 focus:outline-none focus:border-rose transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-brown-light hover:text-brown-dark transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-full bg-rose text-white hover:bg-rose-dark disabled:opacity-60 font-medium text-sm transition-all duration-300 shadow-delicate flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Access Atelier Dashboard</span>
                </>
              )}
            </button>
          </form>

        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center text-xs text-brown/60 py-2">
        <p>© {new Date().getFullYear()} Petal & Thread Atelier. Secure Private System.</p>
      </div>
    </div>
  );
}
