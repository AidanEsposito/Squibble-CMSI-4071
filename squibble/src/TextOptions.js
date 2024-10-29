import React, { useState, useEffect } from 'react';

const TextOptions = ({ onAddText, selectedColor }) => {
  const [text, setText] = useState('');
  const [color, setColor] = useState(selectedColor);
  const [size, setSize] = useState(16);
  const [font, setFont] = useState('Arial');

  // Update the color state whenever the selectedColor prop changes
  useEffect(() => {
    setColor(selectedColor);
  }, [selectedColor]);

  // Ensure the text size doesn't exceed 200 and clear if empty or zero
  const handleSizeChange = (e) => {
    let newSize = parseInt(e.target.value) || '';
    if (newSize === 0) {
      setSize('');
    } else if (newSize > 200) {
      newSize = 200;
    }
    setSize(newSize);
  };

  const handleAddClick = () => {
    if (text.trim() === '') return; // Prevent adding empty text
    onAddText({ text, color, size, font });
    setText(''); // Clear the text input after adding
  };

  const handlePresetSizeSelect = (e) => {
    const selectedSize = parseInt(e.target.value);
    setSize(selectedSize);
  };

  const handleEnterKey = (event) => {
    if (event.key === 'Enter') {
      if (text.trim() === '') return;
      onAddText({ text, color, size, font });
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleEnterKey);
    return () => {
      window.removeEventListener('keydown', handleEnterKey);
    };
  }, [text, color, size, font]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
      {/* Text Input */}
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text"
        style={{ padding: '8px', fontSize: '14px', width: '90%' }}
      />

      {/* Unified Text Size Input with Dropdown */}
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          type="number"
          value={size}
          onChange={handleSizeChange}
          placeholder="Font size"
          min="1"
          max="200"
          style={{
            padding: '8px',
            fontSize: '14px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
        <select
          value={size}
          onChange={handlePresetSizeSelect}
          style={{
            position: 'absolute',
            right: '0',
            top: '0',
            bottom: '0',
            padding: '8px',
            fontSize: '14px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            width: '30%',
            boxSizing: 'border-box',
          }}
        >
          {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 72, 96, 120, 150, 200].map(
            (s) => (
              <option key={s} value={s}>
                {s}
              </option>
            )
          )}
        </select>
      </div>

      {/* Font Dropdown */}
      <select
        value={font}
        onChange={(e) => setFont(e.target.value)}
        style={{ padding: '8px', fontSize: '14px', width: '100%' }}
      >
        <option value="Arial">Arial</option>
        <option value="Courier New">Courier New</option>
        <option value="Georgia">Georgia</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Verdana">Verdana</option>
        <option value="Comic Sans MS">Comic Sans MS</option>
        <option value="Impact">Impact</option>
        <option value="Lucida Console">Lucida Console</option>
        <option value="Tahoma">Tahoma</option>
        {/* Add more font options as needed */}
      </select>

      {/* Selected Color Display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span>Selected Color:</span>
        <div
          style={{
            display: 'inline-block',
            width: '20px',
            height: '20px',
            backgroundColor: color,
            border: '1px solid black',
          }}
        />
      </div>

      {/* Add Text Button */}
      <button
        onClick={handleAddClick}
        style={{
          padding: '10px',
          backgroundColor: '#007BFF',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        Add Text
      </button>
    </div>
  );
};

export default TextOptions;
