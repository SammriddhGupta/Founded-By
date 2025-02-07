import { Circle } from 'react-konva';
import { useEffect, useState } from 'react';

const CompanyIcon = ({ company, x, y, onHover, onClick, onDragEnd }) => {
  const [logo, setLogo] = useState(null);
  const [patternScale, setPatternScale] = useState({ x: 1, y: 1 });
  const [patternOffset, setPatternOffset] = useState({ x: 0, y: 0 });
  const diameter = 80; // circle diameter

  useEffect(() => {
    const img = new window.Image();
    img.src = `https://logo.clearbit.com/${company.domain}`;
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      setLogo(img);
      // Scale the image so its width equals the circle diameter.
      setPatternScale({
        x: diameter / img.width,
        y: diameter / img.height,
      });
      // Offset to center the image in the circle.
      setPatternOffset({
        x: img.width / 2,
        y: img.height / 2,
      });
    };
  }, [company.domain, diameter]);

  return (
    <Circle
      x={x}
      y={y}
      radius={40}
      draggable
      stroke="black"
      strokeWidth={2}
      fillPatternImage={logo}
      fillPatternScale={patternScale}
      fillPatternOffset={patternOffset}
      onMouseEnter={(e) => {
        const pos = e.target.getStage().getPointerPosition();
        onHover(company, pos);
      }}
      onMouseLeave={() => onHover(null, null)}
      onClick={() => onClick(company, { x, y })}
      onDragEnd={(e) => {
        const newPos = { x: e.target.x(), y: e.target.y() };
        if (onDragEnd) onDragEnd(company.id, newPos);
      }}
    />
  );
};

export default CompanyIcon;
