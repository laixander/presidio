# Phase 3: Front Desk Dashboard & Guest Management

This plan outlines the implementation of the first half of Phase 3, focusing on the Front Desk Dashboard and the Guest Directory. This will replace the current placeholders and establish the primary operational view for the Front Desk team.

## Proposed Changes

### 1. Front Desk Dashboard
The dashboard provides a real-time overview of today's operations.

#### [MODIFY] [index.vue](file:///Users/lnaguit/Desktop/code/presidio/app/pages/frontdesk/index.vue)
- **Top Row (KPIs):** Use `StatCard` to display key metrics:
  - In-House Guests (`reservationsStore.inHouseGuests.length`)
  - Arrivals Today (`reservationsStore.arrivalsToday.length`)
  - Departures Today (`reservationsStore.departuresToday.length`)
  - Vacant Rooms (`roomsStore.availableRooms.length`)
- **Main Content (Split View):**
  - **Left Panel:** "Today's Arrivals" table showing pending and confirmed reservations for today. Includes quick action to "Check-In".
  - **Right Panel:** "Today's Departures" table showing in-house reservations checking out today. Includes quick action to "Check-Out".

### 2. Guest Management
The guest directory allows staff to view, search, and manage guest profiles.

#### [NEW] [GuestAvatar.vue](file:///Users/lnaguit/Desktop/code/presidio/app/components/GuestAvatar.vue)
- Reusable component displaying a guest's avatar (initials), full name, and an optional email/phone.
- **VIP Indication:** If `guest.isVip` is true, displays a gold crown icon (`i-lucide-crown`) next to their name.

#### [MODIFY] [index.vue](file:///Users/lnaguit/Desktop/code/presidio/app/pages/frontdesk/guests/index.vue)
- **Data Table:** A full CRUD table powered by `guestsStore.guests`.
- **Columns:** Guest Name (using `GuestAvatar`), Contact (Phone/Email), Company, VIP Status, Actions.
- **Header Actions:** Global search filter and "Add Guest" button.

#### [NEW] [GuestModal.vue](file:///Users/lnaguit/Desktop/code/presidio/app/components/GuestModal.vue)
- **Form:** Create/Edit guest profile modal.
- **Fields:** First Name, Last Name, Email, Phone, Company, VIP Toggle.
- **Validation:** Zod schema enforcing required fields and email formatting.
- Automatically wires into `guestsStore.addGuest` and `guestsStore.updateGuest`.

## Open Questions

> [!IMPORTANT]
> **Check-In/Out Actions on Dashboard**
> For the "Today's Arrivals" and "Today's Departures" tables on the dashboard, should the "Check-In" / "Check-Out" buttons route the user to dedicated pages (e.g., `/frontdesk/checkin?id=123`), or should they trigger a quick-action modal directly on the dashboard?

> [!NOTE]
> I have scoped this plan to just the **Dashboard** and **Guest Management** to keep the PR focused. Once this is complete, we can tackle the Reservation creation and Check-in/Check-out flows. Let me know if you approve this approach!

## Verification Plan

### Automated Tests
- Run `bun run typecheck` to ensure no TypeScript issues with the new Guest models and properties.

### Manual Verification
- Navigate to the Front Desk module (Dashboard) via the sidebar.
- Verify the 4 KPI cards display correct numbers based on the mock data.
- Verify the Arrivals and Departures tables render correctly.
- Navigate to the Guests page.
- Test searching the guest table.
- Test creating a new guest via `GuestModal`, ensuring validation works and it appears in the table.
- Edit an existing guest (e.g., toggle VIP) and ensure the UI reflects the change (gold crown appears).
