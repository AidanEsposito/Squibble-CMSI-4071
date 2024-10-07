import React from 'react';
import "balloon-css";

const ColorMenu = ({ currentColor, handleSampleColorSelect, handleCustomColorSelect, sampleColors }) => {
  return (
    <div className="color-menu">
      {sampleColors.map((color, index) => (
        <div
          key={index}
          className="color-sample"
          style={{ backgroundColor: color }}
          aria-label= {"Color ".concat((index+1))}
          data-balloon-pos="left"
          onClick={(e) => {
            e.stopPropagation(); // Prevent deselecting the tool
            handleSampleColorSelect(color, index);
          }}
        />
      ))}
    {/* Custom Color Picker with Rainbow Border */}
    <div className="custom-color-container">
      <div className="rainbow-border"></div>
      <div className="balloon-wrapper" aria-label= "Custom Color" data-balloon-pos="left">
        <input
          type="color"
          value={currentColor}
          onChange={handleCustomColorSelect}
          className="custom-color-picker"
        />
      </div>
      </div>
    </div>
  );
};

export default ColorMenu;
