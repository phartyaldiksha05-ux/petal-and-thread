import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, AlertCircle, X, Upload, Scissors, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { useSiteData } from '../../context/SiteDataContext';

export function FashionManagement() {
  const { refreshData } = useSiteData();
  const [fashionItems, setFashionItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingSketch, setUploadingSketch] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const initialForm = {
    title: '',
    description: '',
    category: 'Dresses & Silhouettes',
    photos: [''],
    sketches: [''],
    fabrics: '100% GOTS Organic Flax Linen, Cotton Lace',
    sizes: 'Made to Measure (XS to 3XL)',
    availableForCustom: true
  };
  const [formData, setFormData] = useState(initialForm);

  const loadFashion = async () => {
    try {
      setLoading(true);
      const res = await api.fashion.getAll();
      setFashionItems(res || []);
    } catch (err) {
      console.error('Error loading fashion portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFashion();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData(initialForm);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      category: item.category || 'Dresses & Silhouettes',
      photos: Array.isArray(item.photos) && item.photos.length > 0 ? item.photos : [''],
      sketches: Array.isArray(item.sketches) && item.sketches.length > 0 ? item.sketches : [''],
      fabrics: item.fabrics || '',
      sizes: item.sizes || '',
      availableForCustom: item.availableForCustom !== undefined ? !!item.availableForCustom : true
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const res = await api.upload.single(file);
      setFormData(prev => ({
        ...prev,
        photos: prev.photos.filter(p => p.trim() !== '').concat(res.url)
      }));
    } catch (err) {
      setErrorMsg(err.message || 'Photo upload failed.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSketchUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSketch(true);
    try {
      const res = await api.upload.single(file);
      setFormData(prev => ({
        ...prev,
        sketches: prev.sketches.filter(s => s.trim() !== '').concat(res.url)
      }));
    } catch (err) {
      setErrorMsg(err.message || 'Sketch upload failed.');
    } finally {
      setUploadingSketch(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const cleanPhotos = formData.photos.filter(p => p && p.trim() !== '');
      const cleanSketches = formData.sketches.filter(s => s && s.trim() !== '');

      const payload = {
        ...formData,
        photos: cleanPhotos.length > 0 ? cleanPhotos : ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85'],
        sketches: cleanSketches
      };

      if (editingItem) {
        await api.fashion.update(editingItem.id, payload);
        setSuccessMsg(`"${payload.title}" updated.`);
      } else {
        await api.fashion.create(payload);
        setSuccessMsg(`"${payload.title}" added to fashion portfolio.`);
      }

      setIsModalOpen(false);
      await loadFashion();
      refreshData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save fashion item.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await api.fashion.delete(deleteCandidate.id);
      setSuccessMsg(`Design removed from portfolio.`);
      setDeleteCandidate(null);
      await loadFashion();
      refreshData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete design.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-brown-dark font-medium">
            Fashion Studio & Atelier Portfolio
          </h2>
          <p className="text-xs text-brown/70 font-light">
            Upload custom garments, watercolor outfit sketches, and bespoke tailoring specs.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose text-white hover:bg-rose-dark font-medium text-xs sm:text-sm transition-colors shadow-delicate"
        >
          <Plus className="w-4 h-4" />
          <span>Add Fashion Design</span>
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
          <p className="text-xs text-brown/70">Loading atelier designs...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fashionItems.map((item) => (
            <div
              key={item.id}
              className="bg-cream rounded-3xl overflow-hidden border border-blush/60 shadow-soft flex flex-col justify-between"
            >
              <div className="grid grid-cols-2 gap-2 bg-ivory p-3">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden relative border border-blush/40">
                  <img
                    src={item.photos?.[0] || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85'}
                    alt="Clothing photograph"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 bg-cream/90 text-[10px] font-semibold px-2 py-0.5 rounded text-brown-dark">
                    Photograph
                  </span>
                </div>
                <div className="aspect-[4/5] rounded-2xl overflow-hidden relative border border-blush/40 bg-white">
                  <img
                    src={item.sketches?.[0] || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80'}
                    alt="Outfit sketch"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 bg-cream/90 text-[10px] font-semibold px-2 py-0.5 rounded text-brown-dark">
                    Sketch
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-rose">
                      {item.category}
                    </span>
                    {item.availableForCustom && (
                      <span className="text-[10px] bg-sage-light text-sage-dark px-2 py-0.5 rounded-full font-medium">
                        Custom Orders Available
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-xl text-brown-dark font-medium mt-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-brown/75 mt-1.5 leading-relaxed font-light">
                    {item.description}
                  </p>

                  <div className="mt-3 pt-3 border-t border-blush/30 space-y-1 text-xs text-brown/70">
                    <p><strong className="text-brown-dark font-medium">Fabrics:</strong> {item.fabrics}</p>
                    <p><strong className="text-brown-dark font-medium">Sizing:</strong> {item.sizes}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-blush/30 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg text-brown hover:text-rose hover:bg-blush-light transition-colors"
                    title="Edit design"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteCandidate(item)}
                    className="p-1.5 rounded-lg text-brown hover:text-rose-dark hover:bg-rose-light transition-colors"
                    title="Delete design"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Fashion Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-brown-dark/50 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-xl bg-cream rounded-3xl p-6 sm:p-8 border border-blush/70 shadow-soft-lg z-10 max-h-[90vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-ivory text-brown hover:bg-blush-light flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif text-2xl text-brown-dark font-medium">
              {editingItem ? 'Edit Fashion Design' : 'Add Atelier Design'}
            </h3>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-light border border-rose/30 text-rose-dark text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-brown-dark mb-1">Design Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scalloped Linen Reverie Dress"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-blush/60 text-sm text-brown-dark focus:outline-none focus:border-rose"
                />
              </div>

              <div>
                <label className="block font-medium text-brown-dark mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Dresses & Silhouettes, Blouses, Bridal"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
                />
              </div>

              <div>
                <label className="block font-medium text-brown-dark mb-1">Design Description</label>
                <textarea
                  rows={2}
                  placeholder="Inspiration, cut details, hand-crocheted accents..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-brown-dark mb-1">Fabric & Material Details</label>
                  <input
                    type="text"
                    placeholder="e.g. 100% GOTS European Flax Linen"
                    value={formData.fabrics}
                    onChange={(e) => setFormData({ ...formData, fabrics: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
                  />
                </div>
                <div>
                  <label className="block font-medium text-brown-dark mb-1">Size Information</label>
                  <input
                    type="text"
                    placeholder="e.g. Made to Measure (XS to 3XL)"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
                  />
                </div>
              </div>

              {/* Photos & Sketches Upload */}
              <div className="space-y-3 pt-2 border-t border-blush/40">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-medium text-brown-dark">Finished Clothing Photograph</label>
                    <label className="cursor-pointer text-[11px] text-rose font-medium hover:underline inline-flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>{uploadingPhoto ? 'Uploading...' : 'Upload Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={uploadingPhoto}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="Photo URL..."
                    value={formData.photos[0] || ''}
                    onChange={(e) => setFormData({ ...formData, photos: [e.target.value] })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-medium text-brown-dark">Outfit Sketch / Illustration</label>
                    <label className="cursor-pointer text-[11px] text-rose font-medium hover:underline inline-flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>{uploadingSketch ? 'Uploading...' : 'Upload Sketch'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSketchUpload}
                        className="hidden"
                        disabled={uploadingSketch}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="Sketch URL..."
                    value={formData.sketches[0] || ''}
                    onChange={(e) => setFormData({ ...formData, sketches: [e.target.value] })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="customAvailableCheck"
                  checked={formData.availableForCustom}
                  onChange={(e) => setFormData({ ...formData, availableForCustom: e.target.checked })}
                  className="rounded text-rose"
                />
                <label htmlFor="customAvailableCheck" className="text-xs font-medium text-brown-dark cursor-pointer">
                  Available for custom order tailoring requests
                </label>
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
                  {submitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Save Design'}
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
              <h4 className="font-serif text-xl text-brown-dark font-medium">Delete Fashion Design?</h4>
              <p className="text-xs text-brown/70 font-light">
                Are you sure you want to remove <strong className="text-brown-dark">"{deleteCandidate.title}"</strong> from the atelier portfolio?
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
