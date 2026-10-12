import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import Sidebar from '../components/Sidebar';
import {
  Star,
  Heart,
  ShoppingCart,
  Check,
  Ruler,
  Layers,
  Weight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Minus,
  Plus,
  ChevronRight,
  ChevronLeft,
  Package,
  ZoomIn,
  X
} from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Keyboard navigation for image modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isModalOpen) return;
      if (e.key === 'Escape') setIsModalOpen(false);
      if (e.key === 'ArrowLeft') {
        setSelectedImgIndex((prev) => (prev === 0 ? 3 : prev - 1));
      }
      if (e.key === 'ArrowRight') {
        setSelectedImgIndex((prev) => (prev === 3 ? 0 : prev + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center p-12">
          <div className="text-text-muted font-medium animate-pulse text-lg">
            Loading product details...
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-background">
        <Sidebar />
        <main className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <h2 className="text-2xl font-bold font-heading text-text-main mb-2">Product Not Found</h2>
          <p className="text-sm text-text-muted mb-6">The product you are looking for does not exist or has been removed.</p>
          <Link to="/" className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-full text-sm font-semibold shadow-md transition-all">
            Back to Home
          </Link>
        </main>
      </div>
    );
  }

  const price = Number(product.price) || 0;
  const originalPrice = Number(product.originalPrice) || 0;
  const discount = originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;
  const savings = originalPrice > price ? originalPrice - price : 0;

  // Curated 4-image gallery setup for e-commerce furniture presentation
  const fallbackGallery = [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80',
    'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=1200&q=80',
    'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&q=80'
  ];

  const rawImages = product.images && Array.isArray(product.images) && product.images.length > 0
    ? product.images.filter(Boolean)
    : [];

  const galleryImages = [
    rawImages[0] || fallbackGallery[0],
    rawImages[1] || fallbackGallery[1],
    rawImages[2] || fallbackGallery[2],
    rawImages[3] || fallbackGallery[3]
  ].slice(0, 4);

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-background">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-text-muted mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={12} />
          {product.categoryId && (
            <>
              <Link to={`/category/${product.categoryId}`} className="capitalize hover:text-primary transition-colors">
                {product.categoryId.replace('-', ' ')}
              </Link>
              <ChevronRight size={12} />
            </>
          )}
          <span className="font-semibold text-text-main truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
        </nav>

        {/* Product Hero Section (Gallery + Purchase Info) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-border shadow-sm mb-10">

          {/* Left Column: Image Stage & Exactly 4 Thumbnails */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Big Main Stage */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#faf7f2] border border-border/80 group">
              <img
                src={galleryImages[selectedImgIndex] || galleryImages[0]}
                alt={product.name}
                onClick={() => setIsModalOpen(true)}
                className="w-full h-full object-cover object-center cursor-zoom-in transition-transform duration-500 group-hover:scale-105"
              />

              {/* Click to Zoom Pill Indicator */}
              <button 
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-stone-700 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1.5 backdrop-blur-sm transition-all hover:scale-105"
              >
                <ZoomIn size={14} />
                <span>Click to zoom</span>
              </button>

              {/* Prev / Next Arrows on Main Image (Visible on mobile touch, hover on desktop) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImgIndex((prev) => (prev === 0 ? 3 : prev - 1));
                }}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-stone-700 hover:scale-110 active:scale-95 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 z-10"
                aria-label="Previous image"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImgIndex((prev) => (prev === 3 ? 0 : prev + 1));
                }}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-stone-700 hover:scale-110 active:scale-95 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 z-10"
                aria-label="Next image"
              >
                <ChevronRight size={18} />
              </button>

              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 items-start z-10 pointer-events-none">
                {discount > 0 && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-600 text-white shadow-md">
                    {discount}% OFF
                  </span>
                )}
                {product.badges?.map(badge => (
                  <span key={badge} className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#8B5E34] text-white shadow-md capitalize">
                    {badge}
                  </span>
                ))}
              </div>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsWishlisted(!isWishlisted);
                }}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all text-stone-600 hover:text-rose-500 z-10"
                aria-label="Add to wishlist"
              >
                <Heart size={20} className={isWishlisted ? "fill-rose-500 text-rose-500" : "transition-colors"} />
              </button>

              {/* Stock Indicator */}
              {product.stock && Number(product.stock) <= 5 && (
                <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 text-white text-xs font-semibold shadow-md">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    Only {product.stock} items left in stock
                  </span>
                </div>
              )}
            </div>

            {/* Exactly 4 Thumbnails (Matching Screenshot 1) */}
            <div className="grid grid-cols-4 gap-3">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImgIndex(idx)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group/thumb ${
                    selectedImgIndex === idx 
                      ? 'border-primary ring-2 ring-primary/30 shadow-md scale-[1.02]' 
                      : 'border-border/80 opacity-75 hover:opacity-100 hover:border-stone-400'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`${product.name} thumbnail ${idx + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-110" 
                  />
                  <div className={`absolute inset-0 bg-primary/10 transition-opacity ${selectedImgIndex === idx ? 'opacity-100' : 'opacity-0'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Pricing & Quick Actions */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              {/* Rating & Reviews Bar */}
              <div className="flex items-center gap-2 mb-3">
                <div className="inline-flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80 text-amber-800 text-xs font-bold">
                  <Star size={13} className="fill-amber-500 text-amber-500" />
                  <span>{product.rating || '4.5'}</span>
                </div>
                <span className="text-xs text-text-muted font-medium">
                  {product.reviews ? `(${product.reviews} customer reviews)` : '(Verified Product)'}
                </span>
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200 ml-auto">
                  In Stock
                </span>
              </div>

              {/* Title */}
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-stone-900 leading-tight mb-4">
                {product.name}
              </h1>

              {/* Price Section */}
              <div className="bg-[#FAF7F2] rounded-2xl p-4 sm:p-5 border border-border/80 mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="font-heading font-extrabold text-3xl sm:text-4xl text-stone-900 tracking-tight">
                    ₹{price.toLocaleString('en-IN')}
                  </span>
                  {originalPrice > price && (
                    <span className="text-base text-stone-400 line-through">
                      ₹{originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="text-xs font-bold bg-rose-100 text-rose-700 px-2.5 py-1 rounded-md">
                      {discount}% OFF
                    </span>
                  )}
                </div>
                {savings > 0 && (
                  <p className="text-xs font-bold text-emerald-700 mt-1.5 flex items-center gap-1">
                    <Sparkles size={13} /> You save ₹{savings.toLocaleString('en-IN')} on this order!
                  </p>
                )}
                <p className="text-[0.7rem] text-stone-500 mt-2">Inclusive of all taxes. Free shipping on this item.</p>
              </div>

              {/* Description Preview */}
              <p className="text-sm text-text-muted leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Key Highlights Chips */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {product.material && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                    <Layers size={18} className="text-primary shrink-0" />
                    <div>
                      <div className="text-[0.68rem] text-stone-500 font-medium uppercase">Material</div>
                      <div className="text-xs font-bold text-stone-900 capitalize">{product.material}</div>
                    </div>
                  </div>
                )}
                {product.dimensions && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                    <Ruler size={18} className="text-primary shrink-0" />
                    <div>
                      <div className="text-[0.68rem] text-stone-500 font-medium uppercase">Dimensions</div>
                      <div className="text-xs font-bold text-stone-900">{product.dimensions}</div>
                    </div>
                  </div>
                )}
                {product.weight && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                    <Weight size={18} className="text-primary shrink-0" />
                    <div>
                      <div className="text-[0.68rem] text-stone-500 font-medium uppercase">Weight</div>
                      <div className="text-xs font-bold text-stone-900">{product.weight}</div>
                    </div>
                  </div>
                )}
                {product.stock && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                    <Package size={18} className="text-primary shrink-0" />
                    <div>
                      <div className="text-[0.68rem] text-stone-500 font-medium uppercase">Availability</div>
                      <div className="text-xs font-bold text-stone-900">{product.stock} Units</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity & CTAs */}
            <div className="pt-6 border-t border-border flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-text-main">Quantity:</span>
                <div className="inline-flex items-center border border-border rounded-xl bg-background p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-text-main hover:bg-stone-200 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-text-main">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-text-main hover:bg-stone-200 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-md ${addedToCart
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#8B5E34] hover:bg-[#5C3A21] text-white hover:shadow-lg'
                    }`}
                >
                  {addedToCart ? (
                    <>
                      <Check size={18} />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="flex-1 py-3.5 px-6 rounded-xl font-bold text-sm bg-stone-900 hover:bg-black text-white transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Buy Now
                </button>
              </div>

              {/* Service Badges */}
              {/* <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border/60 text-center">
                <div className="flex flex-col items-center gap-1 text-[0.72rem] text-stone-600">
                  <Truck size={18} className="text-primary" />
                  <span>Free Express Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-[0.72rem] text-stone-600">
                  <ShieldCheck size={18} className="text-primary" />
                  <span>1-Year Warranty</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-[0.72rem] text-stone-600">
                  <RotateCcw size={18} className="text-primary" />
                  <span>7-Day Easy Returns</span>
                </div>
              </div> */}
            </div>

          </div>
        </div>

        {/* Detailed Product Specifications & Additional Information */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-border shadow-sm">
          <h2 className="font-heading font-bold text-xl sm:text-2xl text-stone-900 mb-6 pb-4 border-b border-border">
            Additional Information & Specifications
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Specs Table */}
            <div>
              <h3 className="font-heading font-bold text-base text-stone-800 mb-4">Product Specifications</h3>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden text-sm">
                <div className="flex justify-between p-3.5 bg-stone-50/50">
                  <span className="font-medium text-stone-500">Material</span>
                  <span className="font-bold text-stone-900 capitalize">{product.material || 'Engineered Wood'}</span>
                </div>
                <div className="flex justify-between p-3.5 bg-white">
                  <span className="font-medium text-stone-500">Dimensions</span>
                  <span className="font-bold text-stone-900">{product.dimensions || 'Standard'}</span>
                </div>
                <div className="flex justify-between p-3.5 bg-stone-50/50">
                  <span className="font-medium text-stone-500">Weight</span>
                  <span className="font-bold text-stone-900">{product.weight || 'N/A'}</span>
                </div>
                <div className="flex justify-between p-3.5 bg-white">
                  <span className="font-medium text-stone-500">Stock Status</span>
                  <span className="font-bold text-emerald-700">{product.stock ? `${product.stock} Units Left` : 'Available'}</span>
                </div>
                <div className="flex justify-between p-3.5 bg-stone-50/50">
                  <span className="font-medium text-stone-500">Category</span>
                  <span className="font-bold text-stone-900 capitalize">{product.categoryId || 'Furniture'}</span>
                </div>
              </div>
            </div>

            {/* Features & Highlights */}
            <div>
              <h3 className="font-heading font-bold text-base text-stone-800 mb-4">Features & Benefits</h3>

              {product.features && product.features.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-6">
                  {product.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-semibold capitalize"
                    >
                      <Sparkles size={13} />
                      {feat}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-500 mb-6">Designed with compact living and student durability in mind.</p>
              )}

              <div className="p-4 rounded-2xl bg-[#FFF8ED] border border-[#C89B6D]/30 text-xs text-[#6B5542] leading-relaxed">
                <span className="font-bold text-stone-900 block mb-1">Space Saver Design:</span>
                Specially designed for compact rooms, hostels, and modern apartments. Easy to assemble with minimal tools required.
              </div>
            </div>
          </div>
        </div>

        {/* Fullscreen Image Lightbox Zoom Modal (Matches Screenshot 2) */}
        {isModalOpen && (
          <div 
            className="fixed inset-0 z-[1000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 md:p-8 animate-fade-in"
            onClick={() => setIsModalOpen(false)}
          >
            <div 
              className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Circular White Close Button matching Screenshot 2 */}
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-3 right-3 sm:-top-5 sm:-right-5 w-11 h-11 rounded-full bg-white text-stone-800 flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 z-40 border border-stone-200"
                aria-label="Close modal"
              >
                <X size={20} className="stroke-[2.5]" />
              </button>

              {/* Prev Navigation Arrow */}
              <button
                type="button"
                onClick={() => setSelectedImgIndex((prev) => (prev === 0 ? 3 : prev - 1))}
                className="absolute left-2 sm:-left-14 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/95 text-stone-800 shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-30"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>

              {/* Next Navigation Arrow */}
              <button
                type="button"
                onClick={() => setSelectedImgIndex((prev) => (prev === 3 ? 0 : prev + 1))}
                className="absolute right-2 sm:-right-14 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/95 text-stone-800 shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-30"
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>

              {/* Big Centered High-Res Image Display */}
              <div className="w-full max-h-[75vh] flex items-center justify-center bg-white rounded-2xl overflow-hidden shadow-2xl p-2 sm:p-4">
                <img
                  src={galleryImages[selectedImgIndex]}
                  alt={`${product.name} zoomed`}
                  className="max-h-[70vh] max-w-full w-auto h-auto object-contain rounded-xl"
                />
              </div>

              {/* 4 Bottom Thumbnails in Modal */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 mt-4">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImgIndex(idx)}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImgIndex === idx 
                        ? 'border-white ring-2 ring-primary scale-105 sm:scale-110 shadow-lg' 
                        : 'border-white/40 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
