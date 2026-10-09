import { Heart, ShoppingCart, Star } from 'lucide-react';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div className="product-card rounded-card">
      <div className="product-image-container">
        <img src={product.images && product.images[0]} alt={product.name} className="product-image" />
        
        <div className="product-badges">
          {discount > 0 && <span className="badge badge-accent">-{discount}%</span>}
          {product.badges?.map(badge => (
            <span key={badge} className="badge badge-primary">{badge}</span>
          ))}
        </div>
        
        <button className="wishlist-btn"><Heart size={20} /></button>
        
        <div className="product-quick-add">
          <button className="btn btn-primary w-full">Quick Add</button>
        </div>
      </div>
      
      <div className="product-info">
        <div className="product-rating">
          <Star size={14} className="star-icon" fill="currentColor" />
          <span className="rating-value">{product.rating}</span>
          <span className="review-count">({product.reviews})</span>
        </div>
        
        <h3 className="product-title">{product.name}</h3>
        <p className="product-desc">{product.description.substring(0, 50)}...</p>
        
        <div className="product-price-row">
          <div className="price-container">
            <span className="current-price">₹{product.price}</span>
            {product.originalPrice > product.price && (
              <span className="original-price">₹{product.originalPrice}</span>
            )}
          </div>
          <button className="add-cart-icon"><ShoppingCart size={18} /></button>
        </div>
      </div>
    </div>
  );
}
