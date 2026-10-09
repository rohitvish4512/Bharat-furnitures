import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Search } from 'lucide-react';
import './Home.css';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catSnap = await getDocs(collection(db, 'categories'));
        const catData = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(catData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMsg(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading products from Firebase...</div>;
  }

  if (errorMsg) {
    return (
      <div style={{ minHeight: '85vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'red' }}>
        <h2>Database Connection Error</h2>
        <p>{errorMsg}</p>
      </div>
    );
  }

  // Use fallback images for categories based on name
  const getFallbackImage = (name) => {
    const images = {
      'beds': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&q=80',
      'tables': 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=500&q=80',
      'chairs': 'https://images.unsplash.com/photo-1503602642458-232111445657?w=500&q=80',
      'storage': 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500&q=80',
      'study': 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&q=80'
    };
    const key = Object.keys(images).find(k => name.toLowerCase().includes(k));
    return key ? images[key] : 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=500&q=80';
  };

  return (
    <div className="home-page-ref animate-fade-in">
      {/* Sidebar Navigation */}
      <aside className="home-sidebar-nav">
        <div className="search-bar">
          <input type="text" placeholder="SEARCH" />
          <Search size={18} color="var(--text-muted)" />
        </div>
        
        <div className="sidebar-links">
          <Link to="#">ORDER STATUS</Link>
          <Link to="#">ACCOUNT</Link>
          <Link to="#" className="new-launch">NEW LAUNCHES 🎉</Link>
        </div>

        <div className="sidebar-categories">
          <Link to="/category/all" className="font-bold text-main">ALL CATEGORIES</Link>
          {categories.map(cat => (
            <Link to={`/category/${cat.id}`} key={cat.id}>
              {cat.name.toUpperCase()}
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="home-main-board">
        <div className="board-header">
          <h2 className="board-title">BEDROOM FURNITURE</h2>
          <p className="board-subtitle">Academic Year Sale upto 60% OFF • Space Saving Wood • Lifetime warranty</p>
        </div>

        <div className="board-grid">
          {categories.map(cat => (
            <div key={cat.id} className="board-card">
              <div className="card-image-wrap">
                <img src={getFallbackImage(cat.name)} alt={cat.name} />
              </div>
              <p className="card-discount">Upto 60% OFF</p>
              <h4 className="card-title">{cat.name.toUpperCase()}</h4>
              <Link to={`/category/${cat.id}`} className="shop-btn">
                Shop &rarr;
              </Link>
            </div>
          ))}
        </div>

        <div className="board-footer mt-8">
          <p className="subtitle">Introducing</p>
          <h2 className="footer-title">SMART COLLECTION</h2>
        </div>
      </main>
    </div>
  );
}
