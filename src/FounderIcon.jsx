import { Circle } from 'react-konva';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const FounderIcon = ({ founder, x, y, onHover }) => {
  // Define a larger radius for a bigger icon
  // also change in app.jsx
  const radius = 180;
  const diameter = radius * 2;

  const [face, setFace] = useState(null);
  const [patternScale, setPatternScale] = useState({ x: 1, y: 1 });
  const [patternOffset, setPatternOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const imgUrl = founder.image;
    if (!imgUrl) return;

    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.src = imgUrl;

    img.onload = () => {
      setFace(img);
      // Compute the uniform scale factor so the image "contains" inside the circle
      const scale = Math.min(diameter / img.width, diameter / img.height);
      setPatternScale({ x: scale, y: scale });
      // Center the image by offsetting it by half its original dimensions
      setPatternOffset({ x: img.width / 2, y: img.height / 2 });
    };

    // Fallback: if the image fails to load, use a placeholder
    img.onerror = () => {
      const fallback = new window.Image();
      fallback.crossOrigin = 'Anonymous';
      fallback.src = `https://via.placeholder.com/${diameter}?text=${encodeURIComponent(founder.name)}`;
      fallback.onload = () => {
        setFace(fallback);
        const scale = Math.min(diameter / fallback.width, diameter / fallback.height);
        setPatternScale({ x: scale, y: scale });
        setPatternOffset({ x: fallback.width / 2, y: fallback.height / 2 });
      };
    };
  }, [founder.image, diameter, founder.name]);

  return (
    <Circle
      x={x}
      y={y}
      radius={radius}
      stroke="blue"
      strokeWidth={2}
      fillPatternImage={face}
      fillPatternScale={patternScale}
      fillPatternOffset={patternOffset}
      onMouseEnter={(e) => {
        if (onHover) {
          const pos = e.target.getStage().getPointerPosition();
          onHover(founder, pos);
        }
      }}
      onMouseLeave={() => {
        if (onHover) onHover(null, null);
      }}
      onClick={() => {
        if (founder.wiki) {
          window.open(founder.wiki, '_blank');
        }
      }}
    />
  );
};

FounderIcon.propTypes = {
  founder: PropTypes.shape({
    name: PropTypes.string.isRequired,
    wiki: PropTypes.string,
    image: PropTypes.string,
  }).isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  onHover: PropTypes.func,
};


export default FounderIcon;
