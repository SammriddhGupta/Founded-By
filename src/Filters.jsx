import { useState } from "react";
import PropTypes from "prop-types";
import "./Filters.css";

const Filters = ({ allCountries, filters, onChange }) => {
  const { selectedCountries, topN } = filters;
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleCountryToggle = (country) => {
    let newCountries = [...selectedCountries];
    if (newCountries.includes(country)) {
      newCountries = newCountries.filter((c) => c !== country);
    } else {
      newCountries.push(country);
    }
    onChange({ ...filters, selectedCountries: newCountries });
  };

  const handleTopNChange = (e) => {
    onChange({ ...filters, topN: Number(e.target.value) });
  };

  return (
    <div className="filters">
      <div
        className="filters-header"
        onClick={toggleCollapse}
        style={{ cursor: "pointer" }}
      >
        <h4>Filters</h4>
        <span className="arrow-icon">{isCollapsed ? "►" : "▼"}</span>
      </div>
      {!isCollapsed && (
        <div className="filters-content">
          <div className="filter-section">
            <h4>Filter by Country</h4>
            {allCountries.map((country) => (
              <div key={country} className="filter-item">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedCountries.includes(country)}
                    onChange={() => handleCountryToggle(country)}
                  />
                  {country}
                </label>
              </div>
            ))}
          </div>
          <div className="filter-section">
            <h4>Top N Companies</h4>
            <select value={topN} onChange={handleTopNChange}>
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={50}>Top 50</option>
              <option value={100}>Top 100</option>
              <option value={150}>Top 150</option>
              <option value={300}>Top 300</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

Filters.propTypes = {
  allCountries: PropTypes.arrayOf(PropTypes.string).isRequired,
  filters: PropTypes.shape({
    selectedCountries: PropTypes.arrayOf(PropTypes.string).isRequired,
    topN: PropTypes.number.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default Filters;
