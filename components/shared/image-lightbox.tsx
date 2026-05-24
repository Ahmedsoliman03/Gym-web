"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { gsap } from "gsap";
import { useTranslations } from "next-intl";

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
}

export const ImageLightbox = ({
  isOpen,
  onClose,
  images,
  currentIndex: initialIndex,
}: ImageLightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const t = useTranslations("Auth"); 
  const contentRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleNext, handlePrev, onClose]);

  // GSAP Animations
  useEffect(() => {
    if (isOpen && overlayRef.current && contentRef.current) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" }
      );
      gsap.fromTo(
        contentRef.current,
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.2)", delay: 0.1 }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/95 md:bg-black/90 backdrop-blur-xl"
        onClick={onClose}
      />

      {/* Header Controls */}
      <div className="absolute top-0 left-0 w-full p-4 md:p-6 flex justify-end items-center z-[10001]">
        <button
          onClick={onClose}
          className="p-2 md:p-3 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90 backdrop-blur-md"
        >
          <X size={20} className="md:w-6 md:h-6" />
        </button>
      </div>

      {/* Navigation */}
      {images.length > 1 && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 md:px-6 pointer-events-none z-[10001]">
          <button
            onClick={handlePrev}
            className="p-2.5 md:p-5 bg-white/5 border border-white/10 rounded-xl md:rounded-3xl text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90 backdrop-blur-md pointer-events-auto group"
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 group-hover:-translate-x-1 transition-transform" />
          </button>
          <button
            onClick={handleNext}
            className="p-2.5 md:p-5 bg-white/5 border border-white/10 rounded-xl md:rounded-3xl text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90 backdrop-blur-md pointer-events-auto group"
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* Image Display */}
      <div 
        ref={contentRef}
        className="relative w-full h-full flex items-center justify-center p-4 md:p-8 pointer-events-none"
      >
        <div 
            className="relative max-w-full max-h-full flex flex-col items-center justify-center transition-transform duration-500 ease-out pointer-events-auto"
        >
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className="max-w-full max-h-[70vh] md:max-h-[85vh] object-contain rounded-xl md:rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5"
            draggable={false}
          />
          
          {/* Footer Info */}
          <div className="absolute -bottom-10 md:-bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 whitespace-nowrap">
            <span className="text-white/20 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                {currentIndex + 1} / {images.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
