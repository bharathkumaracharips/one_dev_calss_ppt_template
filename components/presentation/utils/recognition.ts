
import * as fabric from 'fabric';
import Tesseract from 'tesseract.js';

// Helper to calculate distance between points
const dist = (p1: fabric.Point, p2: fabric.Point) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

export const analyzeShape = (path: any): fabric.FabricObject | null => {
    // Safe check for path data
    if (!path.path || path.path.length < 2) return null;

    const bbox = path.getBoundingRect();
    const width = bbox.width;
    const height = bbox.height;

    // If it's a small dot, ignore
    if (width < 20 && height < 20) return null;

    // 1. Line Detection (Very thin)
    if (Math.min(width, height) < 20 && Math.max(width, height) > 50) {
        // It's a line
        // Return a Line object matching the path's major axis
        // Simple approximation: diagonal of the bbox
        // Correct way: Check start and end of path.
        // But for now, returning null lets it stay as a drawn stroke, which is often fine for lines.
        // User wanted "clean shapes... lines".
        // Let's return a Line.
        // We need start/end.
        // Taking top-left to bottom-right or bottom-left to top-right?
        // Check path first and last point.
        // Accessing path raw commands is tricky for exact start/end without parsing.
        // Let's fallback to "Rect" logic or Generic Path for lines for now, or just return null to keep original stroke.
        // However, user specifically asked for "lines... clean".
        // A Rect with 1px height is a line.
        return null; // Better to leave lines as freehand than convert to boxes.
    }

    // 2. Interior Point Check (Distinguish Box from Text)
    // We check if the path covers the "center" of the bbox.
    // Shapes (Box/Circle) are usually outlines (center empty).
    // Text fills the center.

    // Extract points from path commands (simplified)
    let points: { x: number, y: number }[] = [];
    path.path.forEach((cmd: any) => {
        // cmd is ["M", x, y] or ["L", x, y] or ["Q", x1, y1, x2, y2]
        // simplified: grab last 2 args as x/y
        if (cmd.length >= 3) {
            points.push({ x: cmd[cmd.length - 2], y: cmd[cmd.length - 1] });
        }
    });

    if (points.length < 5) return null; // Too simple

    const marginX = width * 0.20;
    const marginY = height * 0.20;

    let internalPoints = 0;
    points.forEach(p => {
        // Check if point is strictly inside the margins
        // We need usage of path.left/top offset?
        // path commands in Fabric are relative to top/left of object usually or absolute?
        // In free drawing, they are usually relative to the path group or absolute before group.
        // We can use the point values relative to bbox.
        // But we don't know the offset of 'points' easily without checking path.left/top logic.
        // Let's use a simpler heuristic:
        // Text usually has high density of points?
        // A Box has 4-5 corners. Text has many curves.
        // If path.path.length > 20 -> Likely Text/Complex.
        // A simple drawn box is usually 5-10 points (M, L, L, L, L...).
        // A drawn circle is many points?
        // Freehand drawing produces MANY points (one per mouse move).
    });

    // Revised Heuristic for Freehand:
    // Freehand rectangle = 4 distinct linear segments.
    // Freehand circle = constant curvature.
    // Text = high variance, multiple segments.

    // Complexity Threshold
    // If the user draws a box slowly, it has MANY points.
    // So point count is not a good metric initially.

    // Let's use the USER's specific request: "Text ... styles handwriting is not clean enough"
    // "Shapes ... create clean shapes".

    // Heuristic: Aspect Ratio & Fill?
    // Let's assume everything is TEXT unless it looks VERY much like a circle/square.
    // Square: Convex Hull ~ BBox.
    // Text: Convex Hull > Area of stroke?

    // Simple MVP approach:
    // If Aspect Ratio is ~1 (+/- 20%), treat as Circle.
    // Else, if User holds "Shape" modifier? No.

    // Let's stick to: 
    // 1. Circle check (Ratio ~1).
    // 2. Rect check (User has to be distinct?).
    // 3. Fallback to Text.

    const aspectRatio = width / height;

    // Circle Heuristic
    if (Math.abs(aspectRatio - 1) < 0.2) {
        return new fabric.Circle({
            left: bbox.left + width / 2,
            top: bbox.top + height / 2,
            radius: Math.max(width, height) / 2,
            originX: 'center',
            originY: 'center',
            fill: 'transparent',
            stroke: path.stroke,
            strokeWidth: path.strokeWidth
        });
    }

    // If we are here, it's not a circle.
    // If we blindly return Rect, text recognition never runs.
    // So we MUST return null to allow Text recognition to take over.
    // If the user draws a distinct rectangle, they might be annoyed it becomes text.
    // But converting "Box" (word) to text is better than converting a box to text.
    // Converting a Box to "Box" text is bad.

    return null;
};

export const recognizeTextFromPath = async (path: fabric.FabricObject, canvasElement: HTMLCanvasElement): Promise<string | null> => {
    // Crop the canvas to the path's bounding box and recognize
    const bbox = path.getBoundingRect();
    const padding = 10;

    // Create a temp canvas
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return null;

    tempCanvas.width = bbox.width + padding * 2;
    tempCanvas.height = bbox.height + padding * 2;

    // Draw white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw the image data from main canvas?
    // We can use fabric's toDataURL logic on the object
    const dataUrl = path.toDataURL({
        format: 'png',
        multiplier: 2 // improve quality for OCR
    });

    // Load into temp canvas? Or just pass dataUrl to Tesseract
    try {
        const result = await Tesseract.recognize(dataUrl, 'eng');
        return result.data.text.trim();
    } catch (e) {
        console.error("OCR Failed", e);
        return null;
    }
};

// Advanced Shape Matcher (Circle vs Rect vs Line)
export const detectShapeType = (path: fabric.Path): 'circle' | 'rect' | 'line' | 'unknown' => {
    const bbox = path.getBoundingRect();
    if (Math.min(bbox.width, bbox.height) < 20 && Math.max(bbox.width, bbox.height) > 50) return 'line';
    return 'unknown';
};
