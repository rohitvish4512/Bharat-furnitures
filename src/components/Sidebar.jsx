import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Search } from 'lucide-react';

export default function Sidebar() {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

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

  const filteredCategories = categories.filter(cat => 
    cat.name && cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-full md:w-[250px] bg-surface border-b md:border-b-0 md:border-r border-border p-4 md:p-6 flex flex-col gap-6 shrink-0 md:min-h-[calc(100vh-70px)]">
      <div className="flex items-center bg-[#f1f5f9] rounded-full px-4 py-2 gap-2">
        <input 
          type="text" 
          placeholder="SEARCH" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-none bg-transparent outline-none w-full font-body text-sm text-text-main"
        />
        <Search size={18} className="text-text-muted shrink-0" />
      </div>

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
