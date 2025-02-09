import './Tooltip.css';

const Tooltip = ({ hoveredNode }) => {
  if (!hoveredNode) return null;

  const { type, data, pos } = hoveredNode;
  const style = {
    position: 'absolute',
    top: pos.y + 10,
    left: pos.x + 10,
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
        {data.wiki && (
          <p>
            <a href={data.wiki} target="_blank" rel="noopener noreferrer">
              Wikipedia
            </a>
          </p>
        )}
      </div>
    );
  }

  return null;
};

export default Tooltip;
