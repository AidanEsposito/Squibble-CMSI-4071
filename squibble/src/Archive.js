// Archive.js
import React from 'react';
import './Archive.css'; // Import the CSS file

const Archive = ({ onBack }) => { // Accept onBack prop
  return (
    <div>
      <div className="archive-header">
        <button className="back-button" onClick={onBack}>Back</button>
        <h1>Welcome To The Archive</h1>
      </div>
      <p>This is the archive page where you can view whiteboards saved after every 3 days.</p>
      {/* Add more content or components here as needed */}
    </div>
  );
};

export default Archive;
