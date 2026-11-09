import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SiteDataProvider } from './context/SiteDataContext';
import { WishlistProvider } from './context/WishlistContext';

// Public Customer-Facing Components
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Categories } from './components/Categories';
import { FeaturedProducts } from './components/FeaturedProducts';
import { FashionStudio } from './components/FashionStudio';
import { ArtGallery } from './components/ArtGallery';
import { About } from './components/About';
import { CustomOrders } from './components/CustomOrders';
import { InstagramGallery } from './components/InstagramGallery';
import { Footer } from './components/Footer';
import { ProductModal } from './components/common/ProductModal';
import { WishlistDrawer } from './components/common/WishlistDrawer';
import { CustomOrderModal } from './components/common/CustomOrderModal';
import { Toast } from './components/common/Toast';

// Private Admin Dashboard Components
import { AdminLogin } from './admin/pages/AdminLogin';
import { AdminLayout } from './admin/components/AdminLayout';
import { ProtectedRoute } from './admin/components/ProtectedRoute';
import { Overview } from './admin/pages/Overview';
import { ProductManagement } from './admin/pages/ProductManagement';
import { CategoryManagement } from './admin/pages/CategoryManagement';
import { FashionManagement } from './admin/pages/FashionManagement';
import { ArtGalleryManagement } from './admin/pages/ArtGalleryManagement';
import { OrderManagement } from './admin/pages/OrderManagement';
import { EnquiryManagement } from './admin/pages/EnquiryManagement';
import { InventoryManagement } from './admin/pages/InventoryManagement';
import { WebsiteSettings } from './admin/pages/WebsiteSettings';

// Public Customer Boutique View (Preserved completely)
function PublicWebsite() {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  const handleSelectCategory = (categoryId) => {
    setSelectedCategoryFilter(categoryId);
  };

  const handleClearFilter = () => {
    setSelectedCategoryFilter('all');
  };

  return (
    <div className="min-h-screen bg-ivory text-brown-dark flex flex-col font-sans selection:bg-blush selection:text-brown-dark">
      {/* A. Navigation Bar */}
      <Navbar />

      <main className="flex-grow">
        {/* B. Hero Section */}
        <Hero />

        {/* C. Shop by Category */}
        <Categories
          activeCategory={selectedCategoryFilter}
          onSelectCategory={handleSelectCategory}
        />

        {/* D. Featured Products */}
        <FeaturedProducts
          selectedCategoryFilter={selectedCategoryFilter}
          onClearFilter={handleClearFilter}
        />

        {/* E. Fashion Studio */}
        <FashionStudio />

        {/* F. Art Gallery */}
        <ArtGallery />

        {/* G. Meet the Creator */}
        <About />

        {/* H. Custom Orders */}
        <CustomOrders />

        {/* I. Instagram Gallery */}
        <InstagramGallery />
      </main>

      {/* J. Footer */}
      <Footer onCategoryClick={handleSelectCategory} />

      {/* Interactive Drawers, Modals & Toast */}
      <ProductModal />
      <WishlistDrawer />
      <CustomOrderModal />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SiteDataProvider>
        <WishlistProvider>
          <BrowserRouter>
            <Routes>
              {/* 1. Public Customer-Facing Boutique Website */}
              <Route path="/" element={<PublicWebsite />} />

              {/* 2. Admin Authentication Portal */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* 3. Protected Owner/Admin Dashboard */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/overview" replace />} />
                <Route path="overview" element={<Overview />} />
                <Route path="products" element={<ProductManagement />} />
                <Route path="categories" element={<CategoryManagement />} />
                <Route path="fashion" element={<FashionManagement />} />
                <Route path="art-gallery" element={<ArtGalleryManagement />} />
                <Route path="orders" element={<OrderManagement />} />
                <Route path="enquiries" element={<EnquiryManagement />} />
                <Route path="inventory" element={<InventoryManagement />} />
                <Route path="settings" element={<WebsiteSettings />} />
                <Route path="*" element={<Navigate to="/admin/overview" replace />} />
              </Route>

              {/* Fallback to Public Storefront */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </WishlistProvider>
      </SiteDataProvider>
    </AuthProvider>
  );
}
