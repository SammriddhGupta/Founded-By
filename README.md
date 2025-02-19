[![Netlify Status](https://api.netlify.com/api/v1/badges/07d8e643-f8e1-42dc-a34b-b6860a5b6053/deploy-status)](https://app.netlify.com/sites/founded-by/deploys)

# FoundedBy

**Live At:** [https://founded-by.netlify.app/](https://founded-by.netlify.app/)

FoundedBy is an innovative web application that visualizes the founders of successful companies on an infinite canvas. It allows users to explore a network of companies and their founders, interact with the nodes to reveal additional details, and even click on founder nodes to view their Wikipedia pages. 



### Motivation 💭
I decided to build this because I thought wouldn’t it be cool if you could visually discover the people behind successful companies in an engaging, interactive way?


## Tech Stack 🛠️
- React (built with Vite)
- React Konva: A React wrapper for the Konva library, which is used to render and animate the infinite canvas.
- Express: A lightweight Node.js server that serves as a proxy for SPARQL queries to Wikidata and handles API requests.
- Wikidata SPARQL API & MediaWiki API: These data sources power the app by providing real-time company and founder information.
- Placehold.co and Logo.dev: Used for company logos and as a fallback for displaying placeholder images when logos or founder images are not available.

### Features 🚀
- Infinite Canvas Visualization: Explore an expansive, interactive canvas where companies are represented as nodes and their founders appear on click.
- Interactive Nodes: Hovering over or clicking on nodes triggers smooth animations and tooltips, making the interface feel dynamic.
- Live Data Integration: Company and founder details are fetched live from Wikidata and MediaWiki APIs, and logos are obtained via Logo.dev.
- Responsive & Collapsible Filters: A collapsible filter panel allows users to narrow down results by country and company ranking.
- Direct Wikipedia Access: Clicking a founder node opens their Wikipedia page in a new tab for further exploration.

### Challenges Faced ⚠️

Oh boy the challenges never go away, some/most of these are yet to be fixed

- Data Scraping & API Limitations:
Scraping data from Wikipedia proved challenging, and the Wikidata SPARQL endpoint times out for complex queries.

    <details>

    <summary>Expand if you wanna know more about this timeout issue</summary>


    ```sql
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
    LIMIT 50
    ```

    Because this query does many things at once (fetching company details, founder details, applying BIND operations to extract the domain, and using the SERVICE wikibase:label clause to retrieve all labels), it was too heavy and kept timing out on the Wikidata endpoint.

    And for now I gave up on finding a better solution because I don't think it's very wise to try to scrape sites like Forbes etc. 

    </details>



- API Rate Limits & Data Consistency:
Ensuring data consistency and handling rate limits from free APIs (Wikidata, MediaWiki, and Logo.dev) required careful error handling and fallback strategies.

- Performance and Loading Times:
Initial loading can be slow due to the amount of data fetched and the complexity of rendering a large number of nodes on an infinite canvas.
As more nodes are rendered, performance can degrade, so implemented optimizations (like grid layouts and throttled rendering).

UI/UX Challenges:
- Creating an intuitive and interactive user interface using Konva presented its own challenges
- Experimented with collapsible query sections and dynamic zoom controls, which sometimes resulted in timeouts or lag, requiring further optimization.


### Future Improvements

- Enhanced Data Caching: To reduce loading times and API calls.
- Improved Canvas Performance: Optimizing rendering for larger datasets and smoother panning/zooming.
- Advanced Filtering and Search: More granular filters and search capabilities to help users navigate the network.
- Responsive Design Enhancements: Further tweaks to ensure the best experience on both desktop and mobile devices.
- Dark Mode & Additional Theming Options: Providing a customizable look and feel.


### Developing locally

Getting Started

1)  Clone the Repository:

```bash
git clone https://github.com/SammriddhGupta/Founded-By.git
cd foundedby
```

2) Install Dependencies:

```bash
npm install
```

3) Run the Development Server:

```bash
npm run dev
```

4) Start the Server (for API Proxy):

```bash
node server.js
```

5) Open the App:
Visit http://localhost:5173 (or your configured port) in your browser.


#### Credits
Favicon: <a href="https://www.freepik.com/icon/search_15659390#fromView=search&page=1&position=7&uuid=41ecf639-0484-4090-b8a0-f9320dc46aa0">Icon by prinda895</a> title="search icon">Favicon from - Flaticon</a>