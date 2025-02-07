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
  // MASTER LIST of all fetched companies
  const [companies, setCompanies] = useState([]);

  // We unify the tooltip so it can show either a company or a founder
  // hoveredNode = { type: 'company' | 'founder', data: <object>, pos: {x, y} }
  const [hoveredNode, setHoveredNode] = useState(null);

  // activeCompany: the company whose founder nodes we’re showing
  const [activeCompany, setActiveCompany] = useState(null);

  // We might track zoom scale, though we’re not necessarily using it in the UI
  const [zoomScale, setZoomScale] = useState(1);

  // Our filters now hold an array of selectedCountries + a numeric topN
  const [filters, setFilters] = useState({
    selectedCountries: [],
    topN: 10, // default to top 10
  });

  // ====== Mock data fetching for demonstration ======
  useEffect(() => {
    // Replace the following with an actual API call (SPARQL, DBpedia, etc.)
    // For now, just use setTimeout to simulate fetching
    setTimeout(() => {
      setCompanies([
        {
          id: '1',
          name: 'Google',
          domain: 'google.com',
          country: 'USA',
          ranking: 1,
          founders: [
            {
              id: 'f1',
              name: 'Larry Page',
              image: 'https://via.placeholder.com/80?text=LP',
              wiki: 'https://en.wikipedia.org/wiki/Larry_Page',
            },
            {
              id: 'f2',
              name: 'Sergey Brin',
              image: 'https://via.placeholder.com/80?text=SB',
              wiki: 'https://en.wikipedia.org/wiki/Sergey_Brin',
            },
          ],
          x: 250,
          y: 200,
        },
        {
          id: '2',
          name: 'Facebook',
          domain: 'facebook.com',
          country: 'USA',
          ranking: 2,
          founders: [
            {
              id: 'f3',
              name: 'Mark Zuckerberg',
              image: 'https://via.placeholder.com/80?text=MZ',
              wiki: 'https://en.wikipedia.org/wiki/Mark_Zuckerberg',
            },
          ],
          x: 500,
          y: 300,
        },
        {
          id: '3',
          name: 'Infosys',
          domain: 'infosys.com',
          country: 'India',
          ranking: 50,
          founders: [
            {
              id: 'f4',
              name: 'N. R. Narayana Murthy',
              image: 'https://via.placeholder.com/80?text=NM',
              wiki: 'https://en.wikipedia.org/wiki/N._R._Narayana_Murthy',
            },
          ],
          x: 800,
          y: 400,
        },
        // Add more to test
      ]);
    }, 500);
  }, []);

  // ====== Utility: get unique countries for filters ======
  const allCountries = Array.from(new Set(companies.map((c) => c.country)));

  // ====== Filtering logic ======
  // 1. Sort companies by ranking ascending
  let filteredCompanies = [...companies].sort((a, b) => a.ranking - b.ranking);
  // 2. Slice topN
  filteredCompanies = filteredCompanies.slice(0, filters.topN);
  // 3. Filter by selected countries if any are checked
  if (filters.selectedCountries.length > 0) {
    filteredCompanies = filteredCompanies.filter((c) =>
      filters.selectedCountries.includes(c.country)
    );
  }

  // ====== Founder layout: radial around the company node ======
  const getFounderOffsetsRadial = (n) => {
    const radius = 100; // distance from company node
    const angleStep = (2 * Math.PI) / n;
    return Array.from({ length: n }, (_, i) => {
      const angle = i * angleStep;
      return {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
      };
    });
  };

  // ====== Handle node clicking ======
  const handleClickCompany = (company) => {
    if (activeCompany && activeCompany.id === company.id) {
      // clicking the same company node again collapses
      setActiveCompany(null);
    } else {
      const offsets = getFounderOffsetsRadial(company.founders.length);
      setActiveCompany({ ...company, founderOffsets: offsets });
    }
  };

  // ====== Drag updates ======
  const updateCompanyPosition = (companyId, newPos) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === companyId ? { ...c, x: newPos.x, y: newPos.y } : c))
    );
    // If this company is active, update it as well
    if (activeCompany && activeCompany.id === companyId) {
      setActiveCompany((prev) => ({
        ...prev,
        x: newPos.x,
        y: newPos.y,
      }));
    }
  };

  // ====== Hover handling ======
  const handleHoverCompany = (company, pos) => {
    if (!company || !pos) {
      setHoveredNode(null);
    } else {
      setHoveredNode({
        type: 'company',
        data: company,
        pos,
      });
    }
  };

  const handleHoverFounder = (founder, pos) => {
    if (!founder || !pos) {
      setHoveredNode(null);
    } else {
      setHoveredNode({
        type: 'founder',
        data: founder,
        pos,
      });
    }
  };

  // ====== Zoom & pan ======
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
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    stage.scale({ x: newScale, y: newScale });
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    stage.batchDraw();
    setZoomScale(newScale);
  }, []);

  // ====== Filter change handler ======
  const handleFilterChange = (newFilters) => {
    setActiveCompany(null);
    setHoveredNode(null);
    setFilters(newFilters);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>FoundedBy (Infinite Canvas)</h1>
      </header>
      <Filters
        allCountries={allCountries}
        filters={filters}
        onChange={handleFilterChange}
      />
      <Canvas onWheel={handleWheel}>
        {filteredCompanies.map((company) => (
          <CompanyIcon
            key={company.id}
            company={company}
            x={company.x}
            y={company.y}
            onHover={handleHoverCompany}
            onClick={handleClickCompany}
            onDragEnd={updateCompanyPosition}
          />
        ))}
        {activeCompany &&
          activeCompany.founders &&
          activeCompany.founderOffsets &&
          activeCompany.founders.map((founder, index) => {
            const offset = activeCompany.founderOffsets[index];
            const founderPos = {
              x: activeCompany.x + offset.x,
              y: activeCompany.y + offset.y,
            };
            return (
              <Fragment key={founder.id}>
                <FounderIcon
                  founder={founder}
                  x={founderPos.x}
                  y={founderPos.y}
                  onHover={handleHoverFounder}
                />
                <Line
                  points={[activeCompany.x, activeCompany.y, founderPos.x, founderPos.y]}
                  stroke="gray"
                  strokeWidth={2}
                />
              </Fragment>
            );
          })}
      </Canvas>
      <Tooltip hoveredNode={hoveredNode} />
    </div>
  );
}

export default App;
