import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import Sidebar from '../components/Sidebar';
import { categories as fallbackCategories } from '../data/products';
import { ArrowRight, Sparkles, Tag, ShieldCheck, Flame } from 'lucide-react';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catSnap = await getDocs(collection(db, 'categories'));
        let catData = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (!catData || catData.length === 0) {
          catData = fallbackCategories;
        }
        setCategories(catData);
      } catch (error) {
        console.error("Error fetching data, using fallback:", error);
        setCategories(fallbackCategories);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center text-text-muted font-medium">
        Loading Bharat Furnitures...
      </div>
    );
  }

  const getFallbackImage = (name, id, catImage) => {
    if (catImage && typeof catImage === 'string' && catImage.startsWith('http')) {
      return catImage;
    }
    const key = ((name || '') + ' ' + (id || '')).toLowerCase();
    if (key.includes('sofa') || key.includes('couch')) {
      return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=80';
    }
    if (key.includes('bed')) {
      return 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=700&q=80';
    }
    if (key.includes('dining')) {
      return 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=700&q=80';
    }
    if (key.includes('chair') || key.includes('recliner')) {
      return 'https://images.unsplash.com/photo-1580481077195-c3a82104536b?auto=format&fit=crop&w=700&q=80';
    }
    if (key.includes('study') || key.includes('laptop')) {
      return 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=700&q=80';
    }
    if (key.includes('centre') || key.includes('coffee') || key.includes('table')) {
      return 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=700&q=80';
    }
    if (key.includes('storage') || key.includes('rack') || key.includes('wardrobe') || key.includes('cabinet')) {
      return 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=700&q=80';
    }
    if (key.includes('computer') || key.includes('desk') || key.includes('work')) {
      return 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=700&q=80';
    }
    return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=80';
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-background">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 bg-white">

        {/* PROMOTIONAL OFFERS BANNER (Clicks directly to shopping /category/all) */}
        <Link
          to="/category/all"
          className="relative block w-full rounded-2xl md:rounded-3xl overflow-hidden mb-6 sm:mb-10 shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer border border-amber-200/60 bg-gradient-to-r from-[#F5AF19] via-[#F19018] to-[#E65C00]"
          title="Click to Shop Special Offers!"
        >
          {/* Background decorative patterns */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-4 sm:p-7 md:p-10 gap-3 sm:gap-6">
            
            {/* Left Offer Text */}
            <div className="w-full md:w-3/5 text-stone-900 flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-black/15 text-white text-[0.65rem] sm:text-xs font-bold uppercase tracking-wider mb-1.5 sm:mb-2.5 backdrop-blur-xs">
                <Flame size={12} className="text-amber-200 fill-amber-200 animate-pulse sm:w-3.5 sm:h-3.5" />
                <span>Special Festive Offer • Limited Period</span>
              </div>

              <div className="flex items-baseline gap-2 mb-0.5 sm:mb-1">
                <span className="font-heading font-extrabold text-2xl sm:text-4xl md:text-5xl tracking-tight text-white drop-shadow-sm">
                  Diwali
                </span>
                <span className="font-heading font-light italic text-2xl sm:text-4xl md:text-5xl text-amber-100">
                  Sale
                </span>
              </div>

              <p className="text-white/95 font-medium text-[0.72rem] sm:text-sm md:text-base max-w-md mb-2.5 sm:mb-6 line-clamp-2 sm:line-clamp-none">
                Iss Tyohar, ghar ko kuch solid do. Premium Solid Wood Furniture with authentic craftsmanship.
              </p>

              {/* Shop CTA Button inside banner */}
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-1.5 sm:py-3 rounded-full bg-stone-950 text-white hover:bg-black font-bold text-[0.75rem] sm:text-sm shadow-md transition-all duration-200 group-hover:scale-105 group-hover:bg-[#0010c7]">
                <span>Shop Sale Now</span>
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1 sm:w-4 sm:h-4" />
              </div>
            </div>

            {/* Right Offer Visual with Badge & Furniture Image (Hidden on small mobile to halve height, visible on md/desktop) */}
            <div className="hidden md:flex w-full md:w-2/5 items-center justify-center relative">
              {/* Circular Discount Badge */}
              <div className="absolute -top-3 -right-2 sm:-top-4 sm:right-2 z-20 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-stone-950/90 text-amber-300 border-2 border-dashed border-amber-300 flex flex-col items-center justify-center text-center shadow-xl transform rotate-12 group-hover:rotate-0 transition-transform duration-300">
                <span className="text-[0.6rem] sm:text-[0.68rem] uppercase font-bold tracking-tight text-stone-200">UPTO</span>
                <span className="text-base sm:text-xl font-extrabold leading-none">60%</span>
                <span className="text-[0.55rem] sm:text-[0.65rem] font-bold text-stone-300">OFF</span>
              </div>

              {/* Showcase Image */}
              <div className="relative w-full max-w-[280px] sm:max-w-[340px] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-white/20 backdrop-blur-xs p-1.5 border border-white/40">
                <img 
                  src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=700&q=80" 
                  alt="Solid Wood Bed Festive Sale" 
                  className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>

          </div>
        </Link>

        {/* SHOP BY CATEGORIES SECTION (Reference style with large square boxes) */}
        <section className="mb-14 sm:mb-16">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-extrabold text-[#E65C00] sm:text-[#FF5722] tracking-wide inline-block relative">
              Shop By Categories
              <span className="block h-0.5 w-12 bg-[#FF5722] mx-auto mt-1 rounded-full opacity-60"></span>
            </h2>
          </div>

          {/* Large Square Category Boxes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-5 md:gap-6">
            {categories.map((cat) => {
              const imgUrl = getFallbackImage(cat.name, cat.id, cat.image);
              return (
                <Link 
                  key={cat.id} 
                  to={`/category/${cat.id}`}
                  className="group flex flex-col items-center select-none"
                >
                  {/* Big Square Box with Soft Background */}
                  <div className="w-full aspect-square rounded-xl sm:rounded-2xl bg-[#F8F9FA] hover:bg-[#F1F3F5] border border-stone-200/70 p-3 sm:p-5 flex items-center justify-center transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1 overflow-hidden relative">
                    <img 
                      src={imgUrl} 
                      alt={cat.name} 
                      className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=80';
                      }}
                    />
                  </div>

                  {/* Category Title */}
                  <h3 className="mt-2.5 sm:mt-3 text-xs sm:text-sm md:text-base font-bold text-stone-700 group-hover:text-primary transition-colors text-center leading-tight">
                    {cat.name}
                  </h3>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-8 border-t border-b border-stone-200 my-8 text-center bg-stone-50 rounded-2xl p-4">
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-1">🪵</span>
            <span className="text-xs font-bold text-stone-900">100% Solid Wood</span>
            <span className="text-[0.68rem] text-stone-500">Premium Sheesham</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-1">🛡️</span>
            <span className="text-xs font-bold text-stone-900">Lifetime Warranty</span>
            <span className="text-[0.68rem] text-stone-500">Termite proof build</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-1">🚚</span>
            <span className="text-xs font-bold text-stone-900">Free Delivery</span>
            <span className="text-[0.68rem] text-stone-500">Direct to your doorstep</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-1">💳</span>
            <span className="text-xs font-bold text-stone-900">Easy EMI / COD</span>
            <span className="text-[0.68rem] text-stone-500">Safe & secure checkout</span>
          </div>
        </div>

        {/* Bottom Banner Section */}
        <div className="text-center mt-6 py-6">
          <p className="text-[0.7rem] uppercase tracking-widest text-text-muted mb-1 font-bold">Introducing</p>
          <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-[#8B5E34] tracking-wide">
            SMART SPACES COLLECTION
          </h2>
          <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
            Engineered for hostels, compact flats, and modern student rooms.
          </p>
        </div>

      </main>
    </div>
  );
}
