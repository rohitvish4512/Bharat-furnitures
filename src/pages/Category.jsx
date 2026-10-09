import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Filter, SlidersHorizontal, ChevronDown } from 'lucide-react';
import './Category.css';

export default function Category() {
  const { id } = useParams();
  const [sortBy, setSortBy] = useState('popular');
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState({ name: 'Loading...', id: 'all' });
  const [loading, setLoading] = useState(true);

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
      } catch (error) {
        console.error("Error fetching category data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  let filteredProducts = [...products];

  // Simulate sorting
  if (sortBy === 'price-low') filteredProducts.sort((a, b) => a.price - b.price);
  if (sortBy === 'price-high') filteredProducts.sort((a, b) => b.price - a.price);
  if (sortBy === 'rating') filteredProducts.sort((a, b) => b.rating - a.rating);

  if (loading) {
    return <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading products...</div>;
  }

  return (
    <div className="category-page container animate-fade-in section">
      <div className="category-header mb-8">
        <h1 className="h2-title text-gradient">{category.name}</h1>
        <p className="text-muted">Showing {filteredProducts.length} smart solutions for your space.</p>
      </div>

      <div className="category-layout">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar rounded-card p-4">
          <div className="flex items-center gap-sm mb-6">
            <Filter size={20} />
            <h3 className="font-bold">Filters</h3>
          </div>
          
          <div className="filter-group">
            <h4 className="filter-title">Price Range</h4>
            <div className="flex flex-col gap-sm mt-2">
              <label className="flex items-center gap-sm cursor-pointer">
                <input type="checkbox" /> Under ₹1000
              </label>
              <label className="flex items-center gap-sm cursor-pointer">
                <input type="checkbox" /> ₹1000 - ₹2500
              </label>
              <label className="flex items-center gap-sm cursor-pointer">
                <input type="checkbox" /> Above ₹2500
              </label>
            </div>
          </div>

          <div className="filter-group mt-6">
            <h4 className="filter-title">Features</h4>
            <div className="flex flex-col gap-sm mt-2">
              <label className="flex items-center gap-sm cursor-pointer">
                <input type="checkbox" /> Foldable
              </label>
              <label className="flex items-center gap-sm cursor-pointer">
                <input type="checkbox" /> With Storage
              </label>
              <label className="flex items-center gap-sm cursor-pointer">
                <input type="checkbox" /> Wall Mounted
              </label>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="category-main">
          <div className="toolbar flex justify-between items-center mb-6 rounded-card p-4">
            <button className="btn btn-outline mobile-filter-btn flex items-center gap-sm">
              <SlidersHorizontal size={16} /> Filters
            </button>
            
            <div className="sort-dropdown flex items-center gap-sm ml-auto">
              <span className="text-small font-bold text-main">Sort by:</span>
              <div className="select-wrapper relative">
                <select 
                  value={sortBy} 
                  onChange={e => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="popular">Popularity</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
                <ChevronDown size={16} className="select-icon absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted" />
              </div>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-3 gap-md">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state text-center py-12">
              <div className="text-muted mb-4">No products found in this category.</div>
              <button className="btn btn-primary">Clear Filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
