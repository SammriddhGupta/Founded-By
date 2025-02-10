import PropTypes from 'prop-types';
import './Tooltip.css';

const Tooltip = ({ hoveredNode }) => {
  if (!hoveredNode) return null;

  const { type, data, pos } = hoveredNode;
  const style = {
    position: 'absolute',
    top: pos.y + 1,
    left: pos.x + 1,
  };

  if (type === 'company') {
    return (
      <div className="tooltip" style={style}>
        <strong>{data.name}</strong>
        <div>Country: {data.country}</div>
        <div>Revenue: {Math.round(data.revenue).toLocaleString()}</div>
      </div>
    );
  }

  if (type === 'founder') {
    return (
      <div className="tooltip" style={style}>
        <strong>{data.name}</strong>
      </div>
    );
  }

  return null;
};

Tooltip.propTypes = {
  hoveredNode: PropTypes.shape({
    type: PropTypes.oneOf(['company', 'founder']).isRequired,
    data: PropTypes.shape({
      name: PropTypes.string.isRequired,
      country: PropTypes.string,
      revenue: PropTypes.number,
      wiki: PropTypes.string,
    }).isRequired,
    pos: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }).isRequired,
  }),
};

export default Tooltip;
