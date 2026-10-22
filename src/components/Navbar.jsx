import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ShoppingBag, User, LogOut, ChevronDown, Heart, Package } from 'lucide-react';

export default function Navbar() {
  const { currentUser, openAuthModal, logout } = useAuth();
  const { totalItems, openCart } = useCart();
  const { totalLiked, openWishlist } = useWishlist();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
    <nav className="sticky top-0 z-[100] py-3.5 bg-white/90 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="font-heading font-extrabold text-xl sm:text-2xl tracking-tight text-text-main flex items-center gap-1">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Bharat</span>Furnitures
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Liked / Wishlist Button with Badge */}
          <button
            type="button"
            onClick={openWishlist}
            className="relative p-2.5 rounded-full hover:bg-stone-100 text-stone-700 transition-colors flex items-center justify-center group"
            aria-label="Liked Products"
          >
            <Heart size={21} className={`transition-colors ${totalLiked > 0 ? 'fill-rose-500 text-rose-500' : 'group-hover:text-rose-500'}`} />
            {totalLiked > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-rose-500 text-white text-[0.68rem] font-bold flex items-center justify-center shadow-md animate-scale-in">
                {totalLiked}
              </span>
            )}
          </button>

          {/* Cart Button with Count Badge */}
          <button
            type="button"
            onClick={openCart}
            className="relative p-2.5 rounded-full hover:bg-stone-100 text-stone-700 transition-colors flex items-center justify-center group"
            aria-label="Shopping Cart"
          >
            <ShoppingBag size={21} className="group-hover:text-[#8B5E34] transition-colors" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-[#8B5E34] text-white text-[0.68rem] font-bold flex items-center justify-center shadow-md animate-scale-in">
                {totalItems}
              </span>
            )}
          </button>

          {/* My Orders Direct Link in Navbar */}
          <Link
            to="/orders"
            className="relative p-2.5 rounded-full hover:bg-stone-100 text-stone-700 transition-colors flex items-center justify-center group"
            title="My Orders & Tracking"
            aria-label="My Orders"
          >
            <Package size={21} className="group-hover:text-[#8B5E34] transition-colors" />
          </Link>

          {/* User Authentication Menu */}
          {currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-stone-200 hover:border-stone-300 bg-stone-50 hover:bg-stone-100 transition-all text-xs font-semibold text-stone-800"
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
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="text-xs font-bold text-stone-900 truncate">
                      {currentUser.displayName || 'Bharat Furnitures Member'}
                    </p>
                    <p className="text-[0.68rem] text-stone-500 truncate mt-0.5">
                      {currentUser.email}
                    </p>
                  </div>

                  {/* My Orders in Profile Menu */}
                  <Link
                    to="/orders"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full px-4 py-2.5 text-left text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 font-bold transition-colors"
                  >
                    <Package size={15} className="text-[#8B5E34]" />
                    <span>My Orders & Tracking</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold transition-colors border-t border-stone-100"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('manual')}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <User size={14} />
              <span>Sign In</span>
            </button>
          )}

        </div>
      </div>
    </nav>
  );
}
