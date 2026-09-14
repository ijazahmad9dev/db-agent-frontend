# db-agent-frontend

Next.js (App Router) frontend for db-agent — connect a data source, review its schema and
an editable Entity-Relationship Diagram, and chat with your data in plain English, with
per-session history and auto-generated charts/KPI tiles.

## Table of contents

- [Tech stack](#tech-stack)
- [Requirements](#requirements)
- [Setup](#setup)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Routing / pages](#routing--pages)
- [Data flow, by feature](#data-flow-by-feature)
- [Design decisions worth knowing](#design-decisions-worth-knowing)
- [Adding a new visualization type](#adding-a-new-visualization-type)
- [Known gaps / follow-ups](#known-gaps--follow-ups)

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19 |
| Server state | TanStack Query (`@tanstack/react-query`) — no client-side data store for chat; history is fetched from the backend per session |
| Diagramming | `@xyflow/react` v12 (ERD viewer) |
| Charts | Recharts |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui, built on Base UI (`@base-ui/react`) primitives |
| Class merging | `cn` (a compiled clsx + tailwind-merge drop-in) |
| Icons | lucide-react |

`zustand` and `reactflow` (v11) are present in `package.json` but are legacy/unused —
see [Known gaps](#known-gaps--follow-ups).

## Requirements

- Node.js 20+
- The backend running and reachable (see the backend README) — this app has no
  standalone mode; every page requires the API

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```

3. Run the dev server:
   ```bash
   npm run dev
   ```

App runs at `http://localhost:3000`. There's no separate login page — visiting any route
while unauthenticated shows a "Sign in with Google" screen (`AppShell`), which redirects
to the backend's OAuth flow directly (`window.location.href = ${API_URL}/auth/google/login`).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build + type check |
| `npm run start` | Run a production build |
| `npm run lint` | ESLint |

## Project structure

```
src/
├── app/
│   ├── layout.tsx                     # Root layout: Providers + AppShell wrap every page
│   ├── providers.tsx                  # TanStack QueryClient
│   ├── page.tsx                       # Landing/redirect
│   ├── connections/
│   │   ├── page.tsx                    # List of the user's connections
│   │   ├── new/page.tsx                 # Tabs: Database / CSV upload / Google Sheets
│   │   └── [id]/
│   │       ├── layout.tsx               # Per-connection tab nav (Tables / ERD / Chat)
│   │       ├── tables/page.tsx           # Table selection + "draft semantic layer" trigger
│   │       ├── erd/page.tsx              # ERD viewer + relationship editor
│   │       └── chat/page.tsx             # Session sidebar + chat thread + SQL/Table/Charts tabs
├── components/
│   ├── auth/login-button.tsx
│   ├── layout/                          # app-shell, sidebar, navbar, sidebar-user
│   ├── connections/                     # connection-form, csv-upload-form, gsheets-form, connection-card
│   ├── chat/                            # thread, results tabs, chart carousel/view, kpi-card, session-sidebar
│   ├── erd/                             # erd-viewer (reactflow), relationship-editor, table-node
│   └── ui/                              # shadcn/ui primitives (button, dialog, table, tabs, card, ...)
├── hooks/                                # one hook per resource, all TanStack Query
├── lib/
│   ├── api-client.ts                     # typed fetch wrapper for every backend endpoint
│   ├── types.ts                          # shared request/response types, mirrors backend Pydantic schemas
│   └── utils.ts                          # cn() re-export
└── stores/
    └── chat-store.ts                     # legacy — unused, see Known gaps
```

## Routing / pages

| Route | Purpose |
|---|---|
| `/` | Landing |
| `/connections` | List connections |
| `/connections/new` | Create a connection (Postgres/MySQL form, CSV upload, or Google Sheets) |
| `/connections/[id]/tables` | Select which tables are exposed to the agent; trigger semantic-layer drafting |
| `/connections/[id]/erd` | View the ERD; manage relationships (Postgres/MySQL only) |
| `/connections/[id]/chat` | Chat sessions sidebar + conversation + SQL/Table/Charts tabs |

Every `[id]` page redirects back to `/connections/[id]/tables` if no tables are selected
yet (`useSelectedTables` + a redirect `useEffect`) — ERD and Chat both depend on having a
table allowlist first.

## Data flow, by feature

### Chat (`use-chat-session.ts`, `chat-thread.tsx`, `session-sidebar.tsx`)

- Chat state is **entirely server-derived** — `useChatSession(connectionId, sessionId)`
  reads history via `GET /chat/sessions/{id}/history` (keyed by `["chat-history",
  sessionId]`) rather than keeping its own client-side log.
- **Optimistic question rendering**: the question you just asked renders immediately
  (before the round trip completes) using the mutation's own in-flight `variables` —
  otherwise, since history only reflects what's already been saved server-side, your own
  question would be invisible for the entire time the agent is thinking.
- **Errors are surfaced, not swallowed**: a failed `/chat` call renders a visible message
  in the thread instead of silently reverting with no explanation.
- **Session adoption**: asking a question with no `sessionId` creates one server-side; the
  page adopts the returned `session_id` into its URL (`?session=...`) and the sidebar via
  a `useEffect` watching `latestResponse.session_id`.
- The chat page's SQL/Table/Charts tabs are driven by `latestResponse` — the most recent
  answer only. (See [Known gaps](#known-gaps--follow-ups) re: revisiting older answers.)

### ERD (`use-erd.ts`, `erd-viewer.tsx`)

- `GET /connections/{id}/erd` returns nodes + edges (each edge tagged `source: "fk" |
  "semantic"`, plus `cardinality` and `from_optional`/`to_optional`).
- Rendered with full Information Engineering (crow's-foot) notation: a bar marker means
  "one", a fork means "many", and a circle ahead of either means that side is optional.
  Four custom SVG `<marker>` defs cover all combinations (`erd-one`, `erd-one-optional`,
  `erd-many`, `erd-many-optional`).
- **Important `@xyflow/react` v12 detail**: `markerStart`/`markerEnd` take the *bare
  marker id* (e.g. `"erd-one"`), not a pre-wrapped `url(#erd-one)` string — the library
  wraps it in `url('#...')` itself. Passing an already-wrapped string double-wraps it into
  a value that matches nothing, and the relationship line silently renders with no
  arrowheads at all.
- FK-derived edges animate; semantic (manually added/overridden) edges render dashed.

### Relationship editing (`relationship-editor.tsx`, `use-semantic.ts`)

- Only enabled for `source_type` of `postgres`/`mysql` — CSV/Sheets connections get a
  disabled button, since those relationships are fully defined by the drafted semantic
  layer already (no real FK to introspect or override).
- Edits are staged **entirely client-side** first: `overrides` (add/edit, upserted by the
  four-column key) and `removedKeys` (suppress, whether the edge was originally FK-derived
  or a previous override) — with a live preview computed against the current ERD snapshot.
  Nothing reaches the backend until "Save relationships" calls
  `PUT /connections/{id}/semantic/relationships` once, in one shot.
- **Dialog sizing note**: `DialogContent`'s own base classes include `sm:max-w-sm`. A
  bare `max-w-3xl` override does *not* win the CSS cascade against it (different Tailwind
  modifier scope — `cn`'s tailwind-merge only collapses classes sharing the same
  modifier). The override has to be `sm:max-w-3xl`. Also: content inside a CSS grid/flex
  container (which `DialogContent` is) needs an explicit `min-w-0` somewhere in the chain
  for `overflow-x-auto` to actually engage — otherwise a wide table just pushes past the
  dialog's edge instead of scrolling. Prefer `flex flex-wrap` layouts over viewport-based
  `sm:`/`md:` breakpoints for anything rendered *inside* a `Dialog` — those breakpoints
  track the browser window, which has no fixed relationship to how wide the dialog itself
  ends up being.

### Visualizations (`chart-view.tsx`, `chart-carousel.tsx`, `kpi-card.tsx`)

- Each `Visualization` from the backend is already validated (`type`, plus either `x`/`y`
  for chart types or `value`/`label` for `"kpi"`).
- `ChartCarousel` pages through multiple suggestions one at a time — **except** when every
  suggestion is a KPI, in which case they render together as a row of stat tiles instead
  of being paged one-by-one, since that's how KPI tiles are meant to be scanned.

## Design decisions worth knowing

- **No client-side chat store.** An earlier version kept messages in a Zustand store;
  that's been fully replaced by server-fetched history via TanStack Query. `chat-store.ts`
  and `hooks/use-chat.ts` are both dead code from that earlier iteration — see
  [Known gaps](#known-gaps--follow-ups).
- **Types mirror the backend's Pydantic schemas by hand** (`lib/types.ts`) — there's no
  generated client. If a backend response shape changes, this file needs a matching
  manual update.
- **`api-client.ts` is one flat object** (`api.chat(...)`, `api.getERD(...)`, etc.) rather
  than per-resource modules — every backend endpoint has exactly one corresponding method
  here.

## Adding a new visualization type

1. Add the new `type` value to `Visualization["type"]` in `lib/types.ts`.
2. Add a render branch in `chart-view.tsx`.
3. Check `chart-carousel.tsx`'s "all one type → render together instead of paging" logic
   (currently specific to `"kpi"`) — decide whether the new type should behave the same way.
