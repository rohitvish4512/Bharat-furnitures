import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Ruler, Layers, Check } from 'lucide-react';

export default function ProductCard({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const price = Number(product.price) || 0;
  const originalPrice = Number(product.originalPrice) || 0;
  const discount = originalPrice > price 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : 0;
  const savings = originalPrice > price ? originalPrice - price : 0;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1800);
  };

  const imageSrc = (product.images && product.images.length > 0)
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80';

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-stone-200/80 shadow-[0_2px_12px_rgba(43,33,24,0.04)] hover:shadow-[0_12px_28px_rgba(139,94,52,0.12)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden">
      
      {/* Product Image Stage (Clickable Link) */}
      <Link to={`/product/${product.id}`} className="relative aspect-[4/3] w-full bg-[#fbf8f3] overflow-hidden block">
        <img 
          src={imageSrc} 
          alt={product.name || 'Furniture Product'} 
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105" 
          loading="lazy"
        />
        
        {/* Top Badges (Discount + Custom Badges) */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-start max-w-[70%] z-10 pointer-events-none">
          {discount > 0 && (
            <span className="px-2.5 py-1 rounded-full text-[0.68rem] font-bold uppercase tracking-wider bg-rose-600 text-white shadow-sm">
              {discount}% OFF
            </span>
          )}
          {product.badges?.map(badge => (
            <span 
              key={badge} 
              className="px-2.5 py-1 rounded-full text-[0.68rem] font-bold uppercase tracking-wider bg-[#8B5E34] text-white shadow-sm capitalize"
            >
              {badge}
            </span>
          ))}
        </div>

        {/* Wishlist Button */}
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsWishlisted(!isWishlisted);
          }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all z-10 text-stone-600 hover:text-rose-500"
          aria-label="Wishlist"
        >
          <Heart 
            size={18} 
            className={isWishlisted ? "fill-rose-500 text-rose-500" : "transition-colors"} 
          />
        </button>

        {/* Low Stock Urgency Pill */}
        {product.stock && Number(product.stock) <= 5 && (
          <div className="absolute bottom-2.5 left-3 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/90 text-white text-[0.68rem] font-semibold tracking-wide shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Only {product.stock} left in stock
            </span>
          </div>
        )}
      </Link>

      {/* Product Details Section */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Rating & Reviews Header */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="inline-flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 text-amber-700 text-xs font-bold">
              <Star size={12} className="fill-amber-500 text-amber-500" />
              <span>{product.rating || '4.5'}</span>
            </div>
            {product.reviews && (
              <span className="text-[0.72rem] text-stone-500 font-medium">
                ({product.reviews} reviews)
              </span>
            )}
          </div>

          {/* Product Name */}
          <Link to={`/product/${product.id}`} className="block">
            <h3 className="font-heading font-bold text-base text-stone-900 group-hover:text-[#8B5E34] transition-colors line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Natural Specs Bar (Material, Dimensions, Features) */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            {product.material && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[0.7rem] font-medium border border-stone-200/60 capitalize">
                <Layers size={11} className="text-[#8B5E34]" />
                {product.material}
              </span>
            )}
            {product.dimensions && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[0.7rem] font-medium border border-stone-200/60">
                <Ruler size={11} className="text-[#8B5E34]" />
                {product.dimensions}
              </span>
            )}
            {product.weight && (
              <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[0.7rem] font-medium border border-stone-200/60">
                {product.weight}
              </span>
            )}
            {product.features && product.features.length > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[0.7rem] font-medium border border-emerald-200/60 capitalize">
                {product.features[0]}
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Add to Cart Footer */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2 mt-auto">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading font-extrabold text-lg text-stone-900 tracking-tight">
                ₹{price.toLocaleString('en-IN')}
              </span>
              {originalPrice > price && (
                <span className="text-xs text-stone-400 line-through">
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {savings > 0 && (
              <span className="text-[0.68rem] font-bold text-emerald-700">
                Save ₹{savings.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Quick Action Button */}
          <button 
            type="button"
            onClick={handleAddToCart}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm active:scale-95 ${
              addedToCart 
                ? 'bg-emerald-600 text-white' 
                : 'bg-[#8B5E34] hover:bg-[#5C3A21] text-white hover:shadow-md'
            }`}
          >
            {addedToCart ? (
              <>
                <Check size={14} />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart size={14} />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
