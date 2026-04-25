'use client';

import { useState, useRef } from 'react';

interface Props {
  images: string[];
  productName: string;
}

const ICON_PLACEHOLDER = '🏺';

export default function ImageGallery({ images, productName }: Props) {
  const [activeIndex, setActiveIndex]   = useState(0);
  const [isZoomed, setIsZoomed]         = useState(false);
  const [zoomOrigin, setZoomOrigin]     = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const hasImages = images.length > 0;
  const activeImage = hasImages ? images[activeIndex] : null;

  function handleMouseEnter(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current || !hasImages) return;
    const rect = containerRef.current.getBoundingClientRect();
    setZoomOrigin({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top)  / rect.height) * 100,
    });
    setIsZoomed(true);
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current || !isZoomed) return;
    const rect = containerRef.current.getBoundingClientRect();
    setZoomOrigin({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top)  / rect.height) * 100,
    });
  }

  function handleMouseLeave() {
    setIsZoomed(false);
  }

  return (
    <div className="flex flex-col gap-3">

      {/* ── Main image ─────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className={`relative aspect-square bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 select-none ${
          hasImages ? (isZoomed ? 'cursor-crosshair' : 'cursor-zoom-in') : ''
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {activeImage ? (
          <img
            src={activeImage}
            alt={productName}
            draggable={false}
            className="w-full h-full object-cover"
            style={{
              transform:       isZoomed ? 'scale(2)' : 'scale(1)',
              transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
              // No transition during zoom — origin must track cursor instantly.
              // Smooth scale-out is handled when isZoomed flips back to false
              // and the transition class is re-added at the same time.
              transition: isZoomed ? 'none' : 'transform 0.3s ease',
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-amber-50">
            <span className="text-8xl opacity-40 select-none">{ICON_PLACEHOLDER}</span>
          </div>
        )}

        {/* Zoom hint */}
        {hasImages && !isZoomed && (
          <span className="absolute bottom-3 right-3 bg-black/40 text-white text-[10px] font-medium px-2 py-1 rounded-full backdrop-blur-sm pointer-events-none">
            Hover to zoom
          </span>
        )}
      </div>

      {/* ── Thumbnails ─────────────────────────────────────────────── */}
      {images.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-150 focus:outline-none ${
                i === activeIndex
                  ? 'border-brand-gold shadow-sm'
                  : 'border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`${productName} view ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
