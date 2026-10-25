import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  MapPin, 
  ArrowRight, 
  Clock, 
  Phone, 
  FileText,
  MessageSquare
} from 'lucide-react';
import { sendWhatsAppUpdate } from '../utils/whatsapp';

export default function OrderSuccess() {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.orderData || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (!order && orderId) {
      const fetchOrder = async () => {
        try {
          const docRef = doc(db, 'orders', orderId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setOrder(docSnap.data());
          }
        } catch (err) {
          console.error('Error fetching order:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [orderId, order]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#8B5E34] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-10 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Success Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xl text-center relative overflow-hidden">
          
          {/* Top Decorative Banner */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-emerald-500 via-[#8B5E34] to-amber-500" />

          {/* Animated Success Check */}
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 size={44} className="stroke-[2.5]" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
            Order Placed Successfully
          </span>

          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-stone-900 mb-2">
            Thank You, Your Order Is Confirmed!
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mb-6">
            Your furniture order has been securely received. We will begin processing and dispatching your items shortly.
          </p>

          {/* Tracking ID Pill */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 max-w-md mx-auto mb-8 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[0.68rem] text-stone-400 uppercase font-bold tracking-wider block">
                Order Tracking ID
              </span>
              <span className="font-heading font-extrabold text-base sm:text-lg text-[#8B5E34]">
                {order?.orderId || orderId}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[0.68rem] text-stone-400 uppercase font-bold tracking-wider block">
                Status
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                <Clock size={12} />
                <span>{order?.orderStatus || 'Placed'}</span>
              </span>
            </div>
          </div>

          {/* Delivery & Items Summary Box */}
          {order && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left border-t border-stone-100 pt-6 mb-8">
              
              {/* Delivery Details */}
              <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/60">
                <h3 className="text-xs font-bold text-stone-900 mb-2.5 flex items-center gap-1.5">
                  <MapPin size={15} className="text-[#8B5E34]" /> Delivery Address
                </h3>
                <p className="text-xs font-semibold text-stone-800">{order.customer?.fullName}</p>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  {order.customer?.address}, {order.customer?.city}, {order.customer?.pincode}
                </p>
                <p className="text-xs text-stone-600 mt-2 flex items-center gap-1">
                  <Phone size={13} className="text-stone-400" /> {order.customer?.phone}
                </p>
                {order.estimatedDeliveryDate && (
                  <div className="mt-3 pt-2.5 border-t border-stone-200/80 flex items-center gap-1.5 text-xs text-emerald-800 font-semibold bg-emerald-50/80 px-2.5 py-1.5 rounded-lg">
                    <Truck size={14} className="text-emerald-700 shrink-0" />
                    <span>Estimated Delivery: <strong>Within 2 Days ({order.estimatedDeliveryDate})</strong></span>
                  </div>
                )}
              </div>

              {/* Payment Details */}
              <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/60">
                <h3 className="text-xs font-bold text-stone-900 mb-2.5 flex items-center gap-1.5">
                  <FileText size={15} className="text-[#8B5E34]" /> Payment Summary
                </h3>
                <p className="text-xs text-stone-600">
                  <span className="font-medium">Method:</span> <span className="font-bold text-stone-800">{order.paymentMethod}</span>
                </p>
                <p className="text-xs text-stone-600 mt-1">
                  <span className="font-medium">Payment Status:</span> <span className={`font-bold ${order.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}`}>{order.paymentStatus}</span>
                </p>
                {order.razorpayPaymentId && (
                  <p className="text-[0.7rem] text-stone-500 mt-1 font-mono break-all">
                    <span className="font-sans font-medium text-stone-600">Txn ID: </span>{order.razorpayPaymentId}
                  </p>
                )}
                <p className="text-sm font-extrabold text-stone-900 mt-2 pt-2 border-t border-stone-200">
                  Total Amount: <span className="text-[#8B5E34]">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                </p>
              </div>

            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {order && (
              <button
                type="button"
                onClick={() => sendWhatsAppUpdate(order, 'Placed')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare size={16} />
                <span>Get Updates on WhatsApp</span>
              </button>
            )}
            <Link
              to="/orders"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <Package size={15} />
              <span>Track My Order</span>
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#8B5E34] hover:bg-[#5C3A21] text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Continue Shopping</span>
              <ArrowRight size={15} />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
