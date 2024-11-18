import React, { useEffect, useState } from 'react';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import './Archive.css';

const Archive = ({ onBack }) => {
  const [screenshots, setScreenshots] = useState([]);

  useEffect(() => {
    async function loadScreenshots() {
      const storage = getStorage();
      const screenshotsRef = ref(storage, 'screenshots/');

      try {
        const result = await listAll(screenshotsRef);
        console.log('Fetched items from Firebase Storage:', result);

        const screenshotData = await Promise.all(
          result.items.map(async (itemRef) => {
            const url = await getDownloadURL(itemRef);
            console.log(`Fetched URL for ${itemRef.name}:`, url);
            return { url };
          })
        );

        setScreenshots(screenshotData);
      } catch (error) {
        console.error('Failed to load screenshots:', error);
      }
    }

    loadScreenshots();
  }, []);

  return (
    <div>
      <div className="archive-header">
        <button className="back-button" onClick={onBack}>Back</button>
        <h1>Welcome To The Archive</h1>
      </div>
      <p>This is the archive page where you can view saved whiteboards.</p>

      <div className="screenshot-grid">
        {screenshots.map((screenshot, index) => (
          <div key={index} className="screenshot-item">
            <img src={screenshot.url} alt={`Screenshot ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Archive;

