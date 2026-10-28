import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import {
  ShoppingBag,
  User,
  LogOut,
  ChevronDown,
  Heart,
  Package,
  Menu,
  X,
  Search,
  Phone,
  ChevronRight,
  Layers,
  Sparkles,
  Truck
} from 'lucide-react';

export default function Navbar() {
  const { currentUser, openAuthModal, logout } = useAuth();
  const { totalItems, openCart } = useCart();
  const { totalLiked, openWishlist } = useWishlist();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync mobile search input with URL search param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q !== null) {
      setMobileSearchQuery(q);
    }
  }, [location.search]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Fetch categories for the mobile drawer
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const catSnap = await getDocs(collection(db, 'categories'));
        const catData = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(catData);
      } catch (error) {
        console.error("Error fetching categories in Navbar:", error);
      }
    };
    fetchCats();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMobileSearch = (e) => {
    if (e) e.preventDefault();
    const query = mobileSearchQuery.trim();
    setIsMobileMenuOpen(false);

    // Always navigate to /category/all with ?q= so the search searches ALL products across all categories
    if (query) {
      navigate(`/category/all?q=${encodeURIComponent(query)}`);
    } else {
      if (location.pathname.startsWith('/category/')) {
        const newParams = new URLSearchParams(location.search);
        newParams.delete('q');
        navigate(`${location.pathname}?${newParams.toString()}`);
      } else {
        navigate('/category/all');
      }
    }
  };

  // Map category to a clear, recognizable thumbnail photo
  const getCategoryThumbnail = (cat) => {
    if (cat?.image) return cat.image;
    const id = (cat?.id || '').toLowerCase();
    const name = (cat?.name || '').toLowerCase();

    if (id.includes('study') || name.includes('study') || name.includes('laptop')) {
      return 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=120&q=80';
    }
    if (id.includes('chair') || name.includes('chair')) {
      return 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=120&q=80';
    }
    if (id.includes('computer') || id.includes('work') || name.includes('computer') || name.includes('desk')) {
      return 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=120&q=80';
    }
    if (id.includes('storage') || id.includes('rack') || name.includes('storage') || name.includes('rack')) {
      return 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=120&q=80';
    }
    if (id.includes('dining') || name.includes('dining') || name.includes('utility')) {
      return 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=120&q=80';
    }
    if (id.includes('bed') || name.includes('bed')) {
      return 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=120&q=80';
    }
    return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=120&q=80';
  };

  const getUserInitials = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName.charAt(0).toUpperCase();
    }
    if (currentUser?.email) {
      return currentUser.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName.split(' ')[0];
    }
    if (currentUser?.email) {
      return currentUser.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <>
      <nav className="sticky top-0 z-[100] py-3 bg-white/95 backdrop-blur-md border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between">

          {/* Left section: 3-line hamburger menu toggle on Mobile + Brand Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* 3-line Toggle Sidebar button (Mobile only) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-stone-800 hover:bg-stone-100 transition-colors flex items-center justify-center active:scale-95"
              aria-label="Open Navigation Menu"
            >
              <Menu size={24} className="stroke-[2.2]" />
            </button>

            {/* Brand Logo & Name */}
            <Link to="/" className="group flex items-center gap-2.5 py-1 select-none">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-heading font-black text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-primary via-[#8B5E34] to-secondary bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                    Bharat
                  </span>
                  {/* Glowing Logo Badge right after Bharat */}
                  <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-[#8B5E34] via-[#D4A373] to-[#FAEDCD] shadow-sm flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                    <img
                      src="/logo.png"
                      alt="Bharat Furnitures Logo"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>
                <span className="text-[0.62rem] sm:text-[0.7rem] font-bold tracking-[0.22em] uppercase text-stone-500 font-sans mt-0.5 pl-0.5">
                  Furnitures
                </span>
              </div>
            </Link>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-4">

            {/* Call support icon (Visible on mobile/desktop like reference site) */}
            <a
              href="tel:+919302530042"
              className="p-2 sm:p-2.5 rounded-full hover:bg-stone-100 text-stone-700 transition-colors flex items-center justify-center group"
              title="Customer Support: +91 93025 30042"
              aria-label="Contact Support"
            >
              <Phone size={19} className="group-hover:text-[#8B5E34] transition-colors" />
            </a>

            {/* Liked / Wishlist Button with Badge (Desktop & Tablet) */}
            <button
              type="button"
              onClick={openWishlist}
              className="hidden sm:flex relative p-2.5 rounded-full hover:bg-stone-100 text-stone-700 transition-colors items-center justify-center group"
              aria-label="Liked Products"
            >
              <Heart size={21} className={`transition-colors ${totalLiked > 0 ? 'fill-rose-500 text-rose-500' : 'group-hover:text-rose-500'}`} />
              {totalLiked > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-rose-500 text-white text-[0.68rem] font-bold flex items-center justify-center shadow-md animate-scale-in">
                  {totalLiked}
                </span>
              )}
            </button>

            {/* Cart Button with Count Badge (Always visible on mobile & desktop) */}
            <button
              type="button"
              onClick={openCart}
              className="relative p-2 sm:p-2.5 rounded-full hover:bg-stone-100 text-stone-700 transition-colors flex items-center justify-center group"
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={21} className="group-hover:text-[#8B5E34] transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-[#8B5E34] text-white text-[0.68rem] font-bold flex items-center justify-center shadow-md animate-scale-in">
                  {totalItems}
                </span>
              )}
            </button>

            {/* My Orders Direct Icon (Desktop only) */}
            <Link
              to="/orders"
              className="hidden sm:flex relative p-2.5 rounded-full hover:bg-stone-100 text-stone-700 transition-colors items-center justify-center group"
              title="My Orders & Tracking"
              aria-label="My Orders"
            >
              <Package size={21} className="group-hover:text-[#8B5E34] transition-colors" />
            </Link>

            {/* User Authentication Menu / Profile Dropdown */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 p-1 sm:px-3 sm:py-1.5 rounded-full border border-stone-200 hover:border-stone-300 bg-stone-50 hover:bg-stone-100 transition-all text-xs font-semibold text-stone-800"
                >
                  <div className="w-7 h-7 rounded-full bg-[#8B5E34] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {getUserInitials()}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {getUserDisplayName()}
                  </span>
                  <ChevronDown size={14} className="text-stone-400" />
                </button>

                {/* Profile Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-fade-in divide-y divide-stone-100">
                    <div className="px-4 py-2.5">
                      <p className="text-xs font-bold text-stone-900 truncate">
                        {currentUser.displayName || 'Bharat Furnitures Member'}
                      </p>
                      <p className="text-[0.68rem] text-stone-500 truncate mt-0.5">
                        {currentUser.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/orders"
                        onClick={() => setDropdownOpen(false)}
                        className="w-full px-4 py-2 text-left text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2.5 font-bold transition-colors"
                      >
                        <Package size={16} className="text-[#8B5E34]" />
                        <span>My Orders & Tracking</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          openWishlist();
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-stone-700 hover:bg-stone-50 flex items-center justify-between font-bold transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Heart size={16} className={totalLiked > 0 ? "fill-rose-500 text-rose-500" : "text-rose-500"} />
                          <span>Wishlist & Liked Items</span>
                        </div>
                        {totalLiked > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600 text-[0.65rem] font-bold">
                            {totalLiked}
                          </span>
                        )}
                      </button>
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-semibold transition-colors"
                      >
                        <LogOut size={15} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('manual')}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <User size={13} />
                <span>Sign In</span>
              </button>
            )}

          </div>
        </div>

        {/* Mobile Search Bar below Header (Reference UI layout) */}
        <div className="md:hidden px-3 pt-2.5 pb-1">
          <form
            onSubmit={handleMobileSearch}
            className="flex items-center bg-[#F4ECE1] border border-[#E8DED1] focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-full px-3.5 py-2 transition-all shadow-inner"
          >
            <input
              type="text"
              placeholder="SEARCH PRODUCTS..."
              value={mobileSearchQuery}
              onChange={(e) => setMobileSearchQuery(e.target.value)}
              className="border-none bg-transparent outline-none w-full font-body text-xs text-text-main placeholder:text-text-muted/70 tracking-wide"
            />
            {mobileSearchQuery && (
              <button
                type="button"
                onClick={() => {
                  setMobileSearchQuery('');
                  if (location.pathname.startsWith('/category/')) {
                    const newParams = new URLSearchParams(location.search);
                    newParams.delete('q');
                    navigate(`${location.pathname}?${newParams.toString()}`);
                  }
                }}
                className="text-stone-400 hover:text-stone-700 p-0.5 mr-1"
                aria-label="Clear Search Input"
              >
                <X size={14} />
              </button>
            )}
            <button
              type="submit"
              className="text-[#8B5E34] hover:text-primary transition-colors p-0.5"
              aria-label="Submit Search"
            >
              <Search size={16} />
            </button>
          </form>
        </div>
      </nav>

      {/* MOBILE SLIDE-OUT TOGGLE SIDEBAR (DRAWER) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[200] md:hidden">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 left-0 w-[84%] max-w-[320px] bg-white shadow-2xl flex flex-col z-10 animate-slide-right transform transition-transform duration-300 overflow-hidden">

            {/* Drawer Header with Logo and Close button */}
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 group select-none"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="font-heading font-black text-lg tracking-tight bg-gradient-to-r from-primary to-[#8B5E34] bg-clip-text text-transparent">
                      Bharat
                    </span>
                    <div className="w-6 h-6 rounded-full p-[1.5px] bg-gradient-to-tr from-[#8B5E34] to-[#D4A373] shadow-xs flex items-center justify-center shrink-0">
                      <img src="/logo.png" alt="Logo" className="w-full h-full object-cover rounded-full" />
                    </div>
                  </div>
                  <span className="text-[0.6rem] font-bold tracking-[0.2em] uppercase text-stone-500 font-sans mt-0.5 pl-0.5">
                    Furnitures
                  </span>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-200 text-stone-600 transition-colors"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-4 py-3 divide-y divide-stone-100">

              {/* SECTION 1: ALL CATEGORIES & CATEGORY LIST (Pehle categories) */}
              <div className="pb-4">
                <p className="text-[0.68rem] uppercase tracking-wider font-extrabold text-[#8B5E34] mb-2 px-2 flex items-center gap-1.5">
                  <Layers size={13} />
                  <span>Explore Categories</span>
                </p>

                <div className="flex flex-col gap-1.5">
                  {/* ALL CATEGORIES LINK */}
                  <Link
                    to="/category/all"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold tracking-wider transition-all ${location.pathname === '/category/all'
                      ? 'bg-primary/10 text-primary border-l-4 border-primary shadow-xs'
                      : 'text-stone-800 hover:bg-stone-100'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0 flex items-center justify-center shadow-xs">
                        <span className="text-sm">🪑</span>
                      </div>
                      <span className="uppercase font-bold">ALL CATEGORIES</span>
                    </div>
                    <ChevronRight size={15} className="text-stone-400" />
                  </Link>

                  {/* Individual Categories */}
                  {categories.map((cat) => {
                    const isActive = location.pathname === `/category/${cat.id}`;
                    const thumbUrl = getCategoryThumbnail(cat);
                    return (
                      <Link
                        key={cat.id}
                        to={`/category/${cat.id}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs tracking-wider transition-all ${isActive
                          ? 'bg-primary/10 text-primary font-bold border-l-4 border-primary shadow-xs'
                          : 'text-stone-700 font-medium hover:bg-stone-50 hover:text-stone-900'
                          }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0 shadow-xs">
                            <img
                              src={thumbUrl}
                              alt={cat.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                          <span className={`truncate ${isActive ? 'font-bold text-primary' : 'font-medium'}`}>
                            {cat.name}
                          </span>
                        </div>
                        <ChevronRight size={14} className="text-stone-300 shrink-0 ml-1" />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: USER ACTIVITY (Orders, Track Orders, Liked Items, Cart) */}
              <div className="py-4">
                <p className="text-[0.68rem] uppercase tracking-wider font-extrabold text-[#8B5E34] mb-2 px-2 flex items-center gap-1.5">
                  <Sparkles size={13} />
                  <span>My Activity & Account</span>
                </p>

                <div className="flex flex-col gap-1.5">
                  {/* Orders */}
                  <Link
                    to="/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-800 hover:bg-stone-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-[#8B5E34] group-hover:bg-amber-100 transition-colors">
                        <Package size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">My Orders</p>
                        <p className="text-[0.65rem] text-stone-500">View past purchase history</p>
                      </div>
                    </div>
                    <ChevronRight size={15} className="text-stone-400" />
                  </Link>

                  {/* Track Orders */}
                  <Link
                    to="/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-800 hover:bg-stone-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                        <Truck size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">Track Orders</p>
                        <p className="text-[0.65rem] text-stone-500">Live order shipment status</p>
                      </div>
                    </div>
                    <ChevronRight size={15} className="text-stone-400" />
                  </Link>

                  {/* Liked Items */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openWishlist();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-800 hover:bg-stone-100 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 group-hover:bg-rose-100 transition-colors">
                        <Heart size={16} className={totalLiked > 0 ? "fill-rose-500" : ""} />
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">Liked Items</p>
                        <p className="text-[0.65rem] text-stone-500">Saved wishlist products</p>
                      </div>
                    </div>
                    {totalLiked > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[0.68rem] font-bold shadow-xs">
                        {totalLiked}
                      </span>
                    ) : (
                      <ChevronRight size={15} className="text-stone-400" />
                    )}
                  </button>

                  {/* Cart */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openCart();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-800 hover:bg-stone-100 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-100 transition-colors">
                        <ShoppingBag size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">Shopping Cart</p>
                        <p className="text-[0.65rem] text-stone-500">Check items in cart</p>
                      </div>
                    </div>
                    {totalItems > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#8B5E34] text-white text-[0.68rem] font-bold shadow-xs">
                        {totalItems}
                      </span>
                    ) : (
                      <ChevronRight size={15} className="text-stone-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* SECTION 3: QUICK CONTACT & SUPPORT */}
              <div className="pt-4">
                <a
                  href="tel:+919302530042"
                  className="flex items-center gap-3 p-3 rounded-2xl bg-stone-100 hover:bg-stone-200/80 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-white shadow-xs flex items-center justify-center text-primary">
                    <Phone size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">Need Help or Custom Furniture?</p>
                    <p className="text-[0.68rem] text-stone-600 font-medium">Call us: +91 93025 30042</p>
                  </div>
                </a>
              </div>

            </div>

            {/* Drawer Bottom Footer (Sign in / Sign out) */}
            <div className="p-3 border-t border-stone-200 bg-stone-50/90">
              {currentUser ? (
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-7 h-7 rounded-full bg-[#8B5E34] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {getUserInitials()}
                    </div>
                    <p className="text-xs font-bold text-stone-800 truncate">
                      {getUserDisplayName()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-1 text-xs text-rose-600 font-bold hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors"
                  >
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuthModal('manual');
                  }}
                  className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98"
                >
                  <User size={14} />
                  <span>Sign In / Register</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
