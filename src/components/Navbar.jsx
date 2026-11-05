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
  Heart,
  Package,
  Menu,
  X,
  Search,
  Phone,
  MapPin,
  ChevronRight,
  Layers,
  Sparkles,
  Truck
} from 'lucide-react';

export default function Navbar() {
  const { currentUser, openAuthModal, logout } = useAuth();
  const { totalItems, openCart } = useCart();
  const { totalLiked, openWishlist } = useWishlist();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync search input with URL search param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [location.search]);

  // Close menus on route change
  useEffect(() => {
    setIsSidebarOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname, location.search]);

  // Focus search input when search bar opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearchOpen]);

  // Prevent background scroll when sidebar drawer is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  // Fetch categories for the drawer
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

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    setIsSearchOpen(false);
    setIsSidebarOpen(false);

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

  const getCategoryThumbnail = (cat) => {
    if (cat?.image) return cat.image;
    const id = (cat?.id || '').toLowerCase();
    const name = (cat?.name || '').toLowerCase();

    if (id.includes('study') || name.includes('study') || name.includes('laptop')) {
      return '/study-table-category.jpg';
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
      <nav className="sticky top-0 z-[100] py-3.5 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">

          {/* Left Side: Brand Logo & Name (Exact image replica: Bharat + Logo on top, FURNITURES perfectly stretched 100% across the full width) */}
          <Link to="/" className="group inline-flex flex-col py-0.5 select-none w-fit">
            <div className="flex items-center gap-2.5 sm:gap-3 leading-none w-full justify-between">
              <span className="font-heading font-extrabold text-[2.1rem] sm:text-[2.4rem] tracking-tight text-[#8B5E34] group-hover:opacity-95 transition-opacity">
                Bharat
              </span>
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden shadow-sm flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/logo.png"
                  alt="Bharat Furnitures Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {/* FURNITURES stretched edge-to-edge from under 'B' to the right edge of the logo */}
            <div className="flex items-center justify-between w-full text-[0.72rem] sm:text-[16px] font-bold uppercase text-stone-500 font-sans mt-0.5 select-none">
              <span>F</span>
              <span>u</span>
              <span>r</span>
              <span>n</span>
              <span>i</span>
              <span>t</span>
              <span>u</span>
              <span>r</span>
              <span>e</span>
              <span>s</span>
            </div>
          </Link>

          {/* Right Side: Clean Circular Pill Action Icons (Matched to Reference Image) */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            
            {/* Store Location Map Icon */}
            <a
              href="https://maps.app.goo.gl/TBFTMMWHbgGQuT2L9"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#f4ece1]/80 hover:bg-[#ebdcc8] text-stone-700 hover:text-[#8B5E34] transition-all flex items-center justify-center shadow-xs active:scale-95"
              title="Visit Our Offline Store in Indore"
              aria-label="Visit Offline Store on Google Maps"
            >
              <MapPin size={18} className="stroke-[2.2]" />
            </a>

            {/* Phone Call Support Icon */}
            <a
              href="tel:+917067753335"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#f4ece1]/80 hover:bg-[#ebdcc8] text-stone-700 hover:text-stone-900 transition-all flex items-center justify-center shadow-xs active:scale-95"
              title="Customer Support:70677 53335 "
              aria-label="Call Support"
            >
              <Phone size={18} className="stroke-[2.2]" />
            </a>

            {/* Search Icon (Opens Expandable Search Bar) */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full transition-all flex items-center justify-center shadow-xs active:scale-95 ${isSearchOpen
                ? 'bg-stone-900 text-white'
                : 'bg-[#f4ece1]/80 hover:bg-[#ebdcc8] text-stone-700 hover:text-stone-900'
                }`}
              aria-label="Search Products"
            >
              {isSearchOpen ? <X size={18} /> : <Search size={18} className="stroke-[2.2]" />}
            </button>

            {/* Hamburger Menu Icon (Opens Side Drawer with Cart, Profile & Categories) */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#f4ece1]/80 hover:bg-[#ebdcc8] text-stone-700 hover:text-stone-900 transition-all flex items-center justify-center shadow-xs active:scale-95"
              aria-label="Open Navigation Menu"
            >
              <Menu size={20} className="stroke-[2.3]" />
              {/* Badge indicator on Menu if there are cart or liked items */}
              {(totalItems > 0 || totalLiked > 0) && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#8B5E34] ring-2 ring-white" />
              )}
            </button>
          </div>
        </div>

        {/* Expandable Search Bar Banner */}
        {isSearchOpen && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-3 pb-1 animate-fade-in">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center bg-[#f7f2ea] border border-stone-200/90 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-2xl px-4 py-2.5 transition-all shadow-inner"
            >
              <Search size={18} className="text-[#8B5E34] mr-3 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search sofas, beds, steel almirahs, tables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-none bg-transparent outline-none w-full font-body text-sm text-stone-800 placeholder:text-stone-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-stone-400 hover:text-stone-700 p-1 mr-2 transition-colors"
                  aria-label="Clear Search"
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs shrink-0"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </nav>

      {/* SIDEBAR DRAWER (Slides out from right/left cleanly on both mobile & desktop) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[200]">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 right-0 w-[88%] max-w-[360px] bg-white shadow-2xl flex flex-col z-10 animate-slide-left transform transition-transform duration-300 overflow-hidden">

            {/* Drawer Header with Logo and Close button */}
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/90">
              <Link
                to="/"
                onClick={() => setIsSidebarOpen(false)}
                className="inline-flex flex-col group select-none w-fit"
              >
                <div className="flex items-center gap-2 leading-none w-full justify-between">
                  <span className="font-heading font-extrabold text-xl tracking-tight text-[#8B5E34]">
                    Bharat
                  </span>
                  <div className="w-7 h-7 rounded-full overflow-hidden shadow-xs flex items-center justify-center shrink-0">
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="flex items-center justify-between w-full text-[0.72rem] sm:text-[1.5rem] font-bold uppercase text-stone-500 font-sans mt-0.5 select-none">
                  <span className='m-2'>F</span>
                  <span>U</span>
                  <span>R</span>
                  <span>N</span>
                  <span>I</span>
                  <span>T</span>
                  <span>U</span>
                  <span>R</span>
                  <span>E</span>
                  <span>S</span>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-4 py-3 divide-y divide-stone-100">

              {/* USER / AUTH STATUS SECTION */}
              <div className="pb-3.5">
                {currentUser ? (
                  <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100/80 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-full bg-[#8B5E34] text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                        {getUserInitials()}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-stone-900 truncate">
                          {currentUser.displayName || 'Bharat Member'}
                        </p>
                        <p className="text-[0.68rem] text-stone-500 truncate mt-0.5">
                          {currentUser.email}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSidebarOpen(false);
                        logout();
                      }}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                      title="Sign Out"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSidebarOpen(false);
                      openAuthModal('manual');
                    }}
                    className="w-full py-2.5 px-4 rounded-2xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98"
                  >
                    <User size={15} />
                    <span>Sign In / Register</span>
                  </button>
                )}
              </div>

              {/* SECTION: CART, ORDERS, WISHLIST (Essential Actions) */}
              <div className="py-3.5">
                <p className="text-[0.68rem] uppercase tracking-wider font-extrabold text-[#8B5E34] mb-2 px-2 flex items-center gap-1.5">
                  <Sparkles size={13} />
                  <span>Shopping & Activity</span>
                </p>

                <div className="flex flex-col gap-1.5">
                  {/* Cart */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSidebarOpen(false);
                      openCart();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-800 hover:bg-stone-50 transition-colors group text-left border border-stone-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-100 transition-colors">
                        <ShoppingBag size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">Shopping Cart</p>
                        <p className="text-[0.65rem] text-stone-500">Items ready to checkout</p>
                      </div>
                    </div>
                    {totalItems > 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#8B5E34] text-white text-[0.68rem] font-bold shadow-xs">
                        {totalItems} items
                      </span>
                    ) : (
                      <ChevronRight size={15} className="text-stone-400" />
                    )}
                  </button>

                  {/* Liked Items / Wishlist */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSidebarOpen(false);
                      openWishlist();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-800 hover:bg-stone-50 transition-colors group text-left border border-stone-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 group-hover:bg-rose-100 transition-colors">
                        <Heart size={16} className={totalLiked > 0 ? "fill-rose-500" : ""} />
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">Wishlist & Liked</p>
                        <p className="text-[0.65rem] text-stone-500">Saved favorite furniture</p>
                      </div>
                    </div>
                    {totalLiked > 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[0.68rem] font-bold shadow-xs">
                        {totalLiked} items
                      </span>
                    ) : (
                      <ChevronRight size={15} className="text-stone-400" />
                    )}
                  </button>

                  {/* Orders */}
                  <Link
                    to="/orders"
                    onClick={() => setIsSidebarOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-800 hover:bg-stone-50 transition-colors group border border-stone-100"
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
                    onClick={() => setIsSidebarOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-800 hover:bg-stone-50 transition-colors group border border-stone-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                        <Truck size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">Track Shipment</p>
                        <p className="text-[0.65rem] text-stone-500">Live order delivery status</p>
                      </div>
                    </div>
                    <ChevronRight size={15} className="text-stone-400" />
                  </Link>
                </div>
              </div>

              {/* SECTION: CATEGORIES */}
              <div className="py-3.5">
                <p className="text-[0.68rem] uppercase tracking-wider font-extrabold text-[#8B5E34] mb-2 px-2 flex items-center gap-1.5">
                  <Layers size={13} />
                  <span>Furniture Categories</span>
                </p>

                <div className="flex flex-col gap-1.5">
                  {/* All Categories Link */}
                  <Link
                    to="/category/all"
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold tracking-wider transition-all ${location.pathname === '/category/all'
                      ? 'bg-primary/10 text-primary border-l-4 border-primary shadow-xs'
                      : 'text-stone-800 hover:bg-stone-50'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0 flex items-center justify-center shadow-xs">
                        <span className="text-sm">🪑</span>
                      </div>
                      <span className="uppercase font-bold">ALL FURNITURE</span>
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
                        onClick={() => setIsSidebarOpen(false)}
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

              {/* QUICK CONTACT SUPPORT */}
              <div className="pt-3.5">
                <a
                  href="tel:+917067753335"
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[#f7f2ea] hover:bg-[#ede3d5] transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-white shadow-xs flex items-center justify-center text-primary">
                    <Phone size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">Custom Furniture Support</p>
                    <p className="text-[0.68rem] text-stone-600 font-medium">Call us: +91 70677 53335</p>
                  </div>
                </a>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
