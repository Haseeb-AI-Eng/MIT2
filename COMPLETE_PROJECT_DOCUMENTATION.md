# MIT Media Lab Website - Complete Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Database Architecture](#database-architecture)
5. [Backend Architecture](#backend-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [API Endpoints](#api-endpoints)
8. [Authentication & Authorization](#authentication--authorization)
9. [Setup & Installation](#setup--installation)
10. [Deployment](#deployment)

---

## 🎯 Project Overview

The MIT Media Lab Website is a modern, full-stack web application that showcases MIT Media Lab's research, projects, news articles, and opportunities. It features a responsive interface, dynamic content management, and an admin dashboard for managing submissions and announcements.

### Key Features:
- **Dynamic News Grid** — Masonry-style layout displaying articles with varying sizes
- **Article Detail Pages** — Full-length articles with related content suggestions
- **Project Showcase** — Display research projects with filtering and search capabilities
- **Admin Dashboard** — Manage applications, submissions, and announcements
- **Authentication** — Admin login/signup with JWT-based security
- **Responsive Design** — Mobile-first approach with smooth animations
- **Search Functionality** — Full-text search across articles and projects
- **Application Forms** — Users can submit applications for programs
- **Sticky Navigation** — Fixed header with transparent-to-solid transitions

---

## 🛠️ Technology Stack

### Frontend
| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | React | 18.3.1 |
| **Build Tool** | Vite | 6.3.5 |
| **Routing** | React Router DOM | 7.14.0 |
| **Styling** | Tailwind CSS | 4.1.12 |
| **Animations** | Framer Motion (motion) | 12.23.24 |
| **UI Components** | Radix UI Primitives | Latest |
| **Component Library** | shadcn/ui | Custom |
| **Icons** | Lucide React | 0.487.0 |
| **Forms** | React Hook Form | 7.55.0 |
| **Data Fetching** | Fetch API (native) | - |
| **Carousel** | Embla Carousel React | 8.6.0 |
| **Charts** | Recharts | 2.15.2 |
| **Toasts** | Sonner | 2.0.3 |
| **Theme** | next-themes | 0.4.6 |
| **HTTP Client** | (Fetch API) | - |

### Backend
| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | Express.js | 4.19.0 |
| **Runtime** | Node.js | Latest |
| **Database** | MongoDB | 6.8.0 (Atlas Cloud) |
| **Authentication** | JWT (jsonwebtoken) | 9.0.2 |
| **Password Hashing** | bcryptjs | 2.4.3 |
| **HTTP Client** | Axios | 1.7.0 |
| **CORS** | cors | 2.8.5 |
| **Email** | Nodemailer | 6.9.4 |
| **SMS/Voice** | Twilio | 5.3.4 |
| **Web Scraping** | Cheerio | 1.0.0 |
| **RSS Parser** | rss-parser | 3.13.0 |
| **Job Scheduling** | node-cron | 3.0.3 |
| **Environment** | dotenv | 16.6.1 |
| **Compression** | gzip (native) | - |

### DevOps & Deployment
| Layer | Technology |
|-------|-----------|
| **Package Manager** | pnpm (Monorepo) |
| **Monorepo Structure** | pnpm workspaces |
| **Hosting** | Replit (Backend) / Vercel (Frontend) |
| **Database Hosting** | MongoDB Atlas Cloud |
| **Version Control** | Git |

---

## 📂 Project Structure

### Root Level (`MIT2/`)
```
MIT2/
├── package.json              # Monorepo root config
├── pnpm-workspace.yaml       # pnpm workspaces definition
├── README.md                 # Project documentation
├── QUICK_START.md           # Quick start guide
├── seed.js                  # Database seeding script
├── frontend/                # React frontend application
├── backend/                 # Express.js backend server
└── guidelines/              # Project guidelines
```

### Frontend Structure (`frontend/src/`)
```
frontend/
├── package.json                      # Frontend dependencies
├── vite.config.ts                   # Vite build configuration
├── postcss.config.mjs               # PostCSS configuration
├── vercel.json                      # Vercel deployment config
├── index.html                       # HTML entry point
├── .env.development                 # Development environment variables
├── public/                          # Static assets (images, icons)
└── src/
    ├── main.tsx                     # React DOM render entry
    ├── app/
    │   ├── App.tsx                  # Root routing component
    │   ├── ScrollToTop.jsx          # Route change scroll handler
    │   ├── api.ts                   # API client configuration & functions
    │   ├── components/
    │   │   ├── Header.tsx           # Fixed top navigation
    │   │   ├── Sidebar.tsx          # Fixed left sidebar
    │   │   ├── NavSidebar.tsx       # Mobile navigation sidebar
    │   │   ├── Footer.tsx           # Site footer
    │   │   ├── NewsCard.tsx         # Article card component
    │   │   ├── EventCard.tsx        # Event card component
    │   │   ├── HeroCard.tsx         # Hero/featured card
    │   │   ├── NewsItem.tsx         # Compact news item
    │   │   ├── ProjectCard.tsx      # Project showcase card
    │   │   ├── ResearchCard.tsx     # Research highlight card
    │   │   ├── ResearchGroup.tsx    # Research group container
    │   │   ├── SearchPanel.tsx      # Search interface (Ctrl+K)
    │   │   ├── ProtectedRoute.tsx   # Auth guard wrapper
    │   │   ├── ImageWithFallback.tsx # Figma generated
    │   │   └── ui/                  # shadcn/ui components
    │   │       ├── accordion.tsx
    │   │       ├── alert.tsx
    │   │       ├── button.tsx
    │   │       ├── card.tsx
    │   │       ├── checkbox.tsx
    │   │       ├── dialog.tsx
    │   │       ├── dropdown-menu.tsx
    │   │       ├── form.tsx
    │   │       ├── input.tsx
    │   │       ├── label.tsx
    │   │       ├── select.tsx
    │   │       ├── sheet.tsx
    │   │       ├── sidebar.tsx
    │   │       ├── skeleton.tsx
    │   │       ├── sonner.tsx (toast notifications)
    │   │       └── ... (30+ shadcn components)
    │   ├── data/
    │   │   ├── articles.ts          # Static article data
    │   │   └── researchProjects.ts  # Static project data
    │   ├── pages/
    │   │   ├── Home.tsx             # Homepage with news grid
    │   │   ├── About.tsx            # About page
    │   │   ├── Research.tsx         # Research showcase
    │   │   ├── Projects.tsx         # Projects listing
    │   │   ├── ProjectDetail.tsx    # Individual project page
    │   │   ├── ArticleDetail.tsx    # Individual article page
    │   │   ├── Foundations.tsx      # Foundations page
    │   │   ├── People.tsx           # Team/people page
    │   │   ├── MASGraduateProgram.tsx # Program details
    │   │   ├── AlumniFriends.tsx    # Alumni section
    │   │   ├── SupportMediaLab.tsx  # Support/donate page
    │   │   ├── Apply.tsx            # Application form
    │   │   ├── AddResearchProject.tsx # Add project form
    │   │   ├── AdminLogin.tsx       # Admin login
    │   │   ├── AdminSignup.tsx      # Admin registration
    │   │   ├── AdminDashboard.tsx   # Admin control panel
    │   │   └── LeadConfirm.tsx      # Lead confirmation page
    │   └── assets/                  # Images, icons, etc.
    ├── hooks/
    │   └── useKeepAlive.ts          # Backend ping hook (prevents sleep)
    ├── imports/                     # Re-export utilities
    └── styles/
        ├── index.css                # Global styles
        ├── fonts.css                # Custom fonts
        ├── theme.css                # Theme definitions
        ├── tailwind.css             # Tailwind configuration
        └── default_shadcn_theme.css # shadcn theme
```

### Backend Structure (`backend/`)
```
backend/
├── package.json                     # Backend dependencies
├── server.js                        # Main Express server & API routes
├── scraper.js                       # Web scraper for news.mit.edu
├── .env                             # Backend environment variables
└── (no separate route files — all routes in server.js)
```

---

## 💾 Database Architecture

### MongoDB Setup
- **Provider**: MongoDB Atlas Cloud
- **Database Name**: `research`
- **Connection**: `mongodb+srv://hima21517_db_user:...@mitdb.xrxuxql.mongodb.net/?appName=MITDB`

### Collections & Schema

#### 1. **users** Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (bcrypt hashed),
  name: String,
  role: String (enum: ['admin', 'researcher', 'student']),
  createdAt: Date,
  updatedAt: Date
}

// Indexes:
- email: 1 (unique)
```

**Purpose**: Store user accounts and admin authentication

---

#### 2. **projects** Collection
```javascript
{
  _id: ObjectId,
  title: String,
  slug: String (unique),
  description: String,
  content: String,
  category: String,
  tags: [String],
  status: String (enum: ['draft', 'review', 'published']),
  featured: Boolean,
  author: ObjectId (reference to users),
  imageUrl: String,
  viewCount: Number,
  createdAt: Date,
  updatedAt: Date
}

// Indexes:
- slug: 1 (unique, sparse)
- title, description, tags: text (full-text search)
- status: 1, createdAt: -1
- featured: 1, status: 1, createdAt: -1
```

**Purpose**: Store research projects and showcases

---

#### 3. **articles** Collection
```javascript
{
  _id: ObjectId,
  title: String,
  slug: String (unique),
  description: String,
  content: String,
  category: String,
  tags: [String],
  source: String (e.g., 'news.mit.edu'),
  sourceUrl: String,
  author: String,
  imageUrl: String,
  viewCount: Number,
  published: Boolean,
  createdAt: Date,
  updatedAt: Date,
  scrapedAt: Date
}

// Indexes:
- slug: 1 (unique, sparse)
- title, description, content, category: text (full-text search)
```

**Purpose**: Store news articles (auto-scraped from news.mit.edu every 6 hours)

---

#### 4. **project_members** Collection
```javascript
{
  _id: ObjectId,
  projectId: ObjectId (reference to projects),
  userId: ObjectId (reference to users),
  role: String (e.g., 'lead', 'contributor'),
  joinedAt: Date
}

// Indexes:
- projectId: 1
- userId: 1
```

**Purpose**: Track many-to-many relationship between projects and members

---

#### 5. **form_submissions** Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  phone: String,
  universityId: String,
  university: String,
  program: String,
  additionalInfo: String,
  status: String (enum: ['new', 'reviewing', 'contacted', 'accepted', 'rejected']),
  createdAt: Date,
  updatedAt: Date,
  reviewedBy: ObjectId (reference to users, optional)
}

// Indexes:
- createdAt: -1
- email: 1 (unique)
```

**Purpose**: Store user application submissions for programs

---

#### 6. **labs** Collection
```javascript
{
  _id: ObjectId,
  name: String (unique),
  slug: String,
  description: String,
  director: String,
  imageUrl: String,
  createdAt: Date
}

// Indexes:
- name: 1 (unique)
```

**Purpose**: Store information about MIT Media Lab subdivisions

---

#### 7. **tags** Collection
```javascript
{
  _id: ObjectId,
  name: String (unique),
  count: Number,
  createdAt: Date
}

// Indexes:
- name: 1 (unique)
```

**Purpose**: Manage tags used across projects and articles

---

#### 8. **announcements** Collection
```javascript
{
  _id: ObjectId,
  title: String,
  content: String,
  author: ObjectId (reference to users),
  published: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Purpose**: Store admin announcements and news

---

#### 9. **project_views** Collection
```javascript
{
  _id: ObjectId,
  projectId: ObjectId (reference to projects),
  ipAddress: String,
  deviceFingerprint: String,
  viewedAt: Date
}

// Indexes:
- projectId: 1
- projectId: 1, ipAddress: 1, deviceFingerprint: 1 (unique)
- viewedAt: 1 (expires after 90 days)
```

**Purpose**: Track project views for analytics (with auto-expiration)

---

## 🖥️ Backend Architecture

### Express.js Server (`backend/server.js`)

#### Core Features:
1. **CORS Middleware** — Enabled for cross-origin requests from frontend
2. **Gzip Compression** — Response compression for faster data transfer
3. **Request Limits** — 100MB limit for JSON and URL-encoded payloads
4. **Caching Layer** — In-memory cache (5-minute TTL) for articles and projects
5. **JWT Authentication** — Secure token-based auth for admin routes
6. **MongoDB Connection** — Atlas cloud database with collection indexing

#### Environment Variables:
```bash
PORT=4000                           # Server port (or 8080 on Replit)
MONGO_URI=mongodb+srv://...         # MongoDB connection string
DB_NAME=research                    # Database name
JWT_SECRET=supersecretkey_change_me # JWT signing secret
REPLIT_DOMAIN=...                   # For Replit deployment
API_BASE_URL=http://localhost:4000  # API base URL (auto-detected)
```

### Key Endpoints

#### Articles
- `GET /api/articles/latest?limit=20` — Fetch latest articles with caching
- `GET /api/articles/:slug` — Get single article by slug
- `POST /api/articles` — Create article (admin only)
- `PUT /api/articles/:id` — Update article (admin only)
- `DELETE /api/articles/:id` — Delete article (admin only)
- `POST /api/articles/refresh` — Manual trigger for web scraper
- `GET /api/articles/search?q=query` — Full-text search articles

#### Projects
- `GET /api/projects` — List all published projects
- `GET /api/projects/featured` — List featured projects only
- `GET /api/projects/:id` — Get project details
- `POST /api/projects` — Create project (admin only)
- `PUT /api/projects/:id` — Update project (admin only)
- `DELETE /api/projects/:id` — Delete project (admin only)
- `GET /api/projects/:id/views` — Get project view count

#### Form Submissions
- `POST /api/submissions` — Submit application form (public)
- `GET /api/submissions` — List submissions (admin only)
- `PUT /api/submissions/:id` — Update submission status (admin only)
- `DELETE /api/submissions/:id` — Delete submission (admin only)
- `GET /api/submissions/stats` — Get submission statistics

#### Authentication
- `POST /api/auth/signup` — Create admin account
- `POST /api/auth/login` — Admin login (returns JWT token)
- `POST /api/auth/logout` — Logout (client-side token removal)
- `GET /api/auth/me` — Get current user info (protected)

#### Admin Dashboard
- `GET /api/dashboard/stats` — Overall statistics
- `GET /api/dashboard/submissions/overview` — Submission breakdown
- `GET /api/dashboard/projects/trending` — Trending projects
- `GET /api/dashboard/articles/trending` — Trending articles

#### Web Scraper
- `POST /api/scraper/refresh` — Manually trigger news.mit.edu scraper
- `GET /api/scraper/status` — Get scraper status and last run time
- Automatic runs every 6 hours via node-cron

### Server Initialization Flow

```
1. Load environment variables (.env)
2. Set DNS servers for reliable resolution
3. Create Express app with middleware
4. Connect to MongoDB
5. Create database collections & indexes
6. Setup Cron job (runs scraper every 6 hours)
7. Start Express server on specified PORT
8. Keep-alive ping endpoint (prevents Replit sleep)
```

---

## 🎨 Frontend Architecture

### React Application Structure

#### Component Hierarchy
```
App (Root)
├── ScrollToTop (monitors route changes)
├── NavSidebar (mobile navigation)
└── Routes
    ├── Layout (with Header, Sidebar, Footer)
    │   ├── Home
    │   ├── Research
    │   ├── Projects
    │   ├── About
    │   ├── Foundations
    │   ├── People
    │   ├── MASGraduateProgram
    │   ├── AlumniFriends
    │   ├── SupportMediaLab
    │   ├── AddResearchProject
    │   ├── Apply
    │   └── ...
    ├── LayoutNoSidebar (detail pages)
    │   ├── ArticleDetail (/article/:id)
    │   └── ProjectDetail (/projects/:id)
    └── Auth Routes (no layout)
        ├── AdminLogin
        ├── AdminSignup
        └── AdminDashboard (protected)
```

#### API Client Configuration (`src/app/api.ts`)
```typescript
const API_BASE = 'https://production-url/api'
    or
    'http://localhost:4000/api' (dev)

// Key functions:
- fetchLatestArticles(limit) → fetch articles from backend
- fetchArticleBySlug(slug) → get specific article
- clientCacheGet/Set() → in-memory caching (5 min TTL)
- fetchWithTimeout() → fetch with 15s timeout
```

#### Client-Side Caching
- **TTL**: 5 minutes
- **Scope**: Articles, projects, user data
- **Purpose**: Reduce API calls, improve performance
- **Invalidation**: Manual via `clientCacheInvalidate(prefix)`

#### Keep-Alive Hook (`src/hooks/useKeepAlive.ts`)
```typescript
// Pings backend every 5 minutes to keep Railway deployment awake
// Prevents cold start delays
```

### Styling Architecture

1. **Tailwind CSS v4** — Utility-first CSS framework
2. **Theme System** — `theme.css` with CSS custom properties
3. **Custom Fonts** — `fonts.css` with @font-face
4. **Global Styles** — `index.css` for resets and base styles
5. **shadcn/ui Theme** — `default_shadcn_theme.css`
6. **Dark Mode** — via next-themes provider

### Component Features

#### Header
- Fixed top navigation with logo
- Sticky background (transparent → solid on scroll)
- Responsive hamburger menu
- Search trigger (Ctrl+K)
- Navigation links to main sections

#### Sidebar
- Fixed left navigation
- Persistent across pages
- Quick links to key sections
- Mobile-responsive (hidden on small screens)

#### SearchPanel
- Modal search interface
- Keyboard shortcut: Ctrl+K
- Full-text search across articles & projects
- Instant results display

#### Cards
- **NewsCard** — Article showcase (variable sizes)
- **ProjectCard** — Project showcase
- **EventCard** — Event information
- **HeroCard** — Featured/highlighted content
- Masonry grid layout with Framer Motion

#### Forms
- **Apply Form** — Application submissions (public)
- **Add Research Project** — Project creation (admin)
- React Hook Form with validation
- Toast notifications on submit

#### Navigation
- React Router v7 for client-side routing
- Dynamic route parameters (`:id`, `:slug`)
- Protected routes for admin pages
- Scroll-to-top on navigation

---

## 🔐 Authentication & Authorization

### Admin Authentication Flow

#### Signup (First Time)
1. User fills registration form (`/admin/signup`)
2. Password hashed with bcryptjs
3. User document created in MongoDB
4. **First user automatically gets 'admin' role**
5. Subsequent users get 'student' role

#### Login
1. User enters email and password (`/admin/login`)
2. Backend validates credentials
3. JWT token generated (signed with `JWT_SECRET`)
4. Token stored in `localStorage` (client-side)
5. Redirect to admin dashboard

#### Protected Routes
- `ProtectedRoute` component checks for valid JWT
- Token extracted from `localStorage`
- If invalid/missing → redirect to login
- Used for: Admin Dashboard, create/edit pages

#### JWT Token Structure
```javascript
{
  userId: ObjectId,
  email: String,
  role: String,
  iat: Timestamp,
  exp: Timestamp (24 hours from issue)
}
```

#### Roles & Permissions
| Role | Permissions |
|------|------------|
| admin | Full access (CRUD all resources, manage users) |
| researcher | Create/edit own projects, view submissions |
| student | Submit applications only |

---

## 📊 API Endpoints Reference

### Public Endpoints (No Authentication)
```
GET  /api/articles/latest              # Get latest articles
GET  /api/articles/:slug               # Get article details
GET  /api/articles/search?q=...        # Search articles

GET  /api/projects                     # List all projects
GET  /api/projects/:id                 # Get project details
GET  /api/projects/featured            # Get featured projects

POST /api/submissions                  # Submit application

GET  /api/labs                         # List labs/divisions
GET  /api/announcements                # Get announcements
```

### Protected Endpoints (Admin Only)
```
POST   /api/articles                   # Create article
PUT    /api/articles/:id               # Update article
DELETE /api/articles/:id               # Delete article

POST   /api/projects                   # Create project
PUT    /api/projects/:id               # Update project
DELETE /api/projects/:id               # Delete project

GET    /api/submissions                # List submissions
PUT    /api/submissions/:id            # Update submission
DELETE /api/submissions/:id            # Delete submission
GET    /api/submissions/stats          # Get stats

POST   /api/announcements              # Create announcement
PUT    /api/announcements/:id          # Update announcement
DELETE /api/announcements/:id          # Delete announcement
```

### Authentication Endpoints
```
POST /api/auth/signup                  # Register admin
POST /api/auth/login                   # Login admin
POST /api/auth/logout                  # Logout
GET  /api/auth/me                      # Get current user
```

---

## ⚙️ Setup & Installation

### Prerequisites
- **Node.js** 18+ and npm/pnpm
- **MongoDB** (Atlas cloud account)
- **Git** for version control
- **Environment variables** configured

### Step 1: Install Dependencies
```bash
# Navigate to project root
cd MIT2

# Install using pnpm (monorepo package manager)
pnpm install

# This installs dependencies for both frontend and backend
```

### Step 2: Configure Environment Variables

#### Backend (`backend/.env`)
```bash
PORT=4000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/?appName=MITDB
DB_NAME=research
JWT_SECRET=your_secret_key_here
NODE_ENV=development

# Optional for email/SMS
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
```

#### Frontend (`frontend/.env.development`)
```bash
VITE_API_URL=http://localhost:4000/api
# Or for production:
# VITE_API_URL=https://your-backend-domain.com/api
```

### Step 3: Start Development Servers

#### Terminal 1 - Backend
```bash
cd backend
pnpm dev
# Runs on http://localhost:4000
```

#### Terminal 2 - Frontend
```bash
cd frontend
pnpm dev
# Runs on http://localhost:5173
```

### Step 4: Verify Setup
1. Open browser: `http://localhost:5173`
2. Check backend: `http://localhost:4000/api/articles/latest`
3. Try admin signup: `http://localhost:5173/admin/signup`

---

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect Vercel to Repo**
   - Go to vercel.com
   - Create new project from Git
   - Select GitHub repository
   - Configure build settings:
     - Build Command: `pnpm build`
     - Output Directory: `dist`
     - Root Directory: `frontend`

3. **Environment Variables**
   - Set `VITE_API_URL` to production backend URL

4. **Deploy**
   ```bash
   vercel deploy --prod
   ```

### Backend Deployment (Replit / Railway / Heroku)

#### Option 1: Replit
1. Create Replit project from GitHub
2. Set environment variables
3. Run command: `pnpm --dir backend dev`
4. Replit generates public URL

#### Option 2: Railway
1. Connect GitHub repo
2. Create new project
3. Add MongoDB addon
4. Set environment variables
5. Deploy automatically on push

#### Option 3: Heroku (Legacy)
```bash
heroku create your-app-name
git push heroku main
heroku config:set MONGO_URI=...
```

### Database Setup (MongoDB Atlas)

1. Create Atlas account
2. Create cluster
3. Add database user with credentials
4. Whitelist IP addresses
5. Get connection string
6. Set `MONGO_URI` in backend .env

### Build Commands

```bash
# Build frontend
pnpm build

# Start backend production
pnpm start:backend

# Build backend (if needed)
cd backend && npm run build
```

---

## 📝 Environment Variables Summary

### Backend (.env)
| Variable | Purpose | Example |
|----------|---------|---------|
| `PORT` | Server port | `4000` |
| `MONGO_URI` | MongoDB connection | `mongodb+srv://...` |
| `DB_NAME` | Database name | `research` |
| `JWT_SECRET` | JWT signing key | `supersecretkey` |
| `NODE_ENV` | Environment | `development` or `production` |
| `API_BASE_URL` | Public API URL | `https://api.example.com` |

### Frontend (.env.development)
| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:4000/api` |

---

## 🔄 Cron Jobs & Scheduled Tasks

### Web Scraper (Every 6 Hours)
- **Function**: `startCronJob()` in `backend/scraper.js`
- **Task**: Scrapes news.mit.edu for new articles
- **Storage**: Saves to `articles` collection
- **Frequency**: 0 */6 * * * (every 6 hours)
- **Manual Trigger**: `POST /api/articles/refresh`

### Project View Expiration (Automatic)
- **Collection**: `project_views`
- **TTL Index**: 90 days (7,776,000 seconds)
- **Auto-cleanup**: MongoDB deletes old records

---

## 📱 Responsive Design Breakpoints

### Tailwind CSS Breakpoints
```
sm   640px   (Mobile)
md   768px   (Tablet)
lg   1024px  (Desktop)
xl   1280px  (Large Desktop)
2xl  1536px  (Extra Large)
```

### Mobile-First Strategy
- Base styles for mobile
- `md:` and `lg:` prefixes for larger screens
- Hamburger menu on mobile (< md)
- Full sidebar on desktop (≥ md)

---

## 🎯 Key Features by Page

| Page | Route | Features |
|------|-------|----------|
| Home | `/` | News grid, featured articles, projects showcase |
| About | `/about` | Team info, mission statement |
| Research | `/research` | Research areas, active projects |
| Projects | `/projects` | Project listing, filtering, search |
| Project Detail | `/projects/:id` | Full project details, related projects |
| Articles | `/article/:id` | Full article, related articles |
| Foundations | `/foundations` | MIT foundations info |
| People | `/people` | Team members directory |
| MAS Program | `/mas-graduate-program` | Program details, apply button |
| Apply | `/apply` | Application form submission |
| Admin Login | `/admin/login` | Admin authentication |
| Admin Signup | `/admin/signup` | Admin registration |
| Admin Dashboard | `/admin/dashboard` | Submissions management, statistics |

---

## 🔗 Key Data Flows

### Article Display Flow
```
Frontend (Home) 
  → useEffect() calls fetchLatestArticles()
  → api.ts checks clientCache
  → If cached → return cached data
  → If not → fetch from /api/articles/latest
  → Backend returns articles with 5-min cache
  → Frontend renders NewsCard components
  → Masonry layout with Framer Motion
```

### Form Submission Flow
```
User fills Apply form
  → React Hook Form validation
  → POST /api/submissions
  → Backend validates & saves to MongoDB
  → Returns success response
  → Frontend shows toast notification
  → Data persists in form_submissions collection
  → Admin can review in dashboard
```

### Admin Authentication Flow
```
User @ /admin/signup
  → Fills registration form
  → POST /api/auth/signup
  → Backend hashes password (bcryptjs)
  → Creates user in DB (first user = admin)
  → Returns JWT token
  → Frontend saves token to localStorage
  → Redirect to /admin/dashboard
  → Dashboard wrapped in ProtectedRoute (checks JWT)
```

---

## 🐛 Common Issues & Troubleshooting

### 1. Backend Won't Connect to MongoDB
- Verify `MONGO_URI` in `.env`
- Check IP whitelist in MongoDB Atlas
- Verify database exists and is named correctly

### 2. Frontend Can't Reach Backend
- Check backend is running on correct port
- Verify `VITE_API_URL` in `.env.development`
- Check CORS is enabled in Express

### 3. Admin Login Not Working
- Verify JWT_SECRET matches in .env
- Check user credentials in MongoDB
- Clear localStorage and retry

### 4. Search Not Finding Results
- Verify full-text indexes created in MongoDB
- Check article titles/descriptions are populated
- Try simpler search terms

### 5. Scraper Not Running
- Verify node-cron schedule in `scraper.js`
- Check news.mit.edu is accessible
- Monitor backend logs for errors

---

## 📚 Additional Resources

### Documentation
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Manual](https://docs.mongodb.com)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [Radix UI](https://www.radix-ui.com)

### File References
- Quick start: [QUICK_START.md](./QUICK_START.md)
- Guidelines: [guidelines/Guidelines.md](./guidelines/Guidelines.md)
- Frontend README: [frontend/README.md](./frontend/README.md)

---

## 📞 Support & Contact

For questions or issues:
1. Check this documentation
2. Review error logs in browser console / backend terminal
3. Check MongoDB Atlas dashboard for database status
4. Review GitHub issues if project is public

---

**Last Updated**: May 2026
**Version**: 1.0.0
**Stack**: MERN (MongoDB, Express, React, Node.js)
