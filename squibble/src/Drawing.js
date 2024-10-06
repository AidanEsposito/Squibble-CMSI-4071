// Drawing.js
export class Drawing {
  constructor(color, segments = []) {
    this.color = color;   // The color of the drawing
    this.segments = segments; // Line segments, each segment is an array of points [{x, y}, {x, y}]
  }

  // Merges another drawing with the same or different color into this one, combining their segments
  merge(drawing) {
    this.segments = this.segments.concat(drawing.segments);
  }

  // A helper to check if two segments overlap using a simple bounding box check
  overlaps(drawing) {
    // For simplicity, we'll use a bounding box approach to detect overlap
    for (let segment1 of this.segments) {
      for (let segment2 of drawing.segments) {
        if (this.boundingBoxOverlap(segment1, segment2)) {
          return true;
        }
      }
    }
    return false;
  }

  // Check if two bounding boxes overlap
  boundingBoxOverlap(segment1, segment2) {
    const [min1, max1] = this.getBoundingBox(segment1);
    const [min2, max2] = this.getBoundingBox(segment2);
    
    return (
      min1.x <= max2.x &&
      max1.x >= min2.x &&
      min1.y <= max2.y &&
      max1.y >= min2.y
    );
  }

  // Get the bounding box for a segment
  getBoundingBox(segment) {
    const xs = segment.map(p => p.x);
    const ys = segment.map(p => p.y);
    return [
      { x: Math.min(...xs), y: Math.min(...ys) },
      { x: Math.max(...xs), y: Math.max(...ys) }
    ];
  }
}
