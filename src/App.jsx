import { useState, useEffect, useCallback, Fragment } from 'react';
import Canvas from './Canvas';
import CompanyIcon from './CompanyIcon';
import FounderIcon from './FounderIcon';
import Tooltip from './Tooltip';
import Filters from './Filters';
import './App.css';
import { Line } from 'react-konva';
import axios from 'axios';

function App() {
  const [companies, setCompanies] = useState([]);
  const [hoveredCompany, setHoveredCompany] = useState({ company: null, pos: null });
  const [activeCompany, setActiveCompany] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [filters, setFilters] = useState({ country: '', ranking: '' });

  // Simulate fetching companies data from a free API.
  useEffect(() => {
    // Replace the following with an actual API call (e.g., to Wikidata/SPARQL)
    setTimeout(() => {
      setCompanies([
        {
          id: '1',
          name: 'Google',
          domain: 'google.com',
          country: 'USA',
          ranking: 1,
          founders: [
            { id: 'f1', name: 'Larry Page', image: 'https://via.placeholder.com/80?text=LP' },
            { id: 'f2', name: 'Sergey Brin', image: 'https://via.placeholder.com/80?text=SB' },
          ],
          x: 250, // initial x
          y: 200, // initial y
        },
        {
          id: '2',
          name: 'Facebook',
          domain: 'facebook.com',
          country: 'USA',
          ranking: 2,
          founders: [
            { id: 'f3', name: 'Mark Zuckerberg', image: 'https://via.placeholder.com/80?text=MZ' },
          ],
          x: 500,
          y: 300,
        },
        // More companies can be fetched from a free API.
      ]);
    }, 500);
  }, []);

  // Compute available filter options.
  const countries = Array.from(new Set(companies.map(c => c.country)));
  const rankings = [10, 100, 200]; // Example thresholds.

  const filteredCompanies = companies.filter(c => {
    let match = true;
    if (filters.country) match = match && c.country === filters.country;
    if (filters.ranking) match = match && c.ranking <= Number(filters.ranking);
    return match;
  });

  // Update company's position on drag end.
  const updateCompanyPosition = (companyId, newPos) => {
    setCompanies(prev =>
      prev.map(c => (c.id === companyId ? { ...c, x: newPos.x, y: newPos.y } : c))
    );
    // If this company is active, update its stored position.
    if (activeCompany && activeCompany.id === companyId) {
      setActiveCompany(prev => ({ ...prev, x: newPos.x, y: newPos.y }));
    }
  };

  // Handle hover events.
  const handleHover = (company, pos) => {
    setHoveredCompany({ company, pos });
  };

  // Compute relative offsets for founder nodes.
  const getFounderRelativeOffsets = (n) => {
    const spacing = 100;
    return Array.from({ length: n }, (_, i) => ({
      x: spacing,
      y: (i - (n - 1) / 2) * spacing,
    }));
  };

  // Handle node click: activate a company node.
  const handleClick = (company, pos) => {
    if (activeCompany && activeCompany.id === company.id) {
      setActiveCompany(null);
    } else {
      const offsets = getFounderRelativeOffsets(company.founders.length);
      // Store the company's current x,y as the base.
      setActiveCompany({ ...company, founderOffsets: offsets });
    }
  };

  // Advanced zoom handling via wheel event.
  const handleWheel = useCallback((e) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    stage.scale({ x: newScale, y: newScale });
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    stage.batchDraw();
    setZoomScale(newScale);
  }, []);

  const handleFilterChange = (newFilter) => {
    setFilters(prev => ({ ...prev, ...newFilter }));
    setActiveCompany(null);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Infinite Canvas App</h1>
      </header>
      <Filters
        countries={countries}
        rankings={rankings}
        selectedCountry={filters.country}
        selectedRanking={filters.ranking}
        onChange={handleFilterChange}
      />
      <Canvas onWheel={handleWheel}>
        {filteredCompanies.map(company => (
          <CompanyIcon
            key={company.id}
            company={company}
            x={company.x}
            y={company.y}
            onHover={handleHover}
            onClick={handleClick}
            onDragEnd={updateCompanyPosition}
          />
        ))}
        {activeCompany &&
          activeCompany.founders &&
          activeCompany.founderOffsets &&
          activeCompany.founders.map((founder, index) => {
            const offset = activeCompany.founderOffsets[index];
            // The founder's absolute position is parent's current x,y plus the stored offset.
            const founderPos = {
              x: activeCompany.x + offset.x,
              y: activeCompany.y + offset.y,
            };
            return (
              <Fragment key={founder.id}>
                <FounderIcon founder={founder} x={founderPos.x} y={founderPos.y} />
                <Line
                  points={[activeCompany.x, activeCompany.y, founderPos.x, founderPos.y]}
                  stroke="gray"
                  strokeWidth={2}
                />
              </Fragment>
            );
          })}
      </Canvas>
      <Tooltip company={hoveredCompany.company} position={hoveredCompany.pos} />
    </div>
  );
}

export default App;
