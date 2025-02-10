import { useState, useEffect, useCallback, Fragment, useMemo } from 'react';
import Canvas from './Canvas';
import CompanyIcon from './CompanyIcon';
import FounderIcon from './FounderIcon';
import Tooltip from './Tooltip';
import Filters from './Filters';
import './App.css';
import { Line } from 'react-konva';

const COMPANY_RADIUS = 200;
const FOUNDER_RADIUS = 180;

function App() {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [activeCompany, setActiveCompany] = useState(null);
  const [zoomScale, setZoomScale] = useState(0.55);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    selectedCountries: [],
    topN: 10,
  });

  // =========================================================================
  // 1) Fetch real data from Wikidata using SPARQL, including founder images

  useEffect(() => {
    async function fetchWikidataAndImages() {
      try {
        // A) Fetch from Wikidata
        const query = `
          SELECT ?company ?companyLabel ?countryLabel ?founder ?founderLabel ?founderArticle ?revenue ?domain ?founderImage
          WHERE {
            ?company wdt:P31 wd:Q4830453;
                     wdt:P17 ?country;
                     wdt:P112 ?founder;
                     wdt:P2139 ?revenue;
                     wdt:P856 ?website.
  
            BIND( REPLACE(STR(?website), "https?://(www\\\\.)?", "") as ?domainFull )
            BIND( REPLACE(?domainFull, "/.*", "") as ?domain )
  
            OPTIONAL { ?founder wdt:P18 ?founderImage. }
            OPTIONAL {
              ?founderArticle schema:about ?founder;
                              schema:isPartOf <https://en.wikipedia.org/>;
                              schema:name ?wpName.
            }
  
            SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
          }
          ORDER BY DESC(?revenue)
          LIMIT 300
        `;
  
        const res = await fetch(`http://localhost:4000/sparql?query=${encodeURIComponent(query)}`);
        const data = await res.json();
        console.log('SPARQL result from proxy:', data);
  
        const rawRows = data.results.bindings;
        const tempMap = {};
        const allFileNames = new Set();
  
        rawRows.forEach((row) => {
          const companyId = row.company.value;
          const companyName = row.companyLabel?.value || 'No name';
          const countryName = row.countryLabel?.value || 'Unknown';
          const revenue = parseFloat(row.revenue.value) || 0;
          const domain = row.domain?.value || '';
          const founderId = row.founder.value;
          const founderName = row.founderLabel?.value || 'Unknown';
          const founderWiki = row.founderArticle?.value || '';
          const p18Url = row.founderImage?.value || '';
  
          let founderImageFileName = '';
          if (p18Url) {
            // strip out the path prefix
            const afterPath = p18Url.replace(/^https?:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\//, '');
            const decoded = decodeURIComponent(afterPath);
            founderImageFileName = decoded.startsWith('File:') ? decoded : `File:${decoded}`;
            allFileNames.add(founderImageFileName);
          }
  
          if (!tempMap[companyId]) {
            tempMap[companyId] = {
              id: companyId,
              name: companyName,
              country: countryName,
              revenue: revenue,
              domain: domain,
              founders: [],
            };
          }
  
          const existingFounders = tempMap[companyId].founders;
          if (!existingFounders.some((f) => f.id === founderId)) {
            existingFounders.push({
              id: founderId,
              name: founderName,
              wiki: founderWiki,
              imageFileName: founderImageFileName,
              image: '',
            });
          }
        });
  
        let companyArray = Object.values(tempMap);
        // Sort by revenue descending
        companyArray.sort((a, b) => b.revenue - a.revenue);

        // Compute non-overlapping positions using a simple grid layout.
        const count = companyArray.length;
        // Use a grid with approximately equal number of columns and rows:
        const gridCols = Math.ceil(Math.sqrt(count));
        const gridRows = Math.ceil(count / gridCols);
        // Define a canvas area (adjust these values as needed):
        const canvasWidth = 9000;
        const canvasHeight = 9000;
        const cellWidth = canvasWidth / gridCols;
        const cellHeight = canvasHeight / gridRows;
    
        companyArray = companyArray.map((company, index) => {
          const col = index % gridCols;
          const row = Math.floor(index / gridCols);
          return {
            ...company,
            x: Math.floor(col * cellWidth + cellWidth / 2),
            y: Math.floor(row * cellHeight + cellHeight / 2)
          };
        });
  
        // B) Chunked approach to fetch thumbnail URLs from MediaWiki
        const fileNamesArray = Array.from(allFileNames);
        const fileToThumbUrl = {};
  
        async function fetchMediaWikiBatch(titlesBatch) {
          const joinedTitles = titlesBatch
            .map((f) => f.replace(/ /g, '_')) // underscores
            .join('|');
  
          const mwUrl = `https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&iiurlwidth=300&format=json&origin=*&titles=${encodeURIComponent(joinedTitles)}`;
  
          const mwRes = await fetch(mwUrl);
          const mwData = await mwRes.json();
  
          if (mwData.query && mwData.query.pages) {
            Object.values(mwData.query.pages).forEach((page) => {
              if (page.title && page.imageinfo && page.imageinfo.length > 0) {
                const title = page.title.replace(/_/g, ' ');
                const thumburl = page.imageinfo[0].thumburl || page.imageinfo[0].url;
                fileToThumbUrl[title] = thumburl;
              }
            });
          }
        }
  
        // Process 50 items at a time
        const chunkSize = 50;
        for (let i = 0; i < fileNamesArray.length; i += chunkSize) {
          const batch = fileNamesArray.slice(i, i + chunkSize);
          await fetchMediaWikiBatch(batch);
        }
  
        // Now fill in the 'image' field for each founder
        companyArray = companyArray.map((co) => {
          const newFounders = co.founders.map((f) => {
            if (f.imageFileName) {
              const maybeThumb = fileToThumbUrl[f.imageFileName];
              if (maybeThumb) {
                return { ...f, image: maybeThumb };
              }
            }
            return f;
          });
          return { ...co, founders: newFounders };
        });
  
        // Finally set state
        setCompanies(companyArray);
        setLoading(false);
      } catch (err) {
        console.error('SPARQL or MediaWiki fetch error:', err);
        setLoading(false);
      }
    }
  
    fetchWikidataAndImages();
  }, []);

  // =========================================================================
  // 2) Apply filters (topN, selectedCountries) whenever [companies, filters] changes

  // Memoize the list of countries so it doesn’t re-calc on every render
  const allCountries = useMemo(() => {
    return [...new Set(companies.map((c) => c.country))].sort();
  }, [companies]);


  useEffect(() => {
    let result = companies
    if (filters.selectedCountries.length > 0) {
      result = result.filter((c) => filters.selectedCountries.includes(c.country));
    }
    result = result.slice(0, filters.topN);
    setFilteredCompanies(result);
    console.log("Filtered companies are: " ,result)
  }, [companies, filters]);

  // =========================================================================
  // 3) Zoom & pan handling
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

  // =========================================================================
  // 4) Company click => toggle founders
  const getFounderOffsetsRadial = (count) => {
    // Define the radii and desired gap:
    const companyRadius = 200; // same as used in CompanyIcon
    const founderRadius = 180; // same as used in FounderIcon
    const gap = 150; // desired gap between the circles
    
    // Calculate the offset distance so the circles don't overlap:
    const offsetDistance = companyRadius + gap + founderRadius; // e.g. 40 + 10 + 30 = 80
    
    const angleStep = (2 * Math.PI) / count;
    return Array.from({ length: count }, (_, i) => {
      const angle = i * angleStep;
      return {
        x: offsetDistance * Math.cos(angle),
        y: offsetDistance * Math.sin(angle),
      };
    });
  };
  

  const handleClickCompany = (company) => {
    if (activeCompany && activeCompany.id === company.id) {
      setActiveCompany(null);
    } else {
      const offsets = getFounderOffsetsRadial(company.founders.length);
      setActiveCompany({ ...company, founderOffsets: offsets });
    }
  };

  // =========================================================================
  // 5) Company drag => update positions
  const updateCompanyPosition = (companyId, newPos) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === companyId ? { ...c, ...newPos } : c))
    );
    if (activeCompany && activeCompany.id === companyId) {
      setActiveCompany((prev) => ({ ...prev, ...newPos }));
    }
  };

  // =========================================================================
  // 6) Hover => unified tooltip
  const handleHoverCompany = (company, pos) => {
    if (!company || !pos) {
      setHoveredNode(null);
    } else {
      setHoveredNode({ type: 'company', data: company, pos });
    }
  };

  const handleHoverFounder = (founder, pos) => {
    if (!founder || !pos) {
      setHoveredNode(null);
    } else {
      setHoveredNode({ type: 'founder', data: founder, pos });
    }
  };

  // =========================================================================
  // 7) Filter changes
  const handleFilterChange = (newFilters) => {
    setActiveCompany(null);
    setHoveredNode(null);
    setFilters(newFilters);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>FoundedBy</h1>
        <p>
          Showing real companies from Wikidata (sorted by revenue). Click a node to see
          founder(s) with actual images from Wikidata if available.
        </p>
      </header>

      {loading && (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      )}

      <Filters
        allCountries={allCountries}
        filters={filters}
        onChange={handleFilterChange}
      />

      <Canvas onWheel={handleWheel} initialScale={zoomScale}>
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
          activeCompany.founders.map((founder, i) => {
            const offset = activeCompany.founderOffsets[i];
            // Center of founder node:
            const fx = activeCompany.x + offset.x;
            const fy = activeCompany.y + offset.y;

            // Compute vector between company and founder centers
            const dx = fx - activeCompany.x;
            const dy = fy - activeCompany.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const normalizedX = dist !== 0 ? dx / dist : 0;
            const normalizedY = dist !== 0 ? dy / dist : 0;
            
            // Line start: edge of company circle
            const startX = activeCompany.x + COMPANY_RADIUS * normalizedX;
            const startY = activeCompany.y + COMPANY_RADIUS * normalizedY;
            
            // Line end: edge of founder circle
            const endX = fx - FOUNDER_RADIUS * normalizedX;
            const endY = fy - FOUNDER_RADIUS * normalizedY;

            return (
              <Fragment key={founder.id}>
                <FounderIcon founder={founder} x={fx} y={fy} onHover={handleHoverFounder} />
                <Line
                  points={[startX, startY, endX, endY]}
                  stroke="gray"
                  strokeWidth={5}
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
