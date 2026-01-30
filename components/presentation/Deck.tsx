"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Slide3D from './Slide3D';

interface DeckProps {
  children: React.ReactNode;
}

export const DeckContext = React.createContext<{
  currentSlide: number;
  totalSlides: number;
  nextSlide: () => void;
  prevSlide: () => void;
}>({
  currentSlide: 0,
  totalSlides: 0,
  nextSlide: () => { },
  prevSlide: () => { },
});

export default function Deck({ children }: DeckProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = React.Children.toArray(children);
  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1 < totalSlides ? prev + 1 : prev));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  return (
    <DeckContext.Provider value={{ currentSlide, totalSlides, nextSlide, prevSlide }}>
      {/* 
        Main Stage: 
        Dark background to make the slides pop (as seen in the reference "3D space").
      */}
      <div className="w-screen h-screen overflow-hidden bg-neutral-900 flex items-center justify-center relative">

        {/* Render only the current slide, or render all with visibility toggle if using complex animations */}
        <div className="relative w-full h-full flex items-center justify-center">
          {slides.map((slide, index) => {
            // We only render the current one and maybe neighbours for performance, 
            // but for Framer Motion transitions, keeping them mounted is often easier.
            // Let's hide non-active ones visually via the Slide3D logic
            if (Math.abs(currentSlide - index) > 1) return null;

            return (
              <div key={index} className={`absolute inset-0 flex items-center justify-center pointer-events-none ${index === currentSlide ? 'z-10 pointer-events-auto' : 'z-0'}`}>
                <Slide3D isActive={index === currentSlide}>
                  {slide}
                </Slide3D>
              </div>
            );
          })}
        </div>

        {/* Navigation overlay */}
        <div className="absolute bottom-8 right-8 z-50 flex items-center gap-4 text-white/50 hover:text-white transition-colors">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 transition-all"
          >
            ←
          </button>
          <span className="font-mono text-sm tracking-widest">
            {String(currentSlide + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
          </span>
          <button
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
            className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 transition-all"
          >
            →
          </button>
        </div>
      </div>
    </DeckContext.Provider>
  );
}
