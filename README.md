# MIT Media Lab Website

<<<<<<< HEAD
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
=======
A modern, responsive website inspired by the [MIT Media Lab](https://www.media.mit.edu/) homepage. Built with React, Vite, Tailwind CSS, and React Router, it features a dynamic news grid, article detail pages, animated transitions, and a polished editorial layout.

## Features

- **Responsive news grid** — Masonry-style layout with cards of varying sizes for articles, events, and research highlights
- **Article detail pages** — Dynamic routing (`/article/:slug`) with full-length content, related articles, and smooth navigation
- **Smooth animations** — Powered by Framer Motion (`motion`) for page transitions and scroll effects
- **Sticky header** — Transparent-to-solid header on scroll with adaptive color theming
- **Persistent sidebar** — Fixed left navigation for quick access to key sections
- **Scroll-to-top on navigation** — Automatic scroll reset when navigating between pages
- **Footer** — Complete footer with social links, MIT branding, and site navigation

## Tech Stack

| Category       | Technology                              |
|----------------|-----------------------------------------|
| Framework      | React 18                                |
| Routing        | React Router DOM v7                     |
| Build Tool     | Vite 6                                  |
| Styling        | Tailwind CSS v4                         |
| Animations     | Framer Motion (motion)                  |
| Icons          | Lucide React                            |
| UI Components  | Radix UI primitives + custom components |
| Charts         | Recharts                                |
| Forms          | React Hook Form                         |
| Carousel       | Embla Carousel                          |

## Project Structure

```
project/
├── src/
│   ├── app/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── Header.tsx      # Fixed top navigation header
│   │   │   ├── Sidebar.tsx     # Fixed left sidebar navigation
│   │   │   ├── Footer.tsx      # Site footer
│   │   │   ├── NewsCard.tsx    # News/article card component
│   │   │   ├── EventCard.tsx   # Event card component
│   │   │   ├── HeroCard.tsx    # Hero/featured card component
│   │   │   ├── NewsItem.tsx    # Compact news item component
│   │   │   ├── ProjectCard.tsx # Project showcase card
│   │   │   ├── ResearchGroup.tsx # Research group component
│   │   │   ├── figma/          # Figma-generated components
│   │   │   └── ui/             # shadcn/ui base components
│   │   ├── data/
│   │   │   └── articles.ts     # Article data definitions
│   │   ├── pages/
│   │   │   ├── Home.tsx        # Homepage with news grid
│   │   │   └── ArticleDetail.tsx # Article detail view
│   │   └── App.tsx             # Root app with routing & layout
│   ├── styles/
│   │   └── index.css           # Global styles & Tailwind imports
│   └── main.tsx                # Application entry point
├── frontend/
│   ├── public/             # Static assets
│   ├── index.html          # HTML template
│   ├── vite.config.ts      # Vite configuration
│   ├── postcss.config.mjs  # PostCSS configuration
│   ├── tailwind.config     # Tailwind configuration
│   ├── package.json        # Frontend dependencies & scripts
│   └── src/                # React app source files
├── backend/
│   └── package.json        # Backend dependencies & scripts
└── README.md               # This file
```
>>>>>>> 471c3bdcb0025b35bd8e026b5312943bec485459

## Getting Started

### Prerequisites

- **Node.js** >= 18.x
<<<<<<< HEAD
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
- Start the REST API on `http://localhost:4000` by default
- Schedule auto-re-scraping every 6 hours

If you need to run the backend on a different port (for example when forwarding with ngrok), set `PORT` before starting:

```bash
PORT=5000 npm start
```

### 2. Start the Frontend

```bash
cd frontend
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
=======
- **npm** or **pnpm**

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start the dev server (http://localhost:5173)
npm run dev
```

### Production Build

```bash
# Build for production
npm run build

# Preview the production build locally
npm run preview   # (if available) or serve the dist/ folder
```

## Available Scripts

| Command          | Description                        |
|------------------|------------------------------------|
| `npm run dev`    | Start the Vite development server  |
| `npm run build`  | Build the app for production       |

## Routing

| Route                  | Description                    |
|------------------------|--------------------------------|
| `/`                    | Homepage with full news grid   |
| `/article/:slug`       | Individual article detail page |

The `ScrollToTop` component ensures the page scrolls to the top on every route change.

## Customization

### Adding New Articles

Edit the `articles` array in `src/app/App.tsx` (or the dedicated `src/app/data/articles.ts` if extracted). Each article should include:

```ts
{
  id: number,
  slug: string,          // URL-friendly identifier (e.g. "my-new-article")
  title: string,
  image: string,         // Image URL
  category: string,      // e.g. "Research", "News", "Event"
  shortDescription: string,
}
```

### Modifying the Layout

- **Header** — `src/app/components/Header.tsx`
- **Sidebar** — `src/app/components/Sidebar.tsx`
- **Footer** — `src/app/components/Footer.tsx` or the inline footer in `App.tsx`
- **News Cards** — `src/app/components/NewsCard.tsx`

### Theme & Styling

The project uses **Tailwind CSS v4** with the `@tailwindcss/vite` plugin. Global styles are defined in `src/styles/index.css`. Modify utility classes directly in components or add custom CSS there.
>>>>>>> 471c3bdcb0025b35bd8e026b5312943bec485459

## License

This project is provided as-is for educational and demonstration purposes.
