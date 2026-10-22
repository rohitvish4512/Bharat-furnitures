import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { X, Heart, Trash2, ShoppingCart, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WishlistDrawer() {
  const { wishlist, isWishlistOpen, closeWishlist, removeFromWishlist, totalLiked } = useWishlist();
  const { addToCart, isInCart, openCart } = useCart();

  if (!isWishlistOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={closeWishlist}
      />

      {/* Slide-over Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-stone-200">
          
          {/* Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <Heart size={18} className="fill-rose-500 text-rose-500" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-lg text-stone-900 leading-tight">
                  Liked Products
                </h3>
                <span className="text-xs text-stone-500 font-medium">
                  {totalLiked} {totalLiked === 1 ? 'item' : 'items'} saved
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={closeWishlist}
              className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              aria-label="Close liked products"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5">
            {wishlist.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-300 mb-4">
                  <Heart size={38} className="stroke-[1.5]" />
                </div>
                <h4 className="font-heading font-bold text-lg text-stone-900 mb-1">
                  No liked products yet
                </h4>
                <p className="text-xs text-stone-500 max-w-xs mb-6">
                  Save your favorite handcrafted furniture pieces here to review or buy later.
                </p>
                <button
                  type="button"
                  onClick={closeWishlist}
                  className="px-5 py-2.5 rounded-xl bg-[#8B5E34] hover:bg-[#5C3A21] text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
                >
                  <span>Explore Furniture</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {wishlist.map((item) => {
                  const alreadyInCart = isInCart(item.id);
                  return (
                    <div 
                      key={item.id}
                      className="flex gap-3.5 p-3 rounded-2xl border border-stone-200/80 bg-white hover:border-stone-300 transition-all shadow-sm group"
                    >
                      {/* Image */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <Link 
                              to={`/product/${item.id}`} 
                              onClick={closeWishlist}
                              className="font-heading font-bold text-sm text-stone-900 hover:text-[#8B5E34] transition-colors truncate block"
                            >
                              {item.name}
                            </Link>
                            <button
                              type="button"
                              onClick={() => removeFromWishlist(item.id)}
                              className="text-stone-400 hover:text-rose-500 p-1 transition-colors"
                              aria-label="Remove from wishlist"
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

                        {/* Price & Move to Cart Button */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100">
                          <span className="font-heading font-extrabold text-sm text-stone-900">
                            ₹{item.price.toLocaleString('en-IN')}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              if (alreadyInCart) {
                                closeWishlist();
                                openCart();
                              } else {
                                addToCart(item, 1);
                              }
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 ${
                              alreadyInCart 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-[#8B5E34] hover:bg-[#5C3A21] text-white'
                            }`}
                          >
                            {alreadyInCart ? (
                              <>
                                <Check size={13} />
                                <span>In Cart</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart size={13} />
                                <span>Add to Cart</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {wishlist.length > 0 && (
            <div className="p-4 border-t border-stone-200 bg-stone-50/70 text-center">
              <p className="text-xs text-stone-500">
                Liked products are safely saved to your account in real-time.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
