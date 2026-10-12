import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, updateDoc, doc, getDocs, deleteDoc } from 'firebase/firestore';

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
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex justify-center gap-3 mb-8">
        <button 
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
            activeTab === 'add' 
              ? 'bg-primary text-white shadow-md' 
              : 'bg-slate-200 text-text-muted hover:bg-slate-300'
          }`}
          onClick={() => { setActiveTab('add'); setEditingId(null); setFormData(initialState); }}
        >
          {editingId ? 'Edit Product' : 'Add New Product'}
        </button>
        <button 
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
            activeTab === 'manage' 
              ? 'bg-primary text-white shadow-md' 
              : 'bg-slate-200 text-text-muted hover:bg-slate-300'
          }`}
          onClick={() => setActiveTab('manage')}
        >
          Manage Products
        </button>
      </div>

      <div className="bg-surface rounded-2xl p-6 md:p-8 shadow-sm border border-border">
        <h2 className="text-2xl font-heading font-bold text-center text-text-main mb-6">
          {activeTab === 'manage' ? 'Manage Products' : (editingId ? 'Edit Product' : 'Add Product')}
        </h2>
        
        {message && (
          <div className={`p-3 mb-6 rounded-lg text-center text-sm font-medium border ${
            message.includes('success') 
              ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
              : 'bg-rose-100 text-rose-800 border-rose-200'
          }`}>
            {message}
          </div>
        )}
        
        {activeTab === 'add' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-xs text-text-main">Product Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary transition-colors" />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-xs text-text-main">Category ID (e.g., storage-racks, beds)</label>
              <input type="text" name="categoryId" value={formData.categoryId} onChange={handleChange} required className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary transition-colors" />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-xs text-text-main">Price (₹)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary transition-colors" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-xs text-text-main">Original Price (₹)</label>
              <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary transition-colors" />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-xs text-text-main">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required rows="4" className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary transition-colors"></textarea>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-xs text-text-main">Dimensions</label>
              <input type="text" name="dimensions" value={formData.dimensions} onChange={handleChange} placeholder="e.g., 80x40x15 cm" className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary transition-colors" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-xs text-text-main">Material</label>
              <input type="text" name="material" value={formData.material} onChange={handleChange} placeholder="e.g., Plastic, Wood" className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary transition-colors" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-xs text-text-main">Weight</label>
              <input type="text" name="weight" value={formData.weight} onChange={handleChange} placeholder="e.g., 3 kg" className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary transition-colors" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-xs text-text-main">Stock</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="e.g., 120" className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary transition-colors" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-xs text-text-main">Badges (comma separated)</label>
              <input type="text" name="badges" value={formData.badges} onChange={handleChange} placeholder="e.g., Smart Storage, New" className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary transition-colors" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-xs text-text-main">Features (comma separated)</label>
              <input type="text" name="features" value={formData.features} onChange={handleChange} placeholder="e.g., Wheels, Slim Design" className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary transition-colors" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-xs text-text-main">Rating</label>
              <input type="number" name="rating" step="0.1" max="5" value={formData.rating} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary transition-colors" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-xs text-text-main">Reviews Count</label>
              <input type="number" name="reviews" value={formData.reviews} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary transition-colors" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-xs text-text-main">Product Image {editingId && '(Leave empty to keep current image)'}</label>
              <input type="file" onChange={handleImageChange} accept="image/*" required={!editingId} className="w-full py-2 text-sm text-text-muted" />
              {editingId && formData.images && (
                <div className="mt-2">
                  <img src={formData.images[0]} alt="Current" className="w-20 h-20 object-cover rounded-lg border border-border" />
                </div>
              )}
            </div>

            <button type="submit" className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-base shadow-md transition-all disabled:opacity-50 mt-2" disabled={loading}>
              {loading ? 'Saving...' : (editingId ? 'Update Product' : 'Add Product')}
            </button>
            
            {editingId && (
              <button 
                type="button" 
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-base shadow-md transition-all mt-2" 
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
          <div className="flex flex-col gap-6">
            {loading ? <p className="text-center text-text-muted py-8">Loading products...</p> : (
              Object.keys(productsByCategory).length === 0 ? <p className="text-center text-text-muted py-8">No products found.</p> :
              Object.keys(productsByCategory).map(catId => {
                const catInfo = categories.find(c => c.id === catId);
                const catName = catInfo ? catInfo.name : catId;
                
                return (
                  <div key={catId} className="bg-background rounded-xl p-4 border border-border">
                    <h3 className="text-base font-bold font-heading text-text-main pb-2 mb-3 border-b border-border flex items-center justify-between">
                      <span>{catName}</span>
                      <span className="text-[0.7rem] bg-white border border-border px-2.5 py-0.5 rounded-full text-text-muted font-normal">{catId}</span>
                    </h3>
                    <div className="flex flex-col gap-3">
                      {productsByCategory[catId].map(prod => (
                        <div key={prod.id} className="flex items-center gap-4 p-3 bg-white border border-border rounded-xl shadow-xs">
                          <img src={prod.images?.[0] || 'https://via.placeholder.com/80'} alt={prod.name} className="w-14 h-14 object-cover rounded-lg shrink-0 border border-border" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-text-main truncate mb-0.5">{prod.name}</h4>
                            <p className="text-xs text-text-muted">₹{prod.price} | Stock: {prod.stock}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all" onClick={() => handleEdit(prod)}>Edit</button>
                            <button className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all" onClick={() => handleDelete(prod.id)}>Delete</button>
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
