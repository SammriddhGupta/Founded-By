import React from 'react';
import './Filters.css';

const Filters = ({ allCountries, filters, onChange }) => {
  const { selectedCountries, topN } = filters;

  // When a country checkbox changes, we either add or remove it from selectedCountries
  const handleCountryToggle = (country) => {
    let newCountries = [...selectedCountries];
    if (newCountries.includes(country)) {
      newCountries = newCountries.filter((c) => c !== country);
    } else {
      newCountries.push(country);
    }
    onChange({ ...filters, selectedCountries: newCountries });
  };

  // Handle topN changes (top 10, top 50, top 200, etc.)
  const handleTopNChange = (e) => {
    onChange({ ...filters, topN: Number(e.target.value) });
  };

  return (
    <div className="filters">
      <h4>Filter by Country</h4>
      {allCountries.map((country) => (
        <div key={country}>
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

      <h4>Top N Companies</h4>
      <select value={topN} onChange={handleTopNChange}>
        <option value={10}>Top 10</option>
        <option value={50}>Top 50</option>
        <option value={200}>Top 200</option>
      </select>
    </div>
  );
};

export default Filters;
