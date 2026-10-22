import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const WishlistContext = createContext();

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

export function WishlistProvider({ children }) {
  const { currentUser, openAuthModal } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // Sync wishlist from Firestore when user changes
  useEffect(() => {
    if (!currentUser) {
      setWishlist([]);
      return;
    }

    let isMounted = true;
    const fetchUserWishlist = async () => {
      setLoadingWishlist(true);
      try {
        const wishlistRef = doc(db, 'wishlists', currentUser.uid);
        const wishlistSnap = await getDoc(wishlistRef);
        if (wishlistSnap.exists() && isMounted) {
          const data = wishlistSnap.data();
          setWishlist(Array.isArray(data.items) ? data.items : []);
        } else if (isMounted) {
          setWishlist([]);
        }
      } catch (err) {
        console.error('Error fetching wishlist from Firestore:', err);
      } finally {
        if (isMounted) setLoadingWishlist(false);
      }
    };

    fetchUserWishlist();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  // Helper to persist wishlist to Firestore
  const saveWishlistToFirestore = async (newWishlist) => {
    if (!currentUser) return;
    try {
      const wishlistRef = doc(db, 'wishlists', currentUser.uid);
      await setDoc(wishlistRef, {
        items: newWishlist,
        userId: currentUser.uid,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error saving wishlist to Firestore:', err);
    }
  };

  const isLiked = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  const toggleWishlist = (product) => {
    if (!currentUser) {
      openAuthModal('cart', () => {
        toggleWishlist(product);
      });
      return;
    }

    setWishlist((prevWishlist) => {
      const exists = prevWishlist.some((item) => item.id === product.id);
      let updated;
      if (exists) {
        updated = prevWishlist.filter((item) => item.id !== product.id);
      } else {
        const image = (product.images && product.images.length > 0)
          ? product.images[0]
          : (product.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80');

        updated = [
          ...prevWishlist,
          {
            id: product.id,
            name: product.name,
            price: Number(product.price) || 0,
            originalPrice: Number(product.originalPrice) || Number(product.price) || 0,
            image,
            material: product.material || '',
            dimensions: product.dimensions || '',
            rating: product.rating || 4.5
          }
        ];
      }
      saveWishlistToFirestore(updated);
      return updated;
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlist((prev) => {
      const updated = prev.filter((item) => item.id !== productId);
      saveWishlistToFirestore(updated);
      return updated;
    });
  };

  const openWishlist = () => setIsWishlistOpen(true);
  const closeWishlist = () => setIsWishlistOpen(false);

  const totalLiked = wishlist.length;

  const value = {
    wishlist,
    loadingWishlist,
    isLiked,
    toggleWishlist,
    removeFromWishlist,
    isWishlistOpen,
    openWishlist,
    closeWishlist,
    totalLiked
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}
