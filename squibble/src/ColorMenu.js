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
      <input
        type="color"
        value={currentColor}
        onChange={handleCustomColorSelect}
        className="custom-color-picker"
        title="Choose Custom Color"
      />
    </div>
  );
};

export default ColorMenu;
