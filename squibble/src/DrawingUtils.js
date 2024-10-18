// DrawingUtils.js

export const drawLine = (context, start, end, color, size) => {
  context.strokeStyle = color;
  context.lineWidth = size;
  context.lineCap = 'round';
  context.beginPath();
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.stroke();
  context.closePath();
};

export const drawSpline = (context, spline) => {
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

export const drawText = (context, textObject) => {
  context.font = `${textObject.size}px ${textObject.font}`;
  context.fillStyle = textObject.color;
  context.fillText(textObject.text, textObject.position.x, textObject.position.y);
  const textWidth = context.measureText(textObject.text).width;
  const textHeight = textObject.size;
  textObject.width = textWidth;
  textObject.height = textHeight;
};

export const handleAddText = (textOptions) => {
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