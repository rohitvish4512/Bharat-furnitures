import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, AlertCircle, ShoppingCart, Sparkles, LogIn } from 'lucide-react';

export default function AuthModal() {
  const { 
    isAuthModalOpen, 
    authModalReason, 
    closeAuthModal, 
    loginWithEmail, 
    registerWithEmail, 
    loginWithGoogle 
  } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const getReasonInfo = () => {
    switch (authModalReason) {
      case 'cart':
        return {
          icon: <ShoppingCart className="text-[#8B5E34]" size={22} />,
          title: 'Sign In to Add to Cart',
          subtitle: 'Please log in to add products to your cart and save them across your devices.'
        };
      case 'order':
        return {
          icon: <Lock className="text-[#8B5E34]" size={22} />,
          title: 'Sign In to Place Order',
          subtitle: 'Login is required to verify your address, track express delivery and warranty.'
        };
      case 'timed':
        return {
          icon: <Sparkles className="text-amber-500" size={22} />,
          title: 'Welcome to Bharat Furnitures!',
          subtitle: 'Sign in to unlock exclusive festive discounts and save your favorite furniture.'
        };
      default:
        return {
          icon: <LogIn className="text-[#8B5E34]" size={22} />,
          title: 'Welcome Back',
          subtitle: 'Sign in to your Bharat Furnitures account.'
        };
    }
  };

  const reasonInfo = getReasonInfo();

  const getErrorMessage = (err) => {
    const code = err.code || '';
    if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
      return 'Invalid email or password. Please try again.';
    }
    if (code.includes('email-already-in-use')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (code.includes('weak-password')) {
      return 'Password should be at least 6 characters.';
    }
    if (code.includes('invalid-email')) {
      return 'Please enter a valid email address.';
    }
    if (code.includes('popup-closed-by-user')) {
      return 'Google sign-in was cancelled.';
    }
    return err.message || 'Something went wrong. Please try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) {
          setError('Please enter your full name');
          setLoading(false);
          return;
        }
        await registerWithEmail(email, password, name.trim());
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[1200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      onClick={closeAuthModal}
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-10"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Modal Top Context Header */}
        <div className="bg-gradient-to-br from-[#FFF8ED] to-[#FAF7F2] p-6 pb-5 border-b border-stone-200/60">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-white shadow-sm border border-stone-200 mb-3">
            {reasonInfo.icon}
          </div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-stone-900 leading-tight">
            {reasonInfo.title}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
            {reasonInfo.subtitle}
          </p>

          {/* Tab Switcher */}
          <div className="flex bg-stone-200/70 p-1 rounded-xl mt-5">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                !isRegister 
                  ? 'bg-white text-stone-900 shadow-sm' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                isRegister 
                  ? 'bg-white text-stone-900 shadow-sm' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-[0.7rem] uppercase">
              <span className="bg-white px-3 text-stone-400 font-semibold">Or with Email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {isRegister && (
              <div>
                <label className="block text-[0.75rem] font-bold text-stone-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rohit Sharma"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#8B5E34] focus:bg-white transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[0.75rem] font-bold text-stone-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#8B5E34] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[0.75rem] font-bold text-stone-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#8B5E34] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#8B5E34] hover:bg-[#5C3A21] shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isRegister ? (
                'Create Account & Continue'
              ) : (
                'Sign In & Continue'
              )}
            </button>
          </form>

          <p className="text-center text-[0.7rem] text-stone-500 mt-4">
            By continuing, you agree to Bharat Furnitures' Terms of Service & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
