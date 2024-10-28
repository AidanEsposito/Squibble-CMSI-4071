async function loadScreenshots() {
  const response = await fetch('./Screenshots'); 
  const screenshots = await response.json();
  
  const grid = document.querySelector('.screenshot-grid');
  screenshots.forEach(screenshot => {
    const item = document.createElement('div');
    item.classList.add('screenshot-item');
    
    const img = document.createElement('img');
    img.src = `/screenshots/${screenshot.filename}`;
    const date = document.createElement('div');
    date.classList.add('date');
    date.textContent = new Date(screenshot.timestamp).toLocaleDateString();
    
    item.appendChild(img);
    item.appendChild(date);
    grid.appendChild(item);
  });
}

window.onload = loadScreenshots;
