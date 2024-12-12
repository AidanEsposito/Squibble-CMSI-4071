import { doc, getDoc, setDoc } from 'firebase/firestore';
import db from './firebaseConfig.js';

export const saveWhiteboardData = async (whiteboardId, data) => {
  try {
    const docRef = doc(db, 'whiteboards', whiteboardId);
    await setDoc(docRef, data);
    console.log('Whiteboard data saved successfully');
  } catch (error) {
    console.error('Error saving whiteboard data:', error);
  }
};

export const loadWhiteboardData = async (whiteboardId) => {
  try {
    const docRef = doc(db, 'whiteboards', whiteboardId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log('Whiteboard data loaded successfully');
      return docSnap.data();
    } else {
      console.log('No whiteboard data found');
      return null;
    }
  } catch (error) {
    console.error('Error loading whiteboard data:', error);
    return null;
  }
};
