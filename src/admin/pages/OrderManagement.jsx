import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, Check, Clock, Eye, AlertCircle, X, Truck, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

export function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const statusOptions = ['Pending', 'Processing', 'Crafting', 'Shipped', 'Delivered', 'Cancelled'];
  const paymentOptions = ['Paid', 'Pending', 'Refunded'];

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.orders.getAll();
      setOrders(res || []);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus, paymentStatus, notes) => {
    setUpdatingId(orderId);
    try {
      await api.orders.updateStatus(orderId, {
        orderStatus: newStatus,
        paymentStatus,
        notes
      });
      setSuccessMsg(`Order updated to ${newStatus}.`);
      await loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({
          ...prev,
          orderStatus: newStatus,
          paymentStatus: paymentStatus || prev.paymentStatus,
          notes: notes !== undefined ? notes : prev.notes
        }));
      }
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to update order status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.orderStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-brown-dark font-medium">
            Order Fulfillment & Client Purchases
          </h2>
          <p className="text-xs text-brown/70 font-light">
            Monitor client orders, manage crafting stages, update delivery status, and inspect items.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-sage-light border border-sage/40 text-sage-dark text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-sage-dark" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-cream border border-blush/60 shadow-soft flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-brown-light" />
          <input
            type="text"
            placeholder="Search by order #, client name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-ivory border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === 'all'
                ? 'bg-rose text-white shadow-xs'
                : 'bg-ivory border border-blush/60 text-brown hover:bg-blush-light'
            }`}
          >
            All Orders ({orders.length})
          </button>
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-rose text-white shadow-xs'
                  : 'bg-ivory border border-blush/60 text-brown hover:bg-blush-light'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-cream rounded-3xl border border-blush/60 shadow-soft overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-rose/30 border-t-rose rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-brown/70">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-10 h-10 text-rose/50 mx-auto mb-2" />
            <p className="text-sm font-serif text-brown-dark">No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brown-dark">
              <thead className="bg-ivory/80 border-b border-blush/40 text-[11px] uppercase tracking-wider text-brown-light font-medium">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Order ID</th>
                  <th className="py-3.5 px-4">Client Name</th>
                  <th className="py-3.5 px-4">Items & Quantity</th>
                  <th className="py-3.5 px-4">Total Price</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blush/30">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-ivory/50 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold text-brown-dark whitespace-nowrap">
                      {o.orderNumber || o.id}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-medium text-brown-dark">{o.customerName}</p>
                      <p className="text-[10px] text-brown/60">{o.customerEmail}</p>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="truncate">
                        {o.products?.map((p, idx) => (
                          <span key={idx}>
                            {p.quantity || 1}x {p.name}
                            {p.variant ? ` (${p.variant})` : ''}
                            {idx < o.products.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-rose-dark whitespace-nowrap">
                      ${o.totalPrice}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          o.paymentStatus === 'Paid'
                            ? 'bg-sage-light text-sage-dark'
                            : 'bg-ivory border border-blush text-brown'
                        }`}
                      >
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={o.orderStatus}
                        disabled={updatingId === o.id}
                        onChange={(e) => handleUpdateStatus(o.id, e.target.value, o.paymentStatus, o.notes)}
                        className={`text-xs font-medium rounded-xl px-2.5 py-1 border focus:outline-none ${
                          o.orderStatus === 'Delivered'
                            ? 'bg-sage-light border-sage/40 text-sage-dark'
                            : o.orderStatus === 'Shipped'
                            ? 'bg-blush-light border-blush text-rose-dark'
                            : o.orderStatus === 'Crafting'
                            ? 'bg-cream border-rose/50 text-rose font-semibold'
                            : 'bg-white border-blush/60 text-brown-dark'
                        }`}
                      >
                        {statusOptions.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-brown/70 text-[11px]">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="p-1.5 rounded-lg text-brown hover:text-rose hover:bg-blush-light transition-colors"
                        title="View Full Order Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-brown-dark/50 backdrop-blur-xs" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-lg bg-cream rounded-3xl p-6 sm:p-8 border border-blush/70 shadow-soft-lg z-10 space-y-5">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-ivory text-brown hover:bg-blush-light flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-blush/40 pb-4">
              <span className="text-xs uppercase tracking-wider text-rose font-semibold">
                Order #{selectedOrder.orderNumber}
              </span>
              <h3 className="font-serif text-2xl text-brown-dark font-medium mt-0.5">
                Client: {selectedOrder.customerName}
              </h3>
              <p className="text-xs text-brown/70 font-light">
                {selectedOrder.customerEmail} • {selectedOrder.customerPhone || 'No phone provided'}
              </p>
              {selectedOrder.shippingAddress && (
                <p className="text-xs text-brown/80 mt-1 font-medium">
                  Delivery Address: {selectedOrder.shippingAddress}
                </p>
              )}
            </div>

            {/* Products List */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-brown-dark uppercase tracking-wider">
                Purchased Pieces
              </h4>
              <div className="bg-ivory/70 p-3 rounded-2xl border border-blush/40 space-y-2">
                {selectedOrder.products?.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-medium text-brown-dark">
                        {p.quantity || 1}× {p.name}
                      </p>
                      {p.variant && (
                        <p className="text-[11px] text-rose font-cormorant italic">
                          Variant: {p.variant}
                        </p>
                      )}
                    </div>
                    <span className="font-semibold text-rose-dark">
                      ${(p.price || 0) * (p.quantity || 1)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-blush/40 pt-2 flex justify-between items-baseline text-sm">
                  <span className="font-medium text-brown-dark">Total Order Value:</span>
                  <span className="font-serif font-bold text-lg text-brown-dark">
                    ${selectedOrder.totalPrice}
                  </span>
                </div>
              </div>
            </div>

            {/* Status & Notes Form */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-brown-dark mb-1">
                    Order Status
                  </label>
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) =>
                      handleUpdateStatus(selectedOrder.id, e.target.value, selectedOrder.paymentStatus, selectedOrder.notes)
                    }
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark"
                  >
                    {statusOptions.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-brown-dark mb-1">
                    Payment Status
                  </label>
                  <select
                    value={selectedOrder.paymentStatus}
                    onChange={(e) =>
                      handleUpdateStatus(selectedOrder.id, selectedOrder.orderStatus, e.target.value, selectedOrder.notes)
                    }
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark"
                  >
                    {paymentOptions.map((pm) => (
                      <option key={pm} value={pm}>
                        {pm}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-brown-dark mb-1">
                  Atelier Notes & Tracking
                </label>
                <textarea
                  rows={2}
                  value={selectedOrder.notes || ''}
                  placeholder="Tracking number, ribbon color preferences, or packing notes..."
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() =>
                    handleUpdateStatus(
                      selectedOrder.id,
                      selectedOrder.orderStatus,
                      selectedOrder.paymentStatus,
                      selectedOrder.notes
                    )
                  }
                  className="px-5 py-2 rounded-full bg-rose text-white text-xs font-medium hover:bg-rose-dark shadow-delicate"
                >
                  Save Notes & Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
