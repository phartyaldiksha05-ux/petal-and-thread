import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, AlertCircle, X, Upload, Star, Palette } from 'lucide-react';
import { api } from '../../services/api';
import { useSiteData } from '../../context/SiteDataContext';

export function ArtGalleryManagement() {
  const { refreshData } = useSiteData();
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArt, setEditingArt] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const initialForm = {
    title: '',
    description: '',
    category: 'Fashion Illustration',
    medium: 'Watercolor & Gouache',
    year: '2026',
    dimensions: '12" × 16"',
    image: '',
    isFeatured: true
  };
  const [formData, setFormData] = useState(initialForm);

  const loadArtworks = async () => {
    try {
      setLoading(true);
      const res = await api.artGallery.getAll();
      setArtworks(res || []);
    } catch (err) {
      console.error('Error loading art gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArtworks();
  }, []);

  const openCreateModal = () => {
    setEditingArt(null);
    setFormData(initialForm);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (art) => {
    setEditingArt(art);
    setFormData({
      title: art.title || '',
      description: art.description || '',
      category: art.category || 'Fashion Illustration',
      medium: art.medium || 'Watercolor & Gouache',
      year: art.year || '2026',
      dimensions: art.dimensions || '',
      image: art.image || '',
      isFeatured: !!art.isFeatured
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
      const payload = {
        ...formData,
        image: formData.image || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=85'
      };

      if (editingArt) {
        await api.artGallery.update(editingArt.id, payload);
        setSuccessMsg(`Artwork "${payload.title}" updated.`);
      } else {
        await api.artGallery.create(payload);
        setSuccessMsg(`Artwork "${payload.title}" added to gallery.`);
      }

      setIsModalOpen(false);
      await loadArtworks();
      refreshData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save artwork.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await api.artGallery.delete(deleteCandidate.id);
      setSuccessMsg(`Artwork deleted.`);
      setDeleteCandidate(null);
      await loadArtworks();
      refreshData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete artwork.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-brown-dark font-medium">
            Art Gallery & Fashion Illustrations
          </h2>
          <p className="text-xs text-brown/70 font-light">
            Upload fashion sketches, digital watercolor gouache studies, and archival prints.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose text-white hover:bg-rose-dark font-medium text-xs sm:text-sm transition-colors shadow-delicate"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Artwork</span>
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
          <p className="text-xs text-brown/70">Loading artwork...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map((art) => (
            <div
              key={art.id}
              className="bg-cream rounded-3xl overflow-hidden border border-blush/60 shadow-soft flex flex-col justify-between"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-ivory">
                <img
                  src={art.image}
                  alt={art.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-cream/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-medium text-brown-dark border border-blush/40">
                  {art.category}
                </span>
                {art.isFeatured && (
                  <span className="absolute top-3 right-3 bg-rose text-white p-1 rounded-full shadow-xs">
                    <Star className="w-3.5 h-3.5 fill-white" />
                  </span>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-serif text-lg text-brown-dark font-medium">
                    {art.title}
                  </h3>
                  <p className="text-[11px] text-rose font-medium mt-0.5">
                    {art.medium} • {art.year}
                  </p>
                  <p className="text-xs text-brown/70 line-clamp-2 mt-1.5 font-light">
                    {art.description}
                  </p>
                  {art.dimensions && (
                    <p className="text-[11px] text-brown-light mt-1">
                      Size: {art.dimensions}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-blush/30 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(art)}
                    className="p-1.5 rounded-lg text-brown hover:text-rose hover:bg-blush-light transition-colors"
                    title="Edit Artwork"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteCandidate(art)}
                    className="p-1.5 rounded-lg text-brown hover:text-rose-dark hover:bg-rose-light transition-colors"
                    title="Delete Artwork"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Artwork Modal */}
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
              {editingArt ? 'Edit Artwork' : 'Upload Artwork'}
            </h3>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-light border border-rose/30 text-rose-dark text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-brown-dark mb-1">Artwork Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Botanical Dresser"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-blush/60 text-sm text-brown-dark focus:outline-none focus:border-rose"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-brown-dark mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Fashion Illustration"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
                  />
                </div>
                <div>
                  <label className="block font-medium text-brown-dark mb-1">Medium</label>
                  <input
                    type="text"
                    placeholder="e.g. Watercolor & Gouache"
                    value={formData.medium}
                    onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-brown-dark mb-1">Year / Date</label>
                  <input
                    type="text"
                    placeholder="2026"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
                  />
                </div>
                <div>
                  <label className="block font-medium text-brown-dark mb-1">Dimensions</label>
                  <input
                    type="text"
                    placeholder="12 x 16 inches"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-brown-dark mb-1">Description / Curatorial Note</label>
                <textarea
                  rows={2}
                  placeholder="Inspiration and materials note..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-medium text-brown-dark">Artwork Image</label>
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
                  placeholder="Image URL or upload..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featuredArtCheck"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded text-rose"
                />
                <label htmlFor="featuredArtCheck" className="text-xs font-medium text-brown-dark cursor-pointer">
                  Feature in main Art Gallery showcase
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
                  {submitting ? 'Saving...' : editingArt ? 'Save Changes' : 'Upload Artwork'}
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
              <h4 className="font-serif text-xl text-brown-dark font-medium">Delete Artwork?</h4>
              <p className="text-xs text-brown/70 font-light">
                Are you sure you want to delete <strong className="text-brown-dark">"{deleteCandidate.title}"</strong>?
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
