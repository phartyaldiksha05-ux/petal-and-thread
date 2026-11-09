import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, AlertCircle, X, Upload } from 'lucide-react';
import { api } from '../../services/api';
import { useSiteData } from '../../context/SiteDataContext';

export function CategoryManagement() {
  const { refreshData } = useSiteData();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    tag: '',
    shortDescription: '',
    image: '',
    itemCount: '0 items'
  });

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await api.categories.getAll();
      setCategories(res || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      tag: 'Handmade Special',
      shortDescription: '',
      image: 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&w=800&q=80',
      itemCount: 'Boutique Collection'
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      tag: cat.tag || '',
      shortDescription: cat.shortDescription || '',
      image: cat.image || '',
      itemCount: cat.itemCount || '0 items'
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.upload.single(file);
      setFormData(prev => ({ ...prev, image: res.url }));
    } catch (err) {
      setErrorMsg(err.message || 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      if (editingCategory) {
        await api.categories.update(editingCategory.id, formData);
        setSuccessMsg(`Category "${formData.name}" updated.`);
      } else {
        await api.categories.create(formData);
        setSuccessMsg(`Category "${formData.name}" created.`);
      }

      setIsModalOpen(false);
      await loadCategories();
      refreshData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save category.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await api.categories.delete(deleteCandidate.id);
      setSuccessMsg(`Category deleted.`);
      setDeleteCandidate(null);
      await loadCategories();
      refreshData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete category.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-brown-dark font-medium">
            Category & Collection Management
          </h2>
          <p className="text-xs text-brown/70 font-light">
            Organize departments displayed on the public boutique's "Shop by Category" section.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose text-white hover:bg-rose-dark font-medium text-xs sm:text-sm transition-colors shadow-delicate"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-sage-light border border-sage/40 text-sage-dark text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-sage-dark" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-2 border-rose/30 border-t-rose rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-brown/70">Loading categories...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id || cat.slug}
              className="bg-cream rounded-3xl overflow-hidden border border-blush/60 shadow-soft flex flex-col justify-between"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-ivory">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center"
                />
                <span className="absolute top-3 left-3 bg-cream/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-medium text-brown-dark border border-blush/40">
                  {cat.tag}
                </span>
                <span className="absolute bottom-3 right-3 text-white text-[11px] font-cormorant italic drop-shadow-md">
                  {cat.itemCount}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-serif text-lg text-brown-dark font-medium">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-brown/70 line-clamp-2 mt-1 font-light">
                    {cat.shortDescription}
                  </p>
                </div>

                <div className="pt-3 border-t border-blush/30 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 rounded-lg text-brown hover:text-rose hover:bg-blush-light transition-colors"
                    title="Edit Category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteCandidate(cat)}
                    className="p-1.5 rounded-lg text-brown hover:text-rose-dark hover:bg-rose-light transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add/Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-brown-dark/50 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-cream rounded-3xl p-6 sm:p-8 border border-blush/70 shadow-soft-lg z-10 space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-ivory text-brown hover:bg-blush-light flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif text-2xl text-brown-dark font-medium">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h3>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-light border border-rose/30 text-rose-dark text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-brown-dark mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crochet Keychains"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-blush/60 text-sm text-brown-dark focus:outline-none focus:border-rose"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-brown-dark mb-1">Tag / Pill</label>
                  <input
                    type="text"
                    placeholder="e.g. Small Wonders"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
                  />
                </div>
                <div>
                  <label className="block font-medium text-brown-dark mb-1">Item Count Label</label>
                  <input
                    type="text"
                    placeholder="e.g. 14 items"
                    value={formData.itemCount}
                    onChange={(e) => setFormData({ ...formData, itemCount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-brown-dark mb-1">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Appears on homepage category cards..."
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-medium text-brown-dark">Cover Image</label>
                  <label className="cursor-pointer text-[11px] text-rose font-medium hover:underline inline-flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Image URL or upload a file..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-blush/40">
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
                  {submitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-brown-dark/50 backdrop-blur-xs" onClick={() => setDeleteCandidate(null)} />
          <div className="relative w-full max-w-md bg-cream rounded-3xl p-6 sm:p-8 border border-blush shadow-soft-lg z-10 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-light text-rose-dark flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-serif text-xl text-brown-dark font-medium">Delete Category?</h4>
              <p className="text-xs text-brown/70 font-light">
                Are you sure you want to delete <strong className="text-brown-dark">"{deleteCandidate.name}"</strong>?
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
                className="flex-1 py-2.5 rounded-full bg-rose-dark text-white text-xs font-medium hover:bg-rose"
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
