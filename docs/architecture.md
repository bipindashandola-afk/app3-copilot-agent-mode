# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep the React app thin and contract-driven: render route-level sections from shared API responses, expose loading/empty/error states, and rely on the shared API client instead of direct fetch calls.
- Logic tier decision: Use Express routes plus a service layer to validate inputs, translate domain errors into deliberate 4xx responses, and keep business logic separate from HTTP concerns.
- Data tier decision: Define Mongoose schemas with the required fields and defaults, then seed representative users, teams, activities, and workouts idempotently so the app can start from production-like data without duplicating records.
- Activity tracking approach: Accept `userId`, `teamId`, `type`, and `minutes`, verify both references exist, store the activity with computed `points` and `occurredAt`, and reject malformed or missing IDs with 4xx responses.
- Team management approach: Require `name` and `mascot` on create, keep `members` as an array, and preserve membership IDs as object references while listing teams with their members.
- Leaderboard approach: Aggregate team totals from activity points, sort descending by `totalPoints`, and assign a 1-based rank so the UI and API both get a stable ordering contract.
- Workout suggestions approach: Match the requested user email to a seeded user, inspect recent or goal-aligned activity patterns, and return the most relevant workout suggestions with a reason string explaining the match.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` — validates the Mongoose models and the seed script. Failures here usually mean schema requirements, defaults, or idempotent seed behavior are wrong before the API layer is even exercised.
- API command: `npm run test:api --prefix octofit-tracker/backend` — validates the Express endpoints and HTTP contract. Failures here usually mean invalid request handling, missing status codes, wrong sorting, or wrong business logic in the API/service layer.
- Frontend command: `npm test --prefix octofit-tracker/frontend` — validates route rendering, loading/empty/error states, and the use of the shared client. Failures here usually mean the UI still shows placeholders or bypasses the API contract.
- Backend build command: `npm run build --prefix octofit-tracker/backend` — checks TypeScript correctness and server-side compile health. A failing build indicates type mismatches or invalid exports/imports in the backend code.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` — checks the React app compiles cleanly and the Vite bundle resolves correctly. A failing build usually points to invalid component props, route setup, or API client mismatches.
