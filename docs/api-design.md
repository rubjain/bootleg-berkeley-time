# API Design

## Health

- `GET /api/health` — database connectivity and mock fallback status

## Auth

- `POST /api/auth/login` — demo email sign-in (signed session cookie)
- `POST /api/auth/logout`
- `GET /api/auth/session`
- `GET /api/auth/google`, `GET /api/auth/google/callback`
- `GET /api/auth/calnet`, `GET /api/auth/calnet/callback`

## Public read endpoints

- `GET /api/schools`
- `GET /api/courses?q=&department=&level=&tone=`
- `GET /api/courses/[id]`
- `GET /api/instructors`
- `GET /api/terms`, `GET /api/terms/[id]`
- `GET /api/programs?type=`, `GET /api/programs/[id]`
- `GET /api/compare?left=&right=`
- `GET /api/recommendations`
- `GET /api/rmp/professor`

## Authenticated user endpoints

Middleware requires a valid session cookie.

- `GET /api/user/dashboard`
- `POST /api/user/favorites`
- `POST /api/user/course-history`
- `PUT /api/user/program-selections`
- `GET /api/plans`, `POST /api/plans`
- `POST /api/plans/[id]/courses`, `PATCH /api/plans/[id]/courses`, `DELETE /api/plans/[id]/courses`
- `GET /api/social/dashboard`, `POST /api/social/friend-requests`, `PATCH /api/social/friend-requests`
- `POST /api/social/messages`, `POST /api/social/reviews`, `POST /api/social/discussion`
- `GET /api/social/course-community`, `POST /api/social/moderation`

## Admin endpoints (ADMIN role)

- `GET /api/admin/berkeley/coverage?refresh=1`
- `POST /api/admin/berkeley/parse`, `import-catalog`, `import-courses`, `import-departments`
- `POST /api/admin/berkeley/sync-programs`, `run-catalog-pipeline`, `discover-catalog`
- `POST /api/admin/berkeley/import-schedule-offerings`, `import-grade-distributions`
- `POST /api/admin/berkeley/import-professor-ratings`, `import-community-evidence`
- `GET /api/admin/berkeley/import-preview`
- `POST /api/admin/imports/preview`
- `POST /api/admin/rmp/sync`
- `GET /api/admin/moderation/reports`

## Future

- `POST /api/auth/register` — not implemented; OAuth/CAS/demo login used instead
