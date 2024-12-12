import React, { useRef, useEffect, useState } from 'react';
import Canvas from './Canvas.js';
import ToolTabs from './ToolTabs.js';
import ColorMenu from './ColorMenu.js';
import TextOptions from './TextOptions.js';
import ToggleToolTabsButton from './ToggleToolTabsButton.js';
import { useAuthentication } from './Auth.js';
import './Whiteboard.css';

const Whiteboard = ({ texts, setTexts, shouldReset, setShouldReset }) => {
  const user = useAuthentication(); // Get the current user
  const [currentColor, setCurrentColor] = useState('#000000'); // Current pen color
  const [brushSize, setBrushSize] = useState(2); // Current brush size
  const [tempBrushSize, setTempBrushSize] = useState(brushSize); // Temporary state for brush size
  const [activeTool, setActiveTool] = useState('pen'); // Active tool: 'pen', 'pan', 'eraser', or 'text'
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(false); // Shows bounding boxes of all lines drawn (debug)
  const [lines, setLines] = useState([]); // Stores details of all drawn lines
  const [selectedColorIndex, setSelectedColorIndex] = useState(0); // Track the selected color index
  const [sampleColors, setSampleColors] = useState([
    '#000000',
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#FFFF00',
    '#FF00FF',
    '#00DEAD',
  ]); // Colors used for swatches in color menu
  const [isTextMenuOpen, setIsTextMenuOpen] = useState(false); // Track if the TextOptions menu is open
  const [sidePanelVisible, setSidePanelVisible] = useState(false); // Visibility of the side panel
  const [sidePanelHovered, setSidePanelHovered] = useState(false); // Track if the side panel is being hovered over
  const [toolTabsManuallyVisible, setToolTabsManuallyVisible] = useState(false); // Track visibility when using the manual button
  const timeoutRef = useRef(null);
  
  // Function to reset the side panel timeout
  const resetSidePanelTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setSidePanelVisible(false);
    }, 5000); // Hide after 5 seconds of inactivity
  };

  // Add event listeners to track user activity near the right edge of the screen
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Only show the panel if the cursor is in the rightmost 1% of the screen width
      if (e.clientX >= window.innerWidth * 0.99 || toolTabsManuallyVisible) {
        setSidePanelVisible(true);
        resetSidePanelTimeout();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user]);

  useEffect(() => {
    if (user) resetSidePanelTimeout(); 
  }, [user]);

  useEffect(() => {
    if (!user) {
      setActiveTool('none'); 
    }
  }, [user]); 

  // Handle color selection from the sample palette
  const handleSampleColorSelect = (color, index) => {
    setCurrentColor(color);
    setSelectedColorIndex(index);
    // Only switch the active tool if the text menu is not open
    if (!isTextMenuOpen) {
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

  // Key binding to switch colors (1-9 keys)
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Prevent color change if the text menu is open (user typing text)
      if (isTextMenuOpen) {
        return;
      }
      const key = event.key;
      // Check if the key is a number between '1' and '9' for switching colors
      if (key >= '1' && key <= '9') {
        const colorIndex = parseInt(key) - 1;
        if (colorIndex < sampleColors.length) {
          handleSampleColorSelect(sampleColors[colorIndex], colorIndex);
        }
      }
    };
    // Attach the event listener
    window.addEventListener('keydown', handleKeyDown);
    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sampleColors, isTextMenuOpen]);

  const handleAddText = (textOptions) => {
    setTexts((prevTexts) => [
      ...prevTexts,
      {
        ...textOptions,
        position: { x: 100, y: 100 }, // Default position, ideally set via user click
      },
    ]);
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
        isTextMenuOpen={isTextMenuOpen}
        setIsTextMenuOpen={setIsTextMenuOpen}
      />

      {user && ( // Only render hover trigger and side panel if the user is authenticated
        <>
          {/* Hover Trigger Area */}
          <div
            className="hover-trigger"
            onMouseEnter={() => {
              if (!sidePanelVisible) {
                setSidePanelVisible(true);
                resetSidePanelTimeout();
              }
            }}
          />

          {/* Side Panel */}
          <div
            className={`side-panel ${sidePanelVisible ? 'visible' : 'hidden'}`}
            onMouseEnter={() => {
              if (!sidePanelHovered) {
                clearTimeout(timeoutRef.current);
              }
            }}
            onMouseLeave={() => {
              resetSidePanelTimeout();
            }}
          >
            <ToolTabs
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              brushSize={brushSize}
              tempBrushSize={tempBrushSize}
              setTempBrushSize={setTempBrushSize}
              setBrushSize={setBrushSize} // Pass setBrushSize
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
          {/* Toggle Button for Mobile and Manual Control */}
          <ToggleToolTabsButton onToggleToolTabs={() => {
            setToolTabsManuallyVisible((prev) => !prev);
            setSidePanelVisible((prev) => !prev);
          }} />
        </>
      )}

      {/* Render TextOptions only when the Text Tool is active */}
      {activeTool === 'text' && <TextOptions onAddText={handleAddText} />}

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
