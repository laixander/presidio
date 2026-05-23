# Walkthrough: Theme, Branding & Data Foundation

## Summary

Rebranded the application from **ParkFlow/ParkSpot** → **Presidio Hotel PMS** and established the complete data foundation: types, mock data, Pinia stores, services, and hydration infrastructure.

---

## Changes Made

### 1. Theme & Branding (5 files modified)

| File | Change |
|---|---|
| [app.config.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/app.config.ts) | `primary: 'green'` → `primary: 'amber'` |
| [app.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/app.vue) | SEO title/description → "Presidio — Hotel Property Management System" |
| [default.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/layouts/default.vue) | Sidebar logo: `i-ph-car-duotone` + "ParkSpot" → `i-lucide-hotel` + "Presidio" |
| [useDemoAuth.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/composables/useDemoAuth.ts) | Roles: `Admin \| Employee` → `Administrator \| Front Desk \| Billing \| Housekeeping` |
| [index.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/pages/index.vue) | Full login page redesign with 4 department roles + role preview card |

---

### 2. TypeScript Types (1 file)

[types/index.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/types/index.ts) — Added **10 Presidio entity interfaces** + status enums:

`SystemRole` · `StaffUser` · `Guest` · `RoomType` · `Room` · `Reservation` · `Folio` · `Charge` · `Payment` · `HousekeepingTask` · `AuditLog`

---

### 3. Mock Data (6 new files)

| File | Content |
|---|---|
| [users.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/data/mock/users.ts) | 4 staff users (1 per role) |
| [guests.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/data/mock/guests.ts) | 10 guest profiles (3 VIPs, Filipino names) |
| [rooms.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/data/mock/rooms.ts) | 4 room types + 16 rooms across 3 floors |
| [reservations.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/data/mock/reservations.ts) | 10 reservations (7 In-House, 1 Pending, 1 Confirmed, 1 Cancelled) |
| [folios.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/data/mock/folios.ts) | 5 folios + 17 charges + 2 payments |
| [tasks.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/data/mock/tasks.ts) | 8 housekeeping tasks (cleaning, turn-down, maintenance) |

---

### 4. Pinia Stores (5 new files + 1 plugin)

Each store follows the same pattern: **state → persistence (localStorage) → getters → CRUD actions → seed/clear**.

| Store | Key Getters |
|---|---|
| [rooms.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/stores/rooms.ts) | `availableRooms`, `occupancyRate`, `roomsByStatus`, `getEffectiveRate()` |
| [guests.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/stores/guests.ts) | `vipGuests`, `totalGuests`, `getFullName()`, `getById()` |
| [reservations.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/stores/reservations.ts) | `statusCounts`, `inHouseGuests`, `arrivalsToday`, `departuresToday` |
| [folios.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/stores/folios.ts) | `openFolios`, `totalRevenue`, `totalPayments`, `recalculateBalance()` |
| [housekeeping.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/stores/housekeeping.ts) | `pendingTasks`, `inProgressTasks`, `statusCounts`, `getTasksForRoom()` |

[presidio.client.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/plugins/presidio.client.ts) — Client-only plugin that hydrates all stores from localStorage on startup.

---

### 5. Services (6 new files)

Thin Promise-based wrappers with simulated latency (300–500ms). When the Express.js backend is ready, only these files need to change (swap `store.method()` → `$fetch('/api/...')`).

| Service | File |
|---|---|
| AuthService | [auth.service.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/services/auth.service.ts) |
| GuestService | [guest.service.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/services/guest.service.ts) |
| RoomService | [room.service.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/services/room.service.ts) |
| ReservationService | [reservation.service.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/services/reservation.service.ts) |
| FolioService | [folio.service.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/services/folio.service.ts) |
| HousekeepingService | [housekeeping.service.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/services/housekeeping.service.ts) |

---

### 6. Supporting (2 files modified)

| File | Change |
|---|---|
| [useDemoSeeder.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/composables/useDemoSeeder.ts) | `seedAll()` now populates all 5 Pinia stores; `resetAll()` clears everything |
| [DemoFab.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/components/DemoFab.vue) | Updated success toast message for hotel context |

### Infrastructure

| File | Change |
|---|---|
| [nuxt.config.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/nuxt.config.ts) | Added `@pinia/nuxt` module |
| package.json | Added `@pinia/nuxt@0.11.3` dependency |

---

## Verification

- ✅ `bun run typecheck` — passes clean
- ✅ Dev server running (`bun run dev`)

## Data Flow

```
UI Component → Service (async + latency) → Pinia Store (reactive state) → localStorage
                                                ↑
                                    plugins/presidio.client.ts (hydrate on startup)
                                                ↑
                                    DemoFab → useDemoSeeder → seed from data/mock/*
```

## Not Modified (Excluded)

- `app/pages/agent/*` — reference pages untouched
- `app/layouts/agent.vue` — reference layout untouched
- `app/pages/docs/*` — docs pages untouched
