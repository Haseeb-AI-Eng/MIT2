# MIT Media Lab Website

A live, auto-updating news aggregator for MIT Media Lab articles. Scrapes [news.mit.edu](https://news.mit.edu) in real-time, stores articles in MongoDB, and serves them via a REST API to a React frontend.

## Features

- **Live scraping** — Fetches articles from MIT News topic pages (Media Lab, AI, robotics, health, design, etc.)
- **MongoDB storage** — All scraped articles persisted in `MITnews.mitn` collection
- **Auto-refresh** — Re-scrapes every 6 hours via cron job; manual trigger via API
- **Full-text search** — Search across titles, descriptions, categories, and full article content
- **Responsive news grid** — Masonry-style layout with cards of varying sizes
- **Article detail pages** — Dynamic routing (`/article/:slug`) with full content and related articles
- **Smooth animations** — Framer Motion for page transitions and scroll effects
- **Sticky header** — Transparent-to-solid header with slide-out search panel (`Ctrl+K`)

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Frontend   │────▶│   Backend    │────▶│   MongoDB   │
│  (React)    │     │  (Express)   │     │  (MITnews)  │
│  :5173      │     │  :4000       │     │  mitn coll. │
└─────────────┘     └─────────────┘     ─────────────┘
                           │
                    ┌──────▼───────┐
                    │   Scraper    │
                    │ (Cheerio)    │
                    └─────────────┘
                           │
                    ┌──────▼───────┐
                    │ news.mit.edu │
                    └──────────────┘
```

## Tech Stack

| Layer        | Technology                              |
|-------------|-----------------------------------------|
| Frontend    | React 18, React Router DOM v7            |
| Backend     | Express.js, Axios, Cheerio               |
| Database    | MongoDB (`MITnews` → `mitn`)             |
| Build       | Vite 6                                   |
| Styling     | Tailwind CSS v4                          |
| Animations  | Framer Motion                            |
| Scheduling  | node-cron (every 6 hours)                |
| Icons       | Lucide React                             |

## Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **MongoDB** running locally on `mongodb://localhost:27017`

### 1. Start the Backend

```bash
cd backend
npm install
npm start
```

The backend will:
- Connect to MongoDB at `mongodb://localhost:27017`
- Run an **initial scrape** if the database is empty (~50+ articles)
- Start the REST API on `http://localhost:4000`
- Schedule auto-re-scraping every 6 hours

### 2. Start the Frontend

```bash
# From project root
npm install
npm run dev
```

Open **http://localhost:5173** — the Vite proxy forwards `/api` requests to the backend.

### Manual Scrape Trigger

```bash
curl -X POST http://localhost:4000/api/scrape
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/articles/latest?limit=20` | GET | Latest articles for home page |
| `/api/articles/:slug` | GET | Single article by slug |
| `/api/articles/:slug/related` | GET | Related articles (same category) |
| `/api/search?q=keyword` | GET | Full-text search (title, description, content) |
| `/api/scrape` | POST | Trigger manual re-scrape (returns immediately, runs in background) |
| `/api/stats` | GET | Database stats: total articles, categories, last scraped time |
| `/api/health` | GET | Health check |

## Project Structure

```
project/
├── backend/
│   ├── server.js          # Express API server + routes
│   ├── scraper.js         # MIT News scraper (Cheerio + Axios)
│   └── package.json       # Backend dependencies
├── src/
│   ├── app/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── Header.tsx       # Fixed header + search button
│   │   │   ├── Sidebar.tsx      # Fixed left navigation
│   │   │   ├── SearchPanel.tsx  # Slide-out search panel
│   │   │   ├── NewsCard.tsx     # Article card component
│   │   │   └── EventCard.tsx    # Event card component
│   │   ├── pages/
│   │   │   ├── Home.tsx         # Home page (latest articles grid)
│   │   │   └── ArticleDetail.tsx # Article detail view
│   │   ├── api.ts         # Frontend API client
│   │   └── App.tsx        # Root app with routing + layout
│   ├── styles/
│   │   └── index.css
│   └── main.tsx
├── public/
├── vite.config.ts         # Vite config + /api proxy
├── package.json           # Frontend dependencies
└── README.md              # This file
```

## Routing

| Route              | Description                    |
|--------------------|--------------------------------|
| `/`                | Homepage — latest 20 scraped articles |
| `/article/:slug`   | Individual article detail page |

## How Scraping Works

1. **Listing pages** — Fetches article links from MIT News topic pages:
   - `/clp/media-lab`, `/clp/computational-science`, `/clp/health`
   - `/clp/robotics`, `/clp/artificial-intelligence`, `/clp/design`
   - `/topic/machine-learning`, `/topic/sustainability`, `/topic/startups`

2. **Article pages** — Visits each article URL and extracts:
   - Title, date, description, hero image, category
   - Full article body paragraphs
   - Source URL for attribution

3. **Deduplication** — Checks if slug already exists before inserting

4. **Rate limiting** — 1 second delay between article page requests

## Customization

### Add New Scrape Sources

Edit `backend/scraper.js` → `LIST_URLS` array to add more MIT News topic pages.

### Change Scrape Interval

Edit `backend/scraper.js` → `startCronJob()` function. Default: every 6 hours.

### Database Connection

Edit `MONGO_URI`, `DB_NAME`, and `COLLECTION_NAME` in `backend/server.js` and `backend/scraper.js`.

## License

This project is provided as-is for educational and demonstration purposes.
