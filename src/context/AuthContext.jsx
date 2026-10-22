import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth 
} from '../config/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth';
import { db } from '../config/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState('manual'); // 'cart' | 'order' | 'timed' | 'manual'
  const [pendingSuccessAction, setPendingSuccessAction] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const openAuthModal = (reason = 'manual', onSuccess = null) => {
    setAuthModalReason(reason);
    if (onSuccess) {
      setPendingSuccessAction(() => onSuccess);
    } else {
      setPendingSuccessAction(null);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPendingSuccessAction(null);
  };

  const executePendingAction = () => {
    if (typeof pendingSuccessAction === 'function') {
      try {
        pendingSuccessAction();
      } catch (err) {
        console.error('Error executing pending post-login action:', err);
      }
    }
    setPendingSuccessAction(null);
    setIsAuthModalOpen(false);
  };

  const loginWithEmail = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    executePendingAction();
    return userCredential.user;
  };

  const registerWithEmail = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    if (displayName && user) {
      await updateProfile(user, { displayName });
    }
    // Save to Firestore 'users' collection
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: displayName || '',
        email: user.email,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn('Could not save user profile to Firestore:', err);
    }
    executePendingAction();
    return user;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    // Save or update in Firestore 'users' collection
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: user.displayName || '',
        email: user.email,
        photoURL: user.photoURL || '',
        lastLoginAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn('Could not sync Google user profile to Firestore:', err);
    }
    executePendingAction();
    return user;
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    currentUser,
    loading,
    isAuthModalOpen,
    authModalReason,
    openAuthModal,
    closeAuthModal,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
