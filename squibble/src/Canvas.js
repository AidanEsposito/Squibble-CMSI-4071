import React, { useRef, useEffect, useState } from 'react';

const Canvas = ({ currentColor, brushSize, activeTool, lines, setLines, showBoundingBoxes }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [previousPosition, setPreviousPosition] = useState(null);

  // Handle mouse down event for drawing or erasing
  const handleMouseDown = (e) => {
    if (activeTool === 'pen') {
      setIsDrawing(true);
      const { offsetX, offsetY } = e.nativeEvent;
      setPreviousPosition({ x: offsetX, y: offsetY });
    } else if (activeTool === 'eraser') {
      setIsErasing(true);
      handleErase(e);
    }
  };

  // Handle mouse up event to stop drawing or erasing
  const handleMouseUp = () => {
    setIsDrawing(false);
    setPreviousPosition(null);
    setIsErasing(false);
  };

  // Handle mouse movement for drawing, panning, and erasing
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (activeTool === 'pan' && e.buttons === 1) {
      // Handle panning
      const board = canvas.parentElement;
      board.scrollLeft -= e.movementX;
      board.scrollTop -= e.movementY;
    } else if (activeTool === 'pen' && isDrawing) {
      const { offsetX, offsetY } = e.nativeEvent;
      const currentPosition = { x: offsetX, y: offsetY };

      if (previousPosition) {
        drawLine(context, previousPosition, currentPosition, currentColor, brushSize);
        setLines((prevLines) => [
          ...prevLines,
          { start: previousPosition, end: currentPosition, color: currentColor, size: brushSize },
        ]);
        setPreviousPosition(currentPosition);
      }
    } else if (activeTool === 'eraser' && isErasing) {
      handleErase(e);
    }
  };

  // Draw a line between two points on the canvas
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

  // Handle erasing by clicking on a bounding box
  const handleErase = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    setLines((prevLines) =>
      prevLines.filter(
        (line) =>
          !(
            offsetX >= Math.min(line.start.x, line.end.x) - line.size / 2 &&
            offsetX <= Math.max(line.start.x, line.end.x) + line.size / 2 &&
            offsetY >= Math.min(line.start.y, line.end.y) - line.size / 2 &&
            offsetY <= Math.max(line.start.y, line.end.y) + line.size / 2
          )
      )
    );
    redrawCanvas();
  };

  // Redraw the entire canvas with the remaining lines, including bounding boxes for debugging
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    lines.forEach((line) => {
      drawLine(context, line.start, line.end, line.color, line.size);
      if (showBoundingBoxes) {
        drawBoundingBox(context, line);
      }
    });
  };

  // Draw bounding box around a line (for debugging)
  const drawBoundingBox = (context, line) => {
    const minX = Math.min(line.start.x, line.end.x) - line.size / 2;
    const minY = Math.min(line.start.y, line.end.y) - line.size / 2;
    const maxX = Math.max(line.start.x, line.end.x) + line.size / 2;
    const maxY = Math.max(line.start.y, line.end.y) + line.size / 2;

    context.strokeStyle = 'red';
    context.lineWidth = 1;
    context.setLineDash([5, 5]); // Dashed line for bounding box
    context.strokeRect(minX, minY, maxX - minX, maxY - minY);
    context.setLineDash([]); // Reset line dash
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

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      className={`drawing-canvas ${activeTool === 'pan' ? 'pan-cursor' : ''}`}
    />
  );
};

export default Canvas;
