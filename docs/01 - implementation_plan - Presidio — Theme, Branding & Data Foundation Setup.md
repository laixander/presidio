# Presidio — Theme, Branding & Data Foundation Setup

Rebrand the app from ParkFlow/ParkSpot to **Presidio Hotel PMS**, configure the correct amber/gold theme, install Pinia, and establish the full data layer (types, mock data, stores, services).

> [!NOTE]
> **Excluded from scope:** `app/pages/agent/`, `app/layouts/agent.vue`, and `app/pages/docs/` are reference pages and will not be modified.

## Proposed Changes

### 1. Theme & Branding

#### [MODIFY] [app.config.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/app.config.ts)
- Change `primary: 'green'` → `primary: 'amber'`
- Keep `neutral: 'slate'`

#### [MODIFY] [app.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/app.vue)
- Update SEO title/description from "ParkFlow" to "Presidio Hotel PMS"
- Update `ogImage` to a hotel-themed image

#### [MODIFY] [default.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/layouts/default.vue)
- Replace ParkSpot logo (`i-ph-car-duotone` + "ParkSpot") with Presidio branding (`i-lucide-building-2` + "Presidio")

#### [MODIFY] [useDemoAuth.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/composables/useDemoAuth.ts)
- Change `SystemRole` from `'Admin' | 'Employee'` to `'Administrator' | 'Front Desk' | 'Billing' | 'Housekeeping'`

#### [MODIFY] [index.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/pages/index.vue)
- Update role options to 4 Presidio roles
- Add Presidio branding to login card

---

### 2. TypeScript Types

#### [MODIFY] [index.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/types/index.ts)
- Add all Presidio entity interfaces: `Guest`, `Room`, `RoomType`, `Reservation`, `Folio`, `Charge`, `Payment`, `HousekeepingTask`, `AuditLog`
- Update `User` interface to match Presidio schema (add `password`, typed `role` field, `isActive`)
- Export `SystemRole` type from here instead of the composable

---

### 3. Mock Data

#### [NEW] [users.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/data/mock/users.ts)
- 4 demo users, one per role (Administrator, Front Desk, Billing, Housekeeping)

#### [NEW] [guests.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/data/mock/guests.ts)
- ~8–10 guest profiles (Juan Dela Cruz, Maria Santos, Michael Tan, etc.)

#### [NEW] [rooms.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/data/mock/rooms.ts)
- Room types: Standard, Deluxe, Family, Executive Suite
- ~15–20 rooms across 3 floors with varied statuses

#### [NEW] [reservations.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/data/mock/reservations.ts)
- ~8–10 reservations with varied statuses (Pending, Confirmed, In-House, Done, Cancelled)

#### [NEW] [folios.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/data/mock/folios.ts)
- ~5 folios with charges and payments attached

#### [NEW] [tasks.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/data/mock/tasks.ts)
- ~6–8 housekeeping tasks with varied statuses

---

### 4. Pinia Stores

#### Install dependency
- `bun add @pinia/nuxt`

#### [MODIFY] [nuxt.config.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/nuxt.config.ts)
- Add `'@pinia/nuxt'` to modules

#### [NEW] [auth.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/stores/auth.ts)
- Current user, role, session state
- `login(role)`, `logout()`, hydrate from localStorage

#### [NEW] [rooms.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/stores/rooms.ts)
- Room + RoomType CRUD, status updates
- Computed getters: available rooms, occupancy rate, rooms by status

#### [NEW] [guests.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/stores/guests.ts)
- Guest CRUD, VIP filtering, search

#### [NEW] [reservations.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/stores/reservations.ts)
- Reservation CRUD, status transitions, booking ref generation
- Computed: arrivals today, departures today, by-status counts

#### [NEW] [folios.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/stores/folios.ts)
- Folio CRUD, add charge, apply payment, settle & close
- Computed: open folios, total revenue

#### [NEW] [housekeeping.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/stores/housekeeping.ts)
- Task CRUD, status transitions, room status updates

---

### 5. Service Layer

Services expose Promise-based methods with simulated latency, abstracting stores from UI. When the real Express.js API is ready, only these files change.

#### [NEW] [auth.service.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/services/auth.service.ts)
#### [NEW] [guest.service.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/services/guest.service.ts)
#### [NEW] [room.service.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/services/room.service.ts)
#### [NEW] [reservation.service.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/services/reservation.service.ts)
#### [NEW] [folio.service.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/services/folio.service.ts)
#### [NEW] [housekeeping.service.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/services/housekeeping.service.ts)

---

### 6. Supporting Infrastructure

#### [MODIFY] [useDemoSeeder.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/composables/useDemoSeeder.ts)
- Update to seed all Pinia stores from mock data files
- Add `resetAll()` that clears all stores

#### [MODIFY] [DemoFab.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/components/DemoFab.vue)
- Update to use new seeder (all stores instead of just users)

---

## Verification Plan

### Automated
- `bun run dev` boots without errors
- `bun run typecheck` passes

### Manual
- Login page shows Presidio branding with 4 role options
- Sidebar shows "Presidio" logo with amber accent
- DemoFab "Deploy Demo Data" seeds all stores with mock data
- "Reset System" clears all stores
