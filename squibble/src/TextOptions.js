import React, { useState, useEffect, useRef } from 'react';
import './TextOptions.css';

const TextOptions = ({ onAddText, selectedColor }) => {
  const [text, setText] = useState('');
  const [color, setColor] = useState(selectedColor);
  const [size, setSize] = useState(16);
  const [font, setFont] = useState('Arial');
  const editorRef = useRef(null);

  // Update the color state whenever the selectedColor prop changes
  useEffect(() => {
    setColor(selectedColor);
  }, [selectedColor]);

  const handleInputChange = () => {
    setText(editorRef.current.innerHTML);
  };

  const handleAddClick = () => {
    if (text.trim() === '') return; // Prevent adding empty text
    onAddText({ text, color, size, font });
    setText(''); // Clear the text input after adding
    editorRef.current.innerHTML = '';
  };

  // Function to wrap selected text with BBCode tags
  const formatText = (tag) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (selectedText) {
      const beforeTag = `[${tag}]`;
      const afterTag = `[/${tag}]`;

      // Replace the selected text with formatted text
      range.deleteContents();
      range.insertNode(document.createTextNode(`${beforeTag}${selectedText}${afterTag}`));
    }
  };
  
  // Utility function to convert BBCode to HTML
  const parseBBCodeToHTML = (bbcode) => {
    return bbcode
      .replace(/\[b\](.*?)\[\/b\]/g, '<b>$1</b>')       // Bold
      .replace(/\[i\](.*?)\[\/i\]/g, '<i>$1</i>')       // Italic
      .replace(/\[u\](.*?)\[\/u\]/g, '<u>$1</u>');      // Underline
  };

  // Handlers for formatting buttons
  const handleBold = () => formatText('b');
  const handleItalic = () => formatText('i');
  const handleUnderline = () => formatText('u');

  // Keyboard shortcuts for formatting
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        handleBold();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        handleItalic();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        handleUnderline();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
      {/* Formatting Buttons */}
      <div className="formatting-buttons" style={{ marginBottom: '10px' }}>
        <button onClick={handleBold}><b>B</b></button>
        <button onClick={handleItalic}><i>I</i></button>
        <button onClick={handleUnderline}><u>U</u></button>
      </div>

      {/* Rich Text Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="text-editor"
        onInput={handleInputChange}
        style={{
          border: '1px solid black',
          minHeight: '100px',
          padding: '10px',
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
        }}
      />

      {/* Unified Text Size Input with Dropdown */}
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          type="number"
          value={size}
          onChange={(e) => setSize(parseInt(e.target.value))}
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
          onChange={(e) => setSize(parseInt(e.target.value))}
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
      </select>

      {/* Selected Color Display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span>Selected Color:</span>
        <div
          style={{
            display: 'inline-block',
            width: '80px',
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
