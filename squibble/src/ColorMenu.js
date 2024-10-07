import React from 'react';

const ColorMenu = ({ currentColor, handleSampleColorSelect, handleCustomColorSelect, sampleColors }) => {
  return (
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
    {/* Custom Color Picker with Rainbow Border */}
    <div className="custom-color-container">
      <div className="rainbow-border"></div>
        <input
          type="color"
          value={currentColor}
          onChange={handleCustomColorSelect}
          className="custom-color-picker"
          title="Choose Custom Color"
        />
      </div>
    </div>
  );
};

export default ColorMenu;
