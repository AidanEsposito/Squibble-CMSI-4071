import React, { useState, useEffect } from 'react';
import './Header.css';

const Header = ({ onSignOut, onSignIn, isLoggedIn, brushSize, setBrushSize, currentColor, setCurrentColor }) => {
  const [activeMediaItem, setActiveMediaItem] = useState(null);
  const [timer, setTimer] = useState(0);

  const handleMediaMenuToggle = (menu) => {
    setActiveMediaItem(activeMediaItem === menu ? null : menu);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timeInSeconds) => {
    const days = Math.floor(timeInSeconds / 86400);
    const hours = Math.floor((timeInSeconds % 86400) / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <header>
      <div className="logo" onClick={() => window.location.reload()}>
        <img src={`${process.env.PUBLIC_URL}/SquibbleLogo.png`} alt="Squibble Logo" />
      </div>
      <div className="timer">{formatTime(timer)}</div>
      {isLoggedIn ? (
        <>
          <button onClick={onSignOut}>Sign Out</button>
          <button onClick={() => handleMediaMenuToggle('media')}>Media Menu</button>
          {activeMediaItem === 'media' && (
            <div className="media-menu">
              <button onClick={() => handleMediaMenuToggle('images')}>Images</button>
              <button onClick={() => handleMediaMenuToggle('gifs')}>Gifs</button>
              <button onClick={() => handleMediaMenuToggle('drawings')}>Drawings</button>
              <button onClick={() => handleMediaMenuToggle('postit')}>Post-it Notes</button>
            </div>
          )}
          {activeMediaItem === 'drawings' && (
            <div className="submenu drawing-menu">
              <label>Brush Size: </label>
              <input 
                type="range" 
                min="1" 
                max="20" 
                value={brushSize} 
                onChange={(e) => setBrushSize(e.target.value)} 
              />
              <label>Color: </label>
              <input 
                type="color" 
                value={currentColor} 
                onChange={(e) => setCurrentColor(e.target.value)} 
              />
            </div>
          )}
        </>
      ) : (
        <button onClick={onSignIn}>Sign In</button>
      )}
    </header>
  );
};

export default Header;
