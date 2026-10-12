import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import ProductCard from '../components/ProductCard';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ChevronDown, Sliders, RotateCcw } from 'lucide-react';
import Sidebar from '../components/Sidebar';

export default function Category() {
  const { id } = useParams();
  const [sortBy, setSortBy] = useState('popular');
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState({ name: 'Loading...', id: 'all' });
  const [loading, setLoading] = useState(true);

  // Price range volume slider state
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false);
  const [priceLimit, setPriceLimit] = useState(null);
  const priceDropdownRef = useRef(null);

  // Close price popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (priceDropdownRef.current && !priceDropdownRef.current.contains(event.target)) {
        setIsPriceDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch specific category details
        if (id && id !== 'all') {
          const catSnap = await getDocs(query(collection(db, 'categories'), where('id', '==', id)));
          if (!catSnap.empty) {
            setCategory({ id: catSnap.docs[0].id, ...catSnap.docs[0].data() });
          } else {
            setCategory({ name: 'Category Not Found', id });
          }
        } else {
          setCategory({ name: 'All Products', id: 'all' });
        }

        // Fetch products for this category
        let prodQuery;
        if (id && id !== 'all') {
          prodQuery = query(collection(db, 'products'), where('categoryId', '==', id));
        } else {
          prodQuery = collection(db, 'products');
        }

        const prodSnap = await getDocs(prodQuery);
        const prodData = prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(prodData);
        setPriceLimit(null); // Reset filter when category changes
      } catch (error) {
        console.error("Error fetching category data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const maxProductPrice = products.length > 0
    ? Math.max(...products.map(p => Number(p.price) || 0), 2000)
    : 10000;

  const currentMax = priceLimit !== null ? priceLimit : maxProductPrice;

  // Filter products by price
  let filteredProducts = products.filter(p => {
    if (priceLimit !== null) {
      return (Number(p.price) || 0) <= priceLimit;
    }
    return true;
  });

  // Simulate sorting
  if (sortBy === 'price-low') filteredProducts.sort((a, b) => a.price - b.price);
  if (sortBy === 'price-high') filteredProducts.sort((a, b) => b.price - a.price);
  if (sortBy === 'rating') filteredProducts.sort((a, b) => b.rating - a.rating);

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-background">
      <Sidebar />

      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        {loading ? (
          <div className="min-h-[60vh] flex items-center justify-center text-text-muted font-medium">
            Loading products...
          </div>
        ) : (
          <>
            <div className="mb-7">
              <h1 className="font-heading font-extrabold text-2xl md:text-3xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-1">
                {category.name}
              </h1>
              <p className="text-sm text-text-muted">Showing smart solutions for your space.</p>
            </div>

            {/* Toolbar with Price Range volume slider dropdown & Sort By */}
            <div className="relative z-50 flex flex-wrap justify-between items-center mb-8 bg-surface border border-border rounded-2xl p-4 shadow-sm gap-4">
              <div className="flex items-center gap-4">
                <div className="relative z-50" ref={priceDropdownRef}>
                  <button
                    type="button"
                    className={`flex items-center gap-1.5 bg-background border border-border hover:border-primary px-3.5 py-1.5 rounded-lg font-body text-xs font-medium text-text-main transition-all ${
                      priceLimit !== null ? 'border-primary bg-primary/10 text-primary font-semibold' : ''
                    }`}
                    onClick={() => setIsPriceDropdownOpen(!isPriceDropdownOpen)}
                  >
                    <Sliders size={14} />
                    <span>Price: {priceLimit !== null ? `Up to ₹${priceLimit.toLocaleString('en-IN')}` : 'All Prices'}</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 text-text-muted ${isPriceDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isPriceDropdownOpen && (
                    <div className="absolute top-[calc(100%+8px)] left-0 w-[230px] bg-surface border border-border rounded-xl shadow-xl p-3.5 z-[999]">
                      <div className="flex justify-between items-center mb-2.5">
                        <span className="text-[0.72rem] font-bold uppercase tracking-wider text-text-muted">Price Range</span>
                        {priceLimit !== null && (
                          <button
                            type="button"
                            className="flex items-center gap-1 text-[0.75rem] text-rose-600 hover:underline font-semibold"
                            onClick={() => setPriceLimit(null)}
                          >
                            <RotateCcw size={11} /> Reset
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="text-lg font-bold text-primary tracking-tight">
                          ₹{currentMax.toLocaleString('en-IN')}
                        </div>

                        <input
                          type="range"
                          min="500"
                          max={maxProductPrice}
                          step="100"
                          value={currentMax}
                          onChange={(e) => setPriceLimit(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />

                        <div className="flex justify-between text-[0.7rem] font-semibold text-text-muted">
                          <span>₹500</span>
                          <span>₹{maxProductPrice.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs font-bold text-text-main">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="appearance-none bg-background border border-border hover:border-primary focus:border-primary focus:outline-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-medium text-text-main cursor-pointer"
                  >
                    <option value="popular">Popularity</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted" />
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-surface rounded-2xl border border-border p-8">
                <div className="text-text-muted mb-4 text-sm">No products found in this price range.</div>
                <button 
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-full text-sm font-semibold transition-all shadow-md" 
                  onClick={() => setPriceLimit(null)}
                >
                  Clear Price Filter
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
