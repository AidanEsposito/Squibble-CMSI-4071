import React, { useRef, useEffect, useState } from 'react';
import Canvas from './Canvas';
import ToolTabs from './ToolTabs';
import ColorMenu from './ColorMenu';
import './Whiteboard.css';

const Whiteboard = () => {
  const [currentColor, setCurrentColor] = useState('#000000'); // Default pen color
  const [brushSize, setBrushSize] = useState(2); // Default brush size
  const [tempBrushSize, setTempBrushSize] = useState(brushSize); // Temporary state for brush size
  const [activeTool, setActiveTool] = useState(null); // Active tool: 'pen', 'pan', or 'eraser'
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(false);
  const [lines, setLines] = useState([]); // Stores details of all drawn lines
  const [selectedColorIndex, setSelectedColorIndex] = useState(0); // Track the selected color index
  const [sampleColors, setSampleColors] = useState([
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00DEAD'
  ]);

  // useEffect to debounce the brush size update
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setBrushSize(tempBrushSize); // Set the actual brush size after a delay (saves resources)
    }, 300);

    // Cleanup function to clear the timeout if the component re-renders
    return () => clearTimeout(debounceTimer);
  }, [tempBrushSize]);

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

  return (
    <div className="whiteboard">
      <Canvas
        currentColor={currentColor}
        brushSize={brushSize}
        activeTool={activeTool}
        lines={lines}
        setLines={setLines}
        showBoundingBoxes={showBoundingBoxes}
      />
      <ToolTabs
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        tempBrushSize={tempBrushSize}
        setTempBrushSize={setTempBrushSize}
        setShowBoundingBoxes={setShowBoundingBoxes}
        showBoundingBoxes={showBoundingBoxes}
      />
      <ColorMenu
        currentColor={currentColor}
        handleSampleColorSelect={handleSampleColorSelect}
        handleCustomColorSelect={handleCustomColorSelect}
        sampleColors={sampleColors}
      />
    </div>
  );
};

export default Whiteboard;
