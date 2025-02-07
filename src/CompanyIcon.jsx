import { Circle } from 'react-konva';
import { useEffect, useState } from 'react';

const CompanyIcon = ({ company, x, y, onHover, onClick, onDragEnd }) => {
  const [logo, setLogo] = useState(null);
  const [patternScale, setPatternScale] = useState({ x: 1, y: 1 });
  const [patternOffset, setPatternOffset] = useState({ x: 0, y: 0 });
  const diameter = 80;

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';

    // Attempt to load from Clearbit
    img.src = `https://logo.clearbit.com/${company.domain}`;

    img.onload = () => {
      setLogo(img);
      setPatternScale({
        x: diameter / img.width,
        y: diameter / img.height,
      });
      setPatternOffset({
        x: img.width / 2,
        y: img.height / 2,
      });
    };

    // Fallback if Clearbit doesn't have a logo
    img.onerror = () => {
      const fallback = new window.Image();
      fallback.crossOrigin = 'Anonymous';
      fallback.src = 'https://via.placeholder.com/80?text=NO+LOGO';
      fallback.onload = () => {
        setLogo(fallback);
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
      onClick={() => onClick(company)}
      onDragEnd={(e) => {
        const newPos = { x: e.target.x(), y: e.target.y() };
        if (onDragEnd) onDragEnd(company.id, newPos);
      }}
    />
  );
};

export default CompanyIcon;
