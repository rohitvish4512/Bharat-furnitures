import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Search, X, ChevronDown, ChevronUp, Heart, Package } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

export default function Sidebar() {
  const [categories, setCategories] = useState([]);
  const [searchParams] = useSearchParams();
  const urlSearchQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalLiked, openWishlist } = useWishlist();

  // Close mobile toggle when navigating
  useEffect(() => {
    setIsOpenMobile(false);
  }, [location.pathname, location.search]);

  // Sync internal search input with URL search param if changed externally
  useEffect(() => {
    setSearchQuery(urlSearchQuery);
  }, [urlSearchQuery]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catSnap = await getDocs(collection(db, 'categories'));
        const catData = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(catData);
      } catch (error) {
        console.error("Error fetching categories in sidebar:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const queryTerm = searchQuery.trim();

    // Check if we are already inside a category page
    if (location.pathname.startsWith('/category/')) {
      const newParams = new URLSearchParams(searchParams);
      if (queryTerm) {
        newParams.set('q', queryTerm);
      } else {
        newParams.delete('q');
      }
      navigate(`${location.pathname}?${newParams.toString()}`);
    } else {
      // If on Home or another page, navigate to /category/all with search param
      if (queryTerm) {
        navigate(`/category/all?q=${encodeURIComponent(queryTerm)}`);
      } else {
        navigate('/category/all');
      }
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (location.pathname.startsWith('/category/')) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('q');
      navigate(`${location.pathname}?${newParams.toString()}`);
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

  // Filter category list in sidebar as well
  const filteredCategories = categories.filter(cat =>
    cat.name && cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="hidden md:flex w-[260px] bg-surface border-r border-border p-5 flex-col gap-5 shrink-0 min-h-[calc(100vh-70px)]">
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="relative flex items-center bg-[#F4ECE1] border border-[#E8DED1] focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-full px-4 py-2 gap-2 transition-all">
        <input
          type="text"
          placeholder="SEARCH PRODUCTS..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-none bg-transparent outline-none w-full font-body text-xs sm:text-sm text-text-main placeholder:text-text-muted/70"
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={handleClearSearch}
            className="text-text-muted hover:text-text-main transition-colors shrink-0"
            title="Clear"
          >
            <X size={15} />
          </button>
        ) : null}
        <button
          type="submit"
          className="text-text-muted hover:text-primary transition-colors shrink-0"
          title="Search"
        >
          <Search size={16} />
        </button>
      </form>

      {/* Existing Categories list with visual thumbnails */}
      <div className="flex flex-col gap-1.5">
        <Link
          to="/category/all"
          className={`flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all duration-200 group ${
            location.pathname === '/category/all'
              ? 'text-primary bg-primary/10 border-l-[3px] border-primary font-bold shadow-xs'
              : 'text-text-main hover:text-primary hover:bg-stone-100 hover:translate-x-1'
          }`}
        >
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0 flex items-center justify-center shadow-xs">
            <span className="text-sm">🪑</span>
          </div>
          <span className="text-[0.82rem] font-bold tracking-wider uppercase">ALL CATEGORIES</span>
        </Link>

        {filteredCategories.map(cat => {
          const isActive = location.pathname === `/category/${cat.id}`;
          const thumbUrl = getCategoryThumbnail(cat);
          return (
            <Link
              to={`/category/${cat.id}`}
              key={cat.id}
              className={`flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'text-primary bg-primary/10 border-l-[3px] border-primary font-bold shadow-xs'
                  : 'text-text-muted hover:text-stone-900 hover:bg-stone-100 hover:translate-x-1'
              }`}
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0 shadow-xs relative">
                <img 
                  src={thumbUrl} 
                  alt={cat.name} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <span className={`text-[0.82rem] tracking-wide leading-snug line-clamp-2 ${isActive ? 'font-bold text-primary' : 'font-medium'}`}>
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Categories ke niche Section: Liked Items & Orders and Tracking */}
      <div className="pt-4 mt-auto border-t border-border flex flex-col gap-2">
        <p className="text-[0.7rem] uppercase tracking-wider font-bold text-text-muted px-3">
          My Account & Activity
        </p>

        {/* Liked Items */}
        <button
          type="button"
          onClick={openWishlist}
          className="w-full text-left text-[0.85rem] font-semibold px-3 py-1.5 rounded-lg flex items-center justify-between text-text-main hover:text-rose-600 hover:bg-rose-50/70 transition-all duration-200"
        >
          <div className="flex items-center gap-2.5">
            <Heart size={16} className={totalLiked > 0 ? "fill-rose-500 text-rose-500" : "text-stone-500"} />
            <span>Liked Items</span>
          </div>
          {totalLiked > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[0.65rem] font-bold">
              {totalLiked}
            </span>
          )}
        </button>

        {/* Orders & Tracking */}
        <Link
          to="/orders"
          className={`text-[0.85rem] font-semibold px-3 py-1.5 rounded-lg flex items-center gap-2.5 transition-all duration-200 ${
            location.pathname === '/orders'
              ? 'text-primary font-bold bg-primary/10 border-l-[3px] border-primary'
              : 'text-text-main hover:text-primary hover:bg-primary/5 hover:translate-x-1'
          }`}
        >
          <Package size={16} className="text-[#8B5E34]" />
          <span>Orders & Tracking</span>
        </Link>
      </div>
    </aside>
  );
}
