import React, { useState } from 'react';
import Archive from './Archive.js';
import Whiteboard from './Whiteboard.js';
import Header from './Header.js';
import {SignIn, SignOut, useAuthentication } from './Auth.js';

function App() {
  const user = useAuthentication();
  const [brushSize, setBrushSize] = useState(2);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [texts, setTexts] = useState([]);
  const [shouldReset, setShouldReset] = useState(false);
  const [showArchive, setShowArchive] = useState(false); 
  const [timer, setTimer] = useState(259200); // Ensure this is intended
  const isLoggedIn = !!user;
  const onSignIn = SignIn();
  const onSignOut = SignOut();

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

  const handleArchiveClick = () => {
    setShowArchive(true);
  };

  const handleBackToWhiteboard = () => {
    setShowArchive(false);
  };

  const resetWhiteboard = () => {
    setTexts([]);
    setShouldReset(true);
    setTimer(259200); // Ensure this is intended
  };

  return (
    <div className="App">
      {showArchive ? (
        <Archive onBack={handleBackToWhiteboard} />
      ) : (
        <>
          <Header 
            user={user}
            onSignIn={SignIn} 
            onSignOut={SignOut}
            isLoggedIn={isLoggedIn}
            onAddText={onAddText} 
            brushSize={brushSize} 
            setBrushSize={setBrushSize} 
            currentColor={currentColor} 
            setCurrentColor={setCurrentColor} 
            onArchiveClick={handleArchiveClick}
            resetWhiteboard={resetWhiteboard}
            timer={timer}
            setTimer={setTimer}
          />
          <Whiteboard 
            texts={texts} 
            setTexts={setTexts}
            brushSize={brushSize} 
            shouldReset={shouldReset}
            setShouldReset={setShouldReset}
            currentColor={currentColor} 
            resetWhiteboard={resetWhiteboard}
          />
          {!user ? <SignIn /> : <SignOut />}
        </>
      )}
    </div>
  );
}

export default App;


