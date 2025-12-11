# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CareerFlow is a resume builder and job tracking application with AI-powered resume tailoring. It's a pnpm monorepo with three apps and a shared package.

## Commands

### Development
```bash
pnpm install              # Install all dependencies
pnpm dev                  # Start frontend (Vite on port 5173)
pnpm dev:backend          # Start backend (Express on port 3001)
pnpm dev:extension        # Build extension in watch mode
pnpm dev:all              # Start all apps in parallel
```

### Build
```bash
pnpm build                # Build all packages
pnpm build:shared         # Build shared types (required before other builds)
pnpm build:frontend       # Build frontend for production
pnpm build:backend        # Build backend for production
pnpm build:extension      # Build Chrome extension
```

### Other
```bash
pnpm lint                 # Lint all packages
pnpm preview              # Preview production frontend build
```

## Architecture

### Monorepo Structure
- `apps/frontend` - React 19 + Vite + TailwindCSS v4 - Main web application
- `apps/backend` - Express.js API server with Gemini AI integration
- `apps/extension` - Chrome extension for job scraping and auto-fill
- `packages/shared` - Shared TypeScript types used across apps

### Key Dependencies
- **Auth**: Supabase native auth (no custom JWT auth routes)
- **AI**: Google Gemini API (`@google/genai`) for resume tailoring and scoring
- **PDF**: `@react-pdf/renderer` (frontend) and `pdfkit` (backend) for PDF generation
- **Database**: Supabase (PostgreSQL)
- **Jobs API**: RapidAPI JSearch for job listings

### Frontend Architecture
- **State Management**: React Context (`ResumeContext`, `AuthContext`, `ToastContext`)
- **Routing**: React Router v7 with protected routes
- **Views**: Profile (home), Editor, Jobs, Tracker, Analytics, AI Agent
- **Resume State**: Full undo/redo history (50 states), auto-save to active profile

### Backend Routes
- `/api/profiles` - CRUD for user resume profiles
- `/api/tailor` - AI-powered resume tailoring and scoring
- `/api/jobs` - Job listings with match scores
- `/api/applications` - Job application tracking
- `/api/scrape` - Job page scraping
- `/api/autofill` - Form auto-fill data

### Extension Architecture
- `content/` - Content scripts for job detection, scraping, and autofill
- `background/` - Service worker for cross-origin requests
- `popup/` - Extension popup UI

### Type System
Shared types are in `packages/shared/src/types/`. Frontend has additional types in `apps/frontend/src/types.ts`. Key types:
- `Resume` - Full resume document with sections, layout, tailoring state
- `Job` - Job listing with match score
- `TailorResponse` - AI tailoring results

## Environment Variables

Copy `.env.example` to `.env` with:
- `VITE_GEMINI_API_KEY` / `GEMINI_API_KEY` - Google Gemini API
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` - Supabase
- `VITE_RAPIDAPI_KEY` - RapidAPI for JSearch

## Important Patterns

### API Communication
Frontend uses `fetchWithAuth()` from `services/api.ts` which automatically attaches Supabase session tokens.

### Resume Context Flow
1. Initial load from localStorage (optimistic)
2. Hydrate from API if authenticated
3. Auto-save changes after 1s debounce (except during tailoring mode)

### Tailoring Mode
When tailoring, `originalResume` is preserved. Changes can be discarded to revert, or applied to keep. The `isTailoring` flag prevents auto-save during tailoring.

### Build Order
Always build shared package first: `pnpm build:shared` before building apps that depend on it.
