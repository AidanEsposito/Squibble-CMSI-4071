import React, { useRef } from 'react';
import './Whiteboard.css';

const Whiteboard = () => {
  const boardRef = useRef(null);

  //Allows for dragging of mouse around whiteboard
  const handleMouseDrag = (e) => {
    const board = boardRef.current;
    if (e.buttons === 1) {
      board.scrollLeft -= e.movementX;
      board.scrollTop -= e.movementY;
    }
  };

  return (
    <div className="whiteboard" ref={boardRef} onMouseMove={handleMouseDrag}>
      <div className="content">
        {/* Media items will go here with firebase */}
      </div>
    </div>
  );
};

export default Whiteboard;
