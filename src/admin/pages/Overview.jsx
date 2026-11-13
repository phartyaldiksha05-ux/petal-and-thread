import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  IndianRupee,
  Package,
  MessageSquareQuote,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import { formatPrice } from '../../utils/currency';

export function Overview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    productsCount: 0,
    lowStockCount: 0,
    ordersCount: 0,
    totalRevenue: 0,
    enquiriesCount: 0,
    newEnquiriesCount: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [products, orders, enquiries] = await Promise.all([
          api.products.getAll(),
          api.orders.getAll().catch(() => []),
          api.enquiries.getAll().catch(() => [])
        ]);

        const lowStock = (products || []).filter(p => p.stock !== undefined && p.stock <= 5);
        const totalSales = (orders || []).reduce((acc, o) => acc + (Number(o.totalPrice) || 0), 0);
        const newEnqs = (enquiries || []).filter(e => e.status === 'New');

        setStats({
          productsCount: (products || []).length,
          lowStockCount: lowStock.length,
          ordersCount: (orders || []).length,
          totalRevenue: totalSales,
          enquiriesCount: (enquiries || []).length,
          newEnquiriesCount: newEnqs.length
        });

        setRecentOrders((orders || []).slice(0, 5));
        setRecentEnquiries((enquiries || []).slice(0, 5));
        setLowStockItems(lowStock);
      } catch (err) {
        console.error('Error loading dashboard overview:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-2 border-rose/30 border-t-rose rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-brown/70 font-light">Loading atelier metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-cream via-cream to-blush-light/50 border border-blush/60 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-rose text-xs uppercase tracking-wider font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Atelier Status • Live & Operational</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-brown-dark font-medium">
            Welcome to the Creator Studio
          </h2>
          <p className="text-xs sm:text-sm text-brown/75 font-light max-w-xl">
            Manage your boutique creations, respond to bespoke inquiries, and curate slow fashion designs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="px-5 py-2.5 rounded-full bg-rose text-white hover:bg-rose-dark text-xs font-medium transition-colors shadow-delicate flex items-center gap-1.5"
          >
            <span>+ Add New Product</span>
          </Link>
          <Link
            to="/admin/enquiries"
            className="px-5 py-2.5 rounded-full bg-ivory border border-blush text-brown-dark hover:bg-blush-light text-xs font-medium transition-colors"
          >
            <span>Review Inquiries</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Sales */}
        <div className="p-6 rounded-3xl bg-cream border border-blush/60 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-brown-light uppercase tracking-wider">
              Total Revenue
            </p>
            <h3 className="font-serif text-2xl sm:text-3xl text-brown-dark font-medium mt-1">
              {formatPrice(stats.totalRevenue)}
            </h3>
            <p className="text-[11px] text-sage-dark flex items-center gap-1 mt-1 font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>{stats.ordersCount} total orders</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blush-light text-rose flex items-center justify-center flex-shrink-0">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        {/* Client Orders */}
        <div className="p-6 rounded-3xl bg-cream border border-blush/60 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-brown-light uppercase tracking-wider">
              Active Orders
            </p>
            <h3 className="font-serif text-2xl sm:text-3xl text-brown-dark font-medium mt-1">
              {stats.ordersCount}
            </h3>
            <p className="text-[11px] text-brown/70 mt-1 font-light">
              Crafting & fulfillment
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sage-light text-sage-dark flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Custom Inquiries */}
        <div className="p-6 rounded-3xl bg-cream border border-blush/60 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-brown-light uppercase tracking-wider">
              Custom Inquiries
            </p>
            <h3 className="font-serif text-2xl sm:text-3xl text-brown-dark font-medium mt-1">
              {stats.enquiriesCount}
            </h3>
            <p className="text-[11px] text-rose font-medium mt-1">
              {stats.newEnquiriesCount} awaiting review
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-light text-rose flex items-center justify-center flex-shrink-0">
            <MessageSquareQuote className="w-6 h-6" />
          </div>
        </div>

        {/* Products in Catalog */}
        <div className="p-6 rounded-3xl bg-cream border border-blush/60 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-brown-light uppercase tracking-wider">
              Boutique Catalog
            </p>
            <h3 className="font-serif text-2xl sm:text-3xl text-brown-dark font-medium mt-1">
              {stats.productsCount}
            </h3>
            <p className={`text-[11px] font-medium mt-1 ${stats.lowStockCount > 0 ? 'text-rose-dark' : 'text-sage-dark'}`}>
              {stats.lowStockCount > 0 ? `${stats.lowStockCount} low in stock` : 'Healthy stock levels'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-ivory border border-blush text-brown-dark flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Low Stock Warning Banner if any */}
      {lowStockItems.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-light/50 border border-rose/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose flex-shrink-0" />
            <div>
              <p className="text-xs sm:text-sm font-medium text-brown-dark">
                Low Inventory Notice: {lowStockItems.length} products have 5 or fewer items remaining.
              </p>
              <p className="text-xs text-brown/70 font-light">
                {lowStockItems.map(i => `${i.name} (${i.stock} left)`).join(', ')}
              </p>
            </div>
          </div>
          <Link
            to="/admin/inventory"
            className="px-4 py-1.5 rounded-full bg-rose text-white text-xs font-medium hover:bg-rose-dark transition-colors flex-shrink-0"
          >
            Manage Stock
          </Link>
        </div>
      )}

      {/* Recent Activity Split: Orders & Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Orders (7 cols) */}
        <div className="lg:col-span-7 bg-cream rounded-3xl border border-blush/60 p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-blush/40">
            <div>
              <h3 className="font-serif text-lg text-brown-dark font-medium">
                Recent Client Orders
              </h3>
              <p className="text-xs text-brown/60">
                Latest transactions from boutique clients
              </p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-medium text-rose hover:text-rose-dark flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-brown/60 py-8 text-center font-light">
              No orders recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-3.5 rounded-2xl bg-ivory/70 border border-blush/40 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-brown-dark">
                        {order.orderNumber}
                      </span>
                      <span className="text-brown-light">•</span>
                      <span className="text-brown/80">{order.customerName}</span>
                    </div>
                    <p className="text-brown-light text-[11px]">
                      {order.products.length} {order.products.length === 1 ? 'item' : 'items'} • {formatPrice(order.totalPrice)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        order.orderStatus === 'Delivered'
                          ? 'bg-sage-light text-sage-dark'
                          : order.orderStatus === 'Shipped'
                          ? 'bg-blush-light text-rose-dark'
                          : order.orderStatus === 'Crafting'
                          ? 'bg-cream border border-rose/40 text-rose'
                          : 'bg-ivory border border-blush text-brown'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                    <Link
                      to="/admin/orders"
                      className="text-brown-light hover:text-rose"
                      title="Inspect order"
                    >
                      →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Custom Enquiries (5 cols) */}
        <div className="lg:col-span-5 bg-cream rounded-3xl border border-blush/60 p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-blush/40">
            <div>
              <h3 className="font-serif text-lg text-brown-dark font-medium">
                New Custom Requests
              </h3>
              <p className="text-xs text-brown/60">
                Inquiries from website customers
              </p>
            </div>
            <Link
              to="/admin/enquiries"
              className="text-xs font-medium text-rose hover:text-rose-dark flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentEnquiries.length === 0 ? (
            <p className="text-xs text-brown/60 py-8 text-center font-light">
              No custom inquiries pending.
            </p>
          ) : (
            <div className="space-y-3">
              {recentEnquiries.map((enq) => (
                <div
                  key={enq.id}
                  className="p-3.5 rounded-2xl bg-ivory/70 border border-blush/40 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-brown-dark">
                      {enq.customerName}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-wider ${
                        enq.status === 'New'
                          ? 'bg-rose text-white'
                          : 'bg-blush-light text-rose'
                      }`}
                    >
                      {enq.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-rose font-medium">
                    {enq.creationType}
                  </p>
                  {enq.details && (
                    <p className="text-brown/75 line-clamp-2 text-[11px] font-light">
                      {enq.details}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
