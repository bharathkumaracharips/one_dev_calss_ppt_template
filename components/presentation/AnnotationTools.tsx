"use client";

import React, { useState, useRef, useEffect } from 'react';
import * as fabric from 'fabric';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { analyzeShape, recognizeTextFromPath } from './utils/recognition';

interface AnnotationToolsProps {
  isActive: boolean;
  onClose: () => void;
  slideIndex: number;
  onNext: () => void;
  onPrev: () => void;
  totalSlides: number;
  toggleFullScreen: () => void;
}

type Tool = 'select' | 'pen' | 'highlighter' | 'eraser' | 'text' | 'arrow' | 'rectangle' | 'circle' | 'line';
type Color = string;

export default function AnnotationTools({ isActive, onClose, slideIndex, onNext, onPrev, totalSlides, toggleFullScreen }: AnnotationToolsProps) {
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState<Color>('#FF0000');
  const [lineWidth, setLineWidth] = useState(3);
  const [isSmartMode, setIsSmartMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Shape drawing state
  const isDrawingShape = useRef(false);
  const shapeStartPoint = useRef<{ x: number, y: number } | null>(null);
  const activeShape = useRef<fabric.Object | null>(null);

  // Save Logic
  const saveToStorage = () => {
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON());
    localStorage.setItem(`annotation_slide_${slideIndex}`, json);
  };

  // Load Logic
  const loadFromStorage = (c: fabric.Canvas) => {
    const saved = localStorage.getItem(`annotation_slide_${slideIndex}`);
    if (saved) {
      c.loadFromJSON(JSON.parse(saved), () => {
        c.requestRenderAll();
      });
    }
  };

  // Initialize Fabric Canvas
  useEffect(() => {
    if (!isActive || !canvasEl.current) return;

    // Dispose existing if any
    if (canvas) {
      canvas.dispose();
    }

    const newCanvas = new fabric.Canvas(canvasEl.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      isDrawingMode: true,
      selection: true,
    });

    newCanvas.freeDrawingBrush = new fabric.PencilBrush(newCanvas);
    newCanvas.freeDrawingBrush.width = lineWidth;
    newCanvas.freeDrawingBrush.color = color;

    // Load saved state
    loadFromStorage(newCanvas);

    // Auto-save on changes
    const handleModification = () => {
      // Use a timeout to debounce saving? For now save direct.
      // We can't access 'canvas' state variable here reliably inside the effect closure if we don't ref it, 
      // but 'newCanvas' is available.
      // However, we need to use the helper which depends on 'slideIndex'. 
      // It's cleaner to inline:
      const json = JSON.stringify(newCanvas.toJSON());
      localStorage.setItem(`annotation_slide_${slideIndex}`, json);
    };

    newCanvas.on('object:modified', handleModification);
    newCanvas.on('object:added', handleModification);
    newCanvas.on('object:removed', handleModification);
    newCanvas.on('path:created', handleModification); // Pen strokes

    setCanvas(newCanvas);

    const handleResize = () => {
      newCanvas.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeObjects = newCanvas.getActiveObjects();
        if (activeObjects.length) {
          newCanvas.discardActiveObject();
          activeObjects.forEach((obj) => {
            newCanvas.remove(obj);
          });
          newCanvas.requestRenderAll();
          handleModification(); // Save deletion
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      newCanvas.dispose();
      setCanvas(null);
    };
    // Re-run when slideIndex changes to load that slide's notes
  }, [isActive, slideIndex]);

  // Handle Tool Changes
  useEffect(() => {
    if (!canvas) return;

    // Reset basics
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.defaultCursor = 'default';
    canvas.discardActiveObject();
    canvas.requestRenderAll();

    // Detach shape listeners if any (simple approach: we re-attach below if needed)
    canvas.off('mouse:down');
    canvas.off('mouse:move');
    canvas.off('mouse:up');

    // Always re-attach path:created for smart mode
    canvas.off('path:created');
    canvas.on('path:created', handlePathCreated);

    switch (tool) {
      case 'select':
        canvas.selection = true;
        canvas.defaultCursor = 'default';
        break;

      case 'pen':
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.width = lineWidth;
        canvas.freeDrawingBrush.color = color;
        break;

      case 'highlighter':
        canvas.isDrawingMode = true;
        const brush = new fabric.PencilBrush(canvas);
        brush.width = 20;
        brush.color = `${color}50`; // 50 for ~30% alpha hex? No, hex alpha is 00-FF. 50 is approx 30%.
        // Better: use rgba
        // But color is passed as hex usually. 
        // Let's rely on opacity/alpha if fabric brush supports it?
        // Fabric brush color supports rgba. 
        // Simple hack: set opacity of path after creation? 
        // Or set brush color with alpha.
        // For now assume hex and append '50' for transparency if 6 digits.
        canvas.freeDrawingBrush = brush;
        break;

      case 'eraser':
        canvas.isDrawingMode = false;
        canvas.selection = false;
        canvas.defaultCursor = 'not-allowed';

        const handleEraser = (opt: any) => {
          if (!canvas) return;
          const pointer = (canvas as any).getScenePoint(opt.e);
          const objects = canvas.getObjects();
          let removed = false;

          for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];

            const isInside = obj.containsPoint(pointer);

            // Fallback: Check Bounding Box (Robust for hollow/transparent shapes)
            const bbox = obj.getBoundingRect();
            // Add a small buffer (eraser width) to make it easier to hit lines
            const buffer = 10;
            const inBBox = pointer.x >= bbox.left - buffer &&
              pointer.x <= bbox.left + bbox.width + buffer &&
              pointer.y >= bbox.top - buffer &&
              pointer.y <= bbox.top + bbox.height + buffer;

            if (isInside || inBBox) {
              canvas.remove(obj);
              removed = true;
            }
          }

          if (removed) {
            canvas.requestRenderAll();
          }
        };

        canvas.on('mouse:down', (opt) => {
          handleEraser(opt); // Delete on click
          // Enable drag delete
          canvas.on('mouse:move', handleEraser);
        });

        canvas.on('mouse:up', () => {
          canvas.off('mouse:move', handleEraser);
        });
        break;

      case 'text':
        canvas.defaultCursor = 'text';
        canvas.on('mouse:down', (opt) => {
          if (activeShape.current) return; // Prevent double click
          const pointer = (canvas as any).getScenePoint(opt.e);
          const text = new fabric.IText('Type here', {
            left: pointer.x,
            top: pointer.y,
            fill: color,
            fontSize: 24,
            fontFamily: 'Arial'
          });
          canvas.add(text);
          canvas.setActiveObject(text);
          text.enterEditing();
        });
        break;

      case 'rectangle':
      case 'circle':
      case 'line':
      case 'arrow':
        canvas.defaultCursor = 'crosshair';
        canvas.on('mouse:down', handleShapeStart);
        canvas.on('mouse:move', handleShapeMove);
        canvas.on('mouse:up', handleShapeEnd);
        break;
    }

  }, [tool, canvas, color, lineWidth]);

  // Update Brush Properties when Color/Width changes
  useEffect(() => {
    if (!canvas || !canvas.freeDrawingBrush) return;
    if (tool === 'pen') {
      canvas.freeDrawingBrush.color = color;
      canvas.freeDrawingBrush.width = lineWidth;
    }
    if (tool === 'highlighter') {
      canvas.freeDrawingBrush.color = `${color}50`; // Hex alpha
    }
  }, [color, lineWidth, canvas, tool]);

  // Smart Mode & Path Handling
  const handlePathCreated = async (e: any) => {
    if (!isSmartMode) return;
    // We only analyze if it's a "pen" stroke
    if (tool !== 'pen') return;

    const path = e.path;
    if (!path) return;

    setIsProcessing(true);

    // 1. Analyze for Shape
    const recognizedShape = analyzeShape(path);
    if (recognizedShape) {
      // Replace path with shape
      canvas?.remove(path);
      canvas?.add(recognizedShape);
      canvas?.requestRenderAll();
      setIsProcessing(false);
      return;
    }

    // 2. Analyze for Text (if enabled? Maybe distinct toggle?)
    // Shape recognition is fast. Text is slow.
    // Let's optimize: Only analyze text if shape failed? 
    // Or maybe we need a separate "Pen to Text" mode.
    // For now, let's keep it simple: Shape only.
    // The user asked for "write something... converted to clean text".
    // We can try calling text recognition.

    try {
      const text = await recognizeTextFromPath(path, canvasEl.current!);
      if (text && text.length > 0 && /^[a-zA-Z0-9\s]+$/.test(text)) { // Basic filter
        canvas?.remove(path);
        const iText = new fabric.IText(text, {
          left: path.left,
          top: path.top,
          fill: color,
          fontSize: 24
        });
        canvas?.add(iText);
        canvas?.requestRenderAll();
      }
    } catch (err) {
      // Ignore error
    }

    setIsProcessing(false);
  };

  // Shape Handlers
  const handleShapeStart = (opt: any) => {
    if (!canvas) return;
    isDrawingShape.current = true;
    const pointer = (canvas as any).getScenePoint(opt.e);
    shapeStartPoint.current = { x: pointer.x, y: pointer.y };

    let shape: fabric.Object | null = null;

    if (tool === 'rectangle') {
      shape = new fabric.Rect({
        left: pointer.x, top: pointer.y, width: 0, height: 0,
        fill: 'transparent', stroke: color, strokeWidth: lineWidth
      });
    } else if (tool === 'circle') {
      shape = new fabric.Circle({
        left: pointer.x, top: pointer.y, radius: 0,
        fill: 'transparent', stroke: color, strokeWidth: lineWidth, originX: 'center', originY: 'center'
      });
    } else if (tool === 'line') {
      shape = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
        stroke: color, strokeWidth: lineWidth
      });
    } else if (tool === 'arrow') {
      // Arrow is complex (Path), simplified as Line for start
      shape = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
        stroke: color, strokeWidth: lineWidth
      });
      // We will add arrow head on "up" or real-time?
      // Let's stick to line for now, or add Triangle later.
    }

    if (shape) {
      canvas.add(shape);
      activeShape.current = shape;
    }
  };

  const handleShapeMove = (opt: any) => {
    if (!isDrawingShape.current || !activeShape.current || !shapeStartPoint.current || !canvas) return;
    const pointer = (canvas as any).getScenePoint(opt.e);
    const start = shapeStartPoint.current;

    if (tool === 'rectangle') {
      const rect = activeShape.current as fabric.Rect;
      rect.set({
        width: Math.abs(pointer.x - start.x),
        height: Math.abs(pointer.y - start.y),
        left: Math.min(pointer.x, start.x),
        top: Math.min(pointer.y, start.y)
      });
    } else if (tool === 'circle') {
      const circle = activeShape.current as fabric.Circle;
      const radius = Math.sqrt(Math.pow(pointer.x - start.x, 2) + Math.pow(pointer.y - start.y, 2)) / 2;
      circle.set({ radius });
    } else if (tool === 'line' || tool === 'arrow') {
      const line = activeShape.current as fabric.Line;
      line.set({ x2: pointer.x, y2: pointer.y });
    }

    canvas.requestRenderAll();
  };

  const handleShapeEnd = () => {
    isDrawingShape.current = false;
    activeShape.current = null;
    saveToStorage(); // Save after shape complete
  };

  const clearAll = () => {
    canvas?.clear();
    saveToStorage();
  };

  const handleDownloadPDF = async () => {
    setIsProcessing(true);
    try {
      // 1. Capture the screen (Slide + Annotations)
      // We grab 'document.body' to ensure we get everything visible
      const canvasRef = await html2canvas(document.body, {
        useCORS: true,
        // @ts-ignore - scale is supported in runtime
        scale: 2,
        logging: false
      });

      const imgData = canvasRef.toDataURL('image/jpeg', 0.9);

      // Calculate aspect ratio
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvasRef.width, canvasRef.height]
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, canvasRef.width, canvasRef.height);
      pdf.save(`slide_${slideIndex + 1}_annotations.pdf`);

    } catch (err) {
      console.error('PDF Export failed', err);
      alert('Failed to generate PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50">
      <canvas ref={canvasEl} className="absolute inset-0" />

      {/* Show Processing Indicator */}
      {isProcessing && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
          Processing...
        </div>
      )}

      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur-sm rounded-2xl p-3 shadow-2xl scale-90 sm:scale-100 transition-all origin-top">
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto max-w-[90vw] touch-pan-x no-scrollbar">

          {/* Main Tools */}
          <div className="flex items-center gap-1 sm:gap-2 border-r border-white/20 pr-2 sm:pr-4">
            <ToolButton active={tool === 'select'} onClick={() => setTool('select')} icon="cursor" title="Select/Move" />
            <ToolButton active={tool === 'pen'} onClick={() => setTool('pen')} icon="pen" title="Pen" />
            <ToolButton active={tool === 'highlighter'} onClick={() => setTool('highlighter')} icon="highlighter" title="Highlighter" />
            <ToolButton active={tool === 'eraser'} onClick={() => setTool('eraser')} icon="eraser" title="Eraser" />
            <ToolButton active={tool === 'text'} onClick={() => setTool('text')} icon="text" title="Text" />
          </div>

          {/* Shapes */}
          <div className="flex items-center gap-1 sm:gap-2 border-r border-white/20 pr-2 sm:pr-4">
            <ToolButton active={tool === 'rectangle'} onClick={() => setTool('rectangle')} icon="rect" title="Rectangle" />
            <ToolButton active={tool === 'circle'} onClick={() => setTool('circle')} icon="circle" title="Circle" />
            <ToolButton active={tool === 'line'} onClick={() => setTool('line')} icon="line" title="Line" />
          </div>

          {/* Smart Toggle */}
          <button
            onClick={() => setIsSmartMode(!isSmartMode)}
            className={`p-2 rounded-lg transition-all ${isSmartMode ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50' : 'text-white/70 hover:bg-white/10'}`}
            title="Smart Mode (Ink to Shape/Text)"
          >
            <span className="font-bold text-xs sm:text-sm">AI</span>
          </button>

          {/* Color & Size */}
          <div className="flex items-center gap-2">
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none bg-transparent" />
            <input type="range" min="1" max="20" value={lineWidth} onChange={e => setLineWidth(Number(e.target.value))} className="w-16 sm:w-20" />
          </div>

          {/* Actions Group */}
          <div className="flex items-center gap-1 border-l border-white/20 pl-2 sm:pl-4">
            {/* Navigation Controls (Duplicated from Deck) */}
            <button onClick={onPrev} disabled={slideIndex === 0} className="p-2 text-white/70 hover:bg-white/10 rounded disabled:opacity-30" title="Previous Slide">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <span className="text-white/50 font-mono text-xs">{slideIndex + 1}/{totalSlides}</span>
            <button onClick={onNext} disabled={slideIndex === totalSlides - 1} className="p-2 text-white/70 hover:bg-white/10 rounded disabled:opacity-30" title="Next Slide">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
            </button>

            {/* Fullscreen */}
            <button onClick={toggleFullScreen} className="p-2 text-white/70 hover:bg-white/10 rounded" title="Toggle Fullscreen">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>
            </button>

            {/* Download PDF */}
            <button onClick={handleDownloadPDF} className="p-2 text-white/70 hover:text-blue-400 hover:bg-white/10 rounded" title="Download Slide with Annotations">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
            </button>

            <button onClick={clearAll} className="p-2 text-white/70 hover:text-red-400" title="Clear Canvas">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
            </button>

            <button onClick={onClose} className="p-2 bg-red-500 text-white rounded hover:bg-red-600" title="Close">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component for buttons to clean up render
function ToolButton({ active, onClick, icon, title }: { active: boolean, onClick: () => void, icon: string, title: string }) {
  const getIcon = () => {
    switch (icon) {
      case 'cursor': return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" /></svg>;
      case 'pen': return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /></svg>;
      case 'highlighter': return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 11-6 6v3h9l3-3" /><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" /></svg>;
      case 'eraser': return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" /><path d="M22 21H7" /><path d="m5 11 9 9" /></svg>;
      case 'text': return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" x2="15" y1="20" y2="20" /><line x1="12" x2="12" y1="4" y2="20" /></svg>;
      case 'rect': return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2" /></svg>;
      case 'circle': return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /></svg>;
      case 'line': return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" x2="19" y1="5" y2="19" /></svg>;
      default: return null;
    }
  };

  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-all ${active ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'}`}
      title={title}
    >
      {getIcon()}
    </button>
  );
}
