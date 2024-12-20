import React, { useRef, useEffect, useState } from 'react';
import { saveWhiteboardData, loadWhiteboardData } from './firestoreUtils.js';
import TextOptions from './TextOptions.js';


const Canvas = ({ currentColor, brushSize, activeTool, lines, setLines, showBoundingBoxes, isTextMenuOpen, setIsTextMenuOpen }) => {
  const canvasRef = useRef(null);
  const whiteboardId = 'userWhiteboard';
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [textMenuPosition, setTextMenuPosition] = useState(null);
  const [previousPosition, setPreviousPosition] = useState(null);
  const [recentLines, setRecentLines] = useState([]);

  const [isMarqueeActive, setIsMarqueeActive] = useState(false);
  const [marqueeStart, setMarqueeStart] = useState(null);
  const [marqueeEnd, setMarqueeEnd] = useState(null);
  const [selectedObjects, setSelectedObjects] = useState([]);
  const [combinedBoundingBox, setCombinedBoundingBox] = useState(null);

  const isManipulatingRef = useRef(false);
  const previousPositionRef = useRef(null);
  const selectedObjectsRef = useRef([]);
  const combinedBoundingBoxRef = useRef(null);

  const [uploadedImages, setUploadedImages] = useState([]);
  const [imagePosition, setImagePosition] = useState(null);

  const [objectsToRedo, setObjectsToRedo] = useState([]);
  const [isUndoOrRedo, setIsUndoOrRedo] = useState(false);

  const handleMouseDown = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
  
    if (activeTool === 'marquee' && combinedBoundingBox) {
      if (
        offsetX >= combinedBoundingBox.minX &&
        offsetX <= combinedBoundingBox.maxX &&
        offsetY >= combinedBoundingBox.minY &&
        offsetY <= combinedBoundingBox.maxY
      ) {
        // Start manipulating selected objects
        isManipulatingRef.current = true;
        previousPositionRef.current = { x: offsetX, y: offsetY };
        return;
      }
    }
    
    if (activeTool === 'marquee') {
      // Single Object Selection or Marquee Start
      const clickedObject = lines.find((object) => {
        if (object.type === 'spline') {
          // Use accurate spline collision detection for splines
          return checkSplineCollision(object, offsetX, offsetY);
        } else {
          const { boundingBox } = getBoundingBox(object);
          return (
            offsetX >= boundingBox.minX &&
            offsetX <= boundingBox.maxX &&
            offsetY >= boundingBox.minY &&
            offsetY <= boundingBox.maxY
          );
        }
      });
  
      if (clickedObject) {
        // Always add to the selection when clicking an object
        setSelectedObjects((prevSelected) => {
          if (!prevSelected.includes(clickedObject)) {
            return [...prevSelected, clickedObject];
          }
          return prevSelected;
        });
  
        // Update the combined bounding box to include the new object
        setCombinedBoundingBox((prevBoundingBox) => {
          const newBoundingBox = getBoundingBox(clickedObject).boundingBox;
          if (!prevBoundingBox) return newBoundingBox;
  
          // Update combined bounding box with the new object
          return {
            minX: Math.min(prevBoundingBox.minX, newBoundingBox.minX),
            minY: Math.min(prevBoundingBox.minY, newBoundingBox.minY),
            maxX: Math.max(prevBoundingBox.maxX, newBoundingBox.maxX),
            maxY: Math.max(prevBoundingBox.maxY, newBoundingBox.maxY),
          };
        });
      } else {
        // Start marquee selection if no object was clicked
        setIsMarqueeActive(true);
        setMarqueeStart({ x: offsetX, y: offsetY });
        setMarqueeEnd({ x: offsetX, y: offsetY });
      }
    } else if (activeTool === 'pen') {
      setIsDrawing(true);
      setPreviousPosition({ x: offsetX, y: offsetY });
      setRecentLines([]);
    } else if (activeTool === 'eraser') {
      setIsErasing(true);
      handleErase(e);
    } else if (activeTool === 'text') {
      setTextMenuPosition({ x: offsetX, y: offsetY });
      setIsTextMenuOpen(true);
    } else if (activeTool === 'image') {
      // Set image position where user clicked and open the file picker
      setImagePosition({ x: offsetX, y: offsetY });
      document.getElementById('image-upload-input').click();
    }
  };

  //Whiteboard Data -- Aidan
  
const handleMouseUp = () => {
  setIsDrawing(false);
  setIsErasing(false);

  if (isManipulatingRef.current) {
    isManipulatingRef.current = false;
    setPreviousPosition(null);
    // Update the state after finishing manipulating to force a full re-render
    setLines([...lines]);
  }
  if (isMarqueeActive) {
    setIsMarqueeActive(false);
    selectObjectsInMarquee();
  }
  if (recentLines.length > 2) {
    const splineCurve = approximateSpline(recentLines);
    setLines((prevLines) => [...prevLines, splineCurve]);
  }
  setRecentLines([]);
};


const handleMouseMove = (e) => {
  const canvas = canvasRef.current;
  const context = canvas.getContext('2d');
  const { offsetX, offsetY } = e.nativeEvent;

  if (activeTool === 'pan' && e.buttons === 1) {
    const board = canvas.parentElement;
    board.scrollLeft -= e.movementX; // Adjust horizontal scroll
    board.scrollTop -= e.movementY; // Adjust vertical scroll
    return; // Prevent other interactions while panning
  } else if (activeTool === 'pen' && isDrawing) {
    const currentPosition = { x: offsetX, y: offsetY };

    if (previousPosition) {
      drawLine(context, previousPosition, currentPosition, currentColor, brushSize);
      setRecentLines((prevRecentLines) => [...prevRecentLines, currentPosition]);
      setPreviousPosition(currentPosition);
    }
  } else if (activeTool === 'eraser' && isErasing) {
    handleErase(e);
  } else if (activeTool === 'marquee' && isMarqueeActive) {
    setMarqueeEnd({ x: offsetX, y: offsetY });
  }

  // Handle manipulating selected objects
  if (isManipulatingRef.current && e.buttons === 1) {
    const deltaX = offsetX - previousPositionRef.current.x;
    const deltaY = offsetY - previousPositionRef.current.y;

    // Directly update the position of all selected objects by the delta
    selectedObjectsRef.current.forEach((line) => {
      if (line.points) {
        line.points.forEach((point) => {
          point.x += deltaX;
          point.y += deltaY;
        });
      } else if (line.type === 'text') {
        line.position.x += deltaX;
        line.position.y += deltaY;
      } else if (line.type === 'image') {
        line.x += deltaX;
        line.y += deltaY;
      }
    });

    // Update marquee bounding box as well
    if (combinedBoundingBoxRef.current) {
      combinedBoundingBoxRef.current.minX += deltaX;
      combinedBoundingBoxRef.current.minY += deltaY;
      combinedBoundingBoxRef.current.maxX += deltaX;
      combinedBoundingBoxRef.current.maxY += deltaY;
    }

    // Save the updated position for the next frame
    previousPositionRef.current = { x: offsetX, y: offsetY };

    // Force a re-render by updating lines at the end of the drag
    setLines([...lines]);
  }
};


  const selectObjectsInMarquee = () => {
    if (marqueeStart && marqueeEnd) {
      const minX = Math.min(marqueeStart.x, marqueeEnd.x);
      const minY = Math.min(marqueeStart.y, marqueeEnd.y);
      const maxX = Math.max(marqueeStart.x, marqueeEnd.x);
      const maxY = Math.max(marqueeStart.y, marqueeEnd.y);

      const selected = lines.filter((object) => {
        const { boundingBox } = getBoundingBox(object);
        return (
          boundingBox.minX >= minX &&
          boundingBox.maxX <= maxX &&
          boundingBox.minY >= minY &&
          boundingBox.maxY <= maxY
        );
      });

      setSelectedObjects(selected);

      // Calculate combined bounding box
      if (selected.length > 0) {
        const combinedMinX = Math.min(...selected.map((obj) => getBoundingBox(obj).boundingBox.minX));
        const combinedMinY = Math.min(...selected.map((obj) => getBoundingBox(obj).boundingBox.minY));
        const combinedMaxX = Math.max(...selected.map((obj) => getBoundingBox(obj).boundingBox.maxX));
        const combinedMaxY = Math.max(...selected.map((obj) => getBoundingBox(obj).boundingBox.maxY));
        setCombinedBoundingBox({ minX: combinedMinX, minY: combinedMinY, maxX: combinedMaxX, maxY: combinedMaxY });
      } else {
        setCombinedBoundingBox(null);
      }
    }
  };

  
  const drawMarquee = (context) => {
    if (isMarqueeActive && marqueeStart && marqueeEnd) {
      const { x: startX, y: startY } = marqueeStart;
      const { x: endX, y: endY } = marqueeEnd;

      context.strokeStyle = 'blue';
      context.lineWidth = 1;
      context.setLineDash([5, 5]);
      context.strokeRect(startX, startY, endX - startX, endY - startY);
      context.setLineDash([]);
    }
  };


  const drawSelectedBoundingBox = (context) => {
    if (combinedBoundingBox) {
      const { minX, minY, maxX, maxY } = combinedBoundingBox;

      context.strokeStyle = 'blue';
      context.lineWidth = 2;
      context.setLineDash([5, 5]);
      context.strokeRect(minX, minY, maxX - minX, maxY - minY);
      context.setLineDash([]);
    }
  };


  const drawLine = (context, start, end, color, size) => {
    context.strokeStyle = color;
    context.lineWidth = size;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
    context.closePath();
  };

  const approximateSpline = (points) => {
    if (points.length < 2) return null;
    return {
      type: 'spline',
      points: points,
      color: currentColor,
      size: brushSize,
    };
  };

  const handleErase = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    setLines((prevLines) =>
      prevLines.filter((object) => {
        return setObjects(object, offsetX, offsetY);
      })
    );
  
    // Update selected objects after erasing
    setSelectedObjects((prevSelected) =>
      prevSelected.filter((object) => setObjects(object, offsetX, offsetY))
    );
  
    // If no objects are selected after erasing, clear the marquee
    if (selectedObjects.length === 0) {
      setCombinedBoundingBox(null);
    }
    redrawCanvas();
  };
  

  const setObjects = (object, offsetX, offsetY) => {
    if (object.type === 'spline') {
      return !checkSplineCollision(object, offsetX, offsetY);
    } else if (object.type === 'line') {
      return !checkBoundingBoxCollision(object, offsetX, offsetY);
    } else if (object.type === 'text') {
      return !checkTextCollision(object, offsetX, offsetY);
    } else if (object.type === 'image') {
      return !checkImageCollision(object, offsetX, offsetY);
    } else {
      return true;
    }
  };


  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
  
    lines.forEach((object) => {
      if (object.type === 'text') {
        drawText(context, object);
      } else if (object.type === 'spline') {
        drawSpline(context, object);
      } else if (object.type === 'line') {
        drawLine(context, object.start, object.end, object.color, object.size);
      } else if (object.type === 'image') {
        context.drawImage(object.img, object.x, object.y, object.width, object.height);
      }
  
      if (showBoundingBoxes) {
        drawBoundingBox(context, object);
      }
    });
  
    drawMarquee(context);
    drawSelectedBoundingBox(context);
  };
  

  const drawSpline = (context, spline) => {
    const { points, color, size } = spline;
    context.strokeStyle = color;
    context.lineWidth = size;
    context.lineCap = 'round';

    if (points.length < 2) return;

    context.beginPath();
    context.moveTo(points[0].x, points[0].y);

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      for (let t = 0; t <= 1; t += 0.1) {
        const t2 = t * t;
        const t3 = t2 * t;

        const x =
          0.5 *
          ((-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3 +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
            (-p0.x + p2.x) * t +
            2 * p1.x);

        const y =
          0.5 *
          ((-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3 +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
            (-p0.y + p2.y) * t +
            2 * p1.y);

        context.lineTo(x, y);
      }
    }

    context.stroke();
    context.closePath();
  };

  const drawText = (context, textObject) => {
    context.font = `${textObject.size}px ${textObject.font}`;
    context.fillStyle = textObject.color;
    context.fillText(textObject.text, textObject.position.x, textObject.position.y);
    const textWidth = context.measureText(textObject.text).width;
    const textHeight = textObject.size;
    textObject.width = textWidth;
    textObject.height = textHeight;
  };

  const handleAddText = (textOptions) => {
    const newText = {
      type: 'text',
      text: textOptions.text,
      color: textOptions.color,
      size: textOptions.size,
      font: textOptions.font,
      position: textMenuPosition,
    };
    setLines((prevLines) => [...prevLines, newText]);
    setIsTextMenuOpen(false);
  };
  

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && imagePosition) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const newImage = {
            type: 'image',
            img: img,
            x: imagePosition.x - img.width / 2, // Center the image at the selected position
            y: imagePosition.y - img.height / 2,
            width: img.width,
            height: img.height,
          };
          setUploadedImages((prevImages) => [...prevImages, newImage]);
          setLines((prevLines) => [...prevLines, newImage]);
          setImagePosition(null); // Reset image position after placing the image
        };
      };
      reader.readAsDataURL(file);
    }
  };
  

  const getBoundingBox = (object) => {
    if (object.type === 'spline' || object.type === 'line') {
      const points = object.points || [object.start, object.end];
      const minX = Math.min(...points.map((point) => point.x)) - object.size / 2;
      const minY = Math.min(...points.map((point) => point.y)) - object.size / 2;
      const maxX = Math.max(...points.map((point) => point.x)) + object.size / 2;
      const maxY = Math.max(...points.map((point) => point.y)) + object.size / 2;
      return { boundingBox: { minX, minY, maxX, maxY } };
    } else if (object.type === 'text') {
      const { position, width, height } = object;
      return {
        boundingBox: {
          minX: position.x,
          minY: position.y - height,
          maxX: position.x + width,
          maxY: position.y,
        },
      };
    } else if (object.type === 'image') {
      const { x, y, width, height } = object;
      return {
        boundingBox: {
          minX: x,
          minY: y,
          maxX: x + width,
          maxY: y + height,
        },
      };
    }
    return { boundingBox: null };
  };
  


  const drawBoundingBox = (context, object) => {
    let minX, minY, maxX, maxY;
    if (object.type === 'spline') {
      minX = Math.min(...object.points.map(point => point.x)) - object.size / 2;
      minY = Math.min(...object.points.map(point => point.y)) - object.size / 2;
      maxX = Math.max(...object.points.map(point => point.x)) + object.size / 2;
      maxY = Math.max(...object.points.map(point => point.y)) + object.size / 2;
    } else if (object.type === 'text') {
      const { position, width, height } = object;
      minX = position.x;
      minY = position.y - height;
      maxX = position.x + width;
      maxY = position.y;
    } else if (object.type === 'image') {
      const { x, y, width, height } = object;
      minX = x;
      minY = y;
      maxX = x + width;
      maxY = y + height;
    } else if (object.type === 'line') {
      minX = Math.min(object.start.x, object.end.x) - object.size / 2;
      minY = Math.min(object.start.y, object.end.y) - object.size / 2;
      maxX = Math.max(object.start.x, object.end.x) + object.size / 2;
      maxY = Math.max(object.start.y, object.end.y) + object.size / 2;
    } else {
      return;
    }
  
    context.strokeStyle = 'red';
    context.lineWidth = 1;
    context.setLineDash([5, 5]);
    context.strokeRect(minX, minY, maxX - minX, maxY - minY);
    context.setLineDash([]);
  };
  

  const checkBoundingBoxCollision = (line, offsetX, offsetY) => {
    return (
      offsetX >= Math.min(line.start.x, line.end.x) - line.size / 2 &&
      offsetX <= Math.max(line.start.x, line.end.x) + line.size / 2 &&
      offsetY >= Math.min(line.start.y, line.end.y) - line.size / 2 &&
      offsetY <= Math.max(line.start.y, line.end.y) + line.size / 2
    );
  };

  const checkSplineCollision = (spline, offsetX, offsetY) => {
    const margin = 5;
    return spline.points.some((point) => {
      return (
        offsetX >= point.x - margin &&
        offsetX <= point.x + margin &&
        offsetY >= point.y - margin &&
        offsetY <= point.y + margin
      );
    });
  };

  const checkTextCollision = (textObject, offsetX, offsetY) => {
    const { position, width, height } = textObject;
    return (
      offsetX >= position.x &&
      offsetX <= position.x + width &&
      offsetY >= position.y - height &&
      offsetY <= position.y
    );
  };

  const checkImageCollision = (image, offsetX, offsetY) => {
    return (
      offsetX >= image.x &&
      offsetX <= image.x + image.width &&
      offsetY >= image.y &&
      offsetY <= image.y + image.height
    );
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 3;
    canvas.height = window.innerHeight * 2;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    redrawCanvas();
  }, [lines, showBoundingBoxes, isMarqueeActive, marqueeStart, marqueeEnd, combinedBoundingBox, uploadedImages]);

  useEffect(() => {
    // Close the text menu if the active tool changes
    if (activeTool !== 'text') {
      setIsTextMenuOpen(false);
    }
  }, [activeTool]);


  //Possible local storage hosting idea --Aidan

  // useEffect(() => {
  //   // Save the state to localStorage whenever lines change
  //   localStorage.setItem('whiteboardState', JSON.stringify(lines));
  // }, [lines]);

  // useEffect(() => {
  //   const savedState = localStorage.getItem('whiteboardState');
  //   if (savedState) {
  //     const { lines: savedLines, images: savedImages } = JSON.parse(savedState);
  //     setLines(savedLines || []);
  //     setUploadedImages(savedImages || []);
  //   }
  // } , []);

  // useEffect(() => {
  //   const stateToSave = { 
  //     lines, 
  //     images: uploadedImages 
  //   };
  //   localStorage.setItem('whiteboardState', JSON.stringify(stateToSave));
  // }, [lines, uploadedImages]);

  // const clearWhiteboard = () => {
  //   localStorage.removeItem('whiteboardState');
  //   setLines([]);
  //   setUploadedImages([]);
  // };


  useEffect(() => {
    // Add a keydown event listener to detect the delete key
    const handleKeyDown = (event) => {
      if (event.key === 'Delete' && selectedObjects.length > 0) {
        // Remove all selected objects from the lines state
        setLines((prevLines) => prevLines.filter(line => !selectedObjects.includes(line)));
        // Clear the selection
        setSelectedObjects([]);
        setCombinedBoundingBox(null);
      }
    };

    // Attach the event listener
    window.addEventListener('keydown', handleKeyDown);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedObjects, setLines]);

  // useEffect to clear redo stack when a new line is added after an undo
  useEffect(() => {
    if (!isUndoOrRedo) {
      // Clear the redo stack if the current action is not undo or redo
      setObjectsToRedo([]);
      console.log('New action detected, redo stack cleared');
    }
    // Reset isUndoOrRedo to false after handling
    setIsUndoOrRedo(false);
  }, [lines]);

// Handle Undo (Ctrl + Z)
useEffect(() => {
  const handleKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
      event.preventDefault(); // Prevent default browser undo behavior

      setLines((prevLines) => {
        if (prevLines.length > 0) {
          const lastObject = prevLines[prevLines.length - 1];
          
          // Add the last object to the redo stack
          setObjectsToRedo((prevRedo) => {
            if (prevRedo[0] !== lastObject) {
              // Only add the lastObject if it's not already at the top of the redo stack to prevent duplication
              return [lastObject, ...prevRedo];
            }
            return prevRedo;
          });

          console.log('Undo action:');
          console.log('lines:', prevLines.slice(0, -1));
          return prevLines.slice(0, -1);
        }
        return prevLines;
      });

      setIsUndoOrRedo(true); // Set to true to indicate that an undo action occurred
    }

    // Handle Redo (Ctrl + Y)
    if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
      event.preventDefault(); // Prevent default browser redo behavior

      setObjectsToRedo((prevRedo) => {
        if (prevRedo.length > 0) {
          const objectToRedo = prevRedo[0];
          setLines((prevLines) => {
            const updatedLines = Array.isArray(objectToRedo)
              ? [...prevLines, ...objectToRedo] // Spread if group of objects
              : [...prevLines, objectToRedo]; // Single object

            console.log('Redo action:');
            console.log('lines:', updatedLines);
            console.log('objectsToRedo:', prevRedo.slice(1));

            return updatedLines;
          });
          return prevRedo.slice(1);
        }
        return prevRedo;
      });

      setIsUndoOrRedo(true); // Set to true to indicate that a redo action occurred
    }
  };

  
    // Attach the event listener
    window.addEventListener('keydown', handleKeyDown);
  
    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setLines, setObjectsToRedo]);

  //Firestore
  useEffect(() => {
    const fetchData = async () => {
      const data = await loadWhiteboardData(whiteboardId);
      if (data) {
        setLines(data.lines || []);
        setUploadedImages(data.images || []);
      }
    };

    fetchData();
  }, [whiteboardId]);
  

  return (
    <div
      className="parent-element"
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'auto',
        position: 'relative',
      }}
    >
      
    {/* Hidden file input for image upload */}
    <input
      type="file"
      id="image-upload-input"
      accept="image/*"
      onChange={handleImageUpload}
      style={{ display: 'none' }}
    />


      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`drawing-canvas ${activeTool === 'pan' ? 'pan-cursor' : ''} ${activeTool === 'text' ? 'text-cursor' : ''}`}
      />

      {isTextMenuOpen && textMenuPosition && (
        <div
          style={{
            position: 'absolute',
            left: `${textMenuPosition.x}px`,
            top: `${textMenuPosition.y}px`,
            width: '200px',
            backgroundColor: 'white',
            padding: '10px',
            border: '1px solid black',
            borderRadius: '4px',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <TextOptions onAddText={handleAddText} selectedColor={currentColor} />
        </div>
      )}
    </div>
  );
};

export default Canvas;