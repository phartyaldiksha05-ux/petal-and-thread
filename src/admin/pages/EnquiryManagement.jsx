import React, { useState, useEffect } from 'react';
import { MessageSquareQuote, Search, Filter, MessageCircle, Check, Trash2, Clock, Sparkles, Mail, Phone, Calendar, Palette, X } from 'lucide-react';
import { api } from '../../services/api';

export function EnquiryManagement() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const statusList = ['New', 'In Discussion', 'In Progress', 'Completed', 'Archived'];

  const loadEnquiries = async () => {
    try {
      setLoading(true);
      const res = await api.enquiries.getAll();
      setEnquiries(res || []);
    } catch (err) {
      console.error('Failed to load enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const handleUpdateStatus = async (id, status, adminNotes) => {
    try {
      await api.enquiries.updateStatus(id, { status, adminNotes });
      setSuccessMsg('Enquiry status updated.');
      await loadEnquiries();
      if (selectedEnquiry && selectedEnquiry.id === id) {
        setSelectedEnquiry(prev => ({ ...prev, status, adminNotes }));
      }
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Error updating enquiry:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer enquiry?')) return;
    try {
      await api.enquiries.delete(id);
      setSuccessMsg('Enquiry deleted.');
      if (selectedEnquiry?.id === id) setSelectedEnquiry(null);
      await loadEnquiries();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Error deleting enquiry:', err);
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    const matchSearch =
      e.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      e.customerEmail?.toLowerCase().includes(search.toLowerCase()) ||
      e.creationType?.toLowerCase().includes(search.toLowerCase()) ||
      e.details?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-brown-dark font-medium">
            Custom Commissions & Customer Enquiries
          </h2>
          <p className="text-xs text-brown/70 font-light">
            Requests received directly from the public boutique website for bespoke crochet florals, hair accessories, and couture clothing.
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
            placeholder="Search by client, email, or creation type..."
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
            All Enquiries ({enquiries.length})
          </button>
          {statusList.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-rose text-white shadow-xs'
                  : 'bg-ivory border border-blush/60 text-brown hover:bg-blush-light'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Enquiries Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-2 border-rose/30 border-t-rose rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-brown/70">Loading inquiries...</p>
        </div>
      ) : filteredEnquiries.length === 0 ? (
        <div className="p-16 rounded-3xl bg-cream border border-blush/60 shadow-soft text-center space-y-2">
          <MessageSquareQuote className="w-10 h-10 text-rose/50 mx-auto" />
          <p className="font-serif text-lg text-brown-dark">No custom inquiries found.</p>
          <p className="text-xs text-brown/60 font-light">
            When website visitors submit the Custom Order Modal, their requests will appear here instantly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnquiries.map((enq) => {
            const cleanPhone = enq.customerPhone ? enq.customerPhone.replace(/[^0-9]/g, '') : '';
            const whatsappUrl = cleanPhone
              ? `https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(enq.customerName)}!%20This%20is%20Amelia%20from%20Petal%20%26%20Thread%20regarding%20your%20custom%20enquiry.`
              : null;

            return (
              <div
                key={enq.id}
                className="bg-cream rounded-3xl p-6 border border-blush/60 shadow-soft flex flex-col justify-between space-y-4 hover:border-rose/50 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-rose uppercase tracking-wider">
                      {enq.creationType}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        enq.status === 'New'
                          ? 'bg-rose text-white'
                          : enq.status === 'In Progress'
                          ? 'bg-sage-light text-sage-dark'
                          : enq.status === 'Completed'
                          ? 'bg-ivory border border-sage/60 text-sage-dark'
                          : 'bg-blush-light text-rose-dark'
                      }`}
                    >
                      {enq.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-xl text-brown-dark font-medium">
                      {enq.customerName}
                    </h3>
                    <div className="flex flex-col gap-0.5 mt-1 text-xs text-brown/70 font-light">
                      {enq.customerEmail && (
                        <a
                          href={`mailto:${enq.customerEmail}`}
                          className="flex items-center gap-1.5 hover:text-rose"
                        >
                          <Mail className="w-3.5 h-3.5 text-rose/70" />
                          <span>{enq.customerEmail}</span>
                        </a>
                      )}
                      {enq.customerPhone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-rose/70" />
                          <span>{enq.customerPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {enq.colorPalette && (
                    <div className="flex items-start gap-1.5 text-xs text-brown/80 bg-ivory/80 p-2 rounded-xl border border-blush/30">
                      <Palette className="w-3.5 h-3.5 text-rose mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-brown-dark font-medium">Palette: </strong>
                        {enq.colorPalette}
                      </div>
                    </div>
                  )}

                  {enq.deadline && (
                    <div className="flex items-center gap-1.5 text-xs text-brown/80">
                      <Calendar className="w-3.5 h-3.5 text-rose flex-shrink-0" />
                      <span>Target Date: {enq.deadline}</span>
                    </div>
                  )}

                  {enq.details && (
                    <div className="pt-2 border-t border-blush/30 text-xs text-brown/75 leading-relaxed font-light">
                      <p className="line-clamp-3 italic">"{enq.details}"</p>
                    </div>
                  )}

                  {/* Reference Image preview if any */}
                  {Array.isArray(enq.referenceImages) && enq.referenceImages.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[10px] text-brown-light font-medium uppercase mb-1">Inspiration Photo</p>
                      <img
                        src={enq.referenceImages[0]}
                        alt="Reference"
                        className="w-full h-28 object-cover rounded-xl border border-blush/50"
                      />
                    </div>
                  )}
                </div>

                {/* Card Bottom: Quick Actions */}
                <div className="pt-3 border-t border-blush/40 flex items-center justify-between gap-2">
                  <select
                    value={enq.status}
                    onChange={(e) => handleUpdateStatus(enq.id, e.target.value, enq.adminNotes)}
                    className="text-xs font-medium px-2.5 py-1.5 rounded-xl bg-white border border-blush/60 text-brown-dark focus:outline-none"
                  >
                    {statusList.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1.5">
                    {whatsappUrl ? (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-xl bg-blush-light text-rose hover:bg-rose hover:text-white transition-colors"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    ) : null}

                    <button
                      onClick={() => setSelectedEnquiry(enq)}
                      className="px-3 py-1.5 rounded-xl bg-ivory border border-blush text-brown text-xs font-medium hover:bg-blush-light transition-colors"
                    >
                      Details & Notes
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail & Notes Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-brown-dark/50 backdrop-blur-xs" onClick={() => setSelectedEnquiry(null)} />
          <div className="relative w-full max-w-lg bg-cream rounded-3xl p-6 sm:p-8 border border-blush/70 shadow-soft-lg z-10 space-y-4">
            <button
              onClick={() => setSelectedEnquiry(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-ivory text-brown hover:bg-blush-light flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-rose">
                {selectedEnquiry.creationType}
              </span>
              <h3 className="font-serif text-2xl text-brown-dark font-medium mt-0.5">
                {selectedEnquiry.customerName}
              </h3>
              <p className="text-xs text-brown/70 font-light mt-0.5">
                Submitted on {new Date(selectedEnquiry.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-ivory/80 border border-blush/40 space-y-2 text-xs">
              <p><strong className="text-brown-dark font-medium">Email:</strong> {selectedEnquiry.customerEmail || '—'}</p>
              <p><strong className="text-brown-dark font-medium">Phone:</strong> {selectedEnquiry.customerPhone || '—'}</p>
              <p><strong className="text-brown-dark font-medium">Preferred Palette:</strong> {selectedEnquiry.colorPalette || '—'}</p>
              <p><strong className="text-brown-dark font-medium">Required By:</strong> {selectedEnquiry.deadline || '—'}</p>
              <div className="pt-1 border-t border-blush/30">
                <strong className="text-brown-dark font-medium">Client Vision & Details:</strong>
                <p className="mt-1 leading-relaxed text-brown/80 font-light whitespace-pre-line">
                  {selectedEnquiry.details || 'No additional details provided.'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-brown-dark mb-1">
                  Atelier Status
                </label>
                <select
                  value={selectedEnquiry.status}
                  onChange={(e) => setSelectedEnquiry({ ...selectedEnquiry, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark"
                >
                  {statusList.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-brown-dark mb-1">
                  Private Studio Notes (Pricing quoted, yarn choice, ribbon length)
                </label>
                <textarea
                  rows={3}
                  value={selectedEnquiry.adminNotes || ''}
                  onChange={(e) => setSelectedEnquiry({ ...selectedEnquiry, adminNotes: e.target.value })}
                  placeholder="Record discussions, agreed pricing, or yarn dyelots..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-blush/60 text-xs text-brown-dark"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-blush/40">
                <button
                  type="button"
                  onClick={() => handleDelete(selectedEnquiry.id)}
                  className="text-xs text-rose hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Enquiry</span>
                </button>

                <button
                  onClick={() =>
                    handleUpdateStatus(selectedEnquiry.id, selectedEnquiry.status, selectedEnquiry.adminNotes)
                  }
                  className="px-6 py-2.5 rounded-full bg-rose text-white hover:bg-rose-dark text-xs font-medium shadow-delicate"
                >
                  Save Status & Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
