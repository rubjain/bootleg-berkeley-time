# CourseMap

CourseMap is a multi-campus course planning platform that starts with UC Berkeley and is designed to expand to additional universities over time. This implementation includes the core architecture, PostgreSQL/Prisma schema, normalized requirement ingestion, Berkeley sample and official sync data, read/write APIs, authenticated user workflows, social features, and admin import tooling.

## Setup

1. Install Node.js 20+ and npm.
2. Create a PostgreSQL database named `coursemap`.
3. Copy `.env.example` to `.env` and update values (especially `DATABASE_URL` and `SESSION_SECRET`).
4. Install dependencies:

```bash
npm install
```

5. Generate Prisma client and apply the schema:

```bash
npm run prisma:generate
npm run prisma:migrate
```

6. Seed Berkeley sample data:

```bash
npm run prisma:seed
```

7. Start the app:

```bash
npm run dev
```

Open **http://localhost:3100** in your browser.

## Demo account

- Primary admin demo user: `student@berkeley.edu` (role: ADMIN after seed)
- Additional demo users: `maya@berkeley.edu`, `jordan@berkeley.edu`, `zoe@berkeley.edu`, `lucas@berkeley.edu`

Protected routes (`/dashboard`, `/planner`, `/profile`, `/friends`, `/messages`, `/admin/*`) require sign-in.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Signs session cookies (required in production) |
| `ADMIN_EMAIL` | Email that receives ADMIN role on first OAuth upsert |
| `ALLOW_MOCK_FALLBACK` | Set `true` in development to show mock data when DB is down |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth (optional) |
| `AUTH_*_ENABLED` | Toggle auth providers |

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server on port 3100 |
| `npm run build` | Production build |
| `npm test` | Run unit tests (Vitest) |
| `npm run berkeley:sync:official` | Sync official Berkeley catalog/programs |
| `npm run berkeley:sync:official -- --discover` | Discovery pipeline (programs index + dept crawl + BFS) |
| `npm run berkeley:sync:coursedog` | **Recommended** — import all courses/programs via Berkeley Coursedog API |
| `npm run berkeley:sync:official -- --discover --full` | Uncapped HTML sync; checkpoints via `BerkeleySyncRun` |
| `npm run berkeley:sync:official -- --discover --resume-run-id=<id>` | Resume a prior sync run |

### Full Berkeley catalog sync

Official data is pulled from [undergraduate.catalog.berkeley.edu](https://undergraduate.catalog.berkeley.edu) (courses, programs, requirements), with optional merges from department major pages and legacy guide pages. Rate My Professors uses the `ratemyprofessors-client` API (not scraping).

```bash
# Recommended: full catalog via Coursedog API (~15–30 min; requires DATABASE_URL)
npm run berkeley:sync:coursedog

# Legacy HTML crawl (catalog pages no longer embed course lists in SSR)
npm run berkeley:sync:official -- --discover --department-limit=60 --course-limit=200 --program-limit=40

# Supplementary dept/guide merge (after catalog programs exist)
curl -X POST http://localhost:3100/api/admin/berkeley/sync-supplementary -H "Content-Type: application/json" -d "{\"limit\":25}"
```

Admin **Imports** page (`/admin/imports`) shows coverage metrics and **Run next chunk** / **Sync supplementary sources** actions.

## API surface

### Public
- `GET /api/health` — database status
- `GET /api/schools`, `/api/courses`, `/api/programs`, `/api/terms`, `/api/compare`, `/api/recommendations`

### Authenticated
- `GET /api/user/dashboard`, `POST /api/user/favorites`, `POST /api/user/course-history`, `PUT /api/user/program-selections`
- `GET /api/plans`, `POST /api/plans`, plan course mutations
- Social: `/api/social/*`

### Admin (ADMIN role required)
- `GET /api/admin/berkeley/coverage`
- Berkeley import/sync routes under `/api/admin/berkeley/*`
- `POST /api/admin/imports/preview`, `POST /api/admin/rmp/sync`
- `GET /api/admin/moderation/reports`

## Berkeley official data

```bash
npm run berkeley:sync:official -- --discover --department-limit=50 --course-limit=100
```

Coverage is tracked via `GET /api/admin/berkeley/coverage`. A nightly GitHub Action (`.github/workflows/berkeley-sync.yml`) can run the sync when `DATABASE_URL` is configured in repository secrets.

## Deployment

Recommended: **Vercel** + hosted **PostgreSQL** (Neon, Supabase, etc.).

1. Set production env vars (`DATABASE_URL`, `SESSION_SECRET`, OAuth secrets).
2. Deploy with `vercel.json` build command (runs migrations).
3. Run `npm run prisma:seed` once on staging, or use the admin import UI.

## Verification status

- Prisma generate, migrate, and seed succeed against local PostgreSQL.
- `npm run typecheck`, `npm test`, and `npm run build` pass.
- Signed session cookies protect user and admin routes via middleware.
- Mock fallbacks are disabled by default (`ALLOW_MOCK_FALLBACK=false`).
