import React, { useRef, useEffect, useState } from 'react';
import TextOptions from './TextOptions';

const Canvas = ({ currentColor, brushSize, activeTool, lines, setLines, showBoundingBoxes }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [isTextMenuOpen, setIsTextMenuOpen] = useState(false);
  const [textMenuPosition, setTextMenuPosition] = useState(null);
  const [previousPosition, setPreviousPosition] = useState(null);
  const [recentLines, setRecentLines] = useState([]);

  const handleMouseDown = (e) => {
    if (activeTool === 'pen') {
      setIsDrawing(true);
      const { offsetX, offsetY } = e.nativeEvent;
      setPreviousPosition({ x: offsetX, y: offsetY });
      setRecentLines([]);
    } else if (activeTool === 'eraser') {
      setIsErasing(true);
      handleErase(e);
    } else if (activeTool === 'text') {
      const { offsetX, offsetY } = e.nativeEvent;
      setTextMenuPosition({ x: offsetX, y: offsetY });
      setIsTextMenuOpen(true);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setIsErasing(false);

    if (recentLines.length > 2) {
      const splineCurve = approximateSpline(recentLines);
      setLines((prevLines) => [...prevLines, splineCurve]);
    }

    setRecentLines([]);
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (activeTool === 'pan' && e.buttons === 1) {
      const board = canvas.parentElement;
      board.scrollLeft -= e.movementX;    // Adjust horizontal scroll
      board.scrollTop -= e.movementY;     // Adjust vertical scroll
      return; // Prevent other interactions while panning
    } else if (activeTool === 'pen' && isDrawing) {
      const { offsetX, offsetY } = e.nativeEvent;
      const currentPosition = { x: offsetX, y: offsetY };
  
      if (previousPosition) {
        drawLine(context, previousPosition, currentPosition, currentColor, brushSize);
        setRecentLines((prevRecentLines) => [...prevRecentLines, currentPosition]);
        setPreviousPosition(currentPosition);
      }
    } else if (activeTool === 'eraser' && isErasing) {
      handleErase(e);
    }
  };

  const drawLine = (context, start, end, color, size) => {
    context.strokeStyle = color;
    context.lineWidth = size;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
    context.closePath();
  };

  const approximateSpline = (points) => {
    if (points.length < 2) return null;
    return {
      type: 'spline',
      points: points,
      color: currentColor,
      size: brushSize,
    };
  };

  const handleErase = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    setLines((prevLines) =>
      prevLines.filter((object) => {
        return setObjects(object, offsetX, offsetY);
      })
    );
    redrawCanvas();
  };

  const setObjects = (object, offsetX, offsetY) => {
    if (object.type === 'spline') {
      return !checkSplineCollision(object, offsetX, offsetY);
    } else if (object.type === 'line') {
      return !checkBoundingBoxCollision(object, offsetX, offsetY);
    } else if (object.type === 'text') {
      return !checkTextCollision(object, offsetX, offsetY);
    } else {
      return true;
    }
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    lines.forEach((object) => {
      if (object.type === 'text') {
        drawText(context, object);
      } else if (object.type === 'spline') {
        drawSpline(context, object);
      } else if (object.type === 'line') {
        drawLine(context, object.start, object.end, object.color, object.size);
      }

      if (showBoundingBoxes) {
        drawBoundingBox(context, object);
      }
    });
  };

  const drawSpline = (context, spline) => {
    const { points, color, size } = spline;
    context.strokeStyle = color;
    context.lineWidth = size;
    context.lineCap = 'round';

    if (points.length < 2) return;

    context.beginPath();
    context.moveTo(points[0].x, points[0].y);

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      for (let t = 0; t <= 1; t += 0.1) {
        const t2 = t * t;
        const t3 = t2 * t;

        const x =
          0.5 *
          ((-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3 +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
            (-p0.x + p2.x) * t +
            2 * p1.x);

        const y =
          0.5 *
          ((-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3 +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
            (-p0.y + p2.y) * t +
            2 * p1.y);

        context.lineTo(x, y);
      }
    }

    context.stroke();
    context.closePath();
  };

  const drawText = (context, textObject) => {
    context.font = `${textObject.size}px ${textObject.font}`;
    context.fillStyle = textObject.color;
    context.fillText(textObject.text, textObject.position.x, textObject.position.y);
    const textWidth = context.measureText(textObject.text).width;
    const textHeight = textObject.size;
    textObject.width = textWidth;
    textObject.height = textHeight;
  };

  const handleAddText = (textOptions) => {
    const newText = {
      type: 'text',
      text: textOptions.text,
      color: textOptions.color,
      size: textOptions.size,
      font: textOptions.font,
      position: textMenuPosition,
    };
    setLines((prevLines) => [...prevLines, newText]);
    setIsTextMenuOpen(false);
  };

  const drawBoundingBox = (context, object) => {
    if (object.type === 'spline') {
      const minX = Math.min(...object.points.map(point => point.x)) - object.size / 2;
      const minY = Math.min(...object.points.map(point => point.y)) - object.size / 2;
      const maxX = Math.max(...object.points.map(point => point.x)) + object.size / 2;
      const maxY = Math.max(...object.points.map(point => point.y)) + object.size / 2;

      context.strokeStyle = 'red';
      context.lineWidth = 1;
      context.setLineDash([5, 5]);
      context.strokeRect(minX, minY, maxX - minX, maxY - minY);
      context.setLineDash([]);
    } else if (object.type === 'text') {
      const { position, width, height } = object;
      context.strokeStyle = 'red';
      context.lineWidth = 1;
      context.setLineDash([5, 5]);
      context.strokeRect(position.x, position.y - height, width, height);
      context.setLineDash([]);
    } else if (object.type === 'line') {
      const minX = Math.min(object.start.x, object.end.x) - object.size / 2;
      const minY = Math.min(object.start.y, object.end.y) - object.size / 2;
      const maxX = Math.max(object.start.x, object.end.x) + object.size / 2;
      const maxY = Math.max(object.start.y, object.end.y) + object.size / 2;

      context.strokeStyle = 'red';
      context.lineWidth = 1;
      context.setLineDash([5, 5]);
      context.strokeRect(minX, minY, maxX - minX, maxY - minY);
      context.setLineDash([]);
    }
  };

  const checkBoundingBoxCollision = (line, offsetX, offsetY) => {
    return (
      offsetX >= Math.min(line.start.x, line.end.x) - line.size / 2 &&
      offsetX <= Math.max(line.start.x, line.end.x) + line.size / 2 &&
      offsetY >= Math.min(line.start.y, line.end.y) - line.size / 2 &&
      offsetY <= Math.max(line.start.y, line.end.y) + line.size / 2
    );
  };

  const checkSplineCollision = (spline, offsetX, offsetY) => {
    const margin = 5;
    return spline.points.some((point) => {
      return (
        offsetX >= point.x - margin &&
        offsetX <= point.x + margin &&
        offsetY >= point.y - margin &&
        offsetY <= point.y + margin
      );
    });
  };

  const checkTextCollision = (textObject, offsetX, offsetY) => {
    const { position, width, height } = textObject;
    return (
      offsetX >= position.x &&
      offsetX <= position.x + width &&
      offsetY >= position.y - height &&
      offsetY <= position.y
    );
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 3;
    canvas.height = window.innerHeight * 2;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    redrawCanvas();
  }, [lines, showBoundingBoxes]);

  useEffect(() => {
    // Close the text menu if the active tool changes
    if (activeTool !== 'text') {
      setIsTextMenuOpen(false);
    }
  }, [activeTool]);

  return (
    <div
      className="parent-element"
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'auto',
        position: 'relative', // Ensure the container is scrollable
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`drawing-canvas ${activeTool === 'pan' ? 'pan-cursor' : ''}`}
      />
      
      {isTextMenuOpen && textMenuPosition && (
      <div
        style={{
          position: 'absolute',
          left: `${textMenuPosition.x}px`,
          top: `${textMenuPosition.y}px`,
          width: '200px', // Set a fixed width for the text menu
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid black',
          borderRadius: '4px',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // Optional, add shadow for better visibility
        }}
      >
        <TextOptions onAddText={handleAddText}
        selectedColor={currentColor}  // Pass the selected color to the text option
         />
      </div>
    )}
    </div>
  );
};

export default Canvas;
