import React from 'react';

const ToolTabs = ({ activeTool, setActiveTool, tempBrushSize, setTempBrushSize, setShowBoundingBoxes, showBoundingBoxes }) => {
  return (
    <div className="tool-tabs">
      <div className={`tool-tab ${activeTool === 'pen' ? 'active' : ''}`} onClick={() => setActiveTool(activeTool === 'pen' ? null : 'pen')}>
        Pen Tool
        <div className="tool-options">
          <label>Brush Size: </label>
          <input
            type="range"
            min="1"
            max="20"
            value={tempBrushSize}
            onChange={(e) => setTempBrushSize(Number(e.target.value))}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>

      <div className={`tool-tab ${activeTool === 'pan' ? 'active' : ''}`} onClick={() => setActiveTool(activeTool === 'pan' ? null : 'pan')}>
        Pan Tool
      </div>

      <div className={`tool-tab ${activeTool === 'eraser' ? 'active' : ''}`} onClick={() => setActiveTool(activeTool === 'eraser' ? null : 'eraser')}>
        Eraser Tool
      </div>

      <div className="tool-tab" onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}>
        {showBoundingBoxes ? 'Hide Bounding Boxes' : 'Show Bounding Boxes'}
      </div>
    </div>
  );
};

export default ToolTabs;
