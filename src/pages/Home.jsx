import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import Sidebar from '../components/Sidebar';

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
    return (
      <div className="min-h-[85vh] flex items-center justify-center text-text-muted font-medium">
        Loading products from Firebase...
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center text-red-600 gap-2">
        <h2 className="text-xl font-bold">Database Connection Error</h2>
        <p className="text-sm">{errorMsg}</p>
      </div>
    );
  }

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
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-background">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 bg-white">
        <div className="text-center mb-10">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#4a2a18] tracking-wider mb-2">
            BEDROOM FURNITURE
          </h2>
          <p className="text-sm text-text-muted">
            Academic Year Sale upto 60% OFF • Space Saving Wood • Lifetime warranty
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-16">
          {categories.map(cat => (
            <div key={cat.id} className="flex flex-col items-center text-center group">
              <div className="w-full aspect-square overflow-hidden mb-3 rounded-xl bg-surface-alt">
                <img 
                  src={getFallbackImage(cat.name)} 
                  alt={cat.name} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <p className="text-primary text-xs font-semibold mb-1">Upto 60% OFF</p>
              <h4 className="font-heading text-sm font-bold text-text-main mb-3">{cat.name.toUpperCase()}</h4>
              <Link 
                to={`/category/${cat.id}`} 
                className="inline-flex items-center gap-1 bg-primary hover:bg-primary-hover text-white text-xs font-medium px-5 py-2 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Shop &rarr;
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 py-8 border-t border-border">
          <p className="text-xs uppercase tracking-widest text-text-muted mb-1">Introducing</p>
          <h2 className="font-heading text-2xl font-extrabold text-primary tracking-wide">SMART COLLECTION</h2>
        </div>
      </main>
    </div>
  );
}
