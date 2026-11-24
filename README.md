# FinNews AI: Financial News Intelligence with Evolving Memory

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.110+-009688.svg?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_19-61DAFB.svg?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Bundler-Vite_8-646CFF.svg?style=flat-square&logo=vite)](https://vitejs.dev)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini_3.5_Flash-4285F4.svg?style=flat-square&logo=google)](https://ai.google.dev)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_16-336791.svg?style=flat-square&logo=postgresql)](https://www.postgresql.org)
[![Firecrawl](https://img.shields.io/badge/Web_Scraper-Firecrawl_v4-FF4F00.svg?style=flat-square)](https://firecrawl.dev)
[![Memento](https://img.shields.io/badge/Memory_Store-Memento_Memory-8A2BE2.svg?style=flat-square)](https://github.com)

**FinNews AI** is an institutional-grade financial intelligence engine designed for equity research analysts, portfolio managers, and market strategists. While conventional market dashboards simply regurgitate the latest news articles in an endless feed, FinNews AI answers the fundamental analyst question: **"What has changed since I last looked?"**

By pairing high-precision web news crawling with an evolving **Memento knowledge graph** and **Google Gemini 3.5 Flash**, FinNews AI extracts discrete events, tracks recurring themes, highlights strategic shifts over time, and preserves institutional memory across runs.

---

## Visual Showcase

### 1. Executive Intelligence Dashboard
The primary command center displays aggregate watchlist statistics, market postures (Bullish / Bearish / Risk), quick search, and active company intelligence cards highlighting the latest **Memory Shift** delta.

![FinNews AI Dashboard](screenshots/dashboard.png)

---

### 2. Deep-Dive Company Dossier & "What Changed" Analysis
Each tracked entity features an executive intelligence dossier. The system explicitly isolates the **Memory Shift** delta—contrasting current developments against previous knowledge base states.

![Company Overview & Memory Shift](screenshots/company_overview.png)

---

### 3. Evolving Institutional Knowledge Base (Memento Graph)
FinNews AI maintains a structured entity relationship and fact graph in SQLite-vec. Every new scrape and analyst note contributes new nodes, updating entity statuses, leadership roles, and regulatory concerns.

![Institutional Knowledge Base](screenshots/memory_panel.png)

---

### 4. Historical Trajectory, Sentiment Trend & Analyst Notes
Analysts can inspect historical runs, observe multi-period sentiment transitions (Neutral &rarr; Bullish), review primary journalistic sources, and record persistent analyst notes that feed directly back into future memory recall.

![Historical Timeline & Analyst Notes](screenshots/timeline_and_notes.png)

---

## Core Value Proposition & Key Features

### 1. Evolving Institutional Memory
- **Graph & Vector Memory**: Employs `memento-memory[gemini]` paired with a custom `gemini-embedding-001` embedder (384-dimensional, L2-normalized) stored in SQLite-vec (`memento.db`).
- **Contextual Recall**: When an analysis runs, the pipeline scopes historical facts, entity relationships, and notes for that specific company before analyzing incoming news.
- **Continuous Learning**: Discoveries from new analyses and manual analyst notes are queued asynchronously into the memory store.

### 2. High-Precision Financial News Ingestion (Firecrawl)
- **Zero Hallucination Noise**: Direct full-text journalistic scraping via Firecrawl Python SDK.
- **Strict Blacklists & Quality Guardrails**: Automatically filters out social noise (X/Twitter, Reddit, TikTok, LinkedIn) and high-frequency stock quote/ticker landing pages (Yahoo Finance quotes, TradingView, Screener, CNBC tickers).
- **Parallel Fetching**: Executes concurrent search and multi-threaded article extractions to optimize latency.

### 3. "What Changed Since Last Time" (Core USP)
- Rather than presenting isolated summaries, the LLM prompt injects historical memory side-by-side with fresh articles.
- The system generates an explicit **delta explanation**—highlighting what transitioned (e.g., leadership handoffs, regulatory shift from pricing probes to growth execution).

### 4. Deterministic Multi-Faceted Extraction
- **Sentiment Classification**: Strictly categorized into `positive`, `neutral`, or `negative`.
- **Risk Assessment**: Graded as `low`, `medium`, or `high`.
- **Discrete Key Events**: Granular items with concrete impact analysis and direct source attribution links.
- **Recurring Themes**: Long-term structural trends identified across multiple reporting cycles.

### 5. Interactive Analyst Collaboration & Notes
- Analysts can append notes directly to any company dossier (e.g., *"Watch deposit pricing probe outcome and CEO succession"*).
- Notes are instantly embedded and committed to the Memento knowledge base, directly conditioning future Gemini analyses.

### 6. Modern Glassmorphism Interface
- Dark-mode terminal-inspired financial aesthetics built with **React 19**, **Vite**, and **Lucide React**.
- Responsive data visualizations using **Recharts** for historical sentiment trajectory.

---

## Architectural Workflow

The following sequence diagram details the end-to-end data pipeline:

```mermaid
sequenceDiagram
    autonumber
    actor Analyst as Equity Analyst
    participant UI as React 19 Frontend
    participant API as FastAPI Backend
    participant DB as PostgreSQL
    participant FC as Firecrawl Service
    participant Mem as Memento Memory
    participant LLM as Gemini 3.5 Flash

    Analyst->>UI: Trigger Analysis / Add Company
    UI->>API: POST /api/analyze {watchlist_id}
    
    rect rgb(24, 32, 47)
        note over API,Mem: Concurrent Scrape & Memory Recall
        par News Crawling
            API->>FC: Scrape journalistic financial news (filtered)
            FC-->>API: Scraped & parsed article contents
        and Memory Recall
            API->>Mem: Recall scoped entity graph & analyst notes
            Mem-->>API: Recalled facts, relations & prior insights
        end
    end

    rect rgb(30, 41, 59)
        note over API,LLM: Structured Synthesis
        API->>LLM: Generate intelligence (Prompt: Articles + Recalled Memory)
        LLM-->>API: Validated JSON (Summary, Sentiment, Risk, What Changed, Events)
    end

    rect rgb(15, 23, 42)
        note over API,DB: Persistence & Memory Growth
        API->>DB: Store Analysis, Articles & Metadata
        API->>Mem: Asynchronously ingest newly extracted entities & facts
    end

    API-->>UI: Return fresh Analysis object
    UI-->>Analyst: Render updated dossier, sentiment chart & memory diff
```

---

## Tech Stack Deep Dive

| Layer | Technology | Purpose & Implementation Details |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19** | Dynamic Single Page Application using concurrent mode and modern hook architecture. |
| **Build Tool** | **Vite 8** | Lightning-fast HMR and optimized production bundling. |
| **Routing** | **React Router v7** | Client-side routing between Dashboard (`/`) and Company Detail (`/company/:id`). |
| **Data Visualization** | **Recharts** | Interactive SVG sentiment progression and historical timeline rendering. |
| **UI & Icons** | **Lucide React** | Clean, consistent icons for financial telemetry and navigation. |
| **Styling** | **Custom CSS3** | High-contrast dark glassmorphism system with CSS variables and responsive grid layouts. |
| **HTTP Client** | **Axios** | REST client with automated fallback support for mock data in testing environments. |
| **Backend Framework** | **FastAPI** | High-performance asynchronous Python API framework with automatic OpenAPI docs. |
| **ASGI Server** | **Uvicorn** | ASGI server with multi-worker production capabilities. |
| **Relational Database** | **PostgreSQL** | Primary persistent store for Watchlists, Scraped Articles, Analyses, and Analyst Notes. |
| **ORM & Migrations** | **SQLAlchemy 2.0** | Declarative ORM models with cascading relationships and connection pooling. |
| **LLM & AI Engine** | **Google Gemini 3.5 Flash** | High-speed, structured JSON generation utilizing strict Pydantic response schemas. |
| **AI SDK** | **`google-genai` (v1.0+)** | Official Google GenAI Python SDK with `types.GenerateContentConfig`. |
| **Embeddings** | **`gemini-embedding-001`** | 384-dimensional, L2-normalized embeddings for vector semantic search. |
| **Memory Store** | **`memento-memory[gemini]`** | Persistent SQLite-vec knowledge graph storing entity relationships and factual nodes. |
| **Web Crawling** | **Firecrawl (`firecrawl-py`)** | Robust web scraping engine with content quality validation and domain exclusion lists. |

---

## Project Directory Structure

```text
finnews-ai/
├── README.md                      # Primary project documentation & architecture guide
├── screenshots/                   # High-resolution application screenshots
│   ├── dashboard.png
│   ├── dashboard_full.png
│   ├── company_overview.png
│   ├── company_detail_full.png
│   ├── memory_panel.png
│   └── timeline_and_notes.png
│
├── backend/                       # FastAPI Backend Service
│   ├── requirements.txt           # Python backend dependencies
│   ├── .env.example               # Backend environment variable template
│   ├── data/                      # Local SQLite-vec Memento storage (memento.db)
│   ├── scripts/                   # Integration and verification test suites
│   │   ├── run_live_analyze.py    # Standalone script to test live analysis execution
│   │   ├── smoke_test.py          # End-to-end integration check for DB, Gemini & Firecrawl
│   │   ├── test_api.py            # API endpoint integration test suite
│   │   └── test_pipeline_mock.py  # Mocked pipeline tests for offline validation
│   └── app/
│       ├── main.py                # FastAPI entry point, lifespan, CORS, and routers
│       ├── config.py              # Centralized Pydantic application settings
│       ├── db.py                  # SQLAlchemy engine, session maker, Base declarative
│       ├── models.py              # PostgreSQL database models (Watchlist, Article, etc.)
│       ├── schemas.py             # Pydantic schemas for request/response validation
│       ├── prompts.py             # System prompt and delta comparison prompt builders
│       ├── routers/               # Modular API endpoint handlers
│       │   ├── health.py          # Health check endpoint (/api/health)
│       │   ├── watchlist.py       # Watchlist CRUD & nested queries (/api/watchlist)
│       │   ├── analyze.py         # Intelligence pipeline trigger (/api/analyze)
│       │   ├── history.py         # Analysis history queries (/api/history)
│       │   └── notes.py           # Analyst notes CRUD (/api/notes)
│       └── services/              # Core business and external integration logic
│           ├── pipeline.py        # Central intelligence orchestrator
│           ├── firecrawl_service.py # News search, domain filtering, and parallel scraping
│           ├── memory_service.py  # Memento configuration and GeminiEmbedder
│           ├── memory_ingestion.py# Background asynchronous memory ingestion
│           └── llm_service.py     # Gemini client with structured JSON parsing & retries
│
└── frontend/                      # React 19 Client
    ├── package.json               # Frontend dependencies & npm scripts
    ├── vite.config.js             # Vite configuration
    ├── index.html                 # HTML application container
    ├── .env.example               # Frontend environment variable template
    └── src/
        ├── main.jsx               # React DOM root entry point
        ├── App.jsx                # Application shell, router setup, and state
        ├── styles/
        │   └── index.css          # Dark glassmorphism CSS design system
        ├── api/
        │   ├── client.js          # Axios instance configuration
        │   ├── endpoints.js       # Typed API interaction functions
        │   └── mock.js            # Offline mock dataset for isolated development
        ├── pages/
        │   ├── Dashboard.jsx      # Watchlist overview and intelligence report cards
        │   └── CompanyDetail.jsx  # In-depth entity dossier view
        └── components/
            ├── Layout.jsx          # App shell with header and responsive sidebar
            ├── WatchlistSidebar.jsx# Watchlist navigation, search, and add entity form
            ├── AddCompanyForm.jsx  # Modal/inline form to track new companies
            ├── SummaryCard.jsx     # Executive summary card
            ├── WhatChanged.jsx     # "What Changed Since Last Time" highlight card
            ├── KeyEvents.jsx       # Structured discrete events list
            ├── ThemesList.jsx      # Recurring thematic tags
            ├── MemoryPanel.jsx     # Memento knowledge base viewer
            ├── HistoryTimeline.jsx # Historical analysis timeline & sentiment chart
            ├── NotesPanel.jsx      # Interactive analyst notes panel
            ├── SourcesList.jsx     # Scraped primary news article cards
            ├── SentimentBadge.jsx  # Dynamic sentiment pill component
            ├── AnalyzeButton.jsx   # Interactive run button with status indicator
            ├── Loader.jsx          # Futuristic pulsating loader component
            └── ErrorBanner.jsx     # Dismissible error notification component
```

---

## Getting Started & Local Setup

### 1. Prerequisites
- **Python**: `3.12+` (or `3.14`)
- **Node.js**: `18.x` or newer (`npm` or `fnm`)
- **PostgreSQL**: Local or remote instance (e.g., `postgresql://postgres@localhost:5432/finnews`)
- **API Keys**:
  - [Google AI Studio API Key](https://aistudio.google.com/) (for Gemini 3.5 Flash and embeddings)
  - [Firecrawl API Key](https://firecrawl.dev/) (for web crawling)

---

### 2. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   Create a `.env` file in `backend/.env`:
   ```env
   # PostgreSQL Connection
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/finnews

   # API Keys
   GOOGLE_API_KEY=your_gemini_api_key_here
   FIRECRAWL_API_KEY=your_firecrawl_api_key_here

   # Gemini Model Settings
   GEMINI_MODEL=gemini-3.5-flash
   MEMENTO_LLM_PROVIDER=gemini
   MEMENTO_EMBEDDING_PROVIDER=gemini

   # Scraping Limits & CORS
   MAX_ARTICLES=3
   CORS_ORIGINS=http://localhost:5173
   ```

5. **Initialize Database Tables**:
   Ensure PostgreSQL is running and the database exists (`createdb finnews`). Tables will be automatically created on startup via SQLAlchemy.

6. **Start Backend Server**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   The backend API will be available at `http://localhost:8000`. You can inspect the interactive Swagger documentation at `http://localhost:8000/docs`.

---

### 3. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd ../frontend
   ```

2. **Install node dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in `frontend/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   VITE_USE_MOCK=false
   ```
   *(Set `VITE_USE_MOCK=true` if you wish to run the frontend entirely offline using realistic financial mock data without backend dependencies).*

4. **Start Vite Development Server**:
   ```bash
   npm run dev
   ```
   The frontend application will launch at `http://localhost:5173`.

---

## API Reference

All backend API routes are prefixed under `/api`:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint returning service status. |
| `GET` | `/api/watchlist` | Retrieve all tracked entities on the watchlist. |
| `POST` | `/api/watchlist` | Add a new entity (`{"name": "Apple", "ticker": "AAPL"}`). |
| `DELETE` | `/api/watchlist/{id}` | Remove an entity and cascade delete associated records. |
| `POST` | `/api/analyze` | Trigger real-time intelligence crawl & analysis (`{"watchlist_id": 1, "max_articles": 3}`). |
| `GET` | `/api/watchlist/{id}/analyses` | Retrieve historical analyses for a specific company (newest first). |
| `GET` | `/api/analyses/{id}` | Fetch a specific analysis by unique ID. |
| `GET` | `/api/watchlist/{id}/memory` | Retrieve all recalled Memento entity knowledge graph nodes. |
| `GET` | `/api/watchlist/{id}/notes` | Retrieve all analyst notes for a company. |
| `POST` | `/api/notes` | Create a new analyst note (`{"watchlist_id": 1, "note": "..."}`). |

---

## Verification & Testing Suite

The backend includes a comprehensive test suite in `backend/scripts/`:

```bash
cd backend
source .venv/bin/activate

# 1. Run the smoke test (Verifies Postgres, Gemini embeddings, JSON output, Memento, and Firecrawl)
python scripts/smoke_test.py

# 2. Run API integration tests
python scripts/test_api.py

# 3. Run mock pipeline tests (Validates end-to-end pipeline without consuming external credits)
python scripts/test_pipeline_mock.py
```

---

## License

This project is released under the **MIT License**.
