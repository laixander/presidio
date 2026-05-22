# Presidio Hotel PMS — Frontend Development Plan

**Project:** Presidio Hotel Property Management System  
**Stack:** Nuxt 3 + Nuxt UI v4 + Tailwind CSS (via Nuxt UI) + Pinia  
**Backend (separate):** Node.js / Express.js + Sequelize ORM + PostgreSQL  
**Current state:** Fresh Nuxt project initialized with `@nuxt/ui` template (bun)

---

## Project Overview

Presidio is a **role-based, SaaS web platform** that centralizes hotel operations across 4 departments — **Administration, Front Desk, Billing, and Housekeeping** — plus an **Operational Simulation Engine** for training and testing. The frontend will be built first with mock data / local state, then wired to the Express.js API in a later phase.

---

## Open Questions

> [!IMPORTANT]
> **Backend-first or Frontend-first?**  
> The plan below assumes a **frontend-first** approach — building all UI with mock/static data and Pinia stores, then connecting to the Express API. Please confirm this approach, or if you'd prefer to build backend + frontend in lockstep per module.

> [!IMPORTANT]
> **Simulation Engine scope**  
> The simulation engine appears to auto-generate hotel events (bookings, check-ins, check-outs, housekeeping tasks) based on configurable weights. Should the simulation run client-side with JS timers, or will it require a backend service / WebSocket connection?

> [!IMPORTANT]
> **Authentication mode**  
> The mockups show a "role picker" (Interactive Demo) approach. For MVP, should we implement:
> - **(A)** A simple role-picker that sets the active role in Pinia (no real auth) — matching the "Interactive Demo" screen
> - **(B)** Full JWT-based auth with login form, connecting to the Express API
> - **(C)** Both — role picker for demo mode, JWT auth for live mode

> [!NOTE]
> **Design system**  
> The mockups use a clean, minimal design with an **amber/gold** brand color (`#E5A100` or similar), **slate/navy** text, and a light background. Nuxt UI v4 provides Tailwind-based theming — I'll configure the `app.config.ts` color scheme to match the mockups precisely.

---

## Data Model Overview (from ERD)

Based on the ERD at [presidio_erd.svg](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/docs/presidio_erd.svg) and the [developer paper](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/docs/presidio-developer-paper.md), the core entities are:

| Entity | Key Fields | Relationships |
|---|---|---|
| **User** | id, name, email, password, role | Has many Audit Logs |
| **Guest** | id, name, email, phone, vip, company | Has many Reservations, Folios |
| **Room** | id, number, floor, type, rate, occupancy_status, clean_status, condition | Belongs to RoomType |
| **RoomType** | id, name, base_rate, max_occupancy | Has many Rooms |
| **Reservation** | id, guest_id, room_id, check_in, check_out, status, source | Belongs to Guest, Room |
| **Folio** | id, guest_id, reservation_id, status, balance | Has many Charges, Payments |
| **Charge** | id, folio_id, description, type, unit_price, qty, total, posted_at | Belongs to Folio |
| **Payment** | id, folio_id, amount, method, date | Belongs to Folio |
| **HousekeepingTask** | id, room_id, assigned_to, status, type | Belongs to Room, User |
| **AuditLog** | id, user_id, action, entity, timestamp | Belongs to User |
| **SimulationConfig** | id, status, event_weights, backlog, done | Singleton per tenant |

---

## Development Phases

### Phase 0 — Project Foundation & Design System
> **Goal:** Configure the Nuxt project, design tokens, shared layouts, composables, and Pinia stores.

#### [MODIFY] [nuxt.config.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/nuxt.config.ts)
- Add `@pinia/nuxt` module
- Configure route rules for SPA-mode dashboard routes
- Set up `runtimeConfig` for API base URL placeholder

#### [MODIFY] [app.config.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/app.config.ts)
- Configure Nuxt UI color theme to match Presidio branding:
  - **Primary:** Amber/Gold (`#E5A100`)
  - **Neutral:** Slate/Navy
- Typography: System font stack (matching mockups)

#### [MODIFY] [app.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/app.vue)
- Update SEO meta to Presidio branding
- Set up the root `<NuxtLayout>` wrapper

#### [NEW] `app/layouts/default.vue`
- Public/landing page layout (navbar with Features, Roles, Educators, Contact links)

#### [NEW] `app/layouts/dashboard.vue`
- Authenticated dashboard layout with:
  - Top navbar: Presidio logo, Dashboard link, active role badge, dark mode toggle, Logout
  - Role-specific action buttons in header area
  - Main content area with `<slot />`

#### [NEW] `app/stores/auth.ts`
- Pinia store managing current user, role, and session state
- Mock user data for initial development

#### [NEW] `app/stores/rooms.ts`
- Pinia store for room inventory, availability, and status

#### [NEW] `app/stores/guests.ts`
- Pinia store for guest profiles, history, VIP tagging

#### [NEW] `app/stores/reservations.ts`
- Pinia store for booking data, CRUD operations

#### [NEW] `app/stores/folios.ts`
- Pinia store for folio management, charges, payments

#### [NEW] `app/stores/housekeeping.ts`
- Pinia store for housekeeping tasks, room condition tracking

#### [NEW] `app/stores/simulation.ts`
- Pinia store for simulation engine configuration and state

#### [NEW] `app/composables/useCurrency.ts`
- Philippine Peso (₱) formatting utility

#### [NEW] `app/composables/useBookingId.ts`
- Booking ID generator (PRS-10001 format)

#### [NEW] `app/types/index.ts`
- TypeScript interfaces for all data models (Guest, Room, Reservation, Folio, etc.)

#### [NEW] `app/data/mock/` (directory)
- Seed mock data files: `guests.ts`, `rooms.ts`, `reservations.ts`, `folios.ts`
- Data matching the mockup screenshots (e.g., Juan Dela Cruz, Maria Santos, Michael Tan, etc.)

---

### Phase 1 — Landing Page & Authentication

> **Goal:** Build the public-facing landing page and the role-picker / authentication flow.

#### [MODIFY] `app/pages/index.vue`
- Full landing page matching the mockup:
  - Hero section: "Every department. **One system.**"
  - Subtitle text describing the platform
  - "Request a Demo" (primary amber CTA) + "See How It Works" (outline) buttons
  - Stats bar: 4 Specialized Roles · 100% Web-Based · 1 Unified System · 24/7 Operational
  - Navigation: Features, Roles, Educators, Contact
  - Feature sections, role descriptions, and footer

#### [NEW] `app/pages/demo.vue`
- Interactive Demo / Role Picker page:
  - Presidio logo + "INTERACTIVE DEMO" badge
  - "Who are you today?" heading
  - 4 role cards (Administrator, Front Desk, Billing Officer, Housekeeping)
  - Each card shows: icon, role name, description, 3 feature tags
  - "Enter as this Role →" amber CTA button
  - Sets selected role in auth store and redirects to role dashboard

#### [NEW] `app/pages/login.vue` *(if option B/C chosen)*
- Login form with email/password
- JWT auth integration placeholder

---

### Phase 2 — Administrator Module

> **Goal:** Build the Administrator dashboard and management screens.

#### [NEW] `app/pages/admin/index.vue` — **Administrator Dashboard**
- Date picker for operational date
- KPI cards (4 across): Total Bookings, In-House (Active guests), Occupancy (%), Revenue Today (₱)
- **Booking Status** sidebar: Pending, Confirmed, Paid, In-House, Done, Cancelled — each with count badges
- **Recent Bookings** table: Booking #, Guest (name + email), Status badge
- Action buttons: Manage Guests, + Manage Rooms, ⚙ Setup Simulation

#### [NEW] `app/pages/admin/guests.vue` — **Guest Management**
- Guest list table with search
- Guest profile detail (view/edit)
- VIP tagging toggle
- Company reference linking
- Guest history (previous stays)

#### [NEW] `app/pages/admin/rooms.vue` — **Room Management**
- Room list table matching mockup: Room #, Floor, Type, Rate, Occupancy, Clean status, Condition
- Filters: search bar + dropdowns (occupancy, clean status, condition)
- "+ New Room" button
- Row actions: View, Edit, Housekeeping
- Add/Edit room modal (room number, floor, type, rate)

#### [NEW] `app/pages/admin/users.vue` — **User Management**
- User list with role assignments
- Create/edit user modal
- Role assignment (Administrator, Front Desk, Billing, Housekeeping)

#### [NEW] `app/pages/admin/settings.vue` — **System Settings**
- General configuration (hotel name, timezone, currency)
- Room type configuration (Standard, Deluxe, Family, Executive Suite)
- Rate management

#### [NEW] `app/pages/admin/reports.vue` — **Analytics & Reporting**
- Revenue reports with Chart.js
- Occupancy analytics
- Booking analytics
- Export to PDF / Excel

---

### Phase 3 — Front Desk Module

> **Goal:** Build the Front Desk dashboard and all guest-facing operational screens.

#### [NEW] `app/pages/frontdesk/index.vue` — **Front Desk Dashboard**
- Date picker for operational date
- **Today's Overview** (2×2 grid): In-House Guests, Arrivals (Expected today), Departures (Due out), Vacant Rooms
- **Room Status** sidebar: Vacant & Clean, Vacant & Dirty, Vacant & Pickup, Occupied — each with room counts
- **Arrivals Today** table: Booking #, Guest (name + email), Source
- **Pending Payments** table: Folio #, Guest, Balance (₱ in red)
- Action buttons: + New Booking, Check In, Check Out, Guests, Rooms, Search

#### [NEW] `app/pages/frontdesk/bookings/new.vue` — **Create Reservation**
- Guest selection (search existing / create new)
- Date range picker (check-in / check-out with nights calculation)
- Room type selection
- Room assignment
- Source selection (Walk-in, Phone, OTA, etc.)
- Booking confirmation

#### [NEW] `app/pages/frontdesk/bookings/[id].vue` — **Reservation Detail**
- Full reservation view
- Modify reservation (dates, room, status)
- Cancel reservation
- Link to guest profile

#### [NEW] `app/pages/frontdesk/search.vue` — **Search Room Availability**
- Modal/panel matching mockup:
  - Check-in / Check-out date inputs
  - "X nights" duration display
  - "Search Availability" button
  - Room type filter dropdown
  - Available/Unavailable count
  - Room cards: Room number badge, name, floor tag, type, status (Available/Occupied/Inspected)

#### [NEW] `app/pages/frontdesk/checkin.vue` — **Guest Check-In**
- Search by booking # or guest name
- Room assignment confirmation
- Key issuance tracking
- In-house guest registration

#### [NEW] `app/pages/frontdesk/checkout.vue` — **Guest Check-Out**
- Select in-house guest
- Outstanding balance display
- Folio settlement prompt
- Room release and housekeeping trigger

#### [NEW] `app/pages/frontdesk/guests/index.vue` — **Guest List**
- Guest directory with search
- Quick guest profile view

#### [NEW] `app/pages/frontdesk/guests/[id].vue` — **Guest Profile**
- Full guest profile detail
- Stay history
- VIP indicator
- Linked reservations

---

### Phase 4 — Billing (Cashier) Module

> **Goal:** Build the Billing Officer dashboard and folio management system.

#### [NEW] `app/pages/billing/index.vue` — **Open Folios Dashboard**
- Matching the mockup layout:
  - **Left sidebar:** Folio list (Folio #, Guest name + VIP crown, Date, Balance in red ₱)
  - Active folio highlighted with amber background
  - "X open" badge in top-right
- **Right panel (folio detail):**
  - Folio #, Status badge (Open), Guest name, Opened date
  - Balance Due (large red ₱ amount)
  - Action buttons: ⊕ Add Charge, □ Apply Payment, △ Settle & Close
  - **Charges table:** Description, Type badge (Room Charge, Mini Bar, etc.), Unit Price (₱), Qty, Total (₱), Posted date
  - Total Charges sum at bottom

#### [NEW] `app/components/billing/AddChargeModal.vue`
- Charge type selection (Room Charge, Mini Bar, Room Service, Laundry, etc.)
- Description, Unit price (₱), Quantity
- Auto-calculated total

#### [NEW] `app/components/billing/ApplyPaymentModal.vue`
- Payment amount input
- Payment method selection (Cash, Card, Bank Transfer)
- Remaining balance display

#### [NEW] `app/components/billing/SettlementModal.vue`
- Outstanding balance summary
- Payment application
- Invoice generation trigger
- Folio close confirmation

#### [NEW] `app/pages/billing/invoices.vue` — **Invoice Generation**
- Invoice list
- Invoice detail view
- PDF export (jsPDF integration)

---

### Phase 5 — Housekeeping Module

> **Goal:** Build the Housekeeping dashboard for room status management.

#### [NEW] `app/pages/housekeeping/index.vue` — **Housekeeping Dashboard**
- Room grid/list with status indicators
- Quick status update controls
- Task assignment overview
- Room condition filters

#### [NEW] `app/pages/housekeeping/tasks.vue` — **Task Management**
- Incoming tasks list
- Task status updates (Pending → In Progress → Complete)
- Room status update (Dirty → Clean → Inspected)
- Maintenance flag submission

#### [NEW] `app/components/housekeeping/RoomStatusCard.vue`
- Room number, type, floor
- Color-coded status badges:
  - Occupancy: Vacant (gray) / Occupied (amber)
  - Clean: Clean (green) / Dirty (red) / Pickup (orange) / Inspected (blue)
  - Condition: Normal (green) / Maintenance (red)
- Quick-action buttons for status changes

---

### Phase 6 — Simulation Engine

> **Goal:** Build the Simulation Configuration and control panel.

#### [NEW] `app/pages/admin/simulation.vue` — **Simulation Config**
- Matching the mockup:
  - Header: "Simulation Config" + View Report / Stop buttons
  - Status cards (3): Status (Stop/Running), Backlog count, Done count
  - **Control panel:** Start, Step, Stop, Reset buttons + status indicator (Idle/Running)
  - **Event Weights** section:
    - Booking (weight input + % display)
    - Check-in (weight input + % display)
    - Check-out (weight input + % display)
    - Housekeeping (weight input + % display)
    - Total weight sum
    - "Save Weights" amber button

#### [NEW] `app/composables/useSimulation.ts`
- Simulation engine logic (client-side timer-based)
- Event generation based on weights
- State machine: Idle → Running → Paused → Stopped

#### [NEW] `app/pages/admin/simulation-report.vue` — **Simulation Report**
- Event log timeline
- Generated bookings, check-ins, check-outs, housekeeping actions
- Summary statistics

---

## Shared Components (Built incrementally across phases)

| Component | Description | Used In |
|---|---|---|
| `AppNavbar.vue` | Top navigation bar with role badge | All dashboard pages |
| `KpiCard.vue` | Stat card (label, value, sublabel, icon) | Admin/FD dashboards |
| `StatusBadge.vue` | Color-coded status pill (Pending, Confirmed, etc.) | Tables across modules |
| `DataTable.vue` | Reusable sortable/filterable table | All list pages |
| `DatePicker.vue` | Custom date input wrapper | Dashboards, bookings |
| `SearchModal.vue` | Search overlay (rooms, guests, bookings) | FD module |
| `GuestAvatar.vue` | Guest name + email + VIP crown | Tables, profiles |
| `RoomBadge.vue` | Room number circle badge (colored) | Room lists, search |
| `CurrencyDisplay.vue` | ₱ formatted amount (with red for balances) | Billing, dashboards |

---

## File Structure Summary

```
app/
├── app.vue
├── app.config.ts
├── layouts/
│   ├── default.vue          # Landing/public layout
│   └── dashboard.vue        # Authenticated dashboard layout
├── pages/
│   ├── index.vue            # Landing page
│   ├── demo.vue             # Role picker (Interactive Demo)
│   ├── login.vue            # JWT login (optional)
│   ├── admin/
│   │   ├── index.vue        # Admin Dashboard
│   │   ├── guests.vue       # Guest management
│   │   ├── rooms.vue        # Room management
│   │   ├── users.vue        # User management
│   │   ├── settings.vue     # System settings
│   │   ├── reports.vue      # Analytics & Reporting
│   │   ├── simulation.vue   # Simulation Config
│   │   └── simulation-report.vue
│   ├── frontdesk/
│   │   ├── index.vue        # Front Desk Dashboard
│   │   ├── search.vue       # Search Room Availability
│   │   ├── checkin.vue       # Guest Check-In
│   │   ├── checkout.vue      # Guest Check-Out
│   │   ├── bookings/
│   │   │   ├── new.vue      # Create Reservation
│   │   │   └── [id].vue     # Reservation Detail
│   │   └── guests/
│   │       ├── index.vue    # Guest List
│   │       └── [id].vue     # Guest Profile
│   ├── billing/
│   │   ├── index.vue        # Open Folios Dashboard
│   │   └── invoices.vue     # Invoice Management
│   └── housekeeping/
│       ├── index.vue        # Housekeeping Dashboard
│       └── tasks.vue        # Task Management
├── components/
│   ├── AppNavbar.vue
│   ├── KpiCard.vue
│   ├── StatusBadge.vue
│   ├── DataTable.vue
│   ├── GuestAvatar.vue
│   ├── RoomBadge.vue
│   ├── CurrencyDisplay.vue
│   └── billing/
│       ├── AddChargeModal.vue
│       ├── ApplyPaymentModal.vue
│       └── SettlementModal.vue
├── composables/
│   ├── useCurrency.ts
│   ├── useBookingId.ts
│   └── useSimulation.ts
├── stores/
│   ├── auth.ts
│   ├── rooms.ts
│   ├── guests.ts
│   ├── reservations.ts
│   ├── folios.ts
│   ├── housekeeping.ts
│   └── simulation.ts
├── types/
│   └── index.ts
└── data/
    └── mock/
        ├── guests.ts
        ├── rooms.ts
        ├── reservations.ts
        └── folios.ts
```

---

## Suggested Timeline

| Phase | Description | Estimated Effort | Dependencies |
|---|---|---|---|
| **Phase 0** | Foundation & Design System | 1–2 days | None |
| **Phase 1** | Landing Page & Auth | 1–2 days | Phase 0 |
| **Phase 2** | Administrator Module | 3–4 days | Phase 0, 1 |
| **Phase 3** | Front Desk Module | 4–5 days | Phase 0, 1 |
| **Phase 4** | Billing Module | 3–4 days | Phase 0, 1 |
| **Phase 5** | Housekeeping Module | 2–3 days | Phase 0, 1 |
| **Phase 6** | Simulation Engine | 2–3 days | Phase 2 |
| **Polish** | Responsive, animations, edge cases | 2–3 days | All phases |

> **Total estimated frontend effort:** ~18–26 days

---

## Verification Plan

### Automated Tests
- Run `bun run dev` after each phase to verify the dev server boots without errors
- Run `bun run typecheck` to verify TypeScript integrity
- Run `bun run lint` to ensure code style compliance

### Manual Verification
- Visually compare each page against the corresponding screen mockup in `docs/Presidio Screens/`
- Test all role-based navigation flows (role picker → dashboard → module screens)
- Verify responsive behavior at mobile/tablet/desktop breakpoints
- Test dark mode toggle across all pages
- Verify all interactive elements (modals, forms, tables, date pickers)

### Process Flow Verification
- Walk through each expanded process flow (P1–P4) end-to-end:
  - **P1 Admin:** Manage Users → Add Rooms → Configure Settings → Override Folio → Monitor Dashboard → Generate Report
  - **P2 Front Desk:** Search Availability → Create Reservation → Link Guest → Assign Room → Check-In → Monitor Guests → Check-Out
  - **P3 Billing:** Open Folio → Post Charges → Apply Payments → Generate Invoice → Settle → Close
  - **P4 Housekeeping:** Receive Tasks → Update Status → Mark Clean → Flag Maintenance
