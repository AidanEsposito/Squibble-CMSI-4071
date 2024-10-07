import React, { useRef, useEffect, useState } from 'react';

const Canvas = ({ currentColor, brushSize, activeTool, lines, setLines, showBoundingBoxes }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [previousPosition, setPreviousPosition] = useState(null);
  const [recentLines, setRecentLines] = useState([]);

  // Handle mouse down event for drawing or erasing
  const handleMouseDown = (e) => {
    if (activeTool === 'pen') {
      setIsDrawing(true);
      const { offsetX, offsetY } = e.nativeEvent;
      setPreviousPosition({ x: offsetX, y: offsetY });
      setRecentLines([]); // Start fresh for the new drawing session
    } else if (activeTool === 'eraser') {
      setIsErasing(true);
      handleErase(e);
    }
  };

  // Handle mouse up event to stop drawing or erasing
  const handleMouseUp = () => {
    setIsDrawing(false);
    setPreviousPosition(null);
    setIsErasing(false);
  
    if (recentLines.length > 2) {
      // Approximate recent lines with a spline
      const splineCurve = approximateSpline(recentLines);
      setLines((prevLines) => [...prevLines, splineCurve]);
    }
  
    setRecentLines([]); // Clear recent lines after creating the curve
  };
  

  // Handle mouse movement for drawing, panning, and erasing
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (activeTool === 'pan' && e.buttons === 1) {
      // Handle panning
      const board = canvas.parentElement;
      board.scrollLeft -= e.movementX;
      board.scrollTop -= e.movementY;

    } else if (activeTool === 'pen' && isDrawing) {
      const { offsetX, offsetY } = e.nativeEvent;
      const currentPosition = { x: offsetX, y: offsetY };
  
      if (previousPosition) {
        drawLine(context, previousPosition, currentPosition, currentColor, brushSize);
        setRecentLines((prevRecentLines) => [...prevRecentLines, currentPosition]);
        setPreviousPosition(currentPosition);
      }
    } else if (activeTool === 'eraser' && isErasing) {
      handleErase(e);
    }
  };
  

  // Draw a line between two points on the canvas (done every frame pen is held down)
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
  

  // Handle erasing by clicking on a bounding box
  const handleErase = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
  
    // Filter out lines and splines that are hit by the eraser
    setLines((prevLines) =>
      prevLines.filter((line) => {
        if (line.type === 'spline') {
          return !checkSplineCollision(line, offsetX, offsetY);
        } else {
          return !checkBoundingBoxCollision(line, offsetX, offsetY);
        }
      })
    );
    redrawCanvas();
  };
  

  // Redraw the entire canvas with the remaining lines, including bounding boxes for debugging
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  
    lines.forEach((line) => {
      if (line.type === 'spline') {
        drawSpline(context, line);
      } else {
        drawLine(context, line.start, line.end, line.color, line.size);
      }
  
      if (showBoundingBoxes) {
        drawBoundingBox(context, line);
      }
    });
  };
  
  // Function to draw a Catmull-Rom spline
  const drawSpline = (context, spline) => {
    const { points, color, size } = spline;
  
    context.strokeStyle = color;
    context.lineWidth = size;
    context.lineCap = 'round';
  
    if (points.length < 2) return;
  
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
  
    // Draw Catmull-Rom spline segments
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
  

  // Draw bounding box around a line (for debugging)
  const drawBoundingBox = (context, line) => {
    if (line.type === 'spline') {
      // Calculate the bounding box for a spline
      const minX = Math.min(...line.points.map(point => point.x)) - line.size / 2;
      const minY = Math.min(...line.points.map(point => point.y)) - line.size / 2;
      const maxX = Math.max(...line.points.map(point => point.x)) + line.size / 2;
      const maxY = Math.max(...line.points.map(point => point.y)) + line.size / 2;
  
      context.strokeStyle = 'red';
      context.lineWidth = 1;
      context.setLineDash([5, 5]); // Dashed line for bounding box
      context.strokeRect(minX, minY, maxX - minX, maxY - minY);
      context.setLineDash([]); // Reset line dash
    } else {
      // Calculate the bounding box for a regular line
      const minX = Math.min(line.start.x, line.end.x) - line.size / 2;
      const minY = Math.min(line.start.y, line.end.y) - line.size / 2;
      const maxX = Math.max(line.start.x, line.end.x) + line.size / 2;
      const maxY = Math.max(line.start.y, line.end.y) + line.size / 2;
  
      context.strokeStyle = 'red';
      context.lineWidth = 1;
      context.setLineDash([5, 5]); // Dashed line for bounding box
      context.strokeRect(minX, minY, maxX - minX, maxY - minY);
      context.setLineDash([]); // Reset line dash
    }
  };
  

  const checkBoundingBoxCollision = (line, offsetX, offsetY) => { //probably will be reused for marquee selection functionality
    return (
      offsetX >= Math.min(line.start.x, line.end.x) - line.size / 2 &&
      offsetX <= Math.max(line.start.x, line.end.x) + line.size / 2 &&
      offsetY >= Math.min(line.start.y, line.end.y) - line.size / 2 &&
      offsetY <= Math.max(line.start.y, line.end.y) + line.size / 2
    );
  };

  const checkSplineCollision = (spline, offsetX, offsetY) => {
    const margin = 5; // Define a margin of error for the eraser "hit" area
  
    return spline.points.some((point) => {
      return (
        offsetX >= point.x - margin &&
        offsetX <= point.x + margin &&
        offsetY >= point.y - margin &&
        offsetY <= point.y + margin
      );
    });
  };
  

// const distance = (point1, point2) => {
//   return Math.sqrt(
//     Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
//   );
// };

// const mergeLines = (lineA, lineB) => {
//   // Calculate distances between all possible combinations of start and end points
//   const distances = {
//     startAtoStartB: distance(lineA.start, lineB.start),
//     startAtoEndB: distance(lineA.start, lineB.end),
//     endAtoStartB: distance(lineA.end, lineB.start),
//     endAtoEndB: distance(lineA.end, lineB.end),
//   };

//   // Find the minimum distance between endpoints
//   const minDistance = Math.min(
//     distances.startAtoStartB,
//     distances.startAtoEndB,
//     distances.endAtoStartB,
//     distances.endAtoEndB
//   );

//   // Concatenate lines based on the closest points
//   if (minDistance === distances.startAtoStartB) {
//     // Reverse lineB to concatenate the start of lineA to the start of lineB
//     return {
//       start: lineA.end,
//       end: lineB.end,
//       color: lineA.color,
//       size: Math.max(lineA.size, lineB.size),
//     };
//   } else if (minDistance === distances.startAtoEndB) {
//     // Attach the start of lineA to the end of lineB
//     return {
//       start: lineA.end,
//       end: lineB.start,
//       color: lineA.color,
//       size: Math.max(lineA.size, lineB.size),
//     };
//   } else if (minDistance === distances.endAtoStartB) {
//     // Attach the end of lineA to the start of lineB
//     return {
//       start: lineA.start,
//       end: lineB.end,
//       color: lineA.color,
//       size: Math.max(lineA.size, lineB.size),
//     };
//   } else if (minDistance === distances.endAtoEndB) {
//     // Reverse lineB to concatenate the end of lineA to the end of lineB
//     return {
//       start: lineA.start,
//       end: lineB.start,
//       color: lineA.color,
//       size: Math.max(lineA.size, lineB.size),
//     };
//   }
// }; 
  
  // const mergeOverlappingBoundingBoxes = () => {
  //   let mergedLines = [...lines];
  
  //   for (let i = 0; i < mergedLines.length; i++) {
  //     for (let j = i + 1; j < mergedLines.length; j++) {
  //       // Check if bounding boxes of line[i] and line[j] overlap
  //       if (checkBoundingBoxOverlap(mergedLines[i], mergedLines[j])) {
  //         // Merge the two lines into one and create a union of their bounding boxes
  //         const mergedLine = mergeLines(mergedLines[i], mergedLines[j]);
  
  //         // Replace the two lines with the merged line
  //         mergedLines[i] = mergedLine;
  //         mergedLines.splice(j, 1); // Remove the merged line
  //         j--; // Decrement j to check the new merged line against the rest
  //       }
  //     }
  //   }
  
  //   setLines(mergedLines); // Update the lines with the merged ones
  // };

  // const checkBoundingBoxOverlap = (lineA, lineB) => {
  //   const margin = 2; // 2-pixel margin for overlap detection
  
  //   const boxA = {
  //     minX: Math.min(lineA.start.x, lineA.end.x) - lineA.size / 2 - margin,
  //     minY: Math.min(lineA.start.y, lineA.end.y) - lineA.size / 2 - margin,
  //     maxX: Math.max(lineA.start.x, lineA.end.x) + lineA.size / 2 + margin,
  //     maxY: Math.max(lineA.start.y, lineA.end.y) + lineA.size / 2 + margin,
  //   };
  
  //   const boxB = {
  //     minX: Math.min(lineB.start.x, lineB.end.x) - lineB.size / 2 - margin,
  //     minY: Math.min(lineB.start.y, lineB.end.y) - lineB.size / 2 - margin,
  //     maxX: Math.max(lineB.start.x, lineB.end.x) + lineB.size / 2 + margin,
  //     maxY: Math.max(lineB.start.y, lineB.end.y) + lineB.size / 2 + margin,
  //   };
  
  //   // Check if boxes A and B overlap
  //   return (
  //     boxA.minX <= boxB.maxX &&
  //     boxA.maxX >= boxB.minX &&
  //     boxA.minY <= boxB.maxY &&
  //     boxA.maxY >= boxB.minY
  //   );
  // };  

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
  }, [lines, showBoundingBoxes]);

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      className={`drawing-canvas ${activeTool === 'pan' ? 'pan-cursor' : ''}`} //allows panning hand to animate when panning around
    />
  );
};

export default Canvas;
