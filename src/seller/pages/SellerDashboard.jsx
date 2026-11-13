import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  Sparkles,
  Plus,
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Edit2,
  Trash2,
  ExternalLink,
  LogOut,
  X,
  Search,
  Filter,
  Eye,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { formatPrice } from '../../utils/currency';

export function SellerDashboard() {
  const { user, sellerProfile, isActiveSeller, isPendingSeller, refreshSellerProfile, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'approved' | 'pending' | 'rejected'
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);

  const initialForm = {
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    categorySlug: 'crochet-keychains',
    categoryName: 'Crochet Keychains',
    stock: 10,
    materials: '',
    dimensions: '',
    images: []
  };

  const [formData, setFormData] = useState(initialForm);

  const predefinedCategories = [
    { slug: 'crochet-keychains', name: 'Crochet Keychains' },
    { slug: 'crochet-flowers', name: 'Crochet Flowers' },
    { slug: 'hair-accessories', name: 'Hair Accessories' },
    { slug: 'handmade-gifts', name: 'Handmade Gifts' },
    { slug: 'clothing', name: 'Clothing' },
    { slug: 'custom-creations', name: 'Custom Creations' }
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const latestProfile = await refreshSellerProfile().catch(() => null);
      const activeNow = Boolean(isActiveSeller || latestProfile?.status === 'active');

      const [prodsRes, catsRes] = await Promise.all([
        activeNow ? api.sellers.getMyProducts().catch(() => []) : Promise.resolve([]),
        api.categories.getAll().catch(() => predefinedCategories)
      ]);

      const normalizedProducts = Array.isArray(prodsRes) ? prodsRes : (prodsRes?.products || []);
      setProducts(normalizedProducts);
      setCategories(catsRes && catsRes.length > 0 ? catsRes : predefinedCategories);
    } catch (err) {
      console.error('Failed to load seller dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    if (!canSubmitCreations) return;
    setEditingProduct(null);
    setFormData(initialForm);
    setFeedbackMsg({ type: '', text: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    if (!canSubmitCreations) return;
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      categorySlug: product.categorySlug || 'crochet-keychains',
      categoryName: product.categoryName || 'Crochet Keychains',
      stock: product.stock !== undefined ? product.stock : 10,
      materials: product.materials || '',
      dimensions: product.dimensions || '',
      images: Array.isArray(product.images) ? [...product.images] : (product.image ? [product.image] : [])
    });
    setFeedbackMsg({ type: '', text: '' });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setFeedbackMsg({ type: '', text: '' });

    try {
      if (files.length === 1) {
        const res = await api.upload.single(files[0]);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, res.url]
        }));
      } else {
        const res = await api.upload.multiple(files);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...(res.urls || [])]
        }));
      }
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Image upload failed. Allowed formats: JPEG, PNG, WebP (max 5MB).'
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmitCreations) {
      setFeedbackMsg({ type: 'error', text: 'Your artisan partner account must be approved before submitting creations.' });
      return;
    }
    if (!formData.name.trim() || !formData.price) {
      setFeedbackMsg({ type: 'error', text: 'Please provide both creation title and price.' });
      return;
    }

    if (formData.images.length === 0) {
      setFeedbackMsg({ type: 'error', text: 'Please upload at least one photograph of your creation.' });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg({ type: '', text: '' });

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        stock: parseInt(formData.stock, 10) || 0,
        image: formData.images[0] || '',
        sellerStoreName: sellerProfile?.storeName || user?.displayName || 'Artisan Partner'
      };

      if (editingProduct) {
        await api.products.update(editingProduct.id, payload);
      } else {
        await api.products.create(payload);
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to save creation. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.products.delete(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete product.');
    }
  };

  // Status and metric computations
  const totalCreations = products.length;
  const approvedCreations = products.filter(p => p.approvalStatus === 'approved').length;
  const pendingCreations = products.filter(p => p.approvalStatus === 'pending' || !p.approvalStatus).length;
  const isProfilePending = isPendingSeller || sellerProfile?.status === 'pending' || (!sellerProfile && !isActiveSeller);
  const canSubmitCreations = Boolean(isActiveSeller && sellerProfile?.status !== 'pending' && sellerProfile?.status !== 'rejected' && sellerProfile?.status !== 'suspended');

  const filteredProducts = products.filter(p => {
    const matchesTab =
      activeTab === 'all'
        ? true
        : activeTab === 'approved'
        ? p.approvalStatus === 'approved'
        : activeTab === 'pending'
        ? p.approvalStatus === 'pending' || !p.approvalStatus
        : p.approvalStatus === 'rejected';

    const matchesSearch =
      searchQuery.trim() === ''
        ? true
        : p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-ivory text-brown-dark flex flex-col font-sans selection:bg-blush selection:text-brown-dark">
      {/* Atelier Navigation */}
      <header className="bg-cream/90 backdrop-blur-xs border-b border-blush/60 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="group flex items-center gap-2">
              <span className="font-serif text-2xl tracking-tight text-brown-dark font-medium group-hover:text-rose transition-colors">
                Petal & Thread
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose" />
            </Link>
            <span className="text-xs uppercase tracking-widest text-brown/60 border-l border-blush/80 pl-3 hidden sm:inline-block">
              Artisan Studio
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-ivory border border-blush/60 text-xs">
              <Store className="w-3.5 h-3.5 text-rose" />
              <span className="font-semibold text-brown-dark truncate max-w-[150px]">
                {sellerProfile?.storeName || 'My Atelier Studio'}
              </span>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  sellerProfile?.status === 'active'
                    ? 'bg-sage-light text-sage border border-sage/40'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {sellerProfile?.status || 'pending'}
              </span>
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blush-light text-rose hover:bg-blush text-xs font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Public Boutique</span>
            </Link>

            <button
              onClick={logout}
              className="p-2 rounded-full text-brown-light hover:text-rose hover:bg-blush-light transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full space-y-8">
        {/* Welcome & Review Banner */}
        {isProfilePending ? (
          <div className="p-6 rounded-3xl bg-amber-50/80 border border-amber-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-soft">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 shadow-xs">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-medium text-amber-950">
                  Artisan Partner Application Under Review
                </h3>
                <p className="text-xs text-amber-800/90 mt-1 max-w-2xl leading-relaxed">
                  Welcome to the atelier! Our curation team is reviewing your artisan store details (
                  <span className="font-semibold">{sellerProfile?.storeName || 'Pending Store'}</span>). You will be able to upload creations and manage your showcase here once your partner account is approved.
                </p>
              </div>
            </div>
            <div className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex-shrink-0">
              Status: Pending Curation
            </div>
          </div>
        ) : !canSubmitCreations ? (
          <div className="p-6 rounded-3xl bg-rose-50/80 border border-rose-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-soft">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center flex-shrink-0 shadow-xs">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-medium text-brown-dark">
                  Artisan Partner Account Inactive ({sellerProfile?.status || 'unavailable'})
                </h3>
                <p className="text-xs text-brown/80 mt-1 max-w-2xl leading-relaxed">
                  Your artisan account does not currently have active selling permissions. Please contact the Petal & Thread atelier team for assistance.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-cream border border-blush/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-soft">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blush-light text-rose flex items-center justify-center flex-shrink-0 shadow-xs">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-medium text-brown-dark">
                  Welcome back, {sellerProfile?.storeName || user?.displayName || user?.name || 'Artisan Partner'}
                </h2>
                <p className="text-xs text-brown/70 mt-1">
                  Manage your boutique showcase, upload artisanal photographs, and monitor curation statuses.
                </p>
              </div>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose text-white text-xs font-semibold hover:bg-rose-dark transition-all shadow-delicate flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Submit New Creation</span>
            </button>
          </div>
        )}

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-cream border border-blush/60 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-brown/70">
              <span className="text-xs uppercase tracking-wider font-medium">Total Creations</span>
              <Package className="w-4 h-4 text-rose" />
            </div>
            <p className="font-serif text-3xl font-medium text-brown-dark">{totalCreations}</p>
          </div>

          <div className="p-5 rounded-2xl bg-cream border border-blush/60 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-brown/70">
              <span className="text-xs uppercase tracking-wider font-medium">Live in Boutique</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="font-serif text-3xl font-medium text-emerald-800">{approvedCreations}</p>
          </div>

          <div className="p-5 rounded-2xl bg-cream border border-blush/60 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-brown/70">
              <span className="text-xs uppercase tracking-wider font-medium">Pending Curation</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="font-serif text-3xl font-medium text-amber-800">{pendingCreations}</p>
          </div>
        </div>

        {/* Studio Product Catalog */}
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 bg-cream p-1 rounded-2xl border border-blush/60 self-start">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === 'all' ? 'bg-rose text-white shadow-xs' : 'text-brown-dark hover:text-rose'
                }`}
              >
                All ({totalCreations})
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === 'approved' ? 'bg-rose text-white shadow-xs' : 'text-brown-dark hover:text-rose'
                }`}
              >
                Live ({approvedCreations})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === 'pending' ? 'bg-rose text-white shadow-xs' : 'text-brown-dark hover:text-rose'
                }`}
              >
                Pending ({pendingCreations})
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-grow sm:w-64">
                <Search className="w-3.5 h-3.5 text-brown/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search your creations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-cream border border-blush/60 text-xs text-brown-dark placeholder-brown/40 focus:outline-none focus:border-rose transition-colors"
                />
              </div>

              {canSubmitCreations && (
                <button
                  onClick={openCreateModal}
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose text-white text-xs font-medium hover:bg-rose-dark transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Creation</span>
                </button>
              )}
            </div>
          </div>

          {/* Product Items Table / Cards */}
          {loading ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-rose/30 border-t-rose rounded-full animate-spin mx-auto" />
              <p className="text-xs text-brown/70 font-medium">Gathering your atelier catalog...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-16 rounded-3xl bg-cream border border-blush/60 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-blush-light text-rose mx-auto flex items-center justify-center">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="max-w-sm mx-auto">
                <h4 className="font-serif text-lg font-medium text-brown-dark">No creations found</h4>
                <p className="text-xs text-brown/70 mt-1">
                  {searchQuery
                    ? 'No creations match your search query.'
                    : canSubmitCreations
                    ? 'Your atelier shelf is empty. Submit your first handcrafted creation today!'
                    : 'Creations and inventory tools will appear here once your artisan account is approved.'}
                </p>
              </div>
              {canSubmitCreations && (
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose text-white text-xs font-medium hover:bg-rose-dark transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Submit First Creation</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((product) => {
                const isApproved = product.approvalStatus === 'approved';
                const isRejected = product.approvalStatus === 'rejected';

                return (
                  <div
                    key={product.id}
                    className="group bg-cream rounded-2xl border border-blush/60 overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Header with Badge */}
                      <div className="relative aspect-square w-full bg-blush-light overflow-hidden">
                        <img
                          src={product.image || product.images?.[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3">
                          <span
                            className={`text-[11px] font-semibold px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5 backdrop-blur-xs ${
                              isApproved
                                ? 'bg-emerald-50/95 text-emerald-800 border border-emerald-300'
                                : isRejected
                                ? 'bg-rose-50/95 text-rose-800 border border-rose-300'
                                : 'bg-amber-50/95 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {isApproved ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Approved</span>
                              </>
                            ) : isRejected ? (
                              <>
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                <span>Rejected</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Pending Review</span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-2">
                        <p className="text-[10px] uppercase tracking-wider text-brown/60 font-medium">
                          {product.categoryName || 'Handcrafted'}
                        </p>
                        <h4 className="font-serif text-base font-medium text-brown-dark line-clamp-1 group-hover:text-rose transition-colors">
                          {product.name}
                        </h4>
                        <div className="flex items-baseline gap-2">
                          <span className="font-serif text-lg font-bold text-brown-dark">
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-xs text-brown/40 line-through">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-brown/70 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="p-4 pt-0 border-t border-blush/30 flex items-center justify-between text-xs mt-3">
                      <span className="text-brown/60 text-[11px]">
                        Stock: <span className="font-semibold text-brown-dark">{product.stock ?? 10}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-1.5 rounded-lg hover:bg-blush-light text-brown hover:text-rose transition-colors"
                          title="Edit Creation"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="p-1.5 rounded-lg hover:bg-rose-light text-brown hover:text-rose transition-colors"
                          title="Delete Creation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Creation Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-brown-dark/50 backdrop-blur-xs"
            onClick={() => !isSubmitting && setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-cream rounded-3xl p-6 sm:p-8 border border-blush shadow-soft-lg z-10 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-blush/60">
              <div>
                <h3 className="font-serif text-2xl font-medium text-brown-dark">
                  {editingProduct ? 'Edit Artisan Creation' : 'Submit New Creation'}
                </h3>
                <p className="text-xs text-brown/70 mt-0.5">
                  Submissions are reviewed by atelier curators before publishing.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-blush-light text-brown-dark"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedbackMsg.text && (
              <div
                className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                  feedbackMsg.type === 'error'
                    ? 'bg-rose-50 text-rose border border-rose-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-brown-dark font-medium mb-1.5">Creation Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lavender Blossom Crochet Bouquet"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-ivory border border-blush/70 text-brown-dark focus:outline-none focus:border-rose transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-brown-dark font-medium mb-1.5">Category *</label>
                  <select
                    value={formData.categorySlug}
                    onChange={(e) => {
                      const selected = categories.find(c => c.slug === e.target.value);
                      setFormData({
                        ...formData,
                        categorySlug: e.target.value,
                        categoryName: selected ? selected.name : 'Handcrafted'
                      });
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-ivory border border-blush/70 text-brown-dark focus:outline-none focus:border-rose transition-colors"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-brown-dark font-medium mb-1.5">Available Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-ivory border border-blush/70 text-brown-dark focus:outline-none focus:border-rose transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-brown-dark font-medium mb-1.5">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="499"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-ivory border border-blush/70 text-brown-dark focus:outline-none focus:border-rose transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-brown-dark font-medium mb-1.5">Original / Strikethrough Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="699"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-ivory border border-blush/70 text-brown-dark focus:outline-none focus:border-rose transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-brown-dark font-medium mb-1.5">Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your artisan technique, materials, and creation story..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-ivory border border-blush/70 text-brown-dark focus:outline-none focus:border-rose transition-colors"
                />
              </div>

              {/* Image Upload via Cloudinary */}
              <div className="space-y-2">
                <label className="block text-brown-dark font-medium">Creation Photographs (Cloudinary Hosted) *</label>
                <div className="p-4 rounded-2xl border-2 border-dashed border-blush bg-ivory text-center space-y-2">
                  <input
                    type="file"
                    id="artisan-image-upload"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                  <label
                    htmlFor="artisan-image-upload"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cream border border-blush text-rose font-medium hover:bg-blush-light transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{uploadingImage ? 'Securing & Uploading...' : 'Upload Photos (Single or Multiple)'}</span>
                  </label>
                  <p className="text-[10px] text-brown/60">
                    JPG, PNG, WebP up to 5MB. Uploads are securely streamed to your dedicated seller Cloudinary repository.
                  </p>
                </div>

                {/* Uploaded Images Preview Grid */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                    {formData.images.map((imgUrl, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-blush group bg-blush-light">
                        <img src={imgUrl} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-rose text-white opacity-90 hover:opacity-100 transition-opacity"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-blush/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-full bg-ivory border border-blush text-brown font-medium hover:bg-blush-light transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || uploadingImage}
                  className="px-6 py-2.5 rounded-full bg-rose text-white font-semibold hover:bg-rose-dark transition-colors shadow-delicate disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving Creation...' : editingProduct ? 'Update Creation' : 'Submit for Curation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-brown-dark/50 backdrop-blur-xs" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-sm bg-cream rounded-3xl p-6 border border-blush shadow-soft-lg z-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-light text-rose mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-medium text-brown-dark">Remove Creation?</h4>
              <p className="text-xs text-brown/70 mt-1">
                Are you sure you want to remove <span className="font-semibold text-brown-dark">{deleteTarget.name}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-full bg-ivory border border-blush text-xs font-medium text-brown hover:bg-blush-light"
              >
                Keep Creation
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 rounded-full bg-rose text-white text-xs font-semibold hover:bg-rose-dark shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
