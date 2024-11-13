import React, { useEffect } from 'react';

const ToolTabs = ({ activeTool, setActiveTool, brushSize, tempBrushSize, setTempBrushSize, setBrushSize, setShowBoundingBoxes, showBoundingBoxes }) => {
  // useEffect to debounce the brush size update
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setBrushSize(tempBrushSize); // Set the actual brush size after a delay (saves resources)
    }, 300);

    // Cleanup function to clear the timeout if the component re-renders
    return () => clearTimeout(debounceTimer);
  }, [tempBrushSize, setBrushSize]);

  return (
    <div className="tool-tabs">
      {/* Marquee Tool Tab */}
      <div
        className={`tool-tab ${activeTool === 'marquee' ? 'active' : ''}`}
        onClick={() => setActiveTool(activeTool === 'marquee' ? null : 'marquee')}
      >
        ✂️ Select {/* Marquee Tool Emoji */}
      </div>

      {/* Pen Tool Tab */}
      <div
        className={`tool-tab ${activeTool === 'pen' ? 'active' : ''}`}
        onClick={() => setActiveTool(activeTool === 'pen' ? null : 'pen')}
      >
        ✏️ Pen {/* Pen Tool Emoji */}
        {activeTool === 'pen' && ( // Only show brush size when Pen Tool is active
          <div className="tool-options">
            <label>Brush Size: </label>
            <input
              type="range"
              min="1"
              max="20"
              value={tempBrushSize}
              onChange={(e) => setTempBrushSize(Number(e.target.value))}
              onClick={(e) => e.stopPropagation()} // Prevent click from bubbling
            />
          </div>
        )}
      </div>

      {/* Eraser Tool Tab */}
      <div
        className={`tool-tab ${activeTool === 'eraser' ? 'active' : ''}`}
        onClick={() => setActiveTool(activeTool === 'eraser' ? null : 'eraser')}
      >
        🧽 Erase {/* Eraser Tool Emoji */}
      </div>

      {/* Pan Tool Tab */}
      <div
        className={`tool-tab ${activeTool === 'pan' ? 'active' : ''}`}
        onClick={() => setActiveTool(activeTool === 'pan' ? null : 'pan')}
      >
        🖐️ Pan {/* Pan Tool Emoji */}
      </div>

      {/* Text Tool Tab */}
      <div
        className={`tool-tab ${activeTool === 'text' ? 'active' : ''}`}
        onClick={() => setActiveTool(activeTool === 'text' ? null : 'text')}
      >
        📝 Add Text {/* Text Tool Emoji */}
      </div>

      {/* Image Tool Tab */}
      <div
        className={`tool-tab ${activeTool === 'image' ? 'active' : ''}`}
        onClick={() => setActiveTool(activeTool === 'image' ? null : 'image')}
      >
        🖼️ Add Image{/* Image Tool Emoji */}
      </div>

      {/* Bounding Boxes Toggle */}
      <div className="tool-tab" onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}>
        {showBoundingBoxes ? '👁️‍🗨️ Hide Bounding Boxes' : '🔲 Show Bounding Boxes'} {/* Bounding Boxes Toggle */}
      </div>
    </div>
  );
};

export default ToolTabs;
