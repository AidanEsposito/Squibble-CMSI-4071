// CollisionUtils.js

export const checkBoundingBoxCollision = (line, offsetX, offsetY) => {
  return (
    offsetX >= Math.min(line.start.x, line.end.x) - line.size / 2 &&
    offsetX <= Math.max(line.start.x, line.end.x) + line.size / 2 &&
    offsetY >= Math.min(line.start.y, line.end.y) - line.size / 2 &&
    offsetY <= Math.max(line.start.y, line.end.y) + line.size / 2
  );
};

export const checkSplineCollision = (spline, offsetX, offsetY) => {
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

export const checkTextCollision = (textObject, offsetX, offsetY) => {
  const { position, width, height } = textObject;
  return (
    offsetX >= position.x &&
    offsetX <= position.x + width &&
    offsetY >= position.y - height &&
    offsetY <= position.y
  );
};
