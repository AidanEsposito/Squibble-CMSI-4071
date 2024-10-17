import React, { useState } from 'react';

const TextOptions = ({ onAddText }) => {
  const [textOptions, setTextOptions] = useState({
    color: '#000000',
    size: '16',
    font: 'Arial',
    text: '',
  });

  const handleTextChange = (e) => {
    setTextOptions({ ...textOptions, text: e.target.value });
  };

  const handleTextAdd = () => {
    if (textOptions.text.trim()) {
      onAddText(textOptions); // Call the function to add text
      setTextOptions({ ...textOptions, text: '' }); // Clear the text input
    }
  };

  return (
    <div className="text-options">
      <label>
        Color:
        <input
          type="color"
          value={textOptions.color}
          onChange={(e) => setTextOptions({ ...textOptions, color: e.target.value })}
        />
      </label>
      <label>
        Size:
        <input
          type="number"
          value={textOptions.size}
          onChange={(e) => setTextOptions({ ...textOptions, size: e.target.value })}
        />
      </label>
      <label>
        Font:
        <select
          value={textOptions.font}
          onChange={(e) => setTextOptions({ ...textOptions, font: e.target.value })}
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
        </select>
      </label>
      <textarea
        value={textOptions.text}
        onChange={handleTextChange}
        placeholder="Enter your text here"
      />
      <button onClick={handleTextAdd}>Add Text</button>
    </div>
  );
};

export default TextOptions;
