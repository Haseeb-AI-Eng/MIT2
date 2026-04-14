# MIT Media Lab Website

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
├── public/                 # Static assets
├── index.html              # HTML template
├── vite.config.ts          # Vite configuration
├── postcss.config.mjs      # PostCSS configuration
├── tailwind.config         # Tailwind configuration
├── package.json            # Dependencies & scripts
└── README.md               # This file
```

## Getting Started

### Prerequisites

- **Node.js** >= 18.x
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

## License

This project is provided as-is for educational and demonstration purposes.
