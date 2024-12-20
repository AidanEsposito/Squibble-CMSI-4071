
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALUQ3tiXPzMw5nfVeZGQu264KHPszN8YE",
  authDomain: "squibble-d2d9c.firebaseapp.com",
  projectId: "squibble-d2d9c",
  storageBucket: "squibble-d2d9c.appspot.com",
  messagingSenderId: "1090141183917",
  appId: "1:1090141183917:web:244c016d69a78ee9214b24"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

// Export the auth and storage objects
export { auth, storage, db };
export default app;
