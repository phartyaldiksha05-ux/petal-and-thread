import React, { useState, useEffect } from 'react';
import { Boxes, Search, AlertTriangle, Check, ArrowUpDown, Plus, Minus, Save } from 'lucide-react';
import { api } from '../../services/api';
import { useSiteData } from '../../context/SiteDataContext';

export function InventoryManagement() {
  const { refreshData } = useSiteData();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | low | out | in
  const [updatingId, setUpdatingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.products.getAll();
      setProducts(res || []);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleStockChange = (id, delta) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const newStock = Math.max(0, (p.stock || 0) + delta);
          return {
            ...p,
            stock: newStock,
            status: newStock === 0 ? 'sold_out' : p.status
          };
        }
        return p;
      })
    );
  };

  const handleManualStockInput = (id, value) => {
    const parsed = parseInt(value, 10);
    const newStock = isNaN(parsed) ? 0 : Math.max(0, parsed);
    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            stock: newStock,
            status: newStock === 0 ? 'sold_out' : p.status
          };
        }
        return p;
      })
    );
  };

  const handleSaveItem = async (product) => {
    setUpdatingId(product.id);
    try {
      await api.products.update(product.id, {
        stock: product.stock,
        status: product.stock === 0 ? 'sold_out' : product.status
      });
      setSuccessMsg(`Inventory updated for "${product.name}".`);
      refreshData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to update stock:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStatus = async (product) => {
    const newStatus = product.status === 'sold_out' ? 'available' : 'sold_out';
    setUpdatingId(product.id);
    try {
      await api.products.update(product.id, { status: newStatus });
      setProducts(prev =>
        prev.map(p => (p.id === product.id ? { ...p, status: newStatus } : p))
      );
      setSuccessMsg(`"${product.name}" marked as ${newStatus === 'sold_out' ? 'Sold Out' : 'Available'}.`);
      refreshData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryName?.toLowerCase().includes(search.toLowerCase());

    if (filter === 'low') return matchSearch && p.stock > 0 && p.stock <= 5;
    if (filter === 'out') return matchSearch && (p.stock === 0 || p.status === 'sold_out');
    if (filter === 'in') return matchSearch && p.stock > 5;
    return matchSearch;
  });

  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter(p => p.stock === 0 || p.status === 'sold_out').length;

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-brown-dark font-medium">
            Inventory & Available Stock
          </h2>
          <p className="text-xs text-brown/70 font-light">
            Quickly monitor quantities, adjust stock after batches, and mark creations as available or sold out.
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
            placeholder="Search by creation name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-ivory border border-blush/60 text-xs text-brown-dark focus:outline-none focus:border-rose"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === 'all'
                ? 'bg-rose text-white shadow-xs'
                : 'bg-ivory border border-blush/60 text-brown hover:bg-blush-light'
            }`}
          >
            All Items ({products.length})
          </button>
          <button
            onClick={() => setFilter('low')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === 'low'
                ? 'bg-rose text-white shadow-xs'
                : 'bg-ivory border border-blush/60 text-brown hover:bg-blush-light'
            }`}
          >
            Low Stock ({lowStockCount})
          </button>
          <button
            onClick={() => setFilter('out')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === 'out'
                ? 'bg-rose text-white shadow-xs'
                : 'bg-ivory border border-blush/60 text-brown hover:bg-blush-light'
            }`}
          >
            Sold Out ({outOfStockCount})
          </button>
          <button
            onClick={() => setFilter('in')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === 'in'
                ? 'bg-rose text-white shadow-xs'
                : 'bg-ivory border border-blush/60 text-brown hover:bg-blush-light'
            }`}
          >
            Well Stocked
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-cream rounded-3xl border border-blush/60 shadow-soft overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-rose/30 border-t-rose rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-brown/70">Loading inventory data...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <Boxes className="w-10 h-10 text-rose/50 mx-auto mb-2" />
            <p className="text-sm font-serif text-brown-dark">No inventory matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brown-dark">
              <thead className="bg-ivory/80 border-b border-blush/40 text-[11px] uppercase tracking-wider text-brown-light font-medium">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Creation</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Current Stock</th>
                  <th className="py-3.5 px-4">Quick Adjust</th>
                  <th className="py-3.5 px-4">Stock Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blush/30">
                {filteredProducts.map((p) => {
                  const mainImage = Array.isArray(p.images) && p.images[0] ? p.images[0] : p.image;
                  const isLow = p.stock > 0 && p.stock <= 5;
                  const isOut = p.stock === 0 || p.status === 'sold_out';

                  return (
                    <tr key={p.id} className="hover:bg-ivory/50 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 flex items-center gap-3">
                        <img
                          src={mainImage}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover border border-blush/40 bg-ivory flex-shrink-0"
                        />
                        <div>
                          <p className="font-medium text-sm text-brown-dark">{p.name}</p>
                          <p className="text-[10px] text-brown/60">{p.categoryName}</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-rose-dark whitespace-nowrap">
                        ${p.price}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={p.stock}
                            onChange={(e) => handleManualStockInput(p.id, e.target.value)}
                            className="w-16 px-2.5 py-1 text-center rounded-lg bg-white border border-blush/60 font-semibold text-xs text-brown-dark focus:outline-none focus:border-rose"
                          />
                          <span className="text-[11px] text-brown-light">units</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStockChange(p.id, -1)}
                            className="w-7 h-7 rounded-lg bg-ivory border border-blush/60 text-brown hover:bg-blush-light flex items-center justify-center transition-colors"
                            title="Decrease by 1"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleStockChange(p.id, 1)}
                            className="w-7 h-7 rounded-lg bg-ivory border border-blush/60 text-brown hover:bg-blush-light flex items-center justify-center transition-colors"
                            title="Increase by 1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(p)}
                          className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                            isOut
                              ? 'bg-rose-light text-rose-dark hover:bg-rose hover:text-white'
                              : isLow
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-sage-light text-sage-dark hover:bg-sage hover:text-white'
                          }`}
                          title="Click to toggle Available / Sold Out"
                        >
                          {isOut ? 'Sold Out' : isLow ? 'Low Stock' : 'Available'}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleSaveItem(p)}
                          disabled={updatingId === p.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose text-white hover:bg-rose-dark font-medium text-xs shadow-2xs transition-colors"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{updatingId === p.id ? 'Saving...' : 'Save'}</span>
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

    </div>
  );
}
