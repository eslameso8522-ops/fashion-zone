'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';

interface ImageZoomModalProps {
  images: string[];
  initialIndex?: number;
  productName: string;
  onClose: () => void;
}

export default function ImageZoomModal({
  images,
  initialIndex = 0,
  productName,
  onClose,
}: ImageZoomModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom & pan when image changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Keyboard navigation & escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handlePrev();
      if (e.key === 'ArrowLeft') handleNext();
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
      if (e.key === '0') handleReset();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [currentIndex, images.length]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 3.5));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Double click to toggle zoom
  const handleDoubleClick = () => {
    if (scale > 1) {
      handleReset();
    } else {
      setScale(2);
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale <= 1 || e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || scale <= 1 || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const activeImage = images[currentIndex] || images[0];

  return (
    <div className="fixed inset-0 z-[200] flex flex-col justify-between bg-black/92 backdrop-blur-md select-none animate-fadeIn">
      
      {/* Top Floating Bar */}
      <div className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-b from-black/80 to-transparent">
        
        {/* Product Title & Counter */}
        <div className="text-white">
          <h3 className="text-xs sm:text-sm font-bold truncate max-w-[200px] sm:max-w-md">
            {productName}
          </h3>
          <p className="text-[11px] text-pink-300">
            صورة {currentIndex + 1} من {images.length}
          </p>
        </div>

        {/* Zoom Controls & Close Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom Out */}
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scale <= 1}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:hover:bg-white/10 transition text-xs font-bold flex items-center gap-1"
            title="تصغير (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Current Scale Badge */}
          <span className="text-xs font-mono font-bold text-pink-300 px-2 py-1 bg-white/5 rounded-lg min-w-[50px] text-center">
            {Math.round(scale * 100)}%
          </span>

          {/* Zoom In */}
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={scale >= 3.5}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:hover:bg-white/10 transition text-xs font-bold flex items-center gap-1"
            title="تكبير (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Reset Zoom */}
          {scale > 1 && (
            <button
              type="button"
              onClick={handleReset}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-500/80 hover:bg-rose-500 text-white transition text-xs font-bold flex items-center gap-1"
              title="إعادة ضبط الحجم"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">100%</span>
            </button>
          )}

          {/* Divider */}
          <div className="w-px h-6 bg-white/20 mx-1" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/15 hover:bg-rose-600 text-white transition text-xs font-bold flex items-center gap-1 shadow-lg"
            title="إغلاق (Esc)"
          >
            <X className="w-5 h-5" />
            <span className="hidden sm:inline">إغلاق</span>
          </button>
        </div>
      </div>

      {/* Main Image Display Area */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
        className={`relative flex-1 flex items-center justify-center overflow-hidden p-4 ${
          scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
        }`}
      >
        <div
          className="relative max-w-full max-h-[75vh] w-auto h-auto transition-transform duration-100 ease-out flex items-center justify-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
        >
          <img
            src={activeImage}
            alt={productName}
            className="max-w-full max-h-[75vh] w-auto h-auto object-contain rounded-2xl shadow-2xl pointer-events-none"
          />

          {/* Boutique Brand Badge in Zoom Modal */}
          <div className="absolute bottom-3 right-3 pointer-events-none select-none z-10">
            <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-pink-200/90 text-stone-900 flex items-center gap-1.5 shadow-lg">
              <span className="w-5 h-5 rounded-lg bg-gradient-to-tr from-pink-500 to-rose-600 text-white flex items-center justify-center text-[10px] font-bold">
                ✨
              </span>
              <span className="text-xs font-black tracking-wide font-serif text-stone-900">
                Fashion Zone <span className="text-rose-600 font-bold text-[10px]">| BOUTIQUE</span>
              </span>
            </div>
          </div>
        </div>

        {/* Carousel Nav Arrows (Previous / Next) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition backdrop-blur-sm shadow-xl"
              aria-label="الصورة السابقة"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition backdrop-blur-sm shadow-xl"
              aria-label="الصورة التالية"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Zoom Instructions Pill */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] text-white/80 border border-white/10 pointer-events-none hidden sm:flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>انقري مرتين للتكبير السريع • استخدمي عجلة الماوس أو الأزرار للزوم • اسحبي للتنقل في التفاصيل</span>
        </div>
      </div>

      {/* Bottom Thumbnails Strip */}
      {images.length > 1 && (
        <div className="relative z-10 px-4 py-3 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-center gap-2 overflow-x-auto max-w-xl mx-auto py-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-14 h-16 rounded-xl overflow-hidden border-2 transition flex-shrink-0 ${
                  currentIndex === idx
                    ? 'border-rose-500 scale-105 shadow-md shadow-rose-500/50'
                    : 'border-white/20 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
