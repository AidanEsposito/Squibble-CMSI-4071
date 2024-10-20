import React from 'react';

const ToolTabs = ({ activeTool, setActiveTool, tempBrushSize, setTempBrushSize, setShowBoundingBoxes, showBoundingBoxes }) => {
  return (
    <div className="tool-tabs">
      {/* Marquee Tool Tab */}
      <div
        className={`tool-tab ${activeTool === 'marquee' ? 'active' : ''}`}
        onClick={() => setActiveTool(activeTool === 'marquee' ? null : 'marquee')}
      >
        Marquee Tool
      </div>

      {/* Pen Tool Tab */}
      <div
        className={`tool-tab ${activeTool === 'pen' ? 'active' : ''}`}
        onClick={() => setActiveTool(activeTool === 'pen' ? null : 'pen')}
      >
        Pen Tool
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
        Eraser Tool
      </div>

      {/* Pan Tool Tab */}
      <div
        className={`tool-tab ${activeTool === 'pan' ? 'active' : ''}`}
        onClick={() => setActiveTool(activeTool === 'pan' ? null : 'pan')}
      >
        Pan Tool
      </div>

      {/* Text Tool Tab */}
      <div
        className={`tool-tab ${activeTool === 'text' ? 'active' : ''}`}
        onClick={() => setActiveTool(activeTool === 'text' ? null : 'text')}
      >
        Text Tool
      </div>

      {/* Bounding Boxes Toggle */}
      <div className="tool-tab" onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}>
        {showBoundingBoxes ? 'Hide Bounding Boxes' : 'Show Bounding Boxes'}
      </div>
      
    </div>
  );
};

export default ToolTabs;