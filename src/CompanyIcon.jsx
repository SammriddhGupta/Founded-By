import { Circle } from 'react-konva';
import { useEffect, useState } from 'react';

const CompanyIcon = ({ company, x, y, onHover, onClick, onDragEnd }) => {
  // Increase radius so the icon is bigger on screen
  // also change in app.jsx
  const [radius] = useState(200); // for example
  const diameter = radius * 2;

  const [logo, setLogo] = useState(null);
  const [patternScale, setPatternScale] = useState({ x: 1, y: 1 });
  const [patternOffset, setPatternOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!company.domain) return;

    const img = new window.Image();
    img.crossOrigin = 'Anonymous'; 
    img.src = `https://logo.clearbit.com/${company.domain}`;

    img.onload = () => {
      setLogo(img);

      // Compute a uniform scale so the image "contains" within the circle:
      const scale = Math.min(diameter / img.width, diameter / img.height);

      setPatternScale({ x: scale, y: scale });
      // Offset to center the image in the circle
      setPatternOffset({ x: img.width / 2, y: img.height / 2 });
    };

    // Fallback if Clearbit fails
    img.onerror = () => {
      const fallback = new window.Image();
      fallback.crossOrigin = 'Anonymous';
      fallback.src = 'https://via.placeholder.com/200?text=NO+LOGO';
      fallback.onload = () => {
        setLogo(fallback);
        const scale = Math.min(diameter / fallback.width, diameter / fallback.height);
        setPatternScale({ x: scale, y: scale });
        setPatternOffset({ x: fallback.width / 2, y: fallback.height / 2 });
      };
    };
  }, [company.domain, diameter]);

  return (
    <Circle
      x={x}
      y={y}
      radius={radius}
      draggable
      stroke="black"
      strokeWidth={2}
      fillPatternImage={logo}
      fillPatternScale={patternScale}
      fillPatternOffset={patternOffset}
      onMouseEnter={(e) => {
        const pos = e.target.getStage().getPointerPosition();
        onHover?.(company, pos);
      }}
      onMouseLeave={() => onHover?.(null, null)}
      onClick={() => onClick(company)}
      onDragEnd={(e) => {
        const newPos = { x: e.target.x(), y: e.target.y() };
        onDragEnd?.(company.id, newPos);
      }}
    />
  );
};

export default CompanyIcon;
