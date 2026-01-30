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
  const [isPrinting, setIsPrinting] = useState(false);
  const slides = React.Children.toArray(children);
  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1 < totalSlides ? prev + 1 : prev));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  // --- Keyboard Handling ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPrinting) return; // Disable nav while printing setup
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, isPrinting]);

  // --- Feature: Full Screen ---
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // --- Feature: Download (Print to PDF) ---
  const handleDownload = () => {
    setIsPrinting(true);
    // Allow React time to render the full list of slides "flat" before printing
    setTimeout(() => {
      window.print();
      // We revert state after print dialog closes (or timeout in some browsers)
      // Note: window.print() is blocking in many browsers, so lines below run after dialog closes
      setIsPrinting(false);
    }, 500);
  };

  return (
    <DeckContext.Provider value={{ currentSlide, totalSlides, nextSlide, prevSlide }}>

      {/* 
        Print specific styles to ensure standard layout 
      */}
      <style jsx global>{`
        @media print {
          @page { margin: 0; size: landscape; }
          body { 
            overflow: visible !important; 
            background: white !important;
            -webkit-print-color-adjust: exact; 
          }
          .no-print { display: none !important; }
          .print-slide { 
            page-break-after: always; 
            width: 100vw; 
            height: 100vh;
            overflow: hidden;
            display: block !important;
            position: relative !important;
          }
        }
      `}</style>

      {/* 
        Main Stage: 
        Render 3D view normally, or Flat View if printing
      */}
      <div className={`w-screen h-screen overflow-hidden ${isPrinting ? 'bg-white block overflow-visible h-auto' : 'bg-neutral-900 flex items-center justify-center relative'}`}>

        {/* SLIDE RENDERING */}
        {isPrinting ? (
          // PRINT MODE: Render ALL slides vertically (handled by page-break CSS)
          <div className="w-full">
            {slides.map((slide, index) => (
              <div key={index} className="print-slide relative w-full h-full">
                {slide}
              </div>
            ))}
          </div>
        ) : (
          // INTERACTIVE 3D MODE
          <div className="relative w-full h-full flex items-center justify-center">
            {slides.map((slide, index) => {
              // Optimization: Only render active slide + neighbors
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
        )}

        {/* CONTROLS OVERLAY (Hidden when printing via 'no-print' class) */}
        {!isPrinting && (
          <div className="no-print absolute bottom-8 right-8 z-50 flex items-center gap-6 text-white/50 transition-colors">

            {/* Feature Controls Group */}
            <div className="flex items-center gap-2 mr-4 border-r border-white/10 pr-6">
              <button
                onClick={handleDownload}
                title="Download PDF"
                className="p-3 rounded-full hover:bg-white/10 hover:text-white transition-all"
              >
                {/* Download Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
              </button>

              <button
                onClick={toggleFullScreen}
                title="Toggle Fullscreen"
                className="p-3 rounded-full hover:bg-white/10 hover:text-white transition-all"
              >
                {/* Fullscreen Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>
              </button>
            </div>

            {/* Navigation Group */}
            <div className="flex items-center gap-4">
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 transition-all hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </button>

              <span className="font-mono text-sm tracking-widest min-w-[60px] text-center">
                {String(currentSlide + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
              </span>

              <button
                onClick={nextSlide}
                disabled={currentSlide === totalSlides - 1}
                className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 transition-all hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </DeckContext.Provider>
  );
}
