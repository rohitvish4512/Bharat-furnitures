import { ShoppingCart, Heart, Search, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="navbar glass">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="text-gradient h3-subtitle">Bharat</span>Furnitures
        </Link>


        {location.pathname !== '/admin' && (
          <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
            <Link to="/category/study-tables">Study Tables</Link>
            <Link to="/category/storage-furniture">Storage</Link>
            <Link to="/category/multipurpose-furniture">Multipurpose</Link>
          </div>
        )}

        <div className="navbar-actions">
          <button className="btn-icon"><User size={20} /></button>
          <button className="btn-icon"><Heart size={20} /></button>
          <button className="btn-icon cart-btn">
            <ShoppingCart size={20} />
            <span className="cart-badge">2</span>
          </button>
          <button className="menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
