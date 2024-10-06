import React, { useRef, useEffect, useState } from 'react';
import './Whiteboard.css';

const Whiteboard = () => {
  const canvasRef = useRef(null);
  const [currentColor, setCurrentColor] = useState('#000000'); // Default pen color
  const [activeTool, setActiveTool] = useState(null); // Active tool: 'pen' or 'pan'
  const [isDrawing, setIsDrawing] = useState(false);
  const [previousPosition, setPreviousPosition] = useState(null);

  // Handle mouse down event for drawing
  const handleMouseDown = (e) => {
    if (activeTool === 'pen') {
      setIsDrawing(true);
      const { offsetX, offsetY } = e.nativeEvent;
      setPreviousPosition({ x: offsetX, y: offsetY });
    }
  };

  // Handle mouse up event to stop drawing
  const handleMouseUp = () => {
    if (activeTool === 'pen') {
      setIsDrawing(false);
      setPreviousPosition(null);
    }
  };

  // Handle mouse movement for drawing and panning
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (activeTool === 'pan' && e.buttons === 1) {
      // Handle panning
      const board = canvas.parentElement;
      board.scrollLeft -= e.movementX;
      board.scrollTop -= e.movementY;
    } else if (activeTool === 'pen' && isDrawing) {
      // Handle drawing
      const { offsetX, offsetY } = e.nativeEvent;
      const currentPosition = { x: offsetX, y: offsetY };

      if (previousPosition) {
        drawLine(context, previousPosition, currentPosition, currentColor);
        setPreviousPosition(currentPosition);
      }
    }
  };

  // Draw a line between two points on the canvas
  const drawLine = (context, start, end, color) => {
    context.strokeStyle = color;
    context.lineWidth = 2; // Adjust line width as needed
    context.lineCap = 'round'; // Make the line ends smooth
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
    context.closePath();
  };

  // Resize the canvas to a larger area for more panning and drawing room
  useEffect(() => {
    const canvas = canvasRef.current;
    const parentElement = canvas.parentElement;

    // Set canvas size to cover 3 page widths and 2 page heights
    canvas.width = parentElement.clientWidth * 3;
    canvas.height = parentElement.clientHeight * 2;
  }, []);

  // Mock color palette dialog for selecting pen color
  const handleColorSelect = (e) => {
    setCurrentColor(e.target.value);
  };

  return (
    <div className="whiteboard" onMouseMove={handleMouseMove}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // Stop drawing if the mouse leaves the canvas
        className="drawing-canvas"
      />

      {/* Tool tabs on the right edge */}
      <div className="tool-tabs">
        {/* Pen Tool Tab */}
        <div
          className={`tool-tab ${activeTool === 'pen' ? 'active' : ''}`}
          onClick={() => setActiveTool(activeTool === 'pen' ? null : 'pen')}
        >
          Pen Tool
          <div className="tool-options">
            <label>Select Color: </label>
            <input
              type="color"
              value={currentColor}
              onChange={handleColorSelect}
              onClick={(e) => e.stopPropagation()} // Prevent deselecting the tool
            />
          </div>
        </div>

        {/* Pan Tool Tab */}
        <div
          className={`tool-tab ${activeTool === 'pan' ? 'active' : ''}`}
          onClick={() => setActiveTool(activeTool === 'pan' ? null : 'pan')}
        >
          Pan Tool
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;
