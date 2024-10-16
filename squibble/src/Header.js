import React, { useState } from 'react';
import './Header.css'; // Make sure to import your CSS for styling

const Header = ({ onSignOut, onSignIn, isLoggedIn }) => {
  const [activeMediaItem, setActiveMediaItem] = useState(null); // State to track the active media item
  const [timer, setTimer] = useState(0); // Example timer state; adjust as needed

  // Helper function to format the timer (if needed)
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleMediaMenuToggle = (menu) => {
    if (activeMediaItem === menu) {
      setActiveMediaItem(null); // Close the menu if it's already open
    } else {
      setActiveMediaItem(menu); // Open the selected menu
    }
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
          <button onClick={() => setActiveMediaItem('archive')}>Archive</button>
          <button onClick={() => handleMediaMenuToggle('media')}>Media Menu</button>
          {activeMediaItem === 'media' && ( // Render submenus when Media Menu is active
            <div className="media-menu">
              <button onClick={() => handleMediaMenuToggle('text')}>Text</button>
              <button onClick={() => handleMediaMenuToggle('images')}>Images</button>
              <button onClick={() => handleMediaMenuToggle('gifs')}>Gifs</button>
              <button onClick={() => handleMediaMenuToggle('drawings')}>Drawings</button>
              <button onClick={() => handleMediaMenuToggle('postit')}>Post-it Notes</button>
            </div>
          )}
          {activeMediaItem === 'drawings' && ( // Show specific settings for Drawings
            <div className="submenu drawing-menu">
              {/* Drawing options here */}
              <label>Brush Size: </label>
              <input type="range" min="1" max="20" />
              {/* Add more drawing options here */}
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
