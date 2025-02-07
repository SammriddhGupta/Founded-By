import { Circle } from 'react-konva';
import { useEffect, useState } from 'react';

const FounderIcon = ({ founder, x, y }) => {
  const [face, setFace] = useState(null);
  const [patternScale, setPatternScale] = useState({ x: 1, y: 1 });
  const [patternOffset, setPatternOffset] = useState({ x: 0, y: 0 });
  const diameter = 60; // founder circle diameter

  useEffect(() => {
    const img = new window.Image();
    img.src = founder.image;
    img.crossOrigin = 'Anonymous';
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
  }, [founder.image, diameter]);

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
    />
  );
};

export default FounderIcon;
