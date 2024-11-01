import React, { useState, useEffect } from 'react';
import './Header.css';
import "balloon-css";
import { SignIn, SignOut, useAuthentication } from './Auth.js'; // Adjust the path as needed

const Header = ({
  brushSize,
  setBrushSize,
  currentColor,
  setCurrentColor,
  onArchiveClick,
  resetWhiteboard,
  timer,
  setTimer,
  setShowBoundingBoxes,
  showBoundingBoxes,
  activeTool,
  setActiveTool
}) => {
  const user = useAuthentication();
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
          return 259200; // Timer initialized to 3 days
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resetWhiteboard, setTimer]);

  const formatTime = (timeInSeconds) => {
    const days = Math.floor(timeInSeconds / 86400);
    const hours = Math.floor((timeInSeconds % 86400) / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <header className="header">
      <div className="logo" 
      aria-label="An artistic squirrel says: 'I only paint with the finest nuts!'"
      data-balloon-pos="right"
      onClick={() => window.location.reload()}>
        <img src={`${process.env.PUBLIC_URL}/SquibbleLogo.png`} alt ='Squibble logo'/>
      </div>
      <div className="timer">{formatTime(timer)}</div>
      <div className="archive">
        <button onClick={onArchiveClick}>Archive</button>
      </div>
      {user ? (
        <>
          <SignOut />
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
        <div className="google-signin-container">
          <SignIn />
        </div>
      )}
    </header>
  );
};

export default Header;
