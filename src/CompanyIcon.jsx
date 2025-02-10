import { Circle } from 'react-konva';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Konva from 'konva';

const CompanyIcon = ({ company, x, y, onHover, onClick, onDragEnd }) => {
  // also change in app.jsx
  const [radius] = useState(200);
  const diameter = radius * 2;

  const [logo, setLogo] = useState(null);
  const [patternScale, setPatternScale] = useState({ x: 1, y: 1 });
  const [patternOffset, setPatternOffset] = useState({ x: 0, y: 0 });

  const publishableToken = import.meta.env.VITE_LOGO_DEV_PUBLISHABLE_KEY;

  useEffect(() => {
    if (!company.domain) return;

    const img = new window.Image();
    img.crossOrigin = 'Anonymous'; 
    img.src = `https://img.logo.dev/${company.domain}?token=${publishableToken}&retina=true`

    img.onload = () => {
      setLogo(img);

      // Compute a uniform scale so the image "contains" within the circle:
      const scale = Math.min(diameter / img.width, diameter / img.height);

      setPatternScale({ x: scale, y: scale });
      // Offset to center the image in the circle
      setPatternOffset({ x: img.width / 2, y: img.height / 2 });
    };

    // Fallback if logo.dev fails
    img.onerror = () => {
      const fallbackUrl = `https://placehold.co/${diameter}x${diameter}/36454F/ffffff.png?text=${encodeURIComponent(company.name)}&font=Open+Sans`;
      const fallback = new window.Image();
      fallback.crossOrigin = 'Anonymous';
      fallback.src = fallbackUrl;
      fallback.onload = () => {
        setLogo(fallback);
        const scale = Math.min(diameter / fallback.width, diameter / fallback.height);
        setPatternScale({ x: scale, y: scale });
        setPatternOffset({ x: fallback.width / 2, y: fallback.height / 2 });
      };
    };
  }, [company.domain, company.name, diameter, publishableToken]);

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
      shadowColor="black"
      shadowBlur={10}
      shadowOffset={{ x: 5, y: 5 }}
      shadowOpacity={0.2}
      onMouseEnter={(e) => {
        const shape = e.target;
        new Konva.Tween({
          node: shape,
          duration: 0.2,
          scaleX: 1.1,
          scaleY: 1.1,
          opacity: 0.9,
        }).play();
        e.target.getStage().container().style.cursor = 'pointer';
        const pos = e.target.getStage().getPointerPosition();
        onHover?.(company, pos);
      }}
      onMouseLeave={(e) => {
        const shape = e.target;
        new Konva.Tween({
          node: shape,
          duration: 0.2,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
        }).play();
        e.target.getStage().container().style.cursor = 'default';
        onHover?.(null, null)
      }}
      onClick={() => onClick(company)}
      onDragEnd={(e) => {
        const newPos = { x: e.target.x(), y: e.target.y() };
        onDragEnd?.(company.id, newPos);
      }}
    />
  );
};

CompanyIcon.propTypes = {
  company: PropTypes.shape({
    id: PropTypes.string.isRequired,
    domain: PropTypes.string,
    name: PropTypes.string,
    country: PropTypes.string,
    revenue: PropTypes.number,
  }).isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  onHover: PropTypes.func,
  onClick: PropTypes.func,
  onDragEnd: PropTypes.func,
};

export default CompanyIcon;
