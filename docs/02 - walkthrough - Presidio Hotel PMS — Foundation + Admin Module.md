# Walkthrough: Presidio Hotel PMS — Foundation + Admin Module

## Phase 1: Theme, Branding & Data Foundation

### Theme & Branding (5 files)
- [app.config.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/app.config.ts) — `primary: 'amber'`
- [app.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/app.vue) — "Presidio — Hotel Property Management System"
- [default.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/layouts/default.vue) — `i-lucide-hotel` + "Presidio" logo
- [useDemoAuth.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/composables/useDemoAuth.ts) — 4 hotel department roles
- [index.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/pages/index.vue) — Branded login with role preview

### Types — [types/index.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/types/index.ts)
10 entity interfaces: `StaffUser`, `Guest`, `Room`, `RoomType`, `Reservation`, `Folio`, `Charge`, `Payment`, `HousekeepingTask`, `AuditLog`

### Mock Data (6 files in `data/mock/`)
4 staff users · 10 guests · 4 room types + 16 rooms · 10 reservations · 5 folios + 17 charges + 2 payments · 8 housekeeping tasks

### Pinia Stores (5 stores + hydration plugin)
`useRoomsStore` · `useGuestsStore` · `useReservationsStore` · `useFoliosStore` · `useHousekeepingStore`

### Services (6 files in `services/`)
Promise-based wrappers with simulated latency, swap-ready for Express.js backend.

---

## Phase 2: Admin Dashboard, Sidebar & Room Management

### Sidebar Navigation — [default.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/layouts/default.vue)
- 6 module links: Dashboard, Rooms, Guests, Reservations, Folios, Housekeeping
- Logout button in sidebar footer

### Dashboard — [dashboard.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/pages/dashboard.vue)

**Row 1 — KPI Cards:**
| Card | Data Source |
|---|---|
| Occupancy Rate | `roomsStore.occupancyRate` |
| In-House Guests | `reservationsStore.inHouseGuests.length` |
| Arrivals Today | `reservationsStore.arrivalsToday.length` |
| Open Balance | Sum of `foliosStore.openFolios` balances |

**Row 2 — Charts:**
| Chart | Type |
|---|---|
| Room Status Breakdown | Doughnut (Vacant Clean, Occupied, Dirty, Pickup, Maintenance) |
| Reservations by Status | Bar (Pending, Confirmed, In-House, Done, Cancelled) |

**Row 3 — Info Panels:**
| Panel | Content |
|---|---|
| Today's Departures | Guest names + room numbers for check-outs today |
| Housekeeping Summary | Pending / In Progress / Completed task counts |

### Room Management — [rooms.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/pages/rooms.vue)
- Full CRUD data table with 9 columns (Room, Floor, Type, Rate, Occupancy, Clean Status, Condition, Actions)
- Color-coded badges for occupancy (green/warning), clean status (success/error/warning/primary), and condition
- Global filter + column toggle
- Dropdown actions: Edit, Delete (with ConfirmationModal)
- Empty state with "Deploy Demo Data" CTA

### RoomModal — [RoomModal.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/components/RoomModal.vue)
- Add/Edit modal with Zod validation
- 2-column layout for Room Number/Floor and Occupancy/Clean Status
- Room type select, rate override with hint, condition select

### Stub Pages (4 files)
- [guests.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/pages/guests.vue) — Coming Soon
- [reservations.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/pages/reservations.vue) — Coming Soon
- [folios.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/pages/folios.vue) — Coming Soon
- [housekeeping.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/pages/housekeeping.vue) — Coming Soon

---

## Verification
- ✅ `bun run typecheck` — passes clean
- ✅ Dev server running (`bun run dev`)

## Data Flow
```
Login → useDemoAuth (role) → /dashboard
         ↓
DemoFab → useDemoSeeder → seed all Pinia stores from data/mock/*
         ↓
Dashboard ← reads from 5 stores → KPI cards + charts + info panels
Rooms    ← useRoomsStore → CRUD table + RoomModal
```

## Not Modified (Excluded)
- `app/pages/agent/*`, `app/layouts/agent.vue`, `app/pages/docs/*`
