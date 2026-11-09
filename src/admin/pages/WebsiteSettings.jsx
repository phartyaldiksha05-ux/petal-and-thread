import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Check, Upload, Save, Sparkles, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useSiteData } from '../../context/SiteDataContext';

export function WebsiteSettings() {
  const { refreshData } = useSiteData();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    brandName: 'Petal & Thread',
    legalName: 'Petal & Thread Atelier Ltd.',
    tagline: 'Handcrafted Treasures & Bespoke Fashion Atelier',
    taglineShort: 'Little things, made with a lot of love.',
    description: 'A sanctuary of handcrafted crochet wonders, delicate botanical hair accessories, bespoke feminine tailoring, and romantic fashion artwork.',
    contactEmail: 'atelier@petalandthread.com',
    ordersEmail: 'custom@petalandthread.com',
    phone: '+1 (555) 382-7432',
    whatsappNumber: '15553827432',
    whatsappDisplay: '+1 (555) 382-7432',
    instagramUrl: 'https://instagram.com/petalandthread',
    pinterestUrl: 'https://pinterest.com/petalandthread',
    heroHeadline: 'Little things, made with a lot of love.',
    heroDescription: 'Discover a world of handmade treasures, thoughtful fashion and beautiful creations.',
    heroBadge: 'Bespoke & Handcrafted in Small Batches',
    heroImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85',
    logoUrl: ''
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await api.settings.get();
        if (res && res.brandName) {
          setFormData(prev => ({ ...prev, ...res }));
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleHeroUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHero(true);
    try {
      const res = await api.upload.single(file);
      setFormData(prev => ({ ...prev, heroImage: res.url }));
    } catch (err) {
      setErrorMsg(err.message || 'Image upload failed.');
    } finally {
      setUploadingHero(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const res = await api.upload.single(file);
      setFormData(prev => ({ ...prev, logoUrl: res.url }));
    } catch (err) {
      setErrorMsg(err.message || 'Logo upload failed.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    try {
      await api.settings.update(formData);
      setSuccessMsg('Website settings saved! Public storefront is updated live.');
      refreshData();
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="w-8 h-8 border-2 border-rose/30 border-t-rose rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-brown/70">Loading website configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-serif text-2xl text-brown-dark font-medium">
          Global Website & Brand Settings
        </h2>
        <p className="text-xs text-brown/70 font-light">
          Update the brand name, contact channels, WhatsApp enquiry routing, and homepage hero campaign.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-sage-light border border-sage/40 text-sage-dark text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-sage-dark" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-light border border-rose/30 text-rose-dark text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-dark" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Brand Identity Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-cream border border-blush/60 shadow-soft space-y-4">
          <h3 className="font-serif text-lg text-brown-dark font-medium pb-2 border-b border-blush/40 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose" />
            <span>Brand Identity & Legal Profile</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-brown-dark mb-1">Brand Name *</label>
              <input
                type="text"
                required
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-blush/60 text-sm font-medium text-brown-dark focus:outline-none focus:border-rose"
              />
              <p className="text-[10px] text-brown-light mt-1">Changes brand name across public site & navigation.</p>
            </div>

            <div>
              <label className="block font-medium text-brown-dark mb-1">Legal Company Name</label>
              <input
                type="text"
                value={formData.legalName}
                onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-brown-dark mb-1">Main Atelier Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
              />
            </div>

            <div>
              <label className="block font-medium text-brown-dark mb-1">Short Tagline (Mobile)</label>
              <input
                type="text"
                value={formData.taglineShort}
                onChange={(e) => setFormData({ ...formData, taglineShort: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-medium text-brown-dark mb-1">Brand Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
            />
          </div>

          {/* Logo Upload */}
          <div className="pt-2 border-t border-blush/30 text-xs">
            <div className="flex justify-between items-center mb-1">
              <label className="font-medium text-brown-dark">Optional Graphic Logo Image</label>
              <label className="cursor-pointer text-[11px] text-rose font-medium hover:underline inline-flex items-center gap-1">
                <Upload className="w-3 h-3" />
                <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={uploadingLogo}
                />
              </label>
            </div>
            <input
              type="text"
              placeholder="Leave empty for elegant text-based brand mark, or provide logo URL..."
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark"
            />
          </div>
        </div>

        {/* Contact & WhatsApp Channels */}
        <div className="p-6 sm:p-8 rounded-3xl bg-cream border border-blush/60 shadow-soft space-y-4">
          <h3 className="font-serif text-lg text-brown-dark font-medium pb-2 border-b border-blush/40 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-rose" />
            <span>Contact, WhatsApp & Social Links</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-brown-dark mb-1">WhatsApp Number (For Direct Links) *</label>
              <input
                type="text"
                required
                placeholder="e.g. 15553827432 (digits only)"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-blush/60 text-xs font-medium text-brown-dark focus:outline-none focus:border-rose"
              />
              <p className="text-[10px] text-brown-light mt-1">Country code + number without plus sign (e.g. 15553827432)</p>
            </div>

            <div>
              <label className="block font-medium text-brown-dark mb-1">WhatsApp Display Text</label>
              <input
                type="text"
                placeholder="e.g. +1 (555) 382-7432"
                value={formData.whatsappDisplay}
                onChange={(e) => setFormData({ ...formData, whatsappDisplay: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-brown-dark mb-1">Primary Studio Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
              />
            </div>

            <div>
              <label className="block font-medium text-brown-dark mb-1">Studio Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-brown-dark mb-1">Instagram URL</label>
              <input
                type="text"
                value={formData.instagramUrl}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
              />
            </div>

            <div>
              <label className="block font-medium text-brown-dark mb-1">Pinterest URL</label>
              <input
                type="text"
                value={formData.pinterestUrl}
                onChange={(e) => setFormData({ ...formData, pinterestUrl: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
              />
            </div>
          </div>
        </div>

        {/* Homepage Hero Campaign */}
        <div className="p-6 sm:p-8 rounded-3xl bg-cream border border-blush/60 shadow-soft space-y-4">
          <h3 className="font-serif text-lg text-brown-dark font-medium pb-2 border-b border-blush/40 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-rose" />
            <span>Homepage Hero Campaign</span>
          </h3>

          <div className="text-xs">
            <label className="block font-medium text-brown-dark mb-1">Hero Main Headline</label>
            <input
              type="text"
              value={formData.heroHeadline}
              onChange={(e) => setFormData({ ...formData, heroHeadline: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-blush/60 text-sm text-brown-dark focus:outline-none focus:border-rose"
            />
          </div>

          <div className="text-xs">
            <label className="block font-medium text-brown-dark mb-1">Hero Sub-description</label>
            <textarea
              rows={2}
              value={formData.heroDescription}
              onChange={(e) => setFormData({ ...formData, heroDescription: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
            />
          </div>

          <div className="text-xs">
            <div className="flex justify-between items-center mb-1">
              <label className="font-medium text-brown-dark">Campaign Editorial Hero Image</label>
              <label className="cursor-pointer text-[11px] text-rose font-medium hover:underline inline-flex items-center gap-1">
                <Upload className="w-3 h-3" />
                <span>{uploadingHero ? 'Uploading...' : 'Upload New Hero Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleHeroUpload}
                  className="hidden"
                  disabled={uploadingHero}
                />
              </label>
            </div>
            <input
              type="text"
              value={formData.heroImage}
              onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark"
            />

            {formData.heroImage && (
              <div className="mt-3 relative aspect-[21/9] rounded-2xl overflow-hidden border border-blush/60 bg-ivory">
                <img
                  src={formData.heroImage}
                  alt="Hero Preview"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 bg-cream/90 text-[10px] font-semibold px-2 py-0.5 rounded text-brown-dark">
                  Live Preview
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-full bg-rose text-white hover:bg-rose-dark font-medium text-sm transition-all shadow-delicate flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Live Changes...' : 'Save All Website Settings'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
