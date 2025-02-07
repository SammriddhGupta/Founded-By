import { Stage, Layer } from 'react-konva';
import { useCallback } from 'react';
import './Canvas.css';

const Canvas = ({ children, onWheel }) => {
  // Use full viewport dimensions.
  const width = window.innerWidth;
  const height = window.innerHeight;

  return (
    <div className="canvas-container">
      <Stage
        width={width}
        height={height}
        draggable
        onWheel={onWheel}
      >
        <Layer>{children}</Layer>
      </Stage>
    </div>
  );
};

export default Canvas;
