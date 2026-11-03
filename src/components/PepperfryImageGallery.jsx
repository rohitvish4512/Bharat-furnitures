import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Share2, Heart, X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

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

  // Lightbox Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [modalScale, setModalScale] = useState(1);
  const [modalPan, setModalPan] = useState({ x: 0, y: 0 });

  // Mobile swipe state for main gallery
  const swipeRef = useRef({ startX: 0, startY: 0, active: false });

  // Modal touch/pinch state
  const modalTouchRef = useRef({ dist: 0, scale: 1, startX: 0, startY: 0, posX: 0, posY: 0 });
  const modalSwipeRef = useRef({ startX: 0, startY: 0, active: false });

  const currentImage = images[selectedIndex] || images[0] || '';

  // Open modal
  const openModal = (idx) => {
    setModalIndex(idx);
    setModalScale(1);
    setModalPan({ x: 0, y: 0 });
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setModalScale(1);
    setModalPan({ x: 0, y: 0 });
    document.body.style.overflow = '';
  };

  const goNext = useCallback(() => {
    setModalIndex((p) => (p === images.length - 1 ? 0 : p + 1));
    setModalScale(1);
    setModalPan({ x: 0, y: 0 });
  }, [images.length]);

  const goPrev = useCallback(() => {
    setModalIndex((p) => (p === 0 ? images.length - 1 : p - 1));
    setModalScale(1);
    setModalPan({ x: 0, y: 0 });
  }, [images.length]);

  // Keyboard support
  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isModalOpen, goNext, goPrev]);

  // Zoom buttons
  const zoomIn  = () => setModalScale((s) => Math.min(s + 0.5, 4));
  const zoomOut = () => setModalScale((s) => {
    const n = Math.max(1, s - 0.5);
    if (n === 1) setModalPan({ x: 0, y: 0 });
    return n;
  });

  // Modal touch: pinch zoom + pan + swipe
  const handleModalTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      modalTouchRef.current = { dist, scale: modalScale, posX: modalPan.x, posY: modalPan.y };
      modalSwipeRef.current.active = false;
    } else if (e.touches.length === 1) {
      if (modalScale > 1) {
        modalTouchRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, posX: modalPan.x, posY: modalPan.y };
        modalSwipeRef.current.active = false;
      } else {
        modalSwipeRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, active: true };
      }
    }
  };

  const handleModalTouchMove = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / (modalTouchRef.current.dist || 1);
      const newScale = Math.min(Math.max(1, modalTouchRef.current.scale * factor), 4);
      setModalScale(newScale);
      if (newScale === 1) setModalPan({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && modalScale > 1) {
      const dx = e.touches[0].clientX - modalTouchRef.current.startX;
      const dy = e.touches[0].clientY - modalTouchRef.current.startY;
      const maxPan = 200 * (modalScale - 1);
      setModalPan({
        x: Math.min(Math.max(-maxPan, modalTouchRef.current.posX + dx), maxPan),
        y: Math.min(Math.max(-maxPan, modalTouchRef.current.posY + dy), maxPan),
      });
    }
  };

  const handleModalTouchEnd = (e) => {
    if (modalScale <= 1 && modalSwipeRef.current.active && e.changedTouches.length === 1) {
      const dx = modalSwipeRef.current.startX - e.changedTouches[0].clientX;
      const dy = modalSwipeRef.current.startY - e.changedTouches[0].clientY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        dx > 0 ? goNext() : goPrev();
      }
    }
  };

  // Main gallery swipe (mobile)
  const handleSwipeStart = (e) => {
    if (e.touches.length === 1)
      swipeRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, active: true };
  };
  const handleSwipeEnd = (e) => {
    if (!swipeRef.current.active || e.changedTouches.length !== 1) return;
    const dx = swipeRef.current.startX - e.changedTouches[0].clientX;
    const dy = swipeRef.current.startY - e.changedTouches[0].clientY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      setSelectedIndex((p) => dx > 0
        ? (p === images.length - 1 ? 0 : p + 1)
        : (p === 0 ? images.length - 1 : p - 1));
    }
    swipeRef.current.active = false;
  };

  return (
    <>
      {/* ── Main Gallery Card ── */}
      <div className="flex flex-col gap-3 w-full">
        <div
          className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#FAF7F2] border border-stone-200/80 shadow-sm select-none cursor-zoom-in"
          onTouchStart={handleSwipeStart}
          onTouchEnd={handleSwipeEnd}
          onClick={() => openModal(selectedIndex)}
        >
          {/* Main Image */}
          <img
            src={currentImage}
            alt={productName}
            className="w-full h-full object-contain p-2 pointer-events-none"
          />

          {/* Badges */}
          <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 items-start z-10 pointer-events-none">
            {discount > 0 && (
              <span className="px-2.5 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wider bg-rose-600 text-white shadow-sm">
                {discount}% OFF
              </span>
            )}
            {badges?.map((badge) => (
              <span key={badge} className="px-2.5 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wider bg-[#8B5E34] text-white shadow-sm capitalize">
                {badge}
              </span>
            ))}
          </div>

          {/* Share & Wishlist */}
          <div className="absolute top-3.5 right-3.5 flex items-center gap-2 z-10">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onShare && onShare(); }}
              className="w-9 h-9 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all text-stone-700 hover:text-[#25D366]"
              title="Share Product" aria-label="Share Product"
            >
              <Share2 size={16} />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggleWishlist && onToggleWishlist(); }}
              className="w-9 h-9 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all text-stone-700 hover:text-rose-500"
              aria-label="Wishlist"
            >
              <Heart size={18} className={liked ? 'fill-rose-500 text-rose-500' : 'transition-colors'} />
            </button>
          </div>

          {/* Low Stock */}
          {stock && Number(stock) <= 5 && (
            <div className="absolute bottom-3 left-3.5 z-10 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500 text-white text-[0.7rem] font-bold shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Only {stock} left in stock
              </span>
            </div>
          )}

          {/* Slide Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full pointer-events-none md:hidden">
            {images.map((_, idx) => (
              <span key={idx} className={`transition-all duration-300 rounded-full ${selectedIndex === idx ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`} />
            ))}
          </div>
        </div>

        {/* Thumbnails */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 px-4 sm:px-0">
          {images.map((img, idx) => (
            <button
              key={idx} type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                selectedIndex === idx
                  ? 'border-[#8B5E34] ring-2 ring-[#8B5E34]/25 shadow-sm scale-[1.02]'
                  : 'border-stone-200/90 opacity-75 hover:opacity-100 hover:border-stone-400'
              }`}
            >
              <img src={img} alt={`${productName} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              <div className={`absolute inset-0 bg-[#8B5E34]/10 transition-opacity ${selectedIndex === idx ? 'opacity-100' : 'opacity-0'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* ── Fullscreen Lightbox Modal ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[999] flex flex-col bg-white"
          style={{ touchAction: 'none' }}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-stone-100">
            <span className="text-stone-500 text-sm font-medium">{modalIndex + 1} / {images.length}</span>
            <div className="flex items-center gap-2">
              <button
                type="button" onClick={zoomOut}
                disabled={modalScale <= 1}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 disabled:opacity-30 transition-all"
                aria-label="Zoom Out"
              >
                <ZoomOut size={18} />
              </button>
              <button
                type="button" onClick={zoomIn}
                disabled={modalScale >= 4}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 disabled:opacity-30 transition-all"
                aria-label="Zoom In"
              >
                <ZoomIn size={18} />
              </button>
              <button
                type="button" onClick={closeModal}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-all ml-1"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Image Area */}
          <div
            className="flex-1 overflow-hidden flex items-center justify-center relative"
            onTouchStart={handleModalTouchStart}
            onTouchMove={handleModalTouchMove}
            onTouchEnd={handleModalTouchEnd}
          >
            {images.length > 1 && (
              <button
                type="button" onClick={goPrev}
                className="absolute left-2 z-10 w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-all shadow-sm"
                aria-label="Previous"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            <img
              src={images[modalIndex]}
              alt={productName}
              draggable={false}
              className="max-w-full max-h-full object-contain select-none"
              style={{
                transform: `translate3d(${modalPan.x}px, ${modalPan.y}px, 0) scale(${modalScale})`,
                transition: modalScale === 1 ? 'transform 0.25s ease-out' : 'none',
                cursor: modalScale > 1 ? 'grab' : 'zoom-in',
              }}
              onClick={() => { if (modalScale === 1) zoomIn(); }}
            />

            {images.length > 1 && (
              <button
                type="button" onClick={goNext}
                className="absolute right-2 z-10 w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-all shadow-sm"
                aria-label="Next"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          <div className="shrink-0 flex gap-2 px-4 pb-4 pt-3 overflow-x-auto justify-center border-t border-stone-100">
            {images.map((img, idx) => (
              <button
                key={idx} type="button"
                onClick={() => { setModalIndex(idx); setModalScale(1); setModalPan({ x: 0, y: 0 }); }}
                className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  modalIndex === idx ? 'border-[#8B5E34] scale-105' : 'border-stone-200 opacity-60 hover:opacity-90'
                }`}
              >
                <img src={img} alt={`thumb ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
