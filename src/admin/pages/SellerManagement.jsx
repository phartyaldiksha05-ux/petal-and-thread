import React, { useState, useEffect } from 'react';
import {
  Store,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../../services/api';

export function SellerManagement() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'active' | 'rejected'
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // id of seller being updated
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [statusNotes, setStatusNotes] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const loadSellers = async () => {
    try {
      setLoading(true);
      const res = await api.sellers.getAll();
      setSellers(res.sellers || []);
    } catch (err) {
      console.error('Failed to load sellers:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to fetch sellers list.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellers();
  }, []);

  const handleUpdateStatus = async (sellerId, newStatus) => {
    try {
      setActionLoading(sellerId);
      setFeedback({ type: '', message: '' });

      await api.sellers.updateStatus(sellerId, newStatus, statusNotes);

      setFeedback({
        type: 'success',
        message: `Artisan partner successfully updated to ${newStatus}.`
      });

      setSelectedSeller(null);
      setStatusNotes('');
      await loadSellers();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Status update failed.' });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredSellers = sellers.filter((s) => {
    const matchesFilter = statusFilter === 'all' ? true : s.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      q === '' ||
      (s.storeName && s.storeName.toLowerCase().includes(q)) ||
      (s.displayName && s.displayName.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.category && s.category.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });

  const totalSellers = sellers.length;
  const pendingSellers = sellers.filter((s) => s.status === 'pending').length;
  const activeSellers = sellers.filter((s) => s.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-brown-dark font-medium">
            Artisan Partners & Vendors
          </h1>
          <p className="font-cormorant italic text-sm text-brown/70 mt-1">
            Review partner applications, verify credentials, and manage multi-vendor atelier status.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1.5 rounded-full bg-cream border border-blush text-xs text-brown-dark font-medium shadow-xs">
            {totalSellers} Total Partners
          </span>
          {pendingSellers > 0 && (
            <span className="px-3 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-xs text-amber-800 font-semibold shadow-xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>{pendingSellers} Pending</span>
            </span>
          )}
        </div>
      </div>

      {feedback.message && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 ${
            feedback.type === 'error'
              ? 'bg-rose-50 text-rose border border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          {feedback.type === 'error' ? (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-cream p-1 rounded-2xl border border-blush/60 self-start">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              statusFilter === 'all' ? 'bg-rose text-white shadow-xs' : 'text-brown-dark hover:text-rose'
            }`}
          >
            All ({totalSellers})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              statusFilter === 'pending' ? 'bg-rose text-white shadow-xs' : 'text-brown-dark hover:text-rose'
            }`}
          >
            Pending ({pendingSellers})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              statusFilter === 'active' ? 'bg-rose text-white shadow-xs' : 'text-brown-dark hover:text-rose'
            }`}
          >
            Active ({activeSellers})
          </button>
        </div>

        <div className="relative flex-grow sm:w-64">
          <Search className="w-3.5 h-3.5 text-brown/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by store or artisan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-cream border border-blush/60 text-xs text-brown-dark placeholder-brown/40 focus:outline-none focus:border-rose transition-colors"
          />
        </div>
      </div>

      {/* Sellers List */}
      {loading ? (
        <div className="p-16 text-center space-y-3">
          <div className="w-10 h-10 border-2 border-rose/30 border-t-rose rounded-full animate-spin mx-auto" />
          <p className="text-xs text-brown/70 font-medium">Loading artisan partner roster...</p>
        </div>
      ) : filteredSellers.length === 0 ? (
        <div className="p-16 rounded-3xl bg-cream border border-blush/60 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-blush-light text-rose mx-auto flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-serif text-lg font-medium text-brown-dark">No artisans found</h4>
            <p className="text-xs text-brown/70 mt-1">
              {search
                ? 'No artisan profiles match your search criteria.'
                : 'No registered artisan partners found in this filter category.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSellers.map((seller) => {
            const isPending = seller.status === 'pending';
            const isActive = seller.status === 'active';
            const isRejected = seller.status === 'rejected';

            return (
              <div
                key={seller.uid || seller.id}
                className="bg-cream rounded-2xl border border-blush/60 p-5 shadow-soft space-y-4 hover:shadow-soft-lg transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blush-light text-rose flex items-center justify-center font-serif text-lg font-bold flex-shrink-0">
                      {seller.storeName ? seller.storeName[0].toUpperCase() : 'A'}
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-semibold text-brown-dark">
                        {seller.storeName || 'Unnamed Atelier'}
                      </h3>
                      <p className="text-xs text-brown/70">
                        {seller.displayName || 'Artisan Partner'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : isRejected
                        ? 'bg-rose-50 text-rose-800 border-rose-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    {seller.status || 'pending'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-blush/30">
                  <div className="flex items-center gap-1.5 text-brown/80 truncate">
                    <Mail className="w-3.5 h-3.5 text-rose flex-shrink-0" />
                    <span className="truncate">{seller.email || 'No email'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-brown/80 truncate">
                    <Phone className="w-3.5 h-3.5 text-rose flex-shrink-0" />
                    <span className="truncate">{seller.phone || 'No phone'}</span>
                  </div>
                </div>

                {seller.bio && (
                  <p className="text-xs text-brown/70 line-clamp-2 italic bg-ivory p-2.5 rounded-xl border border-blush/40">
                    "{seller.bio}"
                  </p>
                )}

                <div className="pt-2 border-t border-blush/40 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-brown/50">
                    Applied: {seller.createdAt ? new Date(seller.createdAt).toLocaleDateString() : 'Recent'}
                  </span>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(seller.uid || seller.id, 'active')}
                          disabled={actionLoading === (seller.uid || seller.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(seller.uid || seller.id, 'rejected')}
                          disabled={actionLoading === (seller.uid || seller.id)}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose hover:bg-rose hover:text-white border border-rose-200 text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {isActive && (
                      <button
                        onClick={() => handleUpdateStatus(seller.uid || seller.id, 'rejected')}
                        disabled={actionLoading === (seller.uid || seller.id)}
                        className="px-3 py-1.5 rounded-xl bg-cream border border-blush text-brown/70 hover:text-rose text-xs font-medium transition-colors"
                      >
                        Suspend
                      </button>
                    )}

                    {isRejected && (
                      <button
                        onClick={() => handleUpdateStatus(seller.uid || seller.id, 'active')}
                        disabled={actionLoading === (seller.uid || seller.id)}
                        className="px-3 py-1.5 rounded-xl bg-cream border border-blush text-emerald-700 hover:bg-emerald-50 text-xs font-medium transition-colors"
                      >
                        Re-activate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
