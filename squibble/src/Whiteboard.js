import React, { useRef, useEffect, useState } from 'react';
import './Whiteboard.css';

const Whiteboard = () => {
  const canvasRef = useRef(null);
  const [currentColor, setCurrentColor] = useState('#000000'); // Default pen color
  const [brushSize, setBrushSize] = useState(2); // Default brush size
  const [activeTool, setActiveTool] = useState(null); // Active tool: 'pen', 'pan', or 'eraser'
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [previousPosition, setPreviousPosition] = useState(null);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(false);
  const [lines, setLines] = useState([]); // Stores details of all drawn lines
  const [selectedColorIndex, setSelectedColorIndex] = useState(0); // Track the selected color index

  const [sampleColors, setSampleColors] = useState([
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'
  ]);


  // Handle color selection from the sample palette
  const handleSampleColorSelect = (color, index) => {
    setCurrentColor(color);
    setSelectedColorIndex(index);
  };

  // Handle color selection from the custom color picker
  const handleCustomColorSelect = (e) => {
    const newColor = e.target.value;
    setCurrentColor(newColor);

    // Update the selected color swatch with the custom color
    setSampleColors((prevColors) => {
      const newColors = [...prevColors];
      newColors[selectedColorIndex] = newColor; // Replace the color at the selected index
      return newColors;
    });
  };

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

  // Handle mouse up event to stop drawing or erasing (line is finished being drawn by user)
  const handleMouseUp = () => {
    if (activeTool === 'pen') {
      setIsDrawing(false);
      setPreviousPosition(null);
    } else if (activeTool === 'eraser') {
      setIsErasing(false);
    }
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
      // Handle drawing
      const { offsetX, offsetY } = e.nativeEvent;
      const currentPosition = { x: offsetX, y: offsetY };

      if (previousPosition) {
        drawLine(context, previousPosition, currentPosition, currentColor, brushSize);

        // Save the line details to state
        setLines((prevLines) => [
          ...prevLines,
          {
            start: previousPosition,
            end: currentPosition,
            color: currentColor,
            size: brushSize,
          },
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
    context.lineWidth = size; // Adjust line width based on brush size
    context.lineCap = 'round'; // Make the line ends smooth
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
    context.closePath();
  };

  // Handle erasing by clicking on a bounding box
  const handleErase = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;

    // Remove the lines whose bounding box contains the clicked point
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

    // Redraw the canvas with the remaining lines
    redrawCanvas();
  };

  // Redraw the entire canvas with the remaining lines
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#ffffff'; // Fill the background with white
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Redraw all remaining lines
    lines.forEach((line) => {
      drawLine(context, line.start, line.end, line.color, line.size);
    });
  };

  // Resize the canvas to a larger area for more panning and drawing room
  useEffect(() => {
    const canvas = canvasRef.current;

    // Set canvas size to cover 3 page widths and 2 page heights
    canvas.width = window.innerWidth * 3;
    canvas.height = window.innerHeight * 2;

    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff'; // Fill the background with white for better visibility
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Mock color palette dialog for selecting pen color
  const handleColorSelect = (e) => {
    setCurrentColor(e.target.value);
  };

  // Mock brush size slider for adjusting brush size
  const handleBrushSizeChange = (e) => {
    setBrushSize(Number(e.target.value));
  };

  return (
    <div className="whiteboard">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`drawing-canvas ${activeTool === 'pan' ? 'pan-cursor' : ''}`}
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
            <label>Brush Size: </label>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={handleBrushSizeChange}
              onClick={(e) => e.stopPropagation()}
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

        {/* Eraser Tool Tab */}
        <div
          className={`tool-tab ${activeTool === 'eraser' ? 'active' : ''}`}
          onClick={() => setActiveTool(activeTool === 'eraser' ? null : 'eraser')}
        >
          Eraser Tool
        </div>

        {/* Toggle Bounding Box Visibility */}
        <div className="tool-tab" onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}>
          {showBoundingBoxes ? 'Hide Bounding Boxes' : 'Show Bounding Boxes'}
        </div>
      </div>

      {/* Always visible color menu */}
      <div className="color-menu">
        {sampleColors.map((color, index) => (
          <div
            key={index}
            className="color-sample"
            style={{ backgroundColor: color }}
            onClick={(e) => {
              e.stopPropagation(); // Prevent deselecting the tool
              handleSampleColorSelect(color, index);
            }}
          />
        ))}
        {/* Custom Color Picker */}
        <input
          type="color"
          value={currentColor}
          onChange={handleCustomColorSelect}
          className="custom-color-picker"
          title="Choose Custom Color"
        />
      </div>

      {/* Render bounding boxes if the toggle is on */}
      {showBoundingBoxes &&
        lines.map((line, index) => {
          const minX = Math.min(line.start.x, line.end.x) - line.size / 2;
          const minY = Math.min(line.start.y, line.end.y) - line.size / 2;
          const maxX = Math.max(line.start.x, line.end.x) + line.size / 2;
          const maxY = Math.max(line.start.y, line.end.y) + line.size / 2;
          return (
            <div
              key={index}
              className="bounding-box"
              style={{
                left: minX,
                top: minY,
                width: maxX - minX,
                height: maxY - minY,
              }}
            />
          );
        })}
    </div>
  );
};

export default Whiteboard;
