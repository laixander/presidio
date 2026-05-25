# Phase 3: Bookings, Check-In, and Check-Out

This plan covers the core operational flows for the Front Desk module: searching availability, creating reservations, checking guests in, and checking them out.

## Proposed Changes

### 1. Reservations Directory
#### [NEW] [index.vue](file:///Users/lnaguit/Desktop/code/presidio/app/pages/frontdesk/bookings/index.vue)
- Implement a CRUD table for all reservations powered by `useReservationsStore()`.
- **Columns:** Booking Ref, Guest Name (using `GuestAvatar`), Check-in, Check-out, Status, Actions.
- **Header Actions:** "New Reservation" button linking to `/frontdesk/bookings/new`.
- **Status Badge:** A reusable `<StatusBadge>` component color-coded by reservation status.

### 2. Search & Create Reservation Flow
#### [NEW] [search.vue](file:///Users/lnaguit/Desktop/code/presidio/app/pages/frontdesk/search.vue)
- **Search Bar:** Inputs for Check-in Date, Check-out Date, and Guest Count.
- **Results:** Displays cards for available `RoomType`s, showing Base Rate and Max Occupancy.
- **Action:** Clicking "Book Now" on a room type redirects to `/frontdesk/bookings/new` with the selected dates and room type pre-filled via query parameters.

#### [NEW] [new.vue](file:///Users/lnaguit/Desktop/code/presidio/app/pages/frontdesk/bookings/new.vue)
- **Form:** 
  - **Guest Selection:** Dropdown to select an existing guest (with a quick-action to open the `GuestModal` for a new guest).
  - **Stay Details:** Check-in and Check-out dates.
  - **Room:** Room type selection and optional specific room assignment.
  - **Source:** Booking source dropdown (Walk-in, Phone, OTA, Corporate).
- **Action:** "Create Reservation" generates a new booking (`status: Pending` or `Confirmed`) via `reservationsStore.addReservation`.

### 3. Check-In & Check-Out Workflows
#### [NEW] [checkin.vue](file:///Users/lnaguit/Desktop/code/presidio/app/pages/frontdesk/checkin.vue)
- **Context:** Requires `?id=X` query param for the reservation ID.
- **UI:** Split view showing Guest Details and Stay Details.
- **Logic:** 
  - If a room is not yet assigned, forces the user to select an available room of the booked type.
  - Clicking "Confirm Check-In" performs 3 actions:
    1. Updates reservation status to `In-House`.
    2. Updates assigned room occupancy to `Occupied`.
    3. Calls `foliosStore.addFolio` to generate a new billing folio for the guest's stay.

#### [NEW] [checkout.vue](file:///Users/lnaguit/Desktop/code/presidio/app/pages/frontdesk/checkout.vue)
- **Context:** Requires `?id=X` query param for the reservation ID.
- **UI:** Displays the associated Folio balance and stay details.
- **Logic:**
  - Validates that Folio balance is exactly `₱0`. If not, shows an alert preventing check-out until the balance is settled (in the Billing module).
  - Clicking "Confirm Check-Out" performs 3 actions:
    1. Updates reservation status to `Done`.
    2. Closes the Folio (`status: Settled`).
    3. Updates room status to `Vacant` and `Dirty` so housekeeping is notified.

## Open Questions

> [!IMPORTANT]
> **Booking Source Default**
> For the "Create Reservation" form, should the default booking source be "Walk-in" or "Phone"? 

> [!NOTE]
> Nuxt UI v4 does not include a complex Date Picker out of the box. For this iteration, I will use native HTML5 `<input type="date">` inputs wrapped in Nuxt UI styling. This ensures solid functionality without needing to install complex third-party calendar libraries right now. Is this acceptable?

## Verification Plan

### Automated Tests
- Run `bun run typecheck` to ensure store updates and prop drilling are fully typed.

### Manual Verification
- Navigate to `/frontdesk/search`, pick dates, and select a room type.
- Verify redirect to `/frontdesk/bookings/new` pre-fills the dates.
- Create a booking and verify it appears in the Reservations table.
- Click "Check-In" on the dashboard for the new booking, assign a room, and confirm.
- Verify the Room status changes to `Occupied` in the Admin Dashboard.
- Click "Check-Out", verify the Folio zero-balance check, and confirm the room becomes `Vacant Dirty`.
