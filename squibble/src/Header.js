import React, { useState, useEffect } from 'react';
// import { auth, googleProvider } from '../firebaseConfig';
// import { signInWithPopup, signOut } from 'firebase/auth';
import './Header.css';



const Header = ({ isLoggedIn, onSignIn, onSignOut }) => {
  const [timer, setTimer] = useState(259200); 

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  //Current timer setup: can be changed when actual timer is implemented
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
          <button>Archive</button>
          <button>Media Menu</button>
          
        </>
      ) : (
        <button onClick={onSignIn}>Sign In</button>
      )}
    </header>
  );
};

export default Header;
