// import logo from './logo.svg';
import React, { useState } from 'react';
import Header from './Header.js';
import Whiteboard from './Whiteboard.js';
import './App.css';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  //Needs firebase implementation
  const handleSignIn = () => {
    setIsLoggedIn(true);
  };

  //Needs firebase implementation
  const handleSignOut = () => {
    setIsLoggedIn(false);
  };

  return(
    <div className="App">
      <Header isLoggedIn={isLoggedIn} onSignIn={handleSignIn} onSignOut={handleSignOut} />
      <Whiteboard />
    </div>
  )
}

export default App;
