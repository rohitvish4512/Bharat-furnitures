import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

export default function MobileZoomModal({ isOpen, onClose, images, initialIndex = 0, productName = '' }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Touch tracking for pinch and pan
  const touchStartRef = useRef({ dist: 0, x: 0, y: 0, scale: 1, posX: 0, posY: 0 });
  const swipeStartRef = useRef(null);
  const containerRef = useRef(null);

  // Sync index when initialIndex changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      resetZoom();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialIndex]);

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    resetZoom();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    resetZoom();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleDoubleTap = (e) => {
    e.stopPropagation();
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2.5);
      setPosition({ x: 0, y: 0 });
    }
  };

  // Touch handlers for mobile pinch-to-zoom and swipe
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // 2 fingers: Pinch to zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      touchStartRef.current = {
        dist,
        scale,
        posX: position.x,
        posY: position.y
      };
    } else if (e.touches.length === 1) {
      // 1 finger
      if (scale > 1) {
        // Pan zoomed image
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          posX: position.x,
          posY: position.y
        };
      } else {
        // Swipe to change photo
        swipeStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      }
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      // Pinching
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      const factor = dist / (touchStartRef.current.dist || 1);
      const newScale = Math.min(Math.max(1, touchStartRef.current.scale * factor), 4);
      setScale(newScale);
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && scale > 1) {
      // Panning
      const deltaX = e.touches[0].clientX - touchStartRef.current.x;
      const deltaY = e.touches[0].clientY - touchStartRef.current.y;
      const maxPan = 150 * (scale - 1);
      setPosition({
        x: Math.min(Math.max(-maxPan, touchStartRef.current.posX + deltaX), maxPan),
        y: Math.min(Math.max(-maxPan, touchStartRef.current.posY + deltaY), maxPan)
      });
    }
  };

  const handleTouchEnd = (e) => {
    if (scale <= 1 && swipeStartRef.current && e.changedTouches.length === 1) {
      const deltaX = swipeStartRef.current.x - e.changedTouches[0].clientX;
      const deltaY = swipeStartRef.current.y - e.changedTouches[0].clientY;
      // If horizontal swipe is dominant
      if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
      swipeStartRef.current = null;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/95 flex flex-col justify-between select-none animate-fade-in"
      onClick={onClose}
    >
      {/* Top Bar: Close Button, Title, and Zoom Controls */}
      <div
        className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent z-20 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 max-w-[70%]">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-500 bg-black/40 px-2 py-0.5 rounded-md border border-amber-500/30">
            {currentIndex + 1} / {images.length}
          </span>
          <span className="text-xs text-stone-300 font-medium truncate">
            {productName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {scale > 1 && (
            <button
              type="button"
              onClick={resetZoom}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw size={16} />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setScale((prev) => Math.min(prev + 0.75, 4));
            }}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white text-stone-900 flex items-center justify-center shadow-lg transition-transform active:scale-95 ml-1"
            aria-label="Close"
          >
            <X size={18} className="stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Main Image Stage (Pinch, Double Tap & Pan Support) */}
      <div
        ref={containerRef}
        className="flex-1 relative flex items-center justify-center overflow-hidden touch-none"
        onClick={handleDoubleTap}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[currentIndex]}
          alt={`Product view ${currentIndex + 1}`}
          className="max-h-[82vh] max-w-full object-contain transition-transform duration-100 ease-out pointer-events-none"
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`
          }}
        />

        {/* Subtle Pepperfry Style Hint (Shown when not zoomed) */}
        {scale === 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xs text-white/90 text-[0.68rem] px-3 py-1 rounded-full pointer-events-none shadow-md">
            Double-tap or pinch to zoom details
          </div>
        )}
      </div>

      {/* Bottom Bar: Pepperfry Style Thumbnails and Dots */}
      <div
        className="p-4 pb-6 bg-gradient-to-t from-black/90 to-transparent flex flex-col items-center gap-3 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Slide Indicator Dots */}
        <div className="flex items-center gap-1.5">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={`transition-all duration-300 rounded-full ${
                currentIndex === idx ? 'w-5 h-1.5 bg-amber-500' : 'w-1.5 h-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Horizontal Mini Thumbnails */}
        <div className="flex items-center gap-2.5 overflow-x-auto max-w-full py-1 px-2 scrollbar-none">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                resetZoom();
                setCurrentIndex(idx);
              }}
              className={`w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                currentIndex === idx
                  ? 'border-amber-500 ring-2 ring-amber-500/40 scale-105'
                  : 'border-white/30 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

