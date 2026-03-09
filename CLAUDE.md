# Estate CRM - 부동산 중개 CRM

부동산 중개사무소를 위한 매물 관리, 고객 매칭, 거래 진행 통합 CRM 시스템.

## Tech Stack

- **Desktop**: Electron (main/preload/renderer)
- **Frontend**: React 19 + TypeScript
- **Routing/Data**: TanStack Router, TanStack Query, TanStack Table, TanStack Form
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Backend**: Supabase (Postgres, Auth, Storage, Edge Functions)
- **Build**: Vite, electron-builder

## Monorepo Structure

```
packages/
  main/          # Electron main process
  preload/       # Electron preload scripts
  renderer/      # React UI (Vite)
    src/
      api/       # Supabase API layer
      components/# Shared UI components
      data/      # Mock data (dev)
      routes/    # TanStack Router pages
      types/     # TypeScript interfaces
      lib/       # Utilities
supabase/
  migrations/    # SQL migrations
```

## Database

22 tables on Supabase (all snake_case):

**Phase 1 (14 tables)**: buildings, dongs, units, contacts, ownerships,
properties, consultations, buyer_requirements, buyer_consultations,
matches, viewings, deals, tasks, calendar_events

**Phase 2 (8 tables)**: contracts, naver_ads, external_feeds, insights,
insight_rules, sync_logs, price_history, activity_logs

## Key Conventions

### Price Unit
만원 (10,000 KRW). Example: 15.8억 = 158000 (만원).
All price fields in DB and TypeScript use 만원 unit.

### Naming
- TypeScript: `camelCase` (e.g., `buyerReqId`, `checkStatus`)
- SQL/Supabase: `snake_case` (e.g., `buyer_req_id`, `check_status`)

### Property ↔ Location
Property has `unitId` linking to Unit → Dong → Building hierarchy.
Building name, address, dong info come from the Building/Unit chain.

### Contact Roles
Contact roles are derived from relationships, not stored directly:
- Has Ownership → owner
- Has BuyerRequirement → buyer

## Dev Commands

```bash
npm start          # Start dev (Electron + Vite HMR)
npm run build      # Build all packages
npm run typecheck  # TypeScript check across workspaces
npm test           # Run Playwright e2e tests
```

## Key Files

- `packages/renderer/src/types/index.ts` — All TypeScript interfaces
- `packages/renderer/src/api/` — Supabase API functions
- `packages/renderer/src/routes/` — Page components (TanStack Router)
- `packages/renderer/src/data/mock-data.ts` — Mock data for development
- `supabase/migrations/` — Database schema migrations

## Supabase

- Project managed via Supabase MCP tools
- RLS policies enabled on all tables
- Indexes on foreign keys and frequently filtered columns

## Important Notes

- Node.js >= 23.0.0 required
- `CheckStatus`: 'unverified' | 'verified' | 'in_contract' | 'hold' | 'done'
- `TaskSource`: 'manual' | 'system' | 'ai'
- Property `isHidden` controls visibility in listing views
- Match pipeline: suggested → buyerContacted → viewing → ownerContacted → negotiating → dealCreated
- Deal pipeline: selection → deposit → contract → completed → closed
