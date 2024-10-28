import React, { useRef, useEffect, useState } from 'react';
import Canvas from './Canvas.js';
import ToolTabs from './ToolTabs.js';
import ColorMenu from './ColorMenu.js';
import TextOptions from './TextOptions.js';
import './Whiteboard.css';

const Whiteboard = ({ texts, setTexts, shouldReset, setShouldReset }) => {
  const [currentColor, setCurrentColor] = useState('#000000');      // Current pen color
  const [brushSize, setBrushSize] = useState(2);                    // Current brush size
  const [tempBrushSize, setTempBrushSize] = useState(brushSize);    // Temporary state for brush size
  const [activeTool, setActiveTool] = useState('pen');               // Active tool: 'pen', 'pan', 'eraser', or 'text'
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(false); // Shows bounding boxes of all lines drawn (debug)
  const [lines, setLines] = useState([]);                           // Stores details of all drawn lines
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);  // Track the selected color index
  const [sampleColors, setSampleColors] = useState([                // Colors used for swatches in color menu
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00DEAD'
  ]);
  const [showTextOptions, setShowTextOptions] = useState(false);          // Control visibility of TextMenu

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
    if (activeTool != 'text') {
    setActiveTool('pen');
    }
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

  const handleAddText = (textOptions) => {
    setTexts((prevTexts) => [
      ...prevTexts,
      {
        ...textOptions,
        position: { x: 100, y: 100 } // Default position, ideally set via user click
      }
    ]);
  };

  useEffect(() => {
    if (shouldReset) {
      console.log('Resetting whiteboard...');
      setTexts([]);
      setShouldReset(false); 
    }
  }, [shouldReset, setTexts, setShouldReset]);

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

      {/* Render TextOptions only when the Text Tool is active */}
      {activeTool === 'text' && (
        <TextOptions onAddText={handleAddText} />
      )}

      {/* Render the added texts */}
      {texts.map((textObj, index) => (
        <div
          key={index}
          style={{
            color: textObj.color,
            fontSize: `${textObj.size}px`,
            fontFamily: textObj.font,
            position: 'absolute',
            left: textObj.position.x,
            top: textObj.position.y,
          }}
        >
          {textObj.text}
        </div>
      ))}
    </div>
  );
};

export default Whiteboard;
