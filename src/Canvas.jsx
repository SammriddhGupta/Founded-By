import { Stage, Layer } from 'react-konva';
import PropTypes from 'prop-types';
import './Canvas.css';

const Canvas = ({ children, onWheel, initialScale = 1 }) => {
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
        scale={{ x: initialScale, y: initialScale }}
      >
        <Layer>{children}</Layer>
      </Stage>
    </div>
  );
};

Canvas.propTypes = {
  children: PropTypes.node.isRequired,
  onWheel: PropTypes.func,
  initialScale: PropTypes.number,
};

export default Canvas;
