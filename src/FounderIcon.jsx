import { Circle } from 'react-konva';
import { useEffect, useState } from 'react';

const FounderIcon = ({ founder, x, y, onHover }) => {
  const [face, setFace] = useState(null);
  const [patternScale, setPatternScale] = useState({ x: 1, y: 1 });
  const [patternOffset, setPatternOffset] = useState({ x: 0, y: 0 });
  const diameter = 60;

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.src = founder.image;

    img.onload = () => {
      setFace(img);
      setPatternScale({
        x: diameter / img.width,
        y: diameter / img.height,
      });
      setPatternOffset({
        x: img.width / 2,
        y: img.height / 2,
      });
    };

    // Fallback if founder image fails
    img.onerror = () => {
      const fallback = new window.Image();
      fallback.crossOrigin = 'Anonymous';
      fallback.src = 'https://via.placeholder.com/60?text=Founder';
      fallback.onload = () => {
        setFace(fallback);
        setPatternScale({
          x: diameter / fallback.width,
          y: diameter / fallback.height,
        });
        setPatternOffset({
          x: fallback.width / 2,
          y: fallback.height / 2,
        });
      };
    };
  }, [founder.image]);

  return (
    <Circle
      x={x}
      y={y}
      radius={30}
      stroke="blue"
      strokeWidth={2}
      fillPatternImage={face}
      fillPatternScale={patternScale}
      fillPatternOffset={patternOffset}
      onMouseEnter={(e) => {
        const pos = e.target.getStage().getPointerPosition();
        if (onHover) onHover(founder, pos);
      }}
      onMouseLeave={() => {
        if (onHover) onHover(null, null);
      }}
    />
  );
};

export default FounderIcon;
