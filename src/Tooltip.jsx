const Tooltip = ({ company, position }) => {
    if (!company || !position) return null;
    return (
      <div className="tooltip" style={{ top: position.y + 10, left: position.x + 10 }}>
        <strong>{company.name}</strong>
        <p>{company.country}</p>
      </div>
    );
  };
  
  export default Tooltip;
  