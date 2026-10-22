import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  MapPin, 
  Search, 
  ArrowRight, 
  ArrowLeft, 
  ChevronRight, 
  RefreshCw,
  ShoppingBag,
  Phone,
  FileText,
  Calendar,
  AlertCircle
} from 'lucide-react';

const TRACKING_STEPS = [
  { 
    id: 'Placed', 
    label: 'Order Placed', 
    description: 'Order received & verified', 
    icon: Clock 
  },
  { 
    id: 'Confirmed', 
    label: 'Confirmed', 
    description: 'Preparation & packaging started', 
    icon: CheckCircle2 
  },
  { 
    id: 'Shipped', 
    label: 'Shipped', 
    description: 'Dispatched from factory warehouse', 
    icon: Package 
  },
  { 
    id: 'Out for Delivery', 
    label: 'Out for Delivery', 
    description: 'Delivery agent is heading to your address', 
    icon: Truck 
  },
  { 
    id: 'Delivered', 
    label: 'Delivered', 
    description: 'Item safely received at doorstep', 
    icon: CheckCircle2 
  }
];

const getStepIndex = (status) => {
  switch (status) {
    case 'Placed': return 0;
    case 'Confirmed': return 1;
    case 'Shipped': return 2;
    case 'Out for Delivery': return 3;
    case 'Delivered': return 4;
    case 'Cancelled': return -1;
    default: return 0;
  }
};

export default function MyOrders() {
  const { currentUser, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForModal, setSelectedOrderForModal] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchMyOrders = async () => {
      setLoading(true);
      try {
        // Query orders by userId
        const q = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
        const snap = await getDocs(q);
        const orderList = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
          });
        setOrders(orderList);
      } catch (err) {
        console.error('Error fetching user orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [currentUser]);

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase().trim();
    return orders.filter(order => {
      const orderId = (order.orderId || order.id || '').toLowerCase();
      const hasItem = order.items?.some(i => i.name?.toLowerCase().includes(q));
      return orderId.includes(q) || hasItem;
    });
  }, [orders, searchQuery]);

  // If user is not logged in, prompt sign in
  if (!currentUser) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center bg-[#FAF7F2]">
        <div className="w-20 h-20 rounded-3xl bg-[#8B5E34]/10 text-[#8B5E34] flex items-center justify-center mb-5 shadow-sm">
          <Package size={40} />
        </div>
        <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-stone-900 mb-2">
          Track Your Furniture Orders
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mb-6 leading-relaxed">
          Please sign in to your Bharat Furnitures account to view all your order histories, invoice receipts, and live step-by-step dispatch tracking.
        </p>
        <button
          onClick={() => openAuthModal('manual')}
          className="px-7 py-3.5 rounded-2xl bg-[#8B5E34] hover:bg-[#5C3A21] text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Sign In to View Orders</span>
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-1">
              <Link to="/" className="hover:text-[#8B5E34] transition-colors">Home</Link>
              <span>/</span>
              <span className="text-[#8B5E34] font-bold">My Orders & Tracking</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-stone-900">
              My Furniture Orders ({orders.length})
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Live tracking progression and detailed receipt breakdown for each delivery.
            </p>
          </div>

          {/* Search Orders */}
          {orders.length > 0 && (
            <div className="flex items-center bg-white border border-stone-200 rounded-2xl px-4 py-2.5 shadow-xs max-w-xs w-full">
              <Search size={16} className="text-stone-400 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order ID or item..."
                className="w-full bg-transparent text-xs text-stone-800 outline-none placeholder:text-stone-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-xs text-stone-400 hover:text-stone-700">✕</button>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw size={28} className="animate-spin text-[#8B5E34] mx-auto mb-3" />
            <p className="text-xs font-bold text-stone-500">Loading your orders & live tracking...</p>
          </div>
        ) : orders.length === 0 ? (
          /* Empty Orders State */
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 text-center shadow-xs">
            <div className="w-20 h-20 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-4 text-3xl">
              📦
            </div>
            <h3 className="font-heading font-extrabold text-xl text-stone-900 mb-1">
              No Orders Found Yet
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto mb-6">
              You haven't placed any furniture orders with this account yet. Explore our handcrafted collection to get started.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#8B5E34] hover:bg-[#5C3A21] text-white font-bold text-xs shadow-md active:scale-95 transition-all"
            >
              <ShoppingBag size={15} />
              <span>Explore Furniture Catalog</span>
            </Link>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const currentStatus = order.orderStatus || 'Placed';
              const currentStepIdx = getStepIndex(currentStatus);
              const isCancelled = currentStatus === 'Cancelled';

              return (
                <div 
                  key={order.id} 
                  className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-xs hover:shadow-md transition-all space-y-6"
                >
                  
                  {/* Top Bar: Order ID, Date, Total Amount, Payment Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-heading font-extrabold text-base sm:text-lg text-[#8B5E34]">
                          {order.orderId || order.id}
                        </span>
                        <span className={`text-[0.68rem] font-bold px-2.5 py-0.5 rounded-full border ${
                          isCancelled 
                            ? 'bg-rose-50 text-rose-700 border-rose-200' 
                            : currentStatus === 'Delivered' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          ● {currentStatus}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-1 flex items-center gap-1.5">
                        <Calendar size={12} />
                        <span>Placed on {order.createdAtFormatted || 'Recently'}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[0.68rem] text-stone-400 uppercase font-bold block">
                        Total Amount
                      </span>
                      <span className="font-heading font-extrabold text-lg sm:text-xl text-stone-900">
                        ₹{order.totalAmount?.toLocaleString('en-IN')}
                      </span>
                      <span className={`block text-[0.65rem] font-bold ${
                        order.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        {order.paymentMethod} • {order.paymentStatus || 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* LIVE VISUAL TRACKING STEPPER */}
                  {!isCancelled ? (
                    <div className="bg-stone-50/80 rounded-2xl p-4 sm:p-6 border border-stone-200/70">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-stone-700 uppercase tracking-wide flex items-center gap-1.5">
                          <Truck size={14} className="text-[#8B5E34]" /> Delivery Progress & Journey
                        </span>
                        <span className="text-[0.68rem] font-bold text-[#8B5E34]">
                          Stage {currentStepIdx + 1} of 5
                        </span>
                      </div>

                      {/* Stepper Steps Desktop/Mobile */}
                      <div className="relative">
                        {/* Connecting Background Line */}
                        <div className="hidden sm:block absolute top-4 left-6 right-6 h-1 bg-stone-200 -z-0" />
                        <div 
                          className="hidden sm:block absolute top-4 left-6 h-1 bg-emerald-500 transition-all duration-500 -z-0" 
                          style={{ width: `${(currentStepIdx / 4) * 100}%` }}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 sm:gap-2">
                          {TRACKING_STEPS.map((step, idx) => {
                            const isCompleted = idx <= currentStepIdx;
                            const isCurrent = idx === currentStepIdx;
                            const StepIcon = step.icon;

                            return (
                              <div key={step.id} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 relative z-10">
                                
                                {/* Step Circle Indicator */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all shrink-0 ${
                                  isCompleted 
                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-4 ring-emerald-100' 
                                    : 'bg-white text-stone-400 border-2 border-stone-300'
                                }`}>
                                  {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                                </div>

                                {/* Step Label & Description */}
                                <div>
                                  <p className={`text-xs font-bold leading-tight ${
                                    isCurrent 
                                      ? 'text-[#8B5E34]' 
                                      : isCompleted 
                                        ? 'text-stone-900' 
                                        : 'text-stone-400'
                                  }`}>
                                    {step.label}
                                  </p>
                                  <p className="text-[0.65rem] text-stone-500 mt-0.5 line-clamp-1 hidden sm:block">
                                    {step.description}
                                  </p>
                                </div>

                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  ) : (
                    /* Cancelled Notice */
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <XCircle size={18} className="shrink-0" />
                      <span>This order was cancelled. If you made an online payment, refund will be credited within 3-5 business days.</span>
                    </div>
                  )}

                  {/* Items Preview */}
                  <div>
                    <h4 className="text-[0.68rem] font-bold text-stone-400 uppercase tracking-wide mb-3">
                      Ordered Furniture Items ({order.items?.length || 0})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50/60 border border-stone-200/60">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-14 h-14 object-cover rounded-xl border border-stone-200 shrink-0" 
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-stone-900 truncate">{item.name}</p>
                            <p className="text-[0.68rem] text-stone-500 mt-0.5">
                              Qty: <span className="font-bold text-stone-700">{item.quantity}</span> × ₹{item.price?.toLocaleString('en-IN')}
                            </p>
                            <span className="text-xs font-extrabold text-[#8B5E34] block mt-0.5">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Actions & Details Link */}
                  <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <p className="text-stone-500 text-[0.7rem] flex items-center gap-1">
                      <MapPin size={13} className="text-[#8B5E34]" />
                      <span>Deliver to: <span className="font-semibold text-stone-800">{order.customer?.city}, {order.customer?.pincode}</span></span>
                    </p>

                    <button
                      type="button"
                      onClick={() => setSelectedOrderForModal(order)}
                      className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer ml-auto"
                    >
                      <FileText size={13} />
                      <span>View Full Order Details</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* FULL ORDER DETAILS MODAL */}
      {selectedOrderForModal && (
        <div 
          className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedOrderForModal(null)}
        >
          <div 
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
              <div>
                <span className="text-[0.68rem] font-bold text-[#8B5E34] uppercase tracking-wider block">
                  Official Order Receipt
                </span>
                <h3 className="font-heading font-extrabold text-xl text-stone-900 mt-0.5">
                  {selectedOrderForModal.orderId || selectedOrderForModal.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderForModal(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Delivery Address */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 mb-5 text-xs space-y-1.5">
              <p className="font-bold text-stone-900 text-sm">{selectedOrderForModal.customer?.fullName}</p>
              <p className="text-stone-600 flex items-center gap-1.5">
                <Phone size={13} className="text-stone-400" />
                <span>Phone: <span className="font-bold text-stone-800">{selectedOrderForModal.customer?.phone}</span></span>
              </p>
              <div className="pt-2 border-t border-stone-200 mt-2">
                <p className="text-stone-500 font-bold uppercase text-[0.68rem] flex items-center gap-1">
                  <MapPin size={12} className="text-[#8B5E34]" /> Shipping Address:
                </p>
                <p className="text-stone-800 mt-1 leading-relaxed font-medium">
                  {selectedOrderForModal.customer?.address}, {selectedOrderForModal.customer?.city}, {selectedOrderForModal.customer?.state} - {selectedOrderForModal.customer?.pincode}
                </p>
                {selectedOrderForModal.customer?.landmark && (
                  <p className="text-stone-500 text-[0.68rem] mt-0.5">
                    Landmark: <span className="font-semibold text-stone-700">{selectedOrderForModal.customer?.landmark}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Items Breakdown */}
            <h4 className="text-xs font-bold text-stone-700 uppercase mb-2">Ordered Furniture:</h4>
            <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl p-3 mb-5 max-h-52 overflow-y-auto">
              {selectedOrderForModal.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-stone-200" />
                    <div>
                      <p className="text-xs font-bold text-stone-900">{item.name}</p>
                      <p className="text-[0.68rem] text-stone-500">Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-stone-900">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Payment & Grand Total Summary */}
            <div className="p-4 rounded-2xl bg-[#8B5E34]/5 border border-[#8B5E34]/15 mb-4 text-xs space-y-1.5">
              <div className="flex justify-between text-stone-600">
                <span>Payment Method:</span>
                <span className="font-bold text-stone-900">{selectedOrderForModal.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Payment Status:</span>
                <span className={`font-bold ${
                  selectedOrderForModal.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {selectedOrderForModal.paymentStatus}
                </span>
              </div>
              {selectedOrderForModal.razorpayPaymentId && (
                <div className="flex justify-between text-stone-600 font-mono text-[0.68rem]">
                  <span>Txn ID:</span>
                  <span>{selectedOrderForModal.razorpayPaymentId}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-900 font-extrabold text-base pt-2 border-t border-[#8B5E34]/20 mt-2">
                <span>Total Paid:</span>
                <span className="text-[#8B5E34]">₹{selectedOrderForModal.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrderForModal(null)}
              className="w-full py-3 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
