const Filters = ({ countries, rankings, selectedCountry, selectedRanking, onChange }) => {
    return (
      <div className="filters">
        <div>
          <label htmlFor="country-select">Country:</label>
          <select
            id="country-select"
            value={selectedCountry}
            onChange={(e) => onChange({ country: e.target.value })}
          >
            <option value="">All</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ranking-select">Ranking:</label>
          <select
            id="ranking-select"
            value={selectedRanking}
            onChange={(e) => onChange({ ranking: e.target.value })}
          >
            <option value="">All</option>
            {rankings.map((r) => (
              <option key={r} value={r}>Top {r}</option>
            ))}
          </select>
        </div>
      </div>
    );
  };
  
  export default Filters;
  