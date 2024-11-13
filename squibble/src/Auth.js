import { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig.js'; 


export function SignIn() {
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error("Error signing in: ", error);
      alert(error.message); 
    }
  };

  return <button className="auth-button" onClick={handleSignIn}>Sign In with Google</button>;
}

export function SignOut() {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
      alert(error.message);
    }
  };

  return (
    <div className="auth-button-container">
      Hello, {auth.currentUser?.displayName} &nbsp;
      <button className="auth-button" onClick={handleSignOut}>Sign Out</button>
    </div>
  );
}


export function useAuthentication() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe(); 
  }, []);

  return user;
}
