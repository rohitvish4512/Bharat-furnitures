import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const CartContext = createContext();

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function CartProvider({ children }) {
  const { currentUser } = useAuth();
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loadingCart, setLoadingCart] = useState(false);

  // Sync cart from Firestore whenever user logs in or out
  useEffect(() => {
    // Clean up any old localStorage cart from previous implementation
    try {
      localStorage.removeItem('bharat_cart');
    } catch (e) {
      // ignore
    }

    if (!currentUser) {
      // If user is logged out, clear cart in UI
      setCart([]);
      return;
    }

    let isMounted = true;
    const fetchUserCart = async () => {
      setLoadingCart(true);
      try {
        const cartRef = doc(db, 'carts', currentUser.uid);
        const cartSnap = await getDoc(cartRef);
        if (cartSnap.exists() && isMounted) {
          const data = cartSnap.data();
          setCart(Array.isArray(data.items) ? data.items : []);
        } else if (isMounted) {
          setCart([]);
        }
      } catch (err) {
        console.error('Error fetching user cart from Firestore:', err);
      } finally {
        if (isMounted) setLoadingCart(false);
      }
    };

    fetchUserCart();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  // Helper to persist updated cart to Firestore
  const saveCartToFirestore = async (newCart) => {
    if (!currentUser) return;
    try {
      const cartRef = doc(db, 'carts', currentUser.uid);
      await setDoc(cartRef, {
        items: newCart,
        userId: currentUser.uid,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error saving cart to Firestore:', err);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    const qtyToAdd = Math.max(1, Number(quantity) || 1);
    const price = Number(product.price) || 0;
    const originalPrice = Number(product.originalPrice) || price;
    const image = (product.images && product.images.length > 0)
      ? product.images[0]
      : (product.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80');

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === product.id);
      let updatedCart;
      if (existingIndex > -1) {
        updatedCart = [...prevCart];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: updatedCart[existingIndex].quantity + qtyToAdd
        };
      } else {
        updatedCart = [
          ...prevCart,
          {
            id: product.id,
            name: product.name,
            price,
            originalPrice,
            image,
            material: product.material || '',
            dimensions: product.dimensions || '',
            quantity: qtyToAdd
          }
        ];
      }
      saveCartToFirestore(updatedCart);
      return updatedCart;
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter((item) => item.id !== productId);
      saveCartToFirestore(updatedCart);
      return updatedCart;
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart((prevCart) => {
      const updatedCart = prevCart
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
      saveCartToFirestore(updatedCart);
      return updatedCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    saveCartToFirestore([]);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalOriginalAmount = cart.reduce((sum, item) => sum + (item.originalPrice || item.price) * item.quantity, 0);
  const totalSavings = totalOriginalAmount > totalAmount ? totalOriginalAmount - totalAmount : 0;

  const isInCart = (productId) => {
    return cart.some((item) => item.id === productId);
  };

  const getItemQuantity = (productId) => {
    const item = cart.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  };

  const value = {
    cart,
    loadingCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
    isCartOpen,
    openCart,
    closeCart,
    totalItems,
    totalAmount,
    totalSavings
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
