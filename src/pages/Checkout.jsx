import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { loadRazorpayScript } from '../utils/razorpay';
import { 
  ShieldCheck, 
  Truck, 
  ArrowLeft, 
  CreditCard, 
  Banknote, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Sparkles,
  AlertCircle,
  Loader2,
  Check
} from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, totalAmount, totalSavings, totalItems, clearCart } = useCart();
  const { currentUser, openAuthModal } = useAuth();

  // Delivery within 2 days
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 2);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const [formData, setFormData] = useState({
    fullName: currentUser?.displayName || '',
    phone: '',
    email: currentUser?.email || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'cod'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pincode lookup states
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState('');
  const [pincodeSuccess, setPincodeSuccess] = useState(false);

  // Auto fetch City and State from India Post API using Pincode
  const fetchAddressByPincode = async (pin) => {
    if (!/^\d{6}$/.test(pin)) {
      setPincodeError('Please enter a valid 6-digit Indian pincode');
      setPincodeSuccess(false);
      return;
    }

    setPincodeLoading(true);
    setPincodeError('');
    setPincodeSuccess(false);

    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await response.json();

      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const postOffice = data[0].PostOffice[0];
        const detectedCity = postOffice.District || postOffice.Block || postOffice.Name || '';
        const detectedState = postOffice.State || '';

        setFormData((prev) => ({
          ...prev,
          city: detectedCity,
          state: detectedState
        }));
        setPincodeSuccess(true);
        setPincodeError('');
      } else {
        setPincodeError('Invalid Pincode. Please check and enter a valid delivery pincode.');
        setPincodeSuccess(false);
      }
    } catch (err) {
      console.error('Error fetching pincode info:', err);
      setPincodeError('Unable to verify pincode. Please enter city & state manually.');
    } finally {
      setPincodeLoading(false);
    }
  };

  // Handle inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'pincode') {
      const sanitizedPin = value.replace(/\D/g, '').slice(0, 6);
      setFormData((prev) => ({
        ...prev,
        pincode: sanitizedPin
      }));

      if (sanitizedPin.length === 6) {
        fetchAddressByPincode(sanitizedPin);
      } else {
        setPincodeError('');
        setPincodeSuccess(false);
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Helper to save order to Firestore
  const saveOrderToFirestore = async (paymentDetails = null) => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedOrderId = `BF-${new Date().getFullYear()}-${randomSuffix}`;

    const orderData = {
      orderId: generatedOrderId,
      userId: currentUser.uid,
      customer: {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email || currentUser.email,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim() || 'India',
        pincode: formData.pincode.trim(),
        landmark: formData.landmark.trim() || ''
      },
      items: cart.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        originalPrice: item.originalPrice || item.price,
        image: item.image,
        quantity: item.quantity,
        material: item.material || '',
        dimensions: item.dimensions || ''
      })),
      totalItems,
      totalAmount,
      totalSavings,
      paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Razorpay (Online Payment)',
      paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Paid',
      razorpayPaymentId: paymentDetails?.razorpay_payment_id || null,
      razorpayOrderId: paymentDetails?.razorpay_order_id || null,
      razorpaySignature: paymentDetails?.razorpay_signature || null,
      orderStatus: 'Placed',
      estimatedDeliveryDate: formattedDeliveryDate,
      createdAt: serverTimestamp(),
      createdAtFormatted: new Date().toLocaleString('en-IN')
    };

    const docRef = await addDoc(collection(db, 'orders'), orderData);
    clearCart();
    navigate(`/order-success/${docRef.id}`, { state: { orderData } });
  };

  // Handle Razorpay Checkout Modal
  const handleRazorpayPayment = async () => {
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      setError('Failed to load Razorpay SDK. Please check your internet connection and try again.');
      setLoading(false);
      return;
    }

    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag';

    const options = {
      key: keyId,
      amount: Math.round(totalAmount * 100), // Amount in paise
      currency: 'INR',
      name: 'Bharat Furnitures',
      description: `Payment for ${totalItems} furniture item(s)`,
      image: '/favicon.svg',
      prefill: {
        name: formData.fullName.trim(),
        email: formData.email.trim() || currentUser?.email || '',
        contact: formData.phone.trim()
      },
      notes: {
        address: `${formData.address.trim()}, ${formData.city.trim()}, ${formData.pincode.trim()}`
      },
      theme: {
        color: '#8B5E34'
      },
      handler: async function (response) {
        try {
          await saveOrderToFirestore(response);
        } catch (err) {
          console.error('Error recording order after payment:', err);
          setError('Payment was received, but failed to record order. Please contact customer support with Payment ID: ' + response.razorpay_payment_id);
          setLoading(false);
        }
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setLoading(false);
        setError(response.error?.description || 'Payment failed. Please try again.');
      });
      rzp.open();
    } catch (err) {
      console.error('Error opening Razorpay:', err);
      setError('Unable to open payment modal. Please try again.');
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      openAuthModal('order');
      return;
    }

    if (cart.length === 0) {
      setError('Your shopping cart is empty. Please add items to proceed.');
      return;
    }

    // Validation
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.address.trim() || !formData.city.trim() || !formData.pincode.trim()) {
      setError('Please fill in all required delivery address fields.');
      return;
    }

    if (formData.phone.trim().length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!/^\d{6}$/.test(formData.pincode.trim()) || pincodeError) {
      setError('Please provide a valid 6-digit delivery pincode.');
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === 'cod') {
        await saveOrderToFirestore();
      } else {
        await handleRazorpayPayment();
      }
    } catch (err) {
      console.error('Error placing order:', err);
      setError('Failed to place order. Please try again.');
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
          <Truck size={36} />
        </div>
        <h2 className="font-heading font-extrabold text-2xl text-stone-900 mb-2">
          Your Cart is Empty
        </h2>
        <p className="text-sm text-stone-500 max-w-sm mb-6">
          Please add furniture products to your cart before proceeding to checkout.
        </p>
        <Link
          to="/"
          className="px-6 py-3 rounded-xl bg-[#8B5E34] hover:bg-[#5C3A21] text-white font-bold text-sm transition-all shadow-md active:scale-95 flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          <span>Explore Furniture</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb / Back button */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-[#8B5E34] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Continue Shopping</span>
          </Link>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-stone-900 mt-2">
            Checkout & Delivery
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2.5">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Delivery Address & Payment Method */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Delivery Address Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-stone-100">
                <div className="w-10 h-10 rounded-xl bg-[#8B5E34]/10 text-[#8B5E34] flex items-center justify-center font-bold">
                  <MapPin size={20} />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-lg text-stone-900">
                    1. Delivery Address
                  </h2>
                  <p className="text-xs text-stone-500">
                    Please provide your complete address for fast, secure delivery.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Rohit Sharma"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#8B5E34] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Mobile Phone */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#8B5E34] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="For delivery tracking and invoices"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#8B5E34] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Street Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Complete Address (House / Flat / Street) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    required
                    rows={2}
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="House/Apartment number, street name, area..."
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#8B5E34] focus:bg-white transition-colors resize-none"
                  />
                </div>

                {/* Landmark */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                    placeholder="Near landmark, park, school, etc."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#8B5E34] focus:bg-white transition-colors"
                  />
                </div>

                {/* Pincode (First to autofill City & State) */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-stone-700">
                      Pincode <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[0.68rem] text-stone-400">
                      Enter 6-digit pin to auto-detect City & State
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      name="pincode"
                      required
                      maxLength={6}
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="e.g. 110001, 400001, 302001"
                      className={`w-full px-3.5 py-2.5 bg-stone-50 border rounded-xl text-xs sm:text-sm focus:outline-none transition-colors ${
                        pincodeError 
                          ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500' 
                          : pincodeSuccess 
                            ? 'border-emerald-300 bg-emerald-50/20 text-stone-900 focus:border-emerald-500' 
                            : 'border-stone-200 focus:border-[#8B5E34] focus:bg-white'
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                      {pincodeLoading && (
                        <Loader2 size={16} className="text-[#8B5E34] animate-spin" />
                      )}
                      {pincodeSuccess && !pincodeLoading && (
                        <span className="flex items-center gap-1 text-[0.68rem] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                          <Check size={12} /> Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pincode Error Message */}
                  {pincodeError && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-rose-600 text-[0.72rem] font-medium animate-fadeIn">
                      <AlertCircle size={13} className="shrink-0" />
                      <span>{pincodeError}</span>
                    </div>
                  )}
                </div>

                {/* City (Auto-filled) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-stone-700">
                      City <span className="text-rose-500">*</span>
                    </label>
                    {pincodeSuccess && (
                      <span className="text-[0.65rem] text-emerald-700 font-semibold">Auto-detected</span>
                    )}
                  </div>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City / District"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#8B5E34] focus:bg-white transition-colors"
                  />
                </div>

                {/* State (Auto-filled) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-stone-700">
                      State <span className="text-rose-500">*</span>
                    </label>
                    {pincodeSuccess && (
                      <span className="text-[0.65rem] text-emerald-700 font-semibold">Auto-detected</span>
                    )}
                  </div>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#8B5E34] focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 2. Payment Method Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-stone-100">
                <div className="w-10 h-10 rounded-xl bg-[#8B5E34]/10 text-[#8B5E34] flex items-center justify-center font-bold">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-lg text-stone-900">
                    2. Payment Method
                  </h2>
                  <p className="text-xs text-stone-500">
                    Select your preferred payment option.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Razorpay Online Payment */}
                <label 
                  className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'razorpay' 
                      ? 'border-[#8B5E34] bg-[#FFF8ED]' 
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="mt-1 accent-[#8B5E34]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CreditCard size={18} className="text-[#8B5E34]" />
                      <span className="font-bold text-sm text-stone-900">Razorpay (UPI / Cards / NetBanking / Wallets)</span>
                      <span className="text-[0.68rem] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full ml-auto">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      Fast & secure online payment via Google Pay, PhonePe, Paytm, Cards & NetBanking.
                    </p>
                  </div>
                </label>

                {/* Cash on Delivery (COD) */}
                <label 
                  className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'cod' 
                      ? 'border-[#8B5E34] bg-[#FFF8ED]' 
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 accent-[#8B5E34]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Banknote size={18} className="text-[#8B5E34]" />
                      <span className="font-bold text-sm text-stone-900">Cash on Delivery (COD)</span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      Pay via cash or UPI upon delivery at your doorstep.
                    </p>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary & Place Order Button */}
          <div className="lg:col-span-5 sticky top-24 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-sm">
              <h2 className="font-heading font-bold text-lg text-stone-900 pb-4 mb-4 border-b border-stone-100 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs text-stone-500 font-normal">{totalItems} items</span>
              </h2>

              {/* Items List */}
              <div className="max-h-64 overflow-y-auto divide-y divide-stone-100 pr-1 space-y-3 mb-5">
                {cart.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-stone-900 truncate">
                        {item.name}
                      </h4>
                      <p className="text-[0.68rem] text-stone-500">
                        Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-stone-900">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Details */}
              <div className="space-y-2 pt-4 border-t border-stone-100 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <Truck size={13} className="text-[#8B5E34]" /> Express Delivery
                  </span>
                  <div className="text-right">
                    <span className="font-semibold text-emerald-700 uppercase">Free</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[0.72rem] bg-amber-50/70 border border-amber-200/60 text-[#8B5E34] px-2.5 py-1.5 rounded-lg">
                  <span className="font-medium flex items-center gap-1.5">
                    <span>⚡ Guaranteed Delivery:</span>
                    <strong className="text-stone-900 font-bold">Within 2 Days ({formattedDeliveryDate})</strong>
                  </span>
                </div>

                {totalSavings > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Festive Discount</span>
                    <span>-₹{totalSavings.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-base font-extrabold text-stone-900 pt-3 border-t border-stone-200">
                  <span>Total Amount</span>
                  <span className="font-heading text-lg text-[#8B5E34]">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Place Order CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full py-4 px-6 rounded-2xl font-bold text-sm text-white bg-[#8B5E34] hover:bg-[#5C3A21] shadow-lg shadow-[#8B5E34]/25 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>{paymentMethod === 'cod' ? 'Place COD Order' : `Pay ₹${totalAmount.toLocaleString('en-IN')} with Razorpay`}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-3 text-[0.68rem] text-stone-500 mt-4">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={13} className="text-[#8B5E34]" /> Verified Secure
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Sparkles size={13} className="text-amber-500" /> 1-Year Warranty
                </span>
              </div>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
