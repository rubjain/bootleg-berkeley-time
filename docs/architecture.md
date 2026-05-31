# CourseMap Technical Architecture Spec

## Product shape

CourseMap is a multi-tenant academic planning platform with a shared domain model across universities and a campus-specific ingestion layer. UC Berkeley is the initial campus, but the data model, APIs, and UI all treat `School` as a first-class boundary rather than embedding Berkeley-specific assumptions.

## Core architecture

### Frontend

- Next.js App Router with server components for read-heavy catalog pages
- Tailwind CSS design system with reusable cards, badges, stats, and page shells
- Route groups built around user journeys: discovery, program planning, and account management

### Backend

- Next.js route handlers in `src/app/api/*`
- `src/lib/repositories.ts` for data access orchestration
- `src/lib/recommendation.ts` for recommendation scoring
- `src/lib/importers/*` for official requirement ingestion
- Auth abstraction in `src/lib/auth/*`

### Data layer

- PostgreSQL as the canonical source of truth
- Prisma ORM with normalized models for courses, offerings, programs, requirement sets, and user plans
- Versioned requirement sets so academic policy changes are historically trackable

## Data provenance rules

- Official requirement data must prefer catalog, department, college, or school sources.
- Inferred projections must be labeled and stored separately from official data.
- Each requirement import must capture URL, source type, sync date, parser/import status, notes, and confidence.
- UI must show whether a rule or projection is official, reviewed manual, or inferred.

## Phase 1 implementation boundary

Phase 1 delivers the structural foundation:

- schema
- seed data
- read APIs
- import pipeline skeleton
- recommendation MVP
- polished read-oriented pages
