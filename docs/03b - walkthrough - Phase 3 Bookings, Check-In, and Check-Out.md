# Walkthrough: Bookings & Guest Lifecycle

## Summary
Successfully implemented the complete guest lifecycle logic in the Front Desk module. This includes searching for room availability, creating new reservations, and processing full check-in and check-out workflows. The core logic successfully orchestrates state changes across multiple Pinia stores (`reservationsStore`, `roomsStore`, and `foliosStore`).

## Changes Made

### 1. Reservations Directory (`/frontdesk/bookings`)
- Built the central reservations table utilizing Nuxt UI data tables.
- Implemented a reusable `<StatusBadge>` component that standardizes color-coding across the app (`Pending` = Yellow, `In-House` = Green, `Done` = Gray, etc.).
- Integrated dropdown actions that route directly to `Check-In` or `Check-Out` depending on the reservation's current status.

### 2. Search Availability (`/frontdesk/search`)
- Built a search form using HTML5 date inputs.
- Implemented client-side filtering logic to display available room types that can accommodate the requested guest count.
- The `Book Now` button passes selected dates and the chosen `roomTypeId` directly into the booking form via URL query parameters.

### 3. Create Reservation (`/frontdesk/bookings/new`)
- Developed a booking form featuring `Zod` validation.
- Automatically selects the guest from the `guestsStore` and auto-populates dates and room types if arriving from the Search page.
- Defaults to `Walk-in` as the booking source and generates a new reservation (`PRS-XXXXX`) upon submission.

### 4. Check-In Flow (`/frontdesk/checkin`)
- Created a robust check-in interface that pulls the guest profile and the reserved room type.
- **Enforced Business Logic:** The user *must* assign a physical room (filtered automatically to only show available, clean rooms of the correct type) before checking in.
- **State Orchestration:** 
  1. Changes reservation status to `In-House`.
  2. Updates physical room status to `Occupied`.
  3. Automatically generates an open billing folio for the guest via `foliosStore`.

### 5. Check-Out Flow (`/frontdesk/checkout`)
- Displays the guest's folio balance and itemized charges/payments.
- **Enforced Business Logic:** The system strictly prevents check-out if the guest's folio has an outstanding balance.
- **State Orchestration:** 
  1. Changes reservation status to `Done`.
  2. Closes and settles the billing folio.
  3. Marks the physical room as `Vacant` and `Dirty`, instantly notifying the housekeeping module.

## Verification
- ✅ **Component Stability:** All new forms, tables, and pages compile and render without errors.
- ✅ **Lifecycle Integrity:** Successfully tested the full path: Search → Book → Check-In (Folio Created) → Check-Out (Room Marked Dirty).
- ✅ **Validation Logic:** Verified that check-out correctly blocks if a balance exists.

> [!TIP]
> You can test the end-to-end flow! Go to `Front Desk -> Reservations`, click the **New Booking** button, and walk through the check-in and check-out screens to see how the status pills and room states update dynamically in real-time.
