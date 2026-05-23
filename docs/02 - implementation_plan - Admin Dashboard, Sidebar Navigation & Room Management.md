# Phase 2 — Admin Dashboard, Sidebar Navigation & Room Management

Build the first functional UI pages: a hotel operations dashboard with live KPI data, proper sidebar navigation for all Presidio modules, and a full Room Management CRUD page.

> [!NOTE]
> **Excluded from scope:** `app/pages/agent/`, `app/layouts/agent.vue`, and `app/pages/docs/`.

## Proposed Changes

### 1. Sidebar Navigation

#### [MODIFY] [default.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/layouts/default.vue)
Replace placeholder nav `items` with Presidio module routes:

```typescript
const items = computed<NavigationMenuItem[]>(() => [
    { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/dashboard' },
    { label: 'Rooms', icon: 'i-lucide-bed-double', to: '/rooms' },
    { label: 'Guests', icon: 'i-lucide-users', to: '/guests' },
    { label: 'Reservations', icon: 'i-lucide-calendar-check', to: '/reservations' },
    { label: 'Folios', icon: 'i-lucide-receipt', to: '/folios' },
    { label: 'Housekeeping', icon: 'i-lucide-spray-can', to: '/housekeeping' },
])
```

Also add a **logout button** in the sidebar footer (next to UserMenu).

---

### 2. Dashboard Page

#### [MODIFY] [dashboard.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/pages/dashboard.vue)
Full rebuild using real store data. Layout:

**Row 1 — KPI Stat Cards (4 columns):**
| Card | Source | Icon |
|---|---|---|
| Occupancy Rate | `roomsStore.occupancyRate` | `i-lucide-building` |
| In-House Guests | `reservationsStore.inHouseGuests.length` | `i-lucide-users` |
| Arrivals Today | `reservationsStore.arrivalsToday.length` | `i-lucide-log-in` |
| Open Folios Balance | `foliosStore.openFolios` total balance | `i-lucide-wallet` |

**Row 2 — Charts (2 columns):**
| Chart | Type | Data |
|---|---|---|
| Room Status Breakdown | Doughnut | `roomsStore.roomsByStatus` (Vacant Clean, Occupied, Dirty, etc.) |
| Reservation Status | Bar | `reservationsStore.statusCounts` (Pending, Confirmed, In-House, Done, Cancelled) |

**Row 3 — Quick Info (2 columns):**
| Panel | Content |
|---|---|
| Today's Departures | List of guests checking out today from `reservationsStore.departuresToday` |
| Housekeeping Summary | Task counts from `housekeepingStore.statusCounts` |

---

### 3. Room Management Page

#### [NEW] [rooms.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/pages/rooms.vue)
Full CRUD data table following the `agent/table.vue` reference pattern:

- **Page header**: Title + "Add Room" button (via `headerActions` meta + `useEvents`)
- **Table columns**: Room Number, Floor, Type (badge), Rate, Occupancy Status (badge), Clean Status (badge), Condition, Actions
- **Global filter** + **Column toggle** (reuse `TableGlobalFilter` + `TableColumnToggle`)
- **Actions dropdown**: Edit, Update Clean Status, Update Occupancy, Delete (with `ConfirmationModal`)
- **Empty state**: Uses `Empty` component with "Deploy Demo Data" CTA

#### [NEW] [RoomModal.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/components/RoomModal.vue)
Modal for Add/Edit room:
- Fields: Room Number, Floor, Room Type (select), Rate Override, Occupancy Status, Clean Status, Condition
- Zod validation schema
- Reuses `UModal` + `UForm` pattern from `UserModal.vue`

---

### 4. Stub Pages (Coming Soon)

Create placeholder pages for the remaining modules so sidebar links don't 404:

#### [NEW] [guests.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/pages/guests.vue)
#### [NEW] [reservations.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/pages/reservations.vue)
#### [NEW] [folios.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/pages/folios.vue)
#### [NEW] [housekeeping.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/pages/housekeeping.vue)

Each uses the `ComingSoon` component with module-specific icon/description.

---

## Verification Plan

### Automated
- `bun run typecheck` passes

### Manual
- Sidebar shows 6 module links, all navigable
- Dashboard displays live KPIs from seeded store data
- Room table shows all 16 rooms with correct badges
- Add/Edit room modal works with validation
- Delete room shows confirmation
- Stub pages show "Coming Soon"
