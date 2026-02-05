"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Slide3D from './Slide3D';

interface DeckProps {
  children: React.ReactNode;
  slideCounts: number[]; // Number of "steps" (e.g. bullet points) for each slide
}

export const DeckContext = React.createContext<{
  currentSlide: number;
  totalSlides: number;
  currentStep: number;
  nextSlide: () => void;
  prevSlide: () => void;
}>({
  currentSlide: 0,
  totalSlides: 0,
  currentStep: 0,
  nextSlide: () => { },
  prevSlide: () => { },
});

export default function Deck({ children, slideCounts }: DeckProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentStep, setCurrentStep] = useState(0); // For inner slide animations (bullets)
  const [isPrinting, setIsPrinting] = useState(false);
  const slides = React.Children.toArray(children);
  const totalSlides = slides.length;

  // Determine max steps for the current slide
  const stepsInCurrentSlide = slideCounts[currentSlide] || 0;

  const nextSlide = useCallback(() => {
    // If there are more steps (bullets) in the current slide, advance step
    if (currentStep < stepsInCurrentSlide) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Otherwise move to next slide
      if (currentSlide + 1 < totalSlides) {
        setCurrentSlide((prev) => prev + 1);
        setCurrentStep(0); // Reset step for new slide
      }
    }
  }, [currentSlide, currentStep, stepsInCurrentSlide, totalSlides]);

  const prevSlide = useCallback(() => {
    // If we are deep in steps, go back a step
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      // Otherwise go to previous slide
      if (currentSlide > 0) {
        // When going back, we typically want to start at the BEGINNING of the previous slide?
        // Or the END (all bullets shown)?
        // User said "back animation same thing", usually means reversing. 
        // Showing all bullets on 'back' is better for flow if you accidentally skipped.
        // But for simplicity/predictability, let's start at 0 (or we need to look up prev slide counts).
        // Let's reset to 0 for now to keep it clean, or we can set to max steps of prev slide.
        // Let's set to 0 to be safe/simple.
        setCurrentSlide((prev) => prev - 1);
        setCurrentStep(0);
      }
    }
  }, [currentSlide, currentStep]);

  const forceNext = useCallback(() => {
    if (currentSlide + 1 < totalSlides) {
      setCurrentSlide((prev) => prev + 1);
      setCurrentStep(0);
    }
  }, [currentSlide, totalSlides]);

  const forcePrev = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
      setCurrentStep(0);
    }
  }, [currentSlide]);

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
    <DeckContext.Provider value={{ currentSlide, totalSlides, currentStep, nextSlide, prevSlide }}>

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
          // Steps ignored in print mode (show all)
          <div className="w-full">
            {slides.map((slide, index) => (
              <div key={index} className="print-slide relative w-full h-full">
                {/* Clone to ensure full visibility if component handles it, though default might be 0. 
                    Ideally ContentSlide should default to 'all visible' if step is not passed or if printing.
                    We'll pass a high step count if printing. */}
                {React.isValidElement(slide) ? React.cloneElement(slide as React.ReactElement<any>, { step: 999 }) : slide}
              </div>
            ))}
          </div>
        ) : (
          // INTERACTIVE 3D MODE
          <div className="relative w-full h-full flex items-center justify-center">
            {slides.map((slide, index) => {
              // Optimization: Only render active slide + neighbors
              // Expand range slightly to ensure animations don't cut off
              if (Math.abs(currentSlide - index) > 1) return null;

              const isCurrent = index === currentSlide;

              // Clone the slide to inject the 'step' prop only if it's the current slide
              // logic: Neighbors get step=0 (reset) or max? 
              // Better: passing step=0 to neighbors ensures they reset when you revisit.
              const slideWithProps = React.isValidElement(slide)
                ? React.cloneElement(slide as React.ReactElement<any>, { step: isCurrent ? currentStep : 0 })
                : slide;

              return (
                <div key={index} className={`absolute inset-0 flex items-center justify-center pointer-events-none ${isCurrent ? 'z-10 pointer-events-auto' : 'z-0'}`}>
                  <Slide3D isActive={isCurrent}>
                    {slideWithProps}
                  </Slide3D>
                </div>
              );
            })}
          </div>
        )}

        {/* Force Navigation Buttons (Side) */}
        {!isPrinting && (
          <>
            <button
              onClick={forcePrev}
              disabled={currentSlide === 0}
              className="no-print absolute left-4 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full hover:bg-white/5 text-white/20 hover:text-white transition-all disabled:opacity-0"
              title="Previous Slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17-5-5 5-5" /><path d="m18 17-5-5 5-5" /></svg>
            </button>

            <button
              onClick={forceNext}
              disabled={currentSlide === totalSlides - 1}
              className="no-print absolute right-4 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full hover:bg-white/5 text-white/20 hover:text-white transition-all disabled:opacity-0"
              title="Next Slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m13 17 5-5-5-5" /><path d="m6 17 5-5-5-5" /></svg>
            </button>
          </>
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
                disabled={currentSlide === 0 && currentStep === 0}
                className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 transition-all hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </button>

              <span className="font-mono text-sm tracking-widest min-w-[60px] text-center">
                {String(currentSlide + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
              </span>

              <button
                onClick={nextSlide}
                disabled={currentSlide === totalSlides - 1 && currentStep === stepsInCurrentSlide}
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
