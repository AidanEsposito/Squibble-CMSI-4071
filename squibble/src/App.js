import React, { useState } from 'react';
import Header from './Header.js';
import Whiteboard from './Whiteboard.js';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [brushSize, setBrushSize] = useState(2); // Define brush size state
  const [currentColor, setCurrentColor] = useState('#000000'); // Define current color state
  const [texts, setTexts] = useState([]);

  const handleSignIn = () => {
    setIsLoggedIn(true);
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
  };

  const onAddText = (textOptions) => {
    setTexts((prevTexts) => [
      ...prevTexts,
      {
        text: textOptions.text,
        color: textOptions.color,
        size: textOptions.size,
        font: textOptions.font,
      },
    ]);
  };

  return (
    <div className="App">
      <Header 
        isLoggedIn={isLoggedIn} 
        onSignIn={handleSignIn} 
        onSignOut={handleSignOut} 
        onAddText={onAddText} 
        brushSize={brushSize} 
        setBrushSize={setBrushSize} 
        currentColor={currentColor} 
        setCurrentColor={setCurrentColor} 
      />
      {/* <Whiteboard 
        texts={texts} 
        brushSize={brushSize} 
        currentColor={currentColor} 
      /> */}
    </div>
  );
}

export default App;
