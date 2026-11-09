import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { brandConfig } from '../config/brandConfig';

const SiteDataContext = createContext(null);

export function SiteDataProvider({ children }) {
  const [settings, setSettings] = useState(brandConfig.brand);
  const [categories, setCategories] = useState(brandConfig.categories);
  const [products, setProducts] = useState(brandConfig.products);
  const [fashionPortfolio, setFashionPortfolio] = useState(brandConfig.fashionStudio);
  const [artGallery, setArtGallery] = useState(brandConfig.artGallery.artworks);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all public collections in parallel
      const [settingsRes, categoriesRes, productsRes, fashionRes, artRes] = await Promise.allSettled([
        api.settings.get(),
        api.categories.getAll(),
        api.products.getAll(),
        api.fashion.getAll(),
        api.artGallery.getAll()
      ]);

      if (settingsRes.status === 'fulfilled' && settingsRes.value) {
        setSettings(prev => ({
          ...prev,
          name: settingsRes.value.brandName || prev.name,
          legalName: settingsRes.value.legalName || prev.legalName,
          tagline: settingsRes.value.tagline || prev.tagline,
          taglineShort: settingsRes.value.taglineShort || prev.taglineShort,
          description: settingsRes.value.description || prev.description,
          whatsappNumber: settingsRes.value.whatsappNumber || prev.whatsappNumber,
          whatsappDisplay: settingsRes.value.whatsappDisplay || prev.whatsappDisplay,
          contactEmail: settingsRes.value.contactEmail || prev.contactEmail,
          heroHeadline: settingsRes.value.heroHeadline || brandConfig.hero.headline,
          heroDescription: settingsRes.value.heroDescription || brandConfig.hero.description,
          heroImage: settingsRes.value.heroImage || brandConfig.hero.images.main,
          heroBadge: settingsRes.value.heroBadge || brandConfig.hero.badge,
          instagramUrl: settingsRes.value.instagramUrl || brandConfig.contact.social.instagram.url
        }));
      }

      if (categoriesRes.status === 'fulfilled' && Array.isArray(categoriesRes.value) && categoriesRes.value.length > 0) {
        // Map backend categories format to public format
        const mappedCats = categoriesRes.value.map(c => ({
          id: c.slug || c.id,
          name: c.name,
          shortDescription: c.shortDescription,
          image: c.image,
          tag: c.tag,
          itemCount: c.itemCount
        }));
        setCategories(mappedCats);
      }

      if (productsRes.status === 'fulfilled' && Array.isArray(productsRes.value) && productsRes.value.length > 0) {
        const mappedProducts = productsRes.value.map(p => ({
          id: p.id,
          name: p.name,
          category: p.categorySlug,
          categoryName: p.categoryName,
          price: p.price,
          originalPrice: p.originalPrice,
          stock: p.stock,
          status: p.status,
          badge: p.badge,
          image: Array.isArray(p.images) && p.images[0] ? p.images[0] : (p.image || 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80'),
          images: p.images || [p.image],
          description: p.description,
          materials: p.materials,
          dimensions: p.dimensions,
          variants: p.variants || [],
          isFeatured: p.isFeatured
        }));
        setProducts(mappedProducts);
      }

      if (fashionRes.status === 'fulfilled' && Array.isArray(fashionRes.value) && fashionRes.value.length > 0) {
        setFashionPortfolio(prev => ({
          ...prev,
          portfolioItems: fashionRes.value,
          editorialImages: fashionRes.value.map(item => ({
            url: item.photos[0] || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85',
            caption: `${item.title} • ${item.fabrics || 'Bespoke'}`
          }))
        }));
      }

      if (artRes.status === 'fulfilled' && Array.isArray(artRes.value) && artRes.value.length > 0) {
        setArtGallery(artRes.value);
      }
    } catch (err) {
      console.warn('Backend live sync notice (using default boutique catalog):', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Submit customer enquiry from website to backend
  const submitCustomEnquiry = async (enquiryData) => {
    try {
      const res = await api.enquiries.create(enquiryData);
      return res;
    } catch (err) {
      console.error('Error submitting enquiry to backend:', err);
      throw err;
    }
  };

  return (
    <SiteDataContext.Provider
      value={{
        settings,
        categories,
        products,
        fashionPortfolio,
        artGallery,
        loading,
        error,
        refreshData: fetchData,
        submitCustomEnquiry
      }}
    >
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData() {
  const context = useContext(SiteDataContext);
  if (!context) {
    throw new Error('useSiteData must be used within a SiteDataProvider');
  }
  return context;
}
