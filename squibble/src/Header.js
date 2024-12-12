import React, { useState, useEffect } from 'react';
import './Header.css';
import "balloon-css";
import { SignIn, SignOut, useAuthentication } from './Auth.js'; // Adjust the path as needed
import PreviewGif from './gifs.js';

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
  const [isMediaMenuOpen, setIsMediaMenuOpen] = useState(false);

  const handleMediaMenuToggle = () => {
    setIsMediaMenuOpen((prev) => !prev);
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
      <div 
        className="logo" 
        aria-label="An artistic squirrel says: 'I only paint with the finest nuts!'"
        data-balloon-pos="right"
        onClick={() => window.location.reload()}
      >
        <img src={`${process.env.PUBLIC_URL}/SquibbleLogo.png`} alt='Squibble logo' />
      </div>
      <div className="timer">{formatTime(timer)}</div>
      <div className="archive">
        <button onClick={onArchiveClick}>Archive</button>
      </div>
      {user ? (
        <>
          <SignOut />
          <button className="media-menu-toggle" onClick={handleMediaMenuToggle}>Media Menu</button>
          {isMediaMenuOpen && (
            <div className="media-menu animated-slide-out">
              <button onClick={() => console.log('Images button clicked')}>Images</button>
              <button onClick={() => console.log('GIFs button clicked')}>GIFs</button>
              <button onClick={() => console.log('Drawings button clicked')}>Drawings</button>
              <button onClick={() => console.log('Post-it Notes button clicked')}>Post-it Notes</button>
              <PreviewGif></PreviewGif>
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