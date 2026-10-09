import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, updateDoc, doc, getDocs, deleteDoc } from 'firebase/firestore';
import './Admin.css';

const generateSignature = async (timestamp, apiSecret) => {
  const str = `timestamp=${timestamp}${apiSecret}`;
  const buffer = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest('SHA-1', buffer);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

const Admin = () => {
  const initialState = {
    name: '',
    categoryId: '',
    description: '',
    price: '',
    originalPrice: '',
    rating: '',
    reviews: '',
    stock: '',
    dimensions: '',
    material: '',
    weight: '',
    badges: '',
    features: ''
  };
  
  const [formData, setFormData] = useState(initialState);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // New States for Manage View
  const [activeTab, setActiveTab] = useState('add'); // 'add' or 'manage'
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Fetch products and categories when manage tab is clicked
  useEffect(() => {
    if (activeTab === 'manage') {
      fetchData();
    }
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const prodSnap = await getDocs(collection(db, 'products'));
      const prods = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setProducts(prods);

      const catSnap = await getDocs(collection(db, 'categories'));
      const cats = catSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCategories(cats);
    } catch (err) {
      console.error(err);
      setMessage('Failed to load data: ' + err.message);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingId && !image) {
      setMessage('Please select an image first.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      let imageUrl = formData.images ? formData.images[0] : null;

      if (image) {
        // Upload Image to Cloudinary (Signed)
        const cloudName = 'dy49nlqn';
        const apiKey = '264425733737867';
        const apiSecret = 'uoZKptVsW_8FHWJrpPZjqXscUaU';
        const timestamp = Math.round(new Date().getTime() / 1000);
        const signature = await generateSignature(timestamp, apiSecret);

        const formDataUpload = new FormData();
        formDataUpload.append('file', image);
        formDataUpload.append('api_key', apiKey);
        formDataUpload.append('timestamp', timestamp);
        formDataUpload.append('signature', signature);
        
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        
        const res = await fetch(cloudinaryUrl, {
          method: 'POST',
          body: formDataUpload
        });
        
        if (!res.ok) throw new Error('Failed to upload image to Cloudinary');
        
        const cloudData = await res.json();
        imageUrl = cloudData.secure_url;
      }

      const now = new Date().toISOString();
      
      // Parse arrays safely
      const parseArray = (str) => {
        if (!str) return [];
        if (Array.isArray(str)) return str;
        return str.split(',').map(item => item.trim());
      };
      
      const badgesArray = parseArray(formData.badges);
      const featuresArray = parseArray(formData.features);

      const productData = {
        name: formData.name,
        categoryId: formData.categoryId,
        description: formData.description,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice) || Number(formData.price),
        rating: Number(formData.rating) || 0,
        reviews: Number(formData.reviews) || 0,
        stock: Number(formData.stock) || 0,
        dimensions: formData.dimensions,
        material: formData.material,
        weight: formData.weight,
        badges: badgesArray,
        features: featuresArray,
        isActive: true,
        updatedAt: now
      };
      
      if (imageUrl) {
        productData.images = [imageUrl];
      }

      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), productData);
        setMessage('Product updated successfully!');
        setEditingId(null);
        setActiveTab('manage');
      } else {
        productData.createdAt = now;
        const docRef = await addDoc(collection(db, 'products'), productData);
        await updateDoc(docRef, { id: docRef.id });
        setMessage('Product added successfully!');
      }

      setFormData(initialState);
      setImage(null);
      e.target.reset(); 
    } catch (error) {
      console.error('Error saving product: ', error);
      setMessage('Failed to save product. ' + error.message);
    }
    setLoading(false);
  };

  const handleEdit = (prod) => {
    setFormData({
      ...prod,
      badges: Array.isArray(prod.badges) ? prod.badges.join(', ') : prod.badges || '',
      features: Array.isArray(prod.features) ? prod.features.join(', ') : prod.features || '',
    });
    setEditingId(prod.id);
    setActiveTab('add'); // Switch to the form view
    setMessage('');
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, 'products', id));
        setMessage('Product deleted successfully');
        fetchData();
      } catch (err) {
        setMessage('Failed to delete: ' + err.message);
      }
      setLoading(false);
    }
  };

  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    const catId = product.categoryId || 'uncategorized';
    if (!acc[catId]) acc[catId] = [];
    acc[catId].push(product);
    return acc;
  }, {});

  return (
    <div className="admin-page">
      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => { setActiveTab('add'); setEditingId(null); setFormData(initialState); }}
        >
          {editingId ? 'Edit Product' : 'Add New Product'}
        </button>
        <button 
          className={`admin-tab ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          Manage Products
        </button>
      </div>

      <div className="admin-container">
        <h2>{activeTab === 'manage' ? 'Manage Products' : (editingId ? 'Edit Product' : 'Add Product')}</h2>
        
        {message && <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}
        
        {activeTab === 'add' && (
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label>Product Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            
            <div className="form-group">
              <label>Category ID (e.g., storage-racks, beds)</label>
              <input type="text" name="categoryId" value={formData.categoryId} onChange={handleChange} required />
            </div>
            
            <div className="form-group">
              <label>Price (₹)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Original Price (₹)</label>
              <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required rows="4"></textarea>
            </div>

            <div className="form-group">
              <label>Dimensions</label>
              <input type="text" name="dimensions" value={formData.dimensions} onChange={handleChange} placeholder="e.g., 80x40x15 cm" />
            </div>

            <div className="form-group">
              <label>Material</label>
              <input type="text" name="material" value={formData.material} onChange={handleChange} placeholder="e.g., Plastic, Wood" />
            </div>

            <div className="form-group">
              <label>Weight</label>
              <input type="text" name="weight" value={formData.weight} onChange={handleChange} placeholder="e.g., 3 kg" />
            </div>

            <div className="form-group">
              <label>Stock</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="e.g., 120" />
            </div>

            <div className="form-group">
              <label>Badges (comma separated)</label>
              <input type="text" name="badges" value={formData.badges} onChange={handleChange} placeholder="e.g., Smart Storage, New" />
            </div>

            <div className="form-group">
              <label>Features (comma separated)</label>
              <input type="text" name="features" value={formData.features} onChange={handleChange} placeholder="e.g., Wheels, Slim Design" />
            </div>

            <div className="form-group">
              <label>Rating</label>
              <input type="number" name="rating" step="0.1" max="5" value={formData.rating} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Reviews Count</label>
              <input type="number" name="reviews" value={formData.reviews} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Product Image {editingId && '(Leave empty to keep current image)'}</label>
              <input type="file" onChange={handleImageChange} accept="image/*" required={!editingId} />
              {editingId && formData.images && (
                <div style={{marginTop: '10px'}}>
                  <img src={formData.images[0]} alt="Current" width="80" />
                </div>
              )}
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Saving...' : (editingId ? 'Update Product' : 'Add Product')}
            </button>
            
            {editingId && (
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={() => {
                  setEditingId(null);
                  setFormData(initialState);
                  setActiveTab('manage');
                }}
                disabled={loading}
              >
                Cancel Edit
              </button>
            )}
          </form>
        )}

        {activeTab === 'manage' && (
          <div className="manage-products">
            {loading ? <p>Loading products...</p> : (
              Object.keys(productsByCategory).length === 0 ? <p>No products found.</p> :
              Object.keys(productsByCategory).map(catId => {
                const catInfo = categories.find(c => c.id === catId);
                const catName = catInfo ? catInfo.name : catId;
                
                return (
                  <div key={catId} className="category-group">
                    <h3 className="category-header">{catName} <span className="cat-badge">{catId}</span></h3>
                    <div className="product-list">
                      {productsByCategory[catId].map(prod => (
                        <div key={prod.id} className="admin-product-card">
                          <img src={prod.images?.[0] || 'https://via.placeholder.com/80'} alt={prod.name} />
                          <div className="prod-details">
                            <h4>{prod.name}</h4>
                            <p>₹{prod.price} | Stock: {prod.stock}</p>
                          </div>
                          <div className="prod-actions">
                            <button className="edit-btn" onClick={() => handleEdit(prod)}>Edit</button>
                            <button className="delete-btn" onClick={() => handleDelete(prod.id)}>Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
