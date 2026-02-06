"use client";

import React, { useState, useRef, useEffect } from 'react';

interface AnnotationToolsProps {
  isActive: boolean;
  onClose: () => void;
  slideIndex: number;
}

type Tool = 'pen' | 'highlighter' | 'eraser' | 'text' | 'arrow' | 'rectangle' | 'circle' | 'line';
type Color = string;

interface DrawingPoint {
  x: number;
  y: number;
}

interface DrawingPath {
  tool: Tool;
  color: Color;
  width: number;
  points: DrawingPoint[];
}

interface TextAnnotation {
  x: number;
  y: number;
  text: string;
  color: Color;
  fontSize: number;
}

interface ShapeAnnotation {
  tool: 'arrow' | 'rectangle' | 'circle' | 'line';
  color: Color;
  width: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export default function AnnotationTools({ isActive, onClose, slideIndex }: AnnotationToolsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState<Color>('#FF0000');
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<DrawingPoint[]>([]);
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [shapes, setShapes] = useState<ShapeAnnotation[]>([]);
  const [tempShape, setTempShape] = useState<ShapeAnnotation | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInputPos, setTextInputPos] = useState({ x: 0, y: 0 });
  const [textInputValue, setTextInputValue] = useState('');

  const colors = [
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFA500', // Orange
    '#800080', // Purple
    '#FFFFFF', // White
    '#000000', // Black
  ];

  useEffect(() => {
    if (!isActive) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to match viewport
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    redrawCanvas();
  }, [isActive, paths, textAnnotations, shapes, tempShape]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all paths
    paths.forEach(path => {
      if (path.points.length < 2) return;

      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (path.tool === 'highlighter') {
        ctx.globalAlpha = 0.3;
      } else {
        ctx.globalAlpha = 1;
      }

      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);
      
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // Draw shapes
    [...shapes, ...(tempShape ? [tempShape] : [])].forEach(shape => {
      ctx.strokeStyle = shape.color;
      ctx.lineWidth = shape.width;
      ctx.lineCap = 'round';

      if (shape.tool === 'arrow') {
        drawArrow(ctx, shape.startX, shape.startY, shape.endX, shape.endY, shape.color, shape.width);
      } else if (shape.tool === 'rectangle') {
        ctx.strokeRect(shape.startX, shape.startY, shape.endX - shape.startX, shape.endY - shape.startY);
      } else if (shape.tool === 'circle') {
        const radius = Math.sqrt(Math.pow(shape.endX - shape.startX, 2) + Math.pow(shape.endY - shape.startY, 2));
        ctx.beginPath();
        ctx.arc(shape.startX, shape.startY, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (shape.tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(shape.startX, shape.startY);
        ctx.lineTo(shape.endX, shape.endY);
        ctx.stroke();
      }
    });

    // Draw text annotations
    textAnnotations.forEach(text => {
      ctx.fillStyle = text.color;
      ctx.font = `${text.fontSize}px Arial`;
      ctx.fillText(text.text, text.x, text.y);
    });
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, color: string, width: number) => {
    const headLength = 20;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    // Draw line
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Draw arrowhead
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);

    if (tool === 'text') {
      setTextInputPos(pos);
      setShowTextInput(true);
      return;
    }

    if (['arrow', 'rectangle', 'circle', 'line'].includes(tool)) {
      setTempShape({
        tool: tool as 'arrow' | 'rectangle' | 'circle' | 'line',
        color,
        width: lineWidth,
        startX: pos.x,
        startY: pos.y,
        endX: pos.x,
        endY: pos.y,
      });
      setIsDrawing(true);
      return;
    }

    setIsDrawing(true);
    setCurrentPath([pos]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const pos = getMousePos(e);

    if (tempShape) {
      setTempShape({ ...tempShape, endX: pos.x, endY: pos.y });
      redrawCanvas();
      return;
    }

    if (tool === 'eraser') {
      // Remove paths that intersect with eraser
      setPaths(prevPaths => prevPaths.filter(path => {
        return !path.points.some(point => {
          const distance = Math.sqrt(Math.pow(point.x - pos.x, 2) + Math.pow(point.y - pos.y, 2));
          return distance < lineWidth * 2;
        });
      }));
    } else {
      setCurrentPath(prev => [...prev, pos]);
      
      // Draw current path in real-time
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && currentPath.length > 0) {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (tool === 'highlighter') {
          ctx.globalAlpha = 0.3;
        }

        ctx.beginPath();
        ctx.moveTo(currentPath[currentPath.length - 1].x, currentPath[currentPath.length - 1].y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  };

  const handleMouseUp = () => {
    if (tempShape) {
      setShapes(prev => [...prev, tempShape]);
      setTempShape(null);
    } else if (currentPath.length > 0 && tool !== 'eraser') {
      setPaths(prev => [...prev, { tool, color, width: lineWidth, points: currentPath }]);
      setCurrentPath([]);
    }
    setIsDrawing(false);
  };

  const handleTextSubmit = () => {
    if (textInputValue.trim()) {
      setTextAnnotations(prev => [...prev, {
        x: textInputPos.x,
        y: textInputPos.y,
        text: textInputValue,
        color,
        fontSize: 24,
      }]);
      setTextInputValue('');
    }
    setShowTextInput(false);
  };

  const clearAll = () => {
    setPaths([]);
    setTextAnnotations([]);
    setShapes([]);
    redrawCanvas();
  };

  const undo = () => {
    if (shapes.length > 0) {
      setShapes(prev => prev.slice(0, -1));
    } else if (textAnnotations.length > 0) {
      setTextAnnotations(prev => prev.slice(0, -1));
    } else if (paths.length > 0) {
      setPaths(prev => prev.slice(0, -1));
    }
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Canvas for drawing */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Text input */}
      {showTextInput && (
        <div
          className="absolute bg-white p-2 rounded shadow-lg"
          style={{ left: textInputPos.x, top: textInputPos.y }}
        >
          <input
            type="text"
            value={textInputValue}
            onChange={(e) => setTextInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
            className="border border-gray-300 px-2 py-1 rounded text-black"
            placeholder="Enter text..."
            autoFocus
          />
          <button onClick={handleTextSubmit} className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-sm">
            Add
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur-sm rounded-2xl p-3 shadow-2xl">
        <div className="flex items-center gap-4">
          {/* Drawing Tools */}
          <div className="flex items-center gap-2 border-r border-white/20 pr-4">
            <button
              onClick={() => setTool('pen')}
              className={`p-2 rounded-lg transition-all ${tool === 'pen' ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'}`}
              title="Pen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/></svg>
            </button>
            <button
              onClick={() => setTool('highlighter')}
              className={`p-2 rounded-lg transition-all ${tool === 'highlighter' ? 'bg-yellow-500 text-white' : 'text-white/70 hover:bg-white/10'}`}
              title="Highlighter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg>
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`p-2 rounded-lg transition-all ${tool === 'eraser' ? 'bg-red-500 text-white' : 'text-white/70 hover:bg-white/10'}`}
              title="Eraser"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>
            </button>
          </div>

          {/* Shape Tools */}
          <div className="flex items-center gap-2 border-r border-white/20 pr-4">
            <button
              onClick={() => setTool('text')}
              className={`p-2 rounded-lg transition-all ${tool === 'text' ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'}`}
              title="Text"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>
            </button>
            <button
              onClick={() => setTool('arrow')}
              className={`p-2 rounded-lg transition-all ${tool === 'arrow' ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'}`}
              title="Arrow"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
            <button
              onClick={() => setTool('rectangle')}
              className={`p-2 rounded-lg transition-all ${tool === 'rectangle' ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'}`}
              title="Rectangle"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>
            </button>
            <button
              onClick={() => setTool('circle')}
              className={`p-2 rounded-lg transition-all ${tool === 'circle' ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'}`}
              title="Circle"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
            </button>
            <button
              onClick={() => setTool('line')}
              className={`p-2 rounded-lg transition-all ${tool === 'line' ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'}`}
              title="Line"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" x2="19" y1="5" y2="19"/></svg>
            </button>
          </div>

          {/* Colors */}
          <div className="flex items-center gap-1 border-r border-white/20 pr-4">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>

          {/* Line Width */}
          <div className="flex items-center gap-2 border-r border-white/20 pr-4">
            <input
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-20"
              title="Line Width"
            />
            <span className="text-white text-sm w-6">{lineWidth}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={undo}
              className="p-2 rounded-lg text-white/70 hover:bg-white/10 transition-all"
              title="Undo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
            </button>
            <button
              onClick={clearAll}
              className="p-2 rounded-lg text-white/70 hover:bg-white/10 transition-all"
              title="Clear All"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all"
              title="Close Annotations"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
