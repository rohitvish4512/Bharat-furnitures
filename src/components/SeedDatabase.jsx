import { useState } from 'react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { products, categories } from '../data/products';

export default function SeedDatabase() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSeed = async () => {
    setLoading(true);
    setMessage('Seeding database...');
    try {
      // Seed Categories
      for (const category of categories) {
        await setDoc(doc(db, 'categories', category.id.toString()), category);
      }
      
      // Seed Products
      for (const product of products) {
        // use product.id as the document ID
        await setDoc(doc(db, 'products', product.id.toString()), product);
      }
      
      setMessage('Database seeded successfully! You can now remove this component.');
    } catch (error) {
      console.error(error);
      setMessage('Error seeding database: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center', background: '#f8d7da', color: '#721c24' }}>
      <h3>Admin Tool: Seed Database</h3>
      <p>Click the button below to push all dummy products and categories from your code into Firestore.</p>
      <button 
        onClick={handleSeed} 
        disabled={loading}
        className="btn btn-primary"
      >
        {loading ? 'Uploading...' : 'Upload Dummy Data to Firestore'}
      </button>
      {message && <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
}
