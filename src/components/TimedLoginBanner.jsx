import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Sparkles, ArrowRight } from 'lucide-react';

export default function TimedLoginBanner() {
  const { currentUser, openAuthModal } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // If user is already logged in, no need to show
    if (currentUser) {
      setIsVisible(false);
      return;
    }

    // Check if user already dismissed in this session
    const isDismissed = sessionStorage.getItem('bharat_dismissed_timed_banner');
    if (isDismissed) {
      return;
    }

    // Set 1 minute (60 seconds) timer
    const timer = setTimeout(() => {
      // Recheck currentUser & session dismissal before showing
      if (!currentUser && !sessionStorage.getItem('bharat_dismissed_timed_banner')) {
        setIsVisible(true);
      }
    }, 60 * 1000); // 60 seconds

    return () => clearTimeout(timer);
  }, [currentUser]);

  const handleDismiss = () => {
    sessionStorage.setItem('bharat_dismissed_timed_banner', 'true');
    setIsVisible(false);
  };

  const handleSignInClick = () => {
    handleDismiss();
    openAuthModal('timed');
  };

  if (!isVisible || currentUser) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[99] animate-fade-in">
      <div className="relative bg-stone-900/95 backdrop-blur-md text-white p-5 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.35)] border border-amber-500/30 overflow-hidden">
        
        {/* Glow decoration */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          aria-label="Dismiss banner"
        >
          <X size={15} />
        </button>

        <div className="flex items-start gap-3.5 pr-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8B5E34] to-amber-500 flex items-center justify-center shrink-0 shadow-md">
            <Sparkles size={20} className="text-white" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[0.68rem] font-bold tracking-wider uppercase mb-1">
              <span>Special Offer</span>
            </div>
            <h4 className="font-heading font-bold text-sm sm:text-base text-white leading-tight">
              Loving Bharat Furnitures?
            </h4>
            <p className="text-xs text-stone-300 mt-1 leading-relaxed">
              Sign in now to save your favorites & unlock up to <span className="text-amber-400 font-bold">15% festive discount</span> on your order!
            </p>

            <div className="flex items-center gap-2.5 mt-3.5">
              <button
                type="button"
                onClick={handleSignInClick}
                className="px-4 py-2 rounded-xl bg-[#8B5E34] hover:bg-[#A06E3F] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95"
              >
                <span>Sign In / Register</span>
                <ArrowRight size={13} />
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="px-3 py-2 rounded-xl text-stone-400 hover:text-stone-200 text-xs font-semibold transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
