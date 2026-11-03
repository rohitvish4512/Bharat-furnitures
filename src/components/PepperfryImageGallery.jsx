import React, { useState, useRef, useEffect } from 'react';
import { Share2, Heart, Sparkles } from 'lucide-react';

export default function PepperfryImageGallery({
  images = [],
  productName = '',
  discount = 0,
  badges = [],
  stock = null,
  liked = false,
  onToggleWishlist,
  onShare
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Desktop Hover Zoom state (smooth zoom on the image itself without disappearing)
  const [isHovering, setIsHovering] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });

  // Mobile Pinch & Pan Zoom state
  const [scale, setScale] = useState(1);
  const [panPos, setPanPos] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);
  const touchStateRef = useRef({ dist: 0, scale: 1, startX: 0, startY: 0, posX: 0, posY: 0 });
  const swipeRef = useRef({ startX: 0, startY: 0, isSwipe: false });

  // Reset zoom when switching active thumbnail
  useEffect(() => {
    setScale(1);
    setPanPos({ x: 0, y: 0 });
  }, [selectedIndex]);

  // Desktop Mouse Move -> smoothly focus zoom on the cursor location
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomOrigin({ x, y });
  };

  // Mobile Double Tap to Toggle Zoom
  const lastTapRef = useRef(0);
  const handleTap = (e) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap detected
      if (scale > 1) {
        setScale(1);
        setPanPos({ x: 0, y: 0 });
      } else {
        setScale(2.5);
        setPanPos({ x: 0, y: 0 });
      }
    }
    lastTapRef.current = now;
  };

  // Mobile Touch handlers: direct fluid pinch-to-zoom + swipe slide
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // 2 fingers pinch
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStateRef.current = {
        dist,
        scale,
        posX: panPos.x,
        posY: panPos.y
      };
      swipeRef.current.isSwipe = false;
    } else if (e.touches.length === 1) {
      if (scale > 1) {
        // Pan zoomed image
        touchStateRef.current = {
          startX: e.touches[0].clientX,
          startY: e.touches[0].clientY,
          posX: panPos.x,
          posY: panPos.y
        };
        swipeRef.current.isSwipe = false;
      } else {
        // Horizontal swipe to change slides
        swipeRef.current = {
          startX: e.touches[0].clientX,
          startY: e.touches[0].clientY,
          isSwipe: true
        };
      }
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / (touchStateRef.current.dist || 1);
      const newScale = Math.min(Math.max(1, touchStateRef.current.scale * factor), 4);
      setScale(newScale);
      if (newScale === 1) {
        setPanPos({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && scale > 1) {
      const deltaX = e.touches[0].clientX - touchStateRef.current.startX;
      const deltaY = e.touches[0].clientY - touchStateRef.current.startY;
      const maxPan = 160 * (scale - 1);
      setPanPos({
        x: Math.min(Math.max(-maxPan, touchStateRef.current.posX + deltaX), maxPan),
        y: Math.min(Math.max(-maxPan, touchStateRef.current.posY + deltaY), maxPan)
      });
    }
  };

  const handleTouchEnd = (e) => {
    if (scale <= 1 && swipeRef.current.isSwipe && e.changedTouches.length === 1) {
      const deltaX = swipeRef.current.startX - e.changedTouches[0].clientX;
      const deltaY = swipeRef.current.startY - e.changedTouches[0].clientY;
      if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        } else {
          setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
        }
      }
    }
  };

  const currentImage = images[selectedIndex] || images[0] || '';

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Main Image Stage Container */}
      <div
        ref={containerRef}
        className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#FAF7F2] border border-stone-200/80 shadow-sm select-none touch-pan-y cursor-zoom-in"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          setZoomOrigin({ x: 50, y: 50 });
        }}
        onMouseMove={handleMouseMove}
        onClick={handleTap}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Main Product Image (Never disappears, smooth Pepperfry style zoom) */}
        <img
          src={currentImage}
          alt={productName}
          className="w-full h-full object-contain p-2 pointer-events-none"
          style={{
            transformOrigin: isHovering ? `${zoomOrigin.x}% ${zoomOrigin.y}%` : 'center center',
            transform: scale > 1
              ? `translate3d(${panPos.x}px, ${panPos.y}px, 0) scale(${scale})`
              : isHovering
              ? 'scale(2.2)'
              : 'scale(1)',
            transition: scale > 1 ? 'none' : 'transform 0.25s ease-out'
          }}
        />

        {/* Badges Overlay */}
        <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 items-start z-10 pointer-events-none">
          {discount > 0 && (
            <span className="px-2.5 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wider bg-rose-600 text-white shadow-sm">
              {discount}% OFF
            </span>
          )}
          {badges?.map((badge) => (
            <span
              key={badge}
              className="px-2.5 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wider bg-[#8B5E34] text-white shadow-sm capitalize"
            >
              {badge}
            </span>
          ))}
        </div>

        {/* Floating Share & Wishlist Buttons */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-2 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onShare && onShare();
            }}
            className="w-9 h-9 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all text-stone-700 hover:text-[#25D366]"
            title="Share Product"
            aria-label="Share Product"
          >
            <Share2 size={16} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist && onToggleWishlist();
            }}
            className="w-9 h-9 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all text-stone-600 hover:text-rose-500"
            aria-label="Wishlist"
          >
            <Heart size={18} className={liked ? 'fill-rose-500 text-rose-500' : 'transition-colors'} />
          </button>
        </div>

        {/* Low Stock Indicator */}
        {stock && Number(stock) <= 5 && (
          <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500 text-white text-[0.7rem] font-bold shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Only {stock} left in stock
            </span>
          </div>
        )}

        {/* Mobile Slide Dots */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-black/25 backdrop-blur-xs px-2.5 py-1 rounded-full pointer-events-none md:hidden">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={`transition-all duration-300 rounded-full ${
                selectedIndex === idx ? 'w-5 h-1.5 bg-white shadow-sm' : 'w-1.5 h-1.5 bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Thumbnails Row */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        {images.map((img, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setSelectedIndex(idx)}
            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
              selectedIndex === idx
                ? 'border-[#8B5E34] ring-2 ring-[#8B5E34]/25 shadow-sm scale-[1.02]'
                : 'border-stone-200/90 opacity-75 hover:opacity-100 hover:border-stone-400'
            }`}
          >
            <img
              src={img}
              alt={`${productName} thumbnail ${idx + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
            <div
              className={`absolute inset-0 bg-[#8B5E34]/10 transition-opacity ${
                selectedIndex === idx ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
