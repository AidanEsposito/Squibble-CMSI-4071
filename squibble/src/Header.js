import React, { useState, useEffect } from 'react';
import './Header.css';

const Header = ({ 
  user,
  onSignOut, 
  onSignIn, 
  isLoggedIn, 
  brushSize, 
  setBrushSize, 
  currentColor, 
  setCurrentColor, 
  onArchiveClick,
  resetWhiteboard,
  timer, 
  setTimer 
}) => {
  const [activeMediaItem, setActiveMediaItem] = useState(null);
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  const handleMediaMenuToggle = (menu) => {
    setActiveMediaItem(activeMediaItem === menu ? null : menu);
    setActiveSubmenu(null); 
  };

  const handleSubmenuToggle = (submenu) => {
    setActiveSubmenu(activeSubmenu === submenu ? null : submenu);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTime) => {
        if (prevTime > 0) {
          return prevTime - 1; 
        } else {
          clearInterval(interval);
          resetWhiteboard(); 
          //Timer initialized to 5 seconds
          return 259200; 
        }
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [resetWhiteboard]); 

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
      <div className="archive">
        <button onClick={onArchiveClick}>Archive</button>
      </div>
      {isLoggedIn ? (
        <>
          <button onClick={onSignOut}>Sign Out</button>
          <button onClick={() => handleMediaMenuToggle('media')}>Media Menu</button>
          {activeMediaItem === 'media' && (
            <div className="media-menu">
              <button onClick={() => handleSubmenuToggle('images')}>Images</button>
              <button onClick={() => handleSubmenuToggle('gifs')}>Gifs</button>
              <button onClick={() => handleSubmenuToggle('drawings')}>Drawings</button>
              <button onClick={() => handleSubmenuToggle('postit')}>Post-it Notes</button>
            </div>
          )}
          {activeSubmenu === 'drawings' && (
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
