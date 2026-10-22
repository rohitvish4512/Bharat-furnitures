import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Search, X } from 'lucide-react';

export default function Sidebar() {
  const [categories, setCategories] = useState([]);
  const [searchParams] = useSearchParams();
  const urlSearchQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const location = useLocation();
  const navigate = useNavigate();

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

  // Filter category list in sidebar as well
  const filteredCategories = categories.filter(cat => 
    cat.name && cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-full md:w-[250px] bg-surface border-b md:border-b-0 md:border-r border-border p-4 md:p-6 flex flex-col gap-6 shrink-0 md:min-h-[calc(100vh-70px)]">
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

      <div className="flex flex-col gap-2">
        <Link 
          to="/category/all" 
          className={`text-[0.85rem] font-bold tracking-wider px-3 py-1.5 rounded-lg block transition-all duration-200 ${
            location.pathname === '/category/all' 
              ? 'text-primary bg-primary/10 border-l-[3px] border-primary' 
              : 'text-text-main hover:text-primary hover:bg-primary/5 hover:translate-x-1'
          }`}
        >
          ALL CATEGORIES
        </Link>
        {filteredCategories.map(cat => {
          const isActive = location.pathname === `/category/${cat.id}`;
          return (
            <Link 
              to={`/category/${cat.id}`} 
              key={cat.id}
              className={`text-[0.85rem] tracking-wider px-3 py-1.5 rounded-lg block transition-all duration-200 ${
                isActive 
                  ? 'text-primary font-bold bg-primary/10 border-l-[3px] border-primary' 
                  : 'text-text-muted font-medium hover:text-primary hover:bg-primary/5 hover:translate-x-1'
              }`}
            >
              {cat.name.toUpperCase()}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
