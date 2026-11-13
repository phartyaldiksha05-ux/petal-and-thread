import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Star,
  Upload,
  X,
  Check,
  AlertCircle,
  Eye,
  Image as ImageIcon
} from 'lucide-react';
import { api } from '../../services/api';
import { useSiteData } from '../../context/SiteDataContext';
import { formatPrice } from '../../utils/currency';

export function ProductManagement() {
  const { refreshData } = useSiteData();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal State (Add or Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [moderationFilter, setModerationFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [moderationLoading, setModerationLoading] = useState(null);

  const handleApproveProduct = async (id) => {
    try {
      setModerationLoading(id);
      await api.moderation.updateProductApproval(id, 'approved');
      setSuccessMsg('Product approved and published to public boutique.');
      await loadProducts();
      refreshData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to approve product.');
    } finally {
      setModerationLoading(null);
    }
  };

  const handleRejectProduct = async (id) => {
    try {
      setModerationLoading(id);
      await api.moderation.updateProductApproval(id, 'rejected');
      setSuccessMsg('Product rejected.');
      await loadProducts();
      refreshData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reject product.');
    } finally {
      setModerationLoading(null);
    }
  };

  // Form State
  const initialForm = {
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    categorySlug: 'crochet-keychains',
    categoryName: 'Crochet Keychains',
    stock: 10,
    status: 'available',
    isFeatured: false,
    badge: '',
    materials: '',
    dimensions: '',
    images: [''],
    variants: [{ name: 'Default', inStock: true }]
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

  const loadProducts = async () => {
    try {
      setLoading(true);
      const [prodsRes, catsRes] = await Promise.all([
        api.products.getAll({ includePending: 'true' }),
        api.categories.getAll().catch(() => predefinedCategories)
      ]);
      setProducts(prodsRes || []);
      setCategories(catsRes && catsRes.length > 0 ? catsRes : predefinedCategories);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData(initialForm);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      categorySlug: product.categorySlug || 'crochet-keychains',
      categoryName: product.categoryName || 'Crochet Keychains',
      stock: product.stock !== undefined ? product.stock : 10,
      status: product.status || 'available',
      isFeatured: !!product.isFeatured,
      badge: product.badge || '',
      materials: product.materials || '',
      dimensions: product.dimensions || '',
      images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image || ''],
      variants: Array.isArray(product.variants) && product.variants.length > 0 ? product.variants : [{ name: 'Default', inStock: true }]
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  // Image upload handler via Multer
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setErrorMsg('');
    try {
      if (files.length === 1) {
        const res = await api.upload.single(files[0]);
        setFormData(prev => ({
          ...prev,
          images: prev.images.filter(img => img.trim() !== '').concat(res.url)
        }));
      } else {
        const res = await api.upload.multiple(files);
        setFormData(prev => ({
          ...prev,
          images: prev.images.filter(img => img.trim() !== '').concat(res.urls)
        }));
      }
    } catch (err) {
      setErrorMsg(err.message || 'Image upload failed. Only JPEG/PNG/WebP under 5MB allowed.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddImageUrl = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const handleImageUrlChange = (index, value) => {
    const updated = [...formData.images];
    updated[index] = value;
    setFormData(prev => ({ ...prev, images: updated }));
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index)
    }));
  };

  // Variants handlers
  const handleAddVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { name: '', inStock: true }]
    }));
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...formData.variants];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, variants: updated }));
  };

  const handleRemoveVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, idx) => idx !== index)
    }));
  };

  // Save product
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const cleanImages = formData.images.filter(img => img && img.trim() !== '');
      const matchedCat = categories.find(c => (c.slug || c.id) === formData.categorySlug);

      const payload = {
        ...formData,
        categoryName: matchedCat ? matchedCat.name : formData.categoryName,
        images: cleanImages.length > 0 ? cleanImages : ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80'],
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        stock: Number(formData.stock)
      };

      if (editingProduct) {
        await api.products.update(editingProduct.id, payload);
        setSuccessMsg(`"${payload.name}" updated successfully.`);
      } else {
        await api.products.create(payload);
        setSuccessMsg(`"${payload.name}" added to catalog.`);
      }

      setIsModalOpen(false);
      await loadProducts();
      refreshData();
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete product
  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await api.products.delete(deleteCandidate.id);
      setSuccessMsg(`"${deleteCandidate.name}" deleted.`);
      setDeleteCandidate(null);
      await loadProducts();
      refreshData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete product.');
    }
  };

  // Filtered products list
  const pendingCount = products.filter(p => p.approvalStatus === 'pending').length;
  const rejectedCount = products.filter(p => p.approvalStatus === 'rejected').length;

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase())) ||
      (p.sellerStoreName && p.sellerStoreName.toLowerCase().includes(search.toLowerCase()));
    const matchCat = selectedCategory === 'all' || p.categorySlug === selectedCategory;
    const matchModeration =
      moderationFilter === 'all'
        ? true
        : moderationFilter === 'pending'
        ? p.approvalStatus === 'pending'
        : moderationFilter === 'approved'
        ? p.approvalStatus === 'approved' || !p.approvalStatus
        : p.approvalStatus === 'rejected';

    return matchSearch && matchCat && matchModeration;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Bar: Title, Search & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-brown-dark font-medium">
            Products & Handmade Catalog
          </h2>
          <p className="text-xs text-brown/70 font-light">
            Manage your boutique inventory, variants, prices, and high-resolution photos.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose text-white hover:bg-rose-dark font-medium text-xs sm:text-sm transition-colors shadow-delicate"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-sage-light border border-sage/40 text-sage-dark text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-sage-dark" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-cream border border-blush/60 shadow-soft flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-brown-light" />
            <input
              type="text"
              placeholder="Search by title, description, or artisan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-ivory border border-blush/60 text-xs text-brown-dark placeholder-brown-light/60 focus:outline-none focus:border-rose"
            />
          </div>

          {/* Curation Moderation Filter */}
          <div className="flex items-center gap-1.5 bg-ivory p-1 rounded-2xl border border-blush/60">
            <button
              onClick={() => setModerationFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                moderationFilter === 'all'
                  ? 'bg-rose text-white shadow-xs'
                  : 'text-brown hover:text-rose'
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setModerationFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1 ${
                moderationFilter === 'pending'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-800 hover:bg-amber-100/60'
              }`}
            >
              <span>Pending</span>
              {pendingCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white/30 text-[10px] font-bold flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setModerationFilter('approved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                moderationFilter === 'approved'
                  ? 'bg-rose text-white shadow-xs'
                  : 'text-brown hover:text-rose'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setModerationFilter('rejected')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1 ${
                moderationFilter === 'rejected'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-red-700 hover:bg-red-50'
              }`}
            >
              <span>Rejected</span>
              {rejectedCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white/30 text-[10px] font-bold flex items-center justify-center">
                  {rejectedCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-rose text-white shadow-xs'
                : 'bg-ivory border border-blush/60 text-brown hover:bg-blush-light'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug || cat.id}
              onClick={() => setSelectedCategory(cat.slug || cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === (cat.slug || cat.id)
                  ? 'bg-rose text-white shadow-xs'
                  : 'bg-ivory border border-blush/60 text-brown hover:bg-blush-light'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-cream rounded-3xl border border-blush/60 shadow-soft overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-rose/30 border-t-rose rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-brown/70">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-serif text-brown-dark">No products found matching your search.</p>
            <button
              onClick={openCreateModal}
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-rose font-medium hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add a creation now</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brown-dark">
              <thead className="bg-ivory/80 border-b border-blush/40 text-[11px] uppercase tracking-wider text-brown-light font-medium">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Curation</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Featured</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blush/30">
                {filteredProducts.map((p) => {
                  const mainImage = Array.isArray(p.images) && p.images[0] ? p.images[0] : p.image;
                  const isPending = p.approvalStatus === 'pending';
                  const isRejected = p.approvalStatus === 'rejected';

                  return (
                    <tr key={p.id} className="hover:bg-ivory/50 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 flex items-center gap-3">
                        <img
                          src={mainImage}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover border border-blush/50 flex-shrink-0 bg-ivory"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-brown-dark truncate">{p.name}</p>
                          {p.sellerStoreName && (
                            <p className="text-[10px] text-rose font-medium truncate">
                              By {p.sellerStoreName}
                            </p>
                          )}
                          <p className="text-[11px] text-brown/60 truncate max-w-xs">{p.description}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-brown/80 font-medium whitespace-nowrap">
                        {p.categoryName || p.categorySlug}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-rose-dark whitespace-nowrap">
                        {formatPrice(p.price)}
                        {p.originalPrice && (
                          <span className="text-brown-light line-through font-normal text-[11px] ml-1.5">
                            {formatPrice(p.originalPrice)}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`font-semibold ${
                            p.stock <= 5 ? 'text-rose-dark' : 'text-brown-dark'
                          }`}
                        >
                          {p.stock} in stock
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isPending ? (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-amber-50 text-amber-800 border border-amber-300">
                              Pending
                            </span>
                            <button
                              onClick={() => handleApproveProduct(p.id)}
                              disabled={moderationLoading === p.id}
                              className="p-1 rounded-md bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                              title="Approve for public boutique"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRejectProduct(p.id)}
                              disabled={moderationLoading === p.id}
                              className="p-1 rounded-md bg-rose-100 text-rose-800 hover:bg-rose-200 transition-colors"
                              title="Reject creation"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : isRejected ? (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-rose-50 text-rose-800 border border-rose-300">
                              Rejected
                            </span>
                            <button
                              onClick={() => handleApproveProduct(p.id)}
                              disabled={moderationLoading === p.id}
                              className="text-[10px] text-emerald-700 hover:underline"
                            >
                              Re-approve
                            </button>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-sage-light text-sage-dark border border-sage/40">
                            Approved
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            p.status === 'sold_out' || p.stock === 0
                              ? 'bg-rose-light text-rose-dark'
                              : 'bg-sage-light text-sage-dark'
                          }`}
                        >
                          {p.status === 'sold_out' || p.stock === 0 ? 'Sold Out' : 'Available'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {p.isFeatured ? (
                          <Star className="w-4 h-4 fill-rose text-rose mx-auto" />
                        ) : (
                          <span className="text-brown-light/40">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap space-x-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg text-brown-light hover:text-rose hover:bg-blush-light transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate(p)}
                          className="p-1.5 rounded-lg text-brown-light hover:text-rose-dark hover:bg-rose-light transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-brown-dark/50 backdrop-blur-xs"
            onClick={() => !submitting && setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-2xl bg-cream rounded-3xl shadow-soft-lg border border-blush/70 p-6 sm:p-8 my-8 z-10 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-ivory text-brown hover:bg-blush-light flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif text-2xl text-brown-dark font-medium mb-1">
              {editingProduct ? 'Edit Boutique Creation' : 'Add New Handcrafted Product'}
            </h3>
            <p className="text-xs text-brown/70 mb-5">
              Fill in the product details, stock, pricing, variants, and upload imagery.
            </p>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-rose-light/70 border border-rose/30 text-rose-dark text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Product Name */}
              <div>
                <label className="block font-medium text-brown-dark mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vintage Blossom Crochet Keychain"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-blush/60 text-sm text-brown-dark focus:outline-none focus:border-rose"
                />
              </div>

              {/* Category & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-brown-dark mb-1">Category *</label>
                  <select
                    value={formData.categorySlug}
                    onChange={(e) => {
                      const slug = e.target.value;
                      const cat = categories.find(c => (c.slug || c.id) === slug);
                      setFormData({
                        ...formData,
                        categorySlug: slug,
                        categoryName: cat ? cat.name : slug
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
                  >
                    {categories.map((c) => (
                      <option key={c.slug || c.id} value={c.slug || c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-brown-dark mb-1">Badge (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Bestseller, Limited Run, New"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
                  />
                </div>
              </div>

              {/* Price, Original Price, Stock, Status */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-medium text-brown-dark mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="24.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
                  />
                </div>

                <div>
                  <label className="block font-medium text-brown-dark mb-1">Original (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="28.00"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
                  />
                </div>

                <div>
                  <label className="block font-medium text-brown-dark mb-1">Stock Count</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
                  />
                </div>

                <div>
                  <label className="block font-medium text-brown-dark mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
                  >
                    <option value="available">Available</option>
                    <option value="sold_out">Sold Out</option>
                  </select>
                </div>
              </div>

              {/* Featured toggle */}
              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="isFeaturedCheck"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded text-rose focus:ring-rose"
                />
                <label htmlFor="isFeaturedCheck" className="text-xs font-medium text-brown-dark cursor-pointer">
                  Feature this product on homepage product grid
                </label>
              </div>

              {/* Description */}
              <div>
                <label className="block font-medium text-brown-dark mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Detailed artisanal story, techniques, and care instructions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
                />
              </div>

              {/* Materials and Dimensions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-brown-dark mb-1">Materials</label>
                  <input
                    type="text"
                    placeholder="e.g. 100% Egyptian Cotton, Brass Clasp"
                    value={formData.materials}
                    onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
                  />
                </div>
                <div>
                  <label className="block font-medium text-brown-dark mb-1">Dimensions</label>
                  <input
                    type="text"
                    placeholder="e.g. 2.5 in diameter - 4.5 in total drop"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
                  />
                </div>
              </div>

              {/* Product Images (Multiple Upload + URLs) */}
              <div className="space-y-2 pt-2 border-t border-blush/40">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-brown-dark flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-rose" />
                    <span>Product Images (Upload or URLs)</span>
                  </label>
                  <label className="cursor-pointer text-xs font-medium text-rose hover:underline inline-flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Image File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Image URL or uploaded path..."
                        value={img}
                        onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark"
                      />
                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-2 text-brown-light hover:text-rose-dark"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="text-[11px] text-rose font-medium hover:underline"
                  >
                    + Add another image URL
                  </button>
                </div>
              </div>

              {/* Variants Section */}
              <div className="space-y-2 pt-2 border-t border-blush/40">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-brown-dark">Product Variants (Colors, Sizes)</label>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="text-xs text-rose font-medium hover:underline"
                  >
                    + Add Variant
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.variants.map((v, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-ivory/60 p-2 rounded-xl border border-blush/30">
                      <input
                        type="text"
                        placeholder="Variant name (e.g. Dusty Rose, 3-6M)"
                        value={v.name}
                        onChange={(e) => handleVariantChange(idx, 'name', e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-blush/60 text-xs text-brown-dark"
                      />
                      <label className="flex items-center gap-1.5 text-[11px] text-brown-dark cursor-pointer">
                        <input
                          type="checkbox"
                          checked={v.inStock}
                          onChange={(e) => handleVariantChange(idx, 'inStock', e.target.checked)}
                          className="rounded text-rose"
                        />
                        <span>In Stock</span>
                      </label>
                      {formData.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="p-1 text-brown-light hover:text-rose-dark"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-blush/40">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-blush text-brown hover:bg-blush-light text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-full bg-rose text-white hover:bg-rose-dark font-medium text-xs shadow-delicate"
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-brown-dark/50 backdrop-blur-xs" onClick={() => setDeleteCandidate(null)} />
          <div className="relative w-full max-w-md bg-cream rounded-3xl p-6 sm:p-8 border border-blush shadow-soft-lg z-10 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-light text-rose-dark flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-serif text-xl text-brown-dark font-medium">Delete Product?</h4>
              <p className="text-xs text-brown/70 font-light">
                Are you sure you want to delete <strong className="text-brown-dark">"{deleteCandidate.name}"</strong>? This action will remove it permanently from the boutique.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="flex-1 py-2.5 rounded-full border border-blush text-brown text-xs font-medium hover:bg-blush-light"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-full bg-rose-dark text-white text-xs font-medium hover:bg-rose transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
