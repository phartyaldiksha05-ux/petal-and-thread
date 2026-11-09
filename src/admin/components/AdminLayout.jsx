import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Dynamic titles based on route
  const getHeaderInfo = () => {
    const path = location.pathname;
    if (path.includes('products')) return { title: 'Product Catalog Management', subtitle: 'Create, edit, upload photos, and set variants & stock' };
    if (path.includes('categories')) return { title: 'Collections & Categories', subtitle: 'Manage boutique departments and card presentations' };
    if (path.includes('fashion')) return { title: 'Fashion Atelier Portfolio', subtitle: 'Couture garments, atelier sketches, fabrics & custom tailoring' };
    if (path.includes('art-gallery')) return { title: 'Art Gallery & Illustrations', subtitle: 'Showcase fashion illustrations, gouache studies & prints' };
    if (path.includes('orders')) return { title: 'Client Orders & Fulfillment', subtitle: 'Track handmade orders, payment states, and crafting stages' };
    if (path.includes('enquiries')) return { title: 'Custom Commissions & Enquiries', subtitle: 'Review personalized requests from public website customers' };
    if (path.includes('inventory')) return { title: 'Stock & Inventory Control', subtitle: 'Monitor quantities, low stock notices, and availability' };
    if (path.includes('settings')) return { title: 'Global Website Settings', subtitle: 'Update brand identity, hero campaign, contact & social links' };
    return { title: 'Atelier Overview', subtitle: 'Real-time studio activity, sales, orders, and inquiries' };
  };

  const { title, subtitle } = getHeaderInfo();

  return (
    <div className="min-h-screen bg-ivory flex text-brown-dark font-sans selection:bg-blush selection:text-brown-dark">
      <AdminSidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <AdminHeader
          onOpenMobile={() => setMobileOpen(true)}
          title={title}
          subtitle={subtitle}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
