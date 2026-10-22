import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function CartDrawer() {
  const navigate = useNavigate();
  const { 
    cart, 
    isCartOpen, 
    closeCart, 
    removeFromCart, 
    updateQuantity, 
    totalItems, 
    totalAmount, 
    totalSavings,
    clearCart 
  } = useCart();

  const { currentUser, openAuthModal } = useAuth();
  const [orderPlaced, setOrderPlaced] = useState(false);

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    closeCart();
    if (!currentUser) {
      openAuthModal('order', () => {
        navigate('/checkout');
      });
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-[1100] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={closeCart}
      />

      {/* Slide-over Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-stone-200">
          
          {/* Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#8B5E34]/10 text-[#8B5E34] flex items-center justify-center font-bold">
                <ShoppingBag size={18} />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-lg text-stone-900 leading-tight">
                  Shopping Cart
                </h3>
                <span className="text-xs text-stone-500 font-medium">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={closeCart}
              className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              aria-label="Close cart"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5">
            {orderPlaced ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 animate-bounce">
                  <CheckCircle2 size={36} />
                </div>
                <h4 className="font-heading font-extrabold text-2xl text-stone-900 mb-2">
                  Order Confirmed!
                </h4>
                <p className="text-sm text-stone-600 leading-relaxed max-w-xs mb-4">
                  Thank you, <span className="font-semibold text-stone-900">{currentUser?.displayName || currentUser?.email || 'Customer'}</span>! Your order has been placed successfully with Free Express Delivery.
                </p>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Tracking ID: BF-{Math.floor(100000 + Math.random() * 900000)}
                </span>
              </div>
            ) : cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
                  <ShoppingBag size={38} className="stroke-[1.5]" />
                </div>
                <h4 className="font-heading font-bold text-lg text-stone-900 mb-1">
                  Your cart is empty
                </h4>
                <p className="text-xs text-stone-500 max-w-xs mb-6">
                  Looks like you haven't added any premium handcrafted furniture to your cart yet.
                </p>
                <button
                  type="button"
                  onClick={closeCart}
                  className="px-5 py-2.5 rounded-xl bg-[#8B5E34] hover:bg-[#5C3A21] text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
                >
                  <span>Explore Furniture</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {cart.map((item) => (
                  <div 
                    key={item.id}
                    className="flex gap-3.5 p-3 rounded-2xl border border-stone-200/80 bg-white hover:border-stone-300 transition-all shadow-sm"
                  >
                    {/* Item Image */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link 
                            to={`/product/${item.id}`} 
                            onClick={closeCart}
                            className="font-heading font-bold text-sm text-stone-900 hover:text-[#8B5E34] transition-colors truncate block"
                          >
                            {item.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="text-stone-400 hover:text-rose-500 p-1 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        {(item.material || item.dimensions) && (
                          <p className="text-[0.7rem] text-stone-500 truncate mt-0.5">
                            {item.material && <span className="capitalize">{item.material}</span>}
                            {item.material && item.dimensions && ' • '}
                            {item.dimensions && <span>{item.dimensions}</span>}
                          </p>
                        )}
                      </div>

                      {/* Pricing & Quantity Controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-heading font-extrabold text-sm text-stone-900">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                          {item.originalPrice > item.price && (
                            <span className="text-[0.68rem] text-stone-400 line-through">
                              ₹{(item.originalPrice * item.quantity).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-stone-900 active:scale-90 transition-all"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-stone-900 active:scale-90 transition-all"
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer (Order Summary) */}
          {cart.length > 0 && !orderPlaced && (
            <div className="p-5 border-t border-stone-200 bg-stone-50/70 space-y-3.5">
              {totalSavings > 0 && (
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <Sparkles size={14} className="text-emerald-600 shrink-0" />
                  <span>You are saving ₹{totalSavings.toLocaleString('en-IN')} on this order!</span>
                </div>
              )}

              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <Truck size={13} className="text-[#8B5E34]" /> Shipping
                  </span>
                  <span className="font-semibold text-emerald-700">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Total Amount</span>
                  <span className="font-heading text-base text-[#8B5E34]">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-[#8B5E34] hover:bg-[#5C3A21] shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>{currentUser ? 'Proceed to Checkout' : 'Login & Place Order'}</span>
                <ArrowRight size={16} />
              </button>

              <div className="flex items-center justify-center gap-4 text-[0.68rem] text-stone-500 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={12} className="text-[#8B5E34]" /> 100% Safe Payments
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Truck size={12} className="text-[#8B5E34]" /> Express Delivery
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
