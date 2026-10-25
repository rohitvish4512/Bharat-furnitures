import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../config/firebase';
import { collection, addDoc, updateDoc, doc, getDocs, deleteDoc } from 'firebase/firestore';
import { categories as fallbackCategories } from '../data/products';
import { 
  Package, 
  PlusCircle, 
  Layers, 
  ShoppingBag, 
  Clock, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Search, 
  ArrowLeft, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Menu, 
  X, 
  ChevronRight, 
  Filter, 
  CreditCard, 
  Phone, 
  MapPin, 
  Mail, 
  RefreshCw,
  Boxes,
  Eye,
  EyeOff,
  Check,
  Tag,
  Lock,
  KeyRound,
  ShieldCheck,
  LogOut,
  MessageSquare,
  RotateCcw
} from 'lucide-react';
import { sendWhatsAppUpdate } from '../utils/whatsapp';

const generateSignature = async (timestamp, apiSecret) => {
  const str = `timestamp=${timestamp}${apiSecret}`;
  const buffer = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest('SHA-1', buffer);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

export const STATUS_COLORS = {
  'Placed': 'bg-blue-50 text-blue-700 border-blue-200',
  'Confirmed': 'bg-amber-50 text-amber-700 border-amber-200',
  'Shipped': 'bg-purple-50 text-purple-700 border-purple-200',
  'Out for Delivery': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Delivered': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Cancelled': 'bg-rose-50 text-rose-700 border-rose-200'
};

const ORDER_STATUS_TABS = [
  { id: 'all', label: 'All Orders', icon: ShoppingBag, color: 'text-stone-700' },
  { id: 'Placed', label: 'Placed', icon: Clock, color: 'text-blue-600' },
  { id: 'Confirmed', label: 'Confirmed', icon: CheckCircle2, color: 'text-amber-600' },
  { id: 'Shipped', label: 'Shipped', icon: Package, color: 'text-purple-600' },
  { id: 'Out for Delivery', label: 'Out for Delivery', icon: Truck, color: 'text-indigo-600' },
  { id: 'Delivered', label: 'Delivered', icon: Check, color: 'text-emerald-600' },
  { id: 'Cancelled', label: 'Cancelled', icon: XCircle, color: 'text-rose-600' }
];

const Admin = () => {
  const initialState = {
    name: '',
    categoryId: '',
    description: '',
    price: '',
    originalPrice: '',
    rating: '',
    reviews: '',
    stock: '',
    dimensions: '',
    material: '',
    weight: '',
    badges: '',
    features: '',
    hasWarranty: 'no', // 'yes' | 'no'
    warrantyDuration: '1',
    warrantyUnit: 'Years', // 'Months' | 'Years'
    hasGuarantee: 'no', // 'yes' | 'no'
    guaranteeDuration: '1',
    guaranteeUnit: 'Years', // 'Months' | 'Years'
    returnPolicy: '7 Days Hassle-Free Replacement for transit damages or defective items',
    deliveryPolicy: 'Free Express Shipping within 2-3 business days with door delivery'
  };
  
  const [formData, setFormData] = useState(initialState);
  // Multiple images state (up to 4 images with cross remove button)
  const [selectedImages, setSelectedImages] = useState([]); // [{ file, previewUrl }]
  const [existingImages, setExistingImages] = useState([]); // [url1, url2, ...] for edit mode
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Navigation & View States
  const [activeTab, setActiveTab] = useState('add'); // 'add' | 'manage' | 'orders'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Manage Products States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [selectedCategoryForManage, setSelectedCategoryForManage] = useState(null);
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // Orders Management States
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Admin Authentication Security State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem('bf_admin_auth') === 'authenticated';
  });
  const [adminLoginForm, setAdminLoginForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Initial Fetch & Tab switches (Only when authenticated)
  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchInitialData();
    }
  }, [isAdminLoggedIn]);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    const validEmail = (import.meta.env.VITE_ADMIN_EMAIL || 'admin@bharatfurnitures.com').trim().toLowerCase();
    const validPassword = (import.meta.env.VITE_ADMIN_PASSWORD || 'admin@bharat123').trim();

    const inputEmail = adminLoginForm.email.trim().toLowerCase();
    const inputPassword = adminLoginForm.password.trim();

    setTimeout(() => {
      if (inputEmail === validEmail && inputPassword === validPassword) {
        sessionStorage.setItem('bf_admin_auth', 'authenticated');
        setIsAdminLoggedIn(true);
        setAdminLoginForm({ email: '', password: '' });
      } else {
        setLoginError('Invalid Administrator credentials. Access denied.');
      }
      setIsLoggingIn(false);
    }, 400);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('bf_admin_auth');
    setIsAdminLoggedIn(false);
  };

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([fetchProductsAndCategories(), fetchOrders()]);
    setLoading(false);
  };

  const fetchOrders = async () => {
    try {
      const orderSnap = await getDocs(collection(db, 'orders'));
      const orderList = orderSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });
      setOrders(orderList);
    } catch (err) {
      console.error(err);
      setMessage('Failed to load orders: ' + err.message);
    }
  };

  const fetchProductsAndCategories = async () => {
    try {
      const prodSnap = await getDocs(collection(db, 'products'));
      const prods = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setProducts(prods);

      const catSnap = await getDocs(collection(db, 'categories'));
      let cats = catSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Fallback if firestore categories empty
      if (cats.length === 0) {
        cats = fallbackCategories;
      }
      setCategories(cats);
    } catch (err) {
      console.error(err);
      setMessage('Failed to load data: ' + err.message);
    }
  };

  // Group products by category
  const productsByCategory = useMemo(() => {
    return products.reduce((acc, product) => {
      const catId = product.categoryId || 'uncategorized';
      if (!acc[catId]) acc[catId] = [];
      acc[catId].push(product);
      return acc;
    }, {});
  }, [products]);

  // Combined Category List with count
  const allCategoryCards = useMemo(() => {
    const list = [...categories];
    // Add any category from products that isn't in categories table
    Object.keys(productsByCategory).forEach(catId => {
      if (!list.some(c => c.id === catId)) {
        list.push({
          id: catId,
          name: catId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          icon: '📦',
          description: 'Custom Category'
        });
      }
    });
    return list;
  }, [categories, productsByCategory]);

  // Orders count per status
  const orderCounts = useMemo(() => {
    const counts = { all: orders.length };
    ORDER_STATUS_TABS.forEach(tab => {
      if (tab.id !== 'all') {
        counts[tab.id] = orders.filter(o => (o.orderStatus || 'Placed') === tab.id).length;
      }
    });
    return counts;
  }, [orders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Status filter
      if (orderStatusFilter !== 'all') {
        const status = order.orderStatus || 'Placed';
        if (status !== orderStatusFilter) return false;
      }
      // Search filter (Order ID, Customer name, phone)
      if (orderSearchQuery.trim()) {
        const query = orderSearchQuery.toLowerCase().trim();
        const orderId = (order.orderId || order.id || '').toLowerCase();
        const name = (order.customer?.fullName || '').toLowerCase();
        const phone = (order.customer?.phone || '').toLowerCase();
        if (!orderId.includes(query) && !name.includes(query) && !phone.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [orders, orderStatusFilter, orderSearchQuery]);

  // Handlers for Order Status Update
  const handleUpdateOrderStatus = async (orderDocId, newStatus) => {
    setUpdatingOrderId(orderDocId);
    try {
      const order = orders.find(o => o.id === orderDocId);
      const updateData = {
        orderStatus: newStatus,
        updatedAt: new Date().toISOString()
      };

      // Auto-update COD payment status to 'Paid' when order is Delivered
      if (newStatus === 'Delivered' && order?.paymentStatus !== 'Paid') {
        updateData.paymentStatus = 'Paid';
      }

      await updateDoc(doc(db, 'orders', orderDocId), updateData);
      
      const updatedOrderObj = { ...order, ...updateData };

      // Update local state
      setOrders(prev => prev.map(o => o.id === orderDocId ? updatedOrderObj : o));
      if (selectedOrder && selectedOrder.id === orderDocId) {
        setSelectedOrder(prev => ({ ...prev, ...updateData }));
      }
      
      setMessage(`Order delivery status updated to "${newStatus}"! Click WhatsApp button to notify customer.`);
      setTimeout(() => setMessage(''), 4500);

      // Auto open WhatsApp with the updated status message
      sendWhatsAppUpdate(updatedOrderObj, newStatus);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update status: ' + err.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleUpdatePaymentStatus = async (orderDocId, newPaymentStatus) => {
    setUpdatingOrderId(orderDocId);
    try {
      await updateDoc(doc(db, 'orders', orderDocId), {
        paymentStatus: newPaymentStatus,
        paymentUpdatedAt: new Date().toISOString()
      });
      // Update local state
      setOrders(prev => prev.map(o => o.id === orderDocId ? { ...o, paymentStatus: newPaymentStatus } : o));
      if (selectedOrder && selectedOrder.id === orderDocId) {
        setSelectedOrder(prev => ({ ...prev, paymentStatus: newPaymentStatus }));
      }
      setMessage(`Payment status updated to "${newPaymentStatus}"!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update payment status: ' + err.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Form Handlers
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleMultipleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentTotal = existingImages.length + selectedImages.length;
    const availableSlots = 4 - currentTotal;

    if (availableSlots <= 0) {
      setMessage('Maximum 4 photos allowed per product. Please remove a photo to add a new one.');
      setTimeout(() => setMessage(''), 3500);
      return;
    }

    const filesToAdd = files.slice(0, availableSlots);
    const newItems = filesToAdd.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    setSelectedImages(prev => [...prev, ...newItems]);
    if (files.length > availableSlots) {
      setMessage(`Only ${availableSlots} photo(s) added. Maximum limit of 4 photos reached.`);
      setTimeout(() => setMessage(''), 3500);
    }
    e.target.value = '';
  };

  const handleRemoveSelectedImage = (indexToRemove) => {
    setSelectedImages(prev => {
      const item = prev[indexToRemove];
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  const handleRemoveExistingImage = (indexToRemove) => {
    setExistingImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const resetProductForm = () => {
    setFormData(initialState);
    selectedImages.forEach(img => {
      if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
    });
    setSelectedImages([]);
    setExistingImages([]);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const totalImagesCount = existingImages.length + selectedImages.length;
    if (totalImagesCount === 0) {
      setMessage('Please select at least 1 product image (up to 4 images allowed).');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      let uploadedUrls = [];

      if (selectedImages.length > 0) {
        const cloudName = 'dy49nlqn';
        const apiKey = '264425733737867';
        const apiSecret = 'uoZKptVsW_8FHWJrpPZjqXscUaU';
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

        const uploadPromises = selectedImages.map(async (item) => {
          const timestamp = Math.round(new Date().getTime() / 1000);
          const signature = await generateSignature(timestamp, apiSecret);

          const formDataUpload = new FormData();
          formDataUpload.append('file', item.file);
          formDataUpload.append('api_key', apiKey);
          formDataUpload.append('timestamp', timestamp);
          formDataUpload.append('signature', signature);

          const res = await fetch(cloudinaryUrl, {
            method: 'POST',
            body: formDataUpload
          });

          if (!res.ok) throw new Error('Failed to upload image to Cloudinary');

          const cloudData = await res.json();
          return cloudData.secure_url;
        });

        uploadedUrls = await Promise.all(uploadPromises);
      }

      const finalImages = [...existingImages, ...uploadedUrls].slice(0, 4);

      const now = new Date().toISOString();
      
      const parseArray = (str) => {
        if (!str) return [];
        if (Array.isArray(str)) return str;
        return str.split(',').map(item => item.trim()).filter(Boolean);
      };
      
      const badgesArray = parseArray(formData.badges);
      const featuresArray = parseArray(formData.features);

      const productData = {
        name: formData.name,
        categoryId: formData.categoryId,
        description: formData.description,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice) || Number(formData.price),
        rating: Number(formData.rating) || 0,
        reviews: Number(formData.reviews) || 0,
        stock: Number(formData.stock) || 0,
        dimensions: formData.dimensions || '',
        material: formData.material || '',
        weight: formData.weight || '',
        badges: badgesArray,
        features: featuresArray,
        hasWarranty: formData.hasWarranty === 'yes',
        warranty: formData.hasWarranty === 'yes' ? `${formData.warrantyDuration} ${formData.warrantyUnit}` : 'No Warranty',
        hasGuarantee: formData.hasGuarantee === 'yes',
        guarantee: formData.hasGuarantee === 'yes' ? `${formData.guaranteeDuration} ${formData.guaranteeUnit}` : 'No Guarantee',
        returnPolicy: formData.returnPolicy || '7 Days Replacement for transit damages or defective items',
        deliveryPolicy: formData.deliveryPolicy || 'Free Express Shipping within 2-3 business days with door delivery',
        images: finalImages,
        isActive: true,
        updatedAt: now
      };

      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), productData);
        setMessage(`Product updated successfully with ${finalImages.length} image(s)!`);
        setEditingId(null);
        await fetchProductsAndCategories();
        setActiveTab('manage');
      } else {
        productData.createdAt = now;
        const docRef = await addDoc(collection(db, 'products'), productData);
        await updateDoc(docRef, { id: docRef.id });
        setMessage(`New product published successfully with ${finalImages.length} image(s)!`);
        await fetchProductsAndCategories();
        setActiveTab('manage');
        setSelectedCategoryForManage(formData.categoryId);
      }

      resetProductForm();
      setTimeout(() => setMessage(''), 4000);
    } catch (error) {
      console.error('Error saving product: ', error);
      setMessage('Failed to save product: ' + error.message);
    }
    setLoading(false);
  };

  const handleEditProduct = (prod) => {
    // Extract warranty duration & unit
    let hasWarranty = prod.hasWarranty ? 'yes' : (prod.warranty && !prod.warranty.toLowerCase().includes('no') ? 'yes' : 'no');
    let warrantyDuration = '1';
    let warrantyUnit = 'Years';
    if (prod.warranty && hasWarranty === 'yes') {
      const parts = prod.warranty.split(' ');
      if (parts[0] && !isNaN(parts[0])) warrantyDuration = parts[0];
      if (parts[1]) warrantyUnit = parts[1];
    }

    // Extract guarantee duration & unit
    let hasGuarantee = prod.hasGuarantee ? 'yes' : (prod.guarantee && !prod.guarantee.toLowerCase().includes('no') ? 'yes' : 'no');
    let guaranteeDuration = '1';
    let guaranteeUnit = 'Years';
    if (prod.guarantee && hasGuarantee === 'yes') {
      const gParts = prod.guarantee.split(' ');
      if (gParts[0] && !isNaN(gParts[0])) guaranteeDuration = gParts[0];
      if (gParts[1]) guaranteeUnit = gParts[1];
    }

    setFormData({
      ...prod,
      hasWarranty,
      warrantyDuration,
      warrantyUnit,
      hasGuarantee,
      guaranteeDuration,
      guaranteeUnit,
      returnPolicy: prod.returnPolicy || '7 Days Hassle-Free Replacement for transit damages or defective items',
      deliveryPolicy: prod.deliveryPolicy || 'Free Express Shipping within 2-3 business days with door delivery',
      badges: Array.isArray(prod.badges) ? prod.badges.join(', ') : prod.badges || '',
      features: Array.isArray(prod.features) ? prod.features.join(', ') : prod.features || '',
    });
    setEditingId(prod.id);
    const existing = Array.isArray(prod.images) ? prod.images.filter(Boolean) : (prod.images ? [prod.images] : []);
    setExistingImages(existing);
    setSelectedImages([]);
    setActiveTab('add');
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, 'products', id));
        setMessage('Product deleted successfully');
        await fetchProductsAndCategories();
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        setMessage('Failed to delete: ' + err.message);
      }
      setLoading(false);
    }
  };

  // Products inside currently selected category
  const productsInSelectedCategory = useMemo(() => {
    if (!selectedCategoryForManage) return [];
    let prods = productsByCategory[selectedCategoryForManage] || [];
    if (productSearchQuery.trim()) {
      const q = productSearchQuery.toLowerCase().trim();
      prods = prods.filter(p => p.name?.toLowerCase().includes(q) || p.material?.toLowerCase().includes(q));
    }
    return prods;
  }, [productsByCategory, selectedCategoryForManage, productSearchQuery]);

  const activeCategoryObject = useMemo(() => {
    return allCategoryCards.find(c => c.id === selectedCategoryForManage);
  }, [allCategoryCards, selectedCategoryForManage]);

  // If Admin is not authenticated, show secure Admin Login Screen (No Sign Up allowed)
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 sm:p-6 font-body">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl relative overflow-hidden animate-fade-in">
          
          {/* Decorative Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#8B5E34] via-[#A87442] to-[#5C3A21]" />

          {/* Logo & Shield Header */}
          <div className="text-center mb-6 pt-2">
            <div className="w-16 h-16 rounded-2xl bg-[#8B5E34]/10 text-[#8B5E34] flex items-center justify-center mx-auto mb-3 shadow-inner">
              <ShieldCheck size={36} />
            </div>
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8B5E34] bg-[#8B5E34]/10 px-3 py-1 rounded-full border border-[#8B5E34]/20">
              Restricted Access • Master Admin
            </span>
            <h2 className="font-heading font-extrabold text-2xl text-stone-900 mt-2">
              Bharat Furnitures
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Please sign in with administrator credentials to manage products, inventory, and customer orders.
            </p>
          </div>

          {/* Error Message */}
          {loginError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-bold text-xs text-stone-700 uppercase tracking-wide flex items-center gap-1.5">
                <Mail size={13} className="text-[#8B5E34]" /> Admin Email Address
              </label>
              <input
                type="email"
                required
                value={adminLoginForm.email}
                onChange={(e) => setAdminLoginForm({ ...adminLoginForm, email: e.target.value })}
                placeholder="admin@bharatfurnitures.com"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#8B5E34] focus:bg-white transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-xs text-stone-700 uppercase tracking-wide flex items-center gap-1.5">
                <KeyRound size={13} className="text-[#8B5E34]" /> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={adminLoginForm.password}
                  onChange={(e) => setAdminLoginForm({ ...adminLoginForm, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full pl-4 pr-11 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#8B5E34] focus:bg-white transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Note that Sign Up is permanently disabled */}
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[0.7rem] text-amber-800 leading-relaxed">
              <span className="font-bold">🔒 Security Notice:</span> Sign up is permanently disabled. This portal is strictly restricted to the authorized master administrator.
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-xl bg-[#8B5E34] hover:bg-[#5C3A21] text-white font-bold text-xs sm:text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock size={15} />
                  <span>Unlock Admin Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Back Link */}
          <div className="pt-6 mt-6 border-t border-stone-100 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-[#8B5E34] transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Back to Bharat Furnitures Store</span>
            </Link>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col md:flex-row font-body text-stone-900">
      
      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 active:scale-95"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div>
            <h1 className="font-heading font-extrabold text-base text-[#8B5E34] leading-tight">
              Bharat Furnitures
            </h1>
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-stone-400 block">
              Admin Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link 
            to="/" 
            target="_blank" 
            className="text-xs font-bold text-stone-600 hover:text-[#8B5E34] flex items-center gap-1 bg-stone-50 border border-stone-200 px-2.5 py-1.5 rounded-lg"
          >
            <span>Store</span>
            <ExternalLink size={12} />
          </Link>
          <button
            onClick={handleAdminLogout}
            className="text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
            title="Log Out of Admin"
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Admin Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-50 md:z-20
        w-72 h-screen bg-white border-r border-stone-200 
        flex flex-col justify-between shrink-0
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-stone-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#8B5E34] text-white flex items-center justify-center font-heading font-black text-lg shadow-sm">
                BF
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-stone-900 text-base leading-tight">
                  Bharat Furnitures
                </h2>
                <span className="text-[0.68rem] font-bold text-[#8B5E34] uppercase tracking-wider">
                  Admin Dashboard
                </span>
              </div>
            </div>

            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-stone-400 hover:text-stone-700"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Sidebar Navigation Links */}
        <div className="p-4 flex-1 space-y-1.5 overflow-y-auto">
          <p className="px-3 pt-2 pb-1 text-[0.68rem] font-bold uppercase text-stone-400 tracking-wider">
            Management Menu
          </p>

          {/* 1. Add Product Link */}
          <button
            onClick={() => {
              setActiveTab('add');
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'add'
                ? 'bg-[#8B5E34] text-white shadow-md shadow-[#8B5E34]/20'
                : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <PlusCircle size={18} className={activeTab === 'add' ? 'text-white' : 'text-[#8B5E34]'} />
              <span>{editingId ? 'Edit Product' : 'Add Product'}</span>
            </div>
            {editingId && (
              <span className="text-[0.65rem] bg-amber-400 text-stone-900 px-1.5 py-0.5 rounded-full font-black">
                Active
              </span>
            )}
          </button>

          {/* 2. Manage Products Link */}
          <button
            onClick={() => {
              setActiveTab('manage');
              setSelectedCategoryForManage(null); // Return to categories view
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'manage'
                ? 'bg-[#8B5E34] text-white shadow-md shadow-[#8B5E34]/20'
                : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Layers size={18} className={activeTab === 'manage' ? 'text-white' : 'text-[#8B5E34]'} />
              <span>Manage Products</span>
            </div>
            <span className={`text-[0.7rem] px-2 py-0.5 rounded-full font-extrabold ${
              activeTab === 'manage' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
            }`}>
              {products.length}
            </span>
          </button>

          {/* 3. Orders Link */}
          <button
            onClick={() => {
              setActiveTab('orders');
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-[#8B5E34] text-white shadow-md shadow-[#8B5E34]/20'
                : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag size={18} className={activeTab === 'orders' ? 'text-white' : 'text-[#8B5E34]'} />
              <span>Customer Orders</span>
            </div>
            {orders.length > 0 && (
              <span className={`text-[0.7rem] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                {orders.length}
              </span>
            )}
          </button>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50/70 space-y-3">
          <div className="bg-white p-3 rounded-xl border border-stone-200 text-xs">
            <p className="text-[0.68rem] text-stone-400 uppercase font-bold">Admin Session</p>
            <p className="font-bold text-stone-800 truncate mt-0.5">
              {import.meta.env.VITE_ADMIN_EMAIL || 'admin@bharatfurnitures.com'}
            </p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 text-[0.68rem]">
              <span className="text-stone-500">Pending Orders:</span>
              <span className="font-bold text-amber-600">
                {orders.filter(o => o.orderStatus === 'Placed' || o.paymentStatus === 'Pending').length}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              to="/"
              target="_blank"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold transition-all shadow-2xs"
            >
              <span>Store</span>
              <ExternalLink size={12} />
            </Link>

            <button
              onClick={handleAdminLogout}
              className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer"
              title="Log Out"
            >
              <LogOut size={13} />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-40 animate-fade-in"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl">
        
        {/* Global Toast / Alert Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between gap-3 shadow-sm border animate-fade-in ${
            message.toLowerCase().includes('fail') || message.toLowerCase().includes('error')
              ? 'bg-rose-50 text-rose-800 border-rose-200' 
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="shrink-0" />
              <span>{message}</span>
            </div>
            <button onClick={() => setMessage('')} className="text-stone-400 hover:text-stone-700">✕</button>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 1: ADD / EDIT PRODUCT                                  */}
        {/* ============================================================== */}
        {activeTab === 'add' && (
          <div className="animate-fade-in max-w-4xl">
            {/* Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-[#8B5E34] uppercase tracking-wider">
                  Product Studio
                </span>
                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-stone-900 mt-0.5">
                  {editingId ? 'Edit Furniture Product' : 'Add New Furniture Product'}
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Fill in all product specifications, pricing, dimensions, and upload high-resolution images.
                </p>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={resetProductForm}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {/* Product Form Card */}
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              
              {/* Product Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-bold text-xs text-stone-700 uppercase tracking-wide">
                    Product Title / Name *
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="e.g. Ergonomic Solid Sheesham Study Table"
                    required 
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:border-[#8B5E34] focus:bg-white transition-all" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-xs text-stone-700 uppercase tracking-wide">
                    Category *
                  </label>
                  <select 
                    name="categoryId" 
                    value={formData.categoryId} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:border-[#8B5E34] focus:bg-white transition-all cursor-pointer font-medium"
                  >
                    <option value="">Select a Category</option>
                    {allCategoryCards.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-xs text-stone-700 uppercase tracking-wide">
                    Custom Category ID (Optional)
                  </label>
                  <input 
                    type="text" 
                    name="categoryId" 
                    value={formData.categoryId} 
                    onChange={handleChange} 
                    placeholder="e.g. beds, sofa-sets"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:border-[#8B5E34] focus:bg-white transition-all" 
                  />
                </div>

                {/* Pricing & Stock */}
                <div className="space-y-1.5">
                  <label className="font-bold text-xs text-stone-700 uppercase tracking-wide">
                    Selling Price (₹) *
                  </label>
                  <input 
                    type="number" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleChange} 
                    placeholder="e.g. 4999"
                    required 
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:border-[#8B5E34] focus:bg-white transition-all font-bold" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-xs text-stone-700 uppercase tracking-wide">
                    Original / MRP Price (₹)
                  </label>
                  <input 
                    type="number" 
                    name="originalPrice" 
                    value={formData.originalPrice} 
                    onChange={handleChange} 
                    placeholder="e.g. 7999"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:border-[#8B5E34] focus:bg-white transition-all" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-xs text-stone-700 uppercase tracking-wide">
                    Stock Quantity
                  </label>
                  <input 
                    type="number" 
                    name="stock" 
                    value={formData.stock} 
                    onChange={handleChange} 
                    placeholder="e.g. 50"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:border-[#8B5E34] focus:bg-white transition-all" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-xs text-stone-700 uppercase tracking-wide">
                    Dimensions
                  </label>
                  <input 
                    type="text" 
                    name="dimensions" 
                    value={formData.dimensions} 
                    onChange={handleChange} 
                    placeholder="e.g. 120 x 60 x 75 cm"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:border-[#8B5E34] focus:bg-white transition-all" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-xs text-stone-700 uppercase tracking-wide">
                    Material
                  </label>
                  <input 
                    type="text" 
                    name="material" 
                    value={formData.material} 
                    onChange={handleChange} 
                    placeholder="e.g. Solid Sheesham Wood, Powder Coated Steel"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:border-[#8B5E34] focus:bg-white transition-all" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-xs text-stone-700 uppercase tracking-wide">
                    Weight
                  </label>
                  <input 
                    type="text" 
                    name="weight" 
                    value={formData.weight} 
                    onChange={handleChange} 
                    placeholder="e.g. 14 kg"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:border-[#8B5E34] focus:bg-white transition-all" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-xs text-stone-700 uppercase tracking-wide">
                    Badges (Comma separated)
                  </label>
                  <input 
                    type="text" 
                    name="badges" 
                    value={formData.badges} 
                    onChange={handleChange} 
                    placeholder="e.g. Best Seller, Pure Wood, 5 Yr Warranty"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:border-[#8B5E34] focus:bg-white transition-all" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-xs text-stone-700 uppercase tracking-wide">
                    Features (Comma separated)
                  </label>
                  <input 
                    type="text" 
                    name="features" 
                    value={formData.features} 
                    onChange={handleChange} 
                    placeholder="e.g. Water Resistant, Ergonomic, Pre-assembled"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:border-[#8B5E34] focus:bg-white transition-all" 
                  />
                </div>

                {/* WARRANTY CONFIGURATION */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-stone-800 uppercase tracking-wide flex items-center gap-1.5">
                      <ShieldCheck size={15} className="text-[#8B5E34]" />
                      <span>Product Warranty</span>
                    </label>
                    <span className="text-[0.68rem] text-stone-500">Repair & Replacement</span>
                  </div>

                  {/* Yes / No Toggle */}
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                      <input 
                        type="radio" 
                        name="hasWarranty" 
                        value="yes" 
                        checked={formData.hasWarranty === 'yes'} 
                        onChange={handleChange}
                        className="accent-[#8B5E34]" 
                      />
                      <span>Yes (Warranty Available)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                      <input 
                        type="radio" 
                        name="hasWarranty" 
                        value="no" 
                        checked={formData.hasWarranty === 'no'} 
                        onChange={handleChange}
                        className="accent-[#8B5E34]" 
                      />
                      <span>No Warranty</span>
                    </label>
                  </div>

                  {/* Duration input if Yes */}
                  {formData.hasWarranty === 'yes' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-stone-200/60 animate-fade-in">
                      <div className="flex-1">
                        <input 
                          type="number" 
                          min="1" 
                          name="warrantyDuration" 
                          value={formData.warrantyDuration} 
                          onChange={handleChange} 
                          placeholder="e.g. 1, 2, 6" 
                          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#8B5E34]"
                        />
                      </div>
                      <select 
                        name="warrantyUnit" 
                        value={formData.warrantyUnit} 
                        onChange={handleChange}
                        className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:border-[#8B5E34] cursor-pointer"
                      >
                        <option value="Months">Month(s)</option>
                        <option value="Years">Year(s)</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* GUARANTEE CONFIGURATION */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-stone-800 uppercase tracking-wide flex items-center gap-1.5">
                      <CheckCircle2 size={15} className="text-emerald-700" />
                      <span>Product Guarantee</span>
                    </label>
                    <span className="text-[0.68rem] text-stone-500">Moneyback / Replacement</span>
                  </div>

                  {/* Yes / No Toggle */}
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                      <input 
                        type="radio" 
                        name="hasGuarantee" 
                        value="yes" 
                        checked={formData.hasGuarantee === 'yes'} 
                        onChange={handleChange}
                        className="accent-[#8B5E34]" 
                      />
                      <span>Yes (Guarantee Available)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                      <input 
                        type="radio" 
                        name="hasGuarantee" 
                        value="no" 
                        checked={formData.hasGuarantee === 'no'} 
                        onChange={handleChange}
                        className="accent-[#8B5E34]" 
                      />
                      <span>No Guarantee</span>
                    </label>
                  </div>

                  {/* Duration input if Yes */}
                  {formData.hasGuarantee === 'yes' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-stone-200/60 animate-fade-in">
                      <div className="flex-1">
                        <input 
                          type="number" 
                          min="1" 
                          name="guaranteeDuration" 
                          value={formData.guaranteeDuration} 
                          onChange={handleChange} 
                          placeholder="e.g. 1, 2, 6" 
                          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#8B5E34]"
                        />
                      </div>
                      <select 
                        name="guaranteeUnit" 
                        value={formData.guaranteeUnit} 
                        onChange={handleChange}
                        className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:border-[#8B5E34] cursor-pointer"
                      >
                        <option value="Months">Month(s)</option>
                        <option value="Years">Year(s)</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* RETURN POLICY INPUT CARD */}
                <div className="space-y-1.5 p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-stone-800 uppercase tracking-wide flex items-center gap-1.5">
                      <RotateCcw size={15} className="text-[#8B5E34]" />
                      <span>Return / Replacement Policy</span>
                    </label>
                    <span className="text-[0.68rem] text-stone-500">Customer Assurance</span>
                  </div>
                  <input 
                    type="text" 
                    name="returnPolicy" 
                    value={formData.returnPolicy} 
                    onChange={handleChange} 
                    placeholder="e.g. 7 Days Hassle-Free Replacement for transit damages"
                    className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#8B5E34] transition-all"
                  />
                  <p className="text-[0.68rem] text-stone-400">
                    Displayed on product page as Return & Exchange policy bar.
                  </p>
                </div>

                {/* DELIVERY POLICY INPUT CARD */}
                <div className="space-y-1.5 p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-stone-800 uppercase tracking-wide flex items-center gap-1.5">
                      <Truck size={15} className="text-[#8B5E34]" />
                      <span>Shipping & Delivery Policy</span>
                    </label>
                    <span className="text-[0.68rem] text-stone-500">Dispatch Speed</span>
                  </div>
                  <input 
                    type="text" 
                    name="deliveryPolicy" 
                    value={formData.deliveryPolicy} 
                    onChange={handleChange} 
                    placeholder="e.g. Free Express Shipping within 2-3 business days"
                    className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#8B5E34] transition-all"
                  />
                  <p className="text-[0.68rem] text-stone-400">
                    Displayed on product page as Delivery timeline & handling note.
                  </p>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-bold text-xs text-stone-700 uppercase tracking-wide">
                    Detailed Product Description *
                  </label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    rows="4" 
                    required 
                    placeholder="Describe craftsmanship, wood quality, ergonomics, and maintenance guidelines..."
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:border-[#8B5E34] focus:bg-white transition-all leading-relaxed" 
                  />
                </div>

              </div>

              {/* Product Photos Upload Section (Up to 4 Photos with Cross buttons) */}
              <div className="pt-4 border-t border-stone-100">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <label className="font-bold text-xs text-stone-700 uppercase tracking-wide block">
                      Product Photos (Maximum 4 Photos) *
                    </label>
                    <span className="text-[0.68rem] text-stone-400 block mt-0.5">
                      Upload up to 4 photos (Front, Side, Dimension, Details). Click ✕ on any photo to remove it.
                    </span>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    existingImages.length + selectedImages.length >= 4
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {existingImages.length + selectedImages.length} of 4 Photos
                  </span>
                </div>

                {/* Thumbnails Grid (2 columns on mobile, 4 on desktop) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-2">
                  {/* 1. Existing Saved Images (in Edit mode) */}
                  {existingImages.map((url, idx) => (
                    <div 
                      key={`exist-${idx}`} 
                      className="relative aspect-square rounded-2xl overflow-hidden border-2 border-stone-200 bg-stone-100 group shadow-xs hover:border-[#8B5E34] transition-all"
                    >
                      <img src={url} alt={`Saved ${idx + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1.5 left-1.5 text-[0.62rem] font-bold bg-black/75 text-white px-2 py-0.5 rounded-md backdrop-blur-xs">
                        Photo #{idx + 1}
                      </span>
                      {/* Red Circular Cross Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(idx)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer"
                        title="Remove photo"
                      >
                        <X size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}

                  {/* 2. Newly Selected Images */}
                  {selectedImages.map((item, idx) => (
                    <div 
                      key={`new-${idx}`} 
                      className="relative aspect-square rounded-2xl overflow-hidden border-2 border-[#8B5E34] bg-stone-100 group shadow-xs"
                    >
                      <img src={item.previewUrl} alt={`New ${idx + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1.5 left-1.5 text-[0.62rem] font-bold bg-[#8B5E34] text-white px-2 py-0.5 rounded-md shadow-xs">
                        New #{existingImages.length + idx + 1}
                      </span>
                      {/* Red Circular Cross Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveSelectedImage(idx)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer"
                        title="Remove photo"
                      >
                        <X size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}

                  {/* 3. Add Photo Slot (Only shown if less than 4 photos selected) */}
                  {existingImages.length + selectedImages.length < 4 && (
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-stone-300 hover:border-[#8B5E34] bg-stone-50 hover:bg-[#8B5E34]/5 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all group">
                      <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 text-[#8B5E34] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform shadow-2xs">
                        <PlusCircle size={20} />
                      </div>
                      <span className="text-xs font-bold text-stone-700 group-hover:text-[#8B5E34]">
                        + Add Photo
                      </span>
                      <span className="text-[0.62rem] text-stone-400 mt-0.5">
                        ({4 - (existingImages.length + selectedImages.length)} slot left)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleMultipleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-3.5 bg-[#8B5E34] hover:bg-[#5C3A21] text-white rounded-2xl font-bold text-sm shadow-md active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Uploading & Saving Product...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>{editingId ? 'Update Product' : 'Publish Product to Store'}</span>
                    </>
                  )}
                </button>

                {editingId && (
                  <button 
                    type="button" 
                    onClick={() => {
                      resetProductForm();
                      setActiveTab('manage');
                    }}
                    className="py-3.5 px-6 rounded-2xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-sm transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>

            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 2: MANAGE PRODUCTS                                     */}
        {/* ============================================================== */}
        {activeTab === 'manage' && (
          <div className="animate-fade-in space-y-6">
            
            {/* VIEW A: CATEGORIES GRID (When no category is clicked) */}
            {!selectedCategoryForManage && (
              <div>
                <div className="mb-6">
                  <span className="text-xs font-bold text-[#8B5E34] uppercase tracking-wider">
                    Inventory Directory
                  </span>
                  <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-stone-900 mt-0.5">
                    Select a Category to Manage Products
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Click any furniture category below to view, edit, or delete its products.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {allCategoryCards.map(cat => {
                    const count = (productsByCategory[cat.id] || []).length;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCategoryForManage(cat.id)}
                        className="group bg-white rounded-3xl p-6 border border-stone-200 shadow-xs hover:shadow-lg hover:border-[#8B5E34]/40 hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-3xl p-2.5 rounded-2xl bg-stone-50 border border-stone-100 group-hover:scale-110 transition-transform">
                              {cat.icon || '🪑'}
                            </span>
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#8B5E34]/10 text-[#8B5E34] border border-[#8B5E34]/20">
                              {count} {count === 1 ? 'Product' : 'Products'}
                            </span>
                          </div>

                          <h3 className="font-heading font-extrabold text-lg text-stone-900 group-hover:text-[#8B5E34] transition-colors">
                            {cat.name}
                          </h3>
                          <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                            {cat.description || 'Explore products in this furniture category.'}
                          </p>
                        </div>

                        <div className="pt-5 mt-5 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#8B5E34]">
                          <span>Manage {count} Products</span>
                          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW B: PRODUCTS LIST INSIDE SELECTED CATEGORY */}
            {selectedCategoryForManage && (
              <div>
                {/* Category Header & Back Button */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedCategoryForManage(null);
                        setProductSearchQuery('');
                      }}
                      className="w-10 h-10 rounded-2xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 flex items-center justify-center transition-all shadow-xs"
                      title="Back to Categories"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#8B5E34] uppercase tracking-wider">
                          Category Products
                        </span>
                        <span className="text-xs bg-stone-100 text-stone-600 px-2.5 py-0.5 rounded-full font-bold">
                          {activeCategoryObject?.id}
                        </span>
                      </div>
                      <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-stone-900 flex items-center gap-2 mt-0.5">
                        <span>{activeCategoryObject?.icon || '📦'}</span>
                        <span>{activeCategoryObject?.name}</span>
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setFormData({ ...initialState, categoryId: selectedCategoryForManage });
                        setEditingId(null);
                        setActiveTab('add');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#8B5E34] hover:bg-[#5C3A21] text-white font-bold text-xs shadow-sm flex items-center gap-2 active:scale-95 transition-all"
                    >
                      <PlusCircle size={15} />
                      <span>Add Product in this Category</span>
                    </button>
                  </div>
                </div>

                {/* Search Bar for products in category */}
                <div className="mb-6 flex items-center bg-white border border-stone-200 rounded-2xl px-4 py-2.5 max-w-md shadow-xs">
                  <Search size={16} className="text-stone-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    placeholder={`Search in ${activeCategoryObject?.name}...`}
                    className="w-full bg-transparent text-xs sm:text-sm text-stone-800 outline-none placeholder:text-stone-400"
                  />
                  {productSearchQuery && (
                    <button onClick={() => setProductSearchQuery('')} className="text-xs text-stone-400 hover:text-stone-600">✕</button>
                  )}
                </div>

                {/* Products List */}
                {productsInSelectedCategory.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-6">
                    <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3 text-2xl">
                      📦
                    </div>
                    <h3 className="font-heading font-extrabold text-lg text-stone-900">
                      No Products Found
                    </h3>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-6">
                      {productSearchQuery 
                        ? 'No products matched your search term in this category.' 
                        : 'There are currently no products listed under this category.'}
                    </p>
                    <button
                      onClick={() => {
                        setFormData({ ...initialState, categoryId: selectedCategoryForManage });
                        setEditingId(null);
                        setActiveTab('add');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#8B5E34] hover:bg-[#5C3A21] text-white text-xs font-bold shadow-md transition-all inline-flex items-center gap-2"
                    >
                      <PlusCircle size={14} />
                      <span>Add First Product Here</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {productsInSelectedCategory.map(prod => (
                      <div 
                        key={prod.id} 
                        className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-stone-100 mb-4 border border-stone-100">
                            <img 
                              src={prod.images?.[0] || 'https://via.placeholder.com/300?text=No+Image'} 
                              alt={prod.name} 
                              className="w-full h-full object-cover" 
                            />
                            {prod.stock <= 5 && (
                              <span className="absolute top-3 left-3 text-[0.65rem] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-xs">
                                Low Stock: {prod.stock}
                              </span>
                            )}
                          </div>

                          <h4 className="font-heading font-extrabold text-base text-stone-900 line-clamp-1">
                            {prod.name}
                          </h4>
                          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                            {prod.description}
                          </p>
                          
                          <div className="mt-3 flex items-baseline gap-2">
                            <span className="font-heading font-extrabold text-lg text-stone-900">
                              ₹{prod.price?.toLocaleString('en-IN')}
                            </span>
                            {prod.originalPrice > prod.price && (
                              <span className="text-xs text-stone-400 line-through">
                                ₹{prod.originalPrice?.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4 mt-4 border-t border-stone-100 flex items-center gap-2">
                          <button
                            onClick={() => handleEditProduct(prod)}
                            className="flex-1 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all border border-rose-200 active:scale-95 cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 3: ORDERS MANAGEMENT (DIVIDED BY STATUS)                */}
        {/* ============================================================== */}
        {activeTab === 'orders' && (
          <div className="animate-fade-in space-y-6">
            
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#8B5E34] uppercase tracking-wider">
                  Fulfillment & Tracking
                </span>
                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-stone-900 mt-0.5">
                  Customer Orders
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Manage delivery progression, payment verification, and customer delivery addresses.
                </p>
              </div>

              {/* Order Search Bar */}
              <div className="flex items-center bg-white border border-stone-200 rounded-2xl px-4 py-2.5 max-w-sm shadow-xs">
                <Search size={16} className="text-stone-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  placeholder="Search by Order ID, Name, Phone..."
                  className="w-full bg-transparent text-xs text-stone-800 outline-none placeholder:text-stone-400"
                />
                {orderSearchQuery && (
                  <button onClick={() => setOrderSearchQuery('')} className="text-xs text-stone-400 hover:text-stone-600">✕</button>
                )}
              </div>
            </div>

            {/* Status Tabs Navigation Bar (Placed, Confirmed, Shipped, etc.) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {ORDER_STATUS_TABS.map((tab) => {
                const count = orderCounts[tab.id] || 0;
                const isActive = orderStatusFilter === tab.id;
                const IconComponent = tab.icon;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setOrderStatusFilter(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border active:scale-95 cursor-pointer ${
                      isActive
                        ? 'bg-[#8B5E34] text-white border-[#8B5E34] shadow-md shadow-[#8B5E34]/20'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <IconComponent size={14} className={isActive ? 'text-white' : tab.color} />
                    <span>{tab.label}</span>
                    <span className={`text-[0.65rem] px-2 py-0.5 rounded-full font-black ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : count > 0 
                          ? 'bg-stone-100 text-stone-800' 
                          : 'bg-stone-50 text-stone-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-6">
                <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3 text-2xl">
                  📋
                </div>
                <h3 className="font-heading font-extrabold text-lg text-stone-900">
                  No {orderStatusFilter !== 'all' ? orderStatusFilter : ''} Orders Found
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                  {orderSearchQuery
                    ? 'No orders matched your search criteria.'
                    : `Currently there are zero orders with status "${orderStatusFilter}".`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  return (
                    <div 
                      key={order.id} 
                      className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs hover:shadow-sm transition-all flex flex-col gap-4"
                    >
                      {/* Top Bar: Order ID, Date, Amount, Payment Method, Payment Status */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-heading font-extrabold text-base text-[#8B5E34]">
                              {order.orderId || order.id}
                            </span>
                            <span className="text-xs text-stone-400 font-medium">
                              ({order.createdAtFormatted || 'Recent'})
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-stone-800 mt-0.5">
                            Customer: <span className="font-bold">{order.customer?.fullName}</span> • 📞 {order.customer?.phone}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-heading font-extrabold text-base text-stone-900">
                            ₹{order.totalAmount?.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[0.68rem] font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                            {order.paymentMethod}
                          </span>
                          <span className={`text-[0.68rem] font-bold px-2.5 py-0.5 rounded-full border ${
                            order.paymentStatus === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {order.paymentStatus === 'Paid' ? '✓ Paid' : '⏳ Payment Pending'}
                          </span>
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="flex flex-wrap items-center gap-3">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-stone-50 border border-stone-200/60 rounded-xl p-2 max-w-xs">
                            <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-stone-900 truncate">{item.name}</p>
                              <p className="text-[0.68rem] text-stone-500">Qty: {item.quantity} × ₹{item.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Bottom Status Update Controls & View Details Button */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-100 bg-stone-50/50 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-4 sm:p-5 rounded-b-3xl">
                        
                        <div className="flex flex-wrap items-center gap-4">
                          {/* Delivery Status Dropdown */}
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-stone-600">Delivery:</label>
                            <select
                              disabled={updatingOrderId === order.id}
                              value={order.orderStatus || 'Placed'}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer transition-all ${
                                STATUS_COLORS[order.orderStatus] || 'bg-stone-50 text-stone-700 border-stone-200'
                              }`}
                            >
                              <option value="Placed">🟡 Placed</option>
                              <option value="Confirmed">🟠 Confirmed</option>
                              <option value="Shipped">🟣 Shipped</option>
                              <option value="Out for Delivery">🚚 Out for Delivery</option>
                              <option value="Delivered">🟢 Delivered</option>
                              <option value="Cancelled">🔴 Cancelled</option>
                            </select>
                          </div>

                          {/* Payment Status Dropdown */}
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-stone-600">Payment:</label>
                            <select
                              disabled={updatingOrderId === order.id}
                              value={order.paymentStatus || 'Pending'}
                              onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value)}
                              className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border focus:outline-none cursor-pointer transition-all ${
                                order.paymentStatus === 'Paid'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              <option value="Pending">⏳ Pending</option>
                              <option value="Paid">✅ Paid</option>
                            </select>
                            {updatingOrderId === order.id && (
                              <span className="text-[0.68rem] text-stone-400 animate-pulse">Saving...</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Send WhatsApp Update Button */}
                          <button
                            type="button"
                            onClick={() => sendWhatsAppUpdate(order)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
                            title="Send status update to customer on WhatsApp"
                          >
                            <MessageSquare size={13} />
                            <span>Notify on WhatsApp</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye size={13} />
                            <span>View Full Details & Address</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

      </main>

      {/* ============================================================== */}
      {/* ORDER DETAILS & ADDRESS MODAL                                   */}
      {/* ============================================================== */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedOrder(null)}
        >
          <div 
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#8B5E34]">Order Details</span>
                  <span className={`text-[0.68rem] font-bold px-2.5 py-0.5 rounded-full border ${
                    STATUS_COLORS[selectedOrder.orderStatus] || 'bg-stone-100 text-stone-700 border-stone-200'
                  }`}>
                    {selectedOrder.orderStatus || 'Placed'}
                  </span>
                </div>
                <h3 className="font-heading font-extrabold text-xl text-stone-900 mt-0.5">
                  {selectedOrder.orderId || selectedOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Order Meta Bar: Order ID, Date, Status */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 mb-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-200">
                <div>
                  <span className="text-[0.68rem] text-stone-400 font-bold uppercase tracking-wider block">
                    Order Tracking ID
                  </span>
                  <span className="font-heading font-extrabold text-lg text-[#8B5E34]">
                    {selectedOrder.orderId || selectedOrder.id}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[0.68rem] text-stone-400 font-bold uppercase tracking-wider block">
                    Order Placed At
                  </span>
                  <span className="text-xs font-bold text-stone-800">
                    {selectedOrder.createdAtFormatted || 'Just Now'}
                  </span>
                </div>
              </div>

              {/* Delivery Timing Highlight */}
              <div className="mt-3 flex items-center justify-between text-xs bg-amber-50/80 border border-amber-200/70 p-2.5 rounded-xl text-[#8B5E34]">
                <span className="flex items-center gap-1.5 font-bold">
                  <Truck size={14} className="text-[#8B5E34]" />
                  <span>Guaranteed Delivery:</span>
                </span>
                <span className="font-bold text-stone-900">
                  {selectedOrder.estimatedDeliveryDate ? `Within 2 Days (${selectedOrder.estimatedDeliveryDate})` : 'Within 2-3 Business Days'}
                </span>
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 text-xs">
              {/* Customer Box */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-2">
                <h4 className="font-bold text-stone-900 uppercase text-[0.68rem] tracking-wide flex items-center gap-1 text-[#8B5E34]">
                  <Phone size={12} /> Customer Contact
                </h4>
                <p className="font-bold text-stone-900 text-sm">{selectedOrder.customer?.fullName}</p>
                <p className="text-stone-600 flex items-center gap-1.5">
                  <Phone size={12} className="text-stone-400" />
                  <span>Mobile: <strong className="text-stone-900">{selectedOrder.customer?.phone}</strong></span>
                </p>
                <p className="text-stone-600 flex items-center gap-1.5">
                  <Mail size={12} className="text-stone-400" />
                  <span>Email: <span className="text-stone-700">{selectedOrder.customer?.email || 'N/A'}</span></span>
                </p>
              </div>

              {/* Full Delivery Address Box */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-2">
                <h4 className="font-bold text-stone-900 uppercase text-[0.68rem] tracking-wide flex items-center gap-1 text-[#8B5E34]">
                  <MapPin size={12} /> Delivery Destination
                </h4>
                <p className="text-stone-800 font-medium leading-relaxed">
                  {selectedOrder.customer?.address}
                </p>
                <p className="text-stone-700 font-semibold">
                  {selectedOrder.customer?.city}, {selectedOrder.customer?.state} - <span className="font-bold text-stone-900">{selectedOrder.customer?.pincode}</span>
                </p>
                {selectedOrder.customer?.landmark && (
                  <p className="text-[0.7rem] text-stone-500 bg-white p-1.5 rounded-lg border border-stone-200/60">
                    <span className="font-bold text-stone-700">Landmark:</span> {selectedOrder.customer?.landmark}
                  </p>
                )}
              </div>
            </div>

            {/* Items List with Material, Dimensions, Qty & Price */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                  Ordered Items ({selectedOrder.items?.length || 0})
                </h4>
                <span className="text-[0.68rem] text-stone-400 font-medium">
                  Total Items Qty: {selectedOrder.totalItems || selectedOrder.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 1}
                </span>
              </div>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl p-3 bg-white max-h-56 overflow-y-auto space-y-1">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2.5 first:pt-1 last:pb-1">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-stone-900">{item.name}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[0.68rem] text-stone-500">
                          <span>Qty: <strong className="text-stone-700">{item.quantity}</strong> × ₹{item.price?.toLocaleString('en-IN')}</span>
                          {item.material && <span>• {item.material}</span>}
                          {item.dimensions && <span>• {item.dimensions}</span>}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-stone-900">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Details Breakdown (Matches Checkout Summary) */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 mb-5 space-y-2 text-xs">
              <h4 className="font-bold text-stone-700 uppercase text-[0.68rem] tracking-wide mb-2 pb-1 border-b border-stone-200">
                Payment & Billing Breakdown
              </h4>
              <div className="flex justify-between text-stone-600">
                <span>Subtotal Items</span>
                <span className="font-semibold text-stone-900">₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span className="flex items-center gap-1">
                  <Truck size={12} className="text-[#8B5E34]" /> Express Delivery
                </span>
                <span className="font-semibold text-emerald-700 uppercase">FREE</span>
              </div>
              {selectedOrder.totalSavings > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Festive Discount</span>
                  <span>-₹{selectedOrder.totalSavings.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>Payment Method</span>
                <span className="font-bold text-stone-900">{selectedOrder.paymentMethod}</span>
              </div>
              {selectedOrder.razorpayPaymentId && (
                <div className="flex justify-between text-stone-600 text-[0.7rem] bg-white p-2 rounded-xl border border-stone-200">
                  <span className="font-bold text-stone-700">Razorpay Payment ID:</span>
                  <span className="font-mono text-stone-900 break-all">{selectedOrder.razorpayPaymentId}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-stone-900 pt-2 border-t border-stone-200">
                <span>Total Received / Payable</span>
                <span className="font-heading text-lg text-[#8B5E34]">
                  ₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Quick Status Modifiers Inside Modal */}
            <div className="bg-stone-50/80 rounded-2xl p-4 border border-stone-200/80 mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[0.68rem] text-stone-500 uppercase font-bold block mb-1">Update Delivery</span>
                <select
                  disabled={updatingOrderId === selectedOrder.id}
                  value={selectedOrder.orderStatus || 'Placed'}
                  onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer transition-all ${
                    STATUS_COLORS[selectedOrder.orderStatus] || 'bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                >
                  <option value="Placed">🟡 Placed</option>
                  <option value="Confirmed">🟠 Confirmed</option>
                  <option value="Shipped">🟣 Shipped</option>
                  <option value="Out for Delivery">🚚 Out for Delivery</option>
                  <option value="Delivered">🟢 Delivered</option>
                  <option value="Cancelled">🔴 Cancelled</option>
                </select>
              </div>

              <div>
                <span className="text-[0.68rem] text-stone-500 uppercase font-bold block mb-1">Payment Status</span>
                <div className="flex items-center gap-2">
                  <select
                    disabled={updatingOrderId === selectedOrder.id}
                    value={selectedOrder.paymentStatus || 'Pending'}
                    onChange={(e) => handleUpdatePaymentStatus(selectedOrder.id, e.target.value)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer transition-all ${
                      selectedOrder.paymentStatus === 'Paid'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    <option value="Pending">⏳ Pending</option>
                    <option value="Paid">✅ Paid</option>
                  </select>
                  {selectedOrder.paymentStatus !== 'Paid' && (
                    <button
                      type="button"
                      onClick={() => handleUpdatePaymentStatus(selectedOrder.id, 'Paid')}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      Mark as Paid
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Action Bar Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🖨️ Print Invoice / Order Slip</span>
              </button>

              <button
                type="button"
                onClick={() => sendWhatsAppUpdate(selectedOrder)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare size={14} />
                <span>Notify Customer on WhatsApp</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;
