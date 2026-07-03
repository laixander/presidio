# Multiple Guests Selection for Reservations

This plan outlines the structural and UI changes needed to support multiple guests per reservation, while still identifying a primary guest. 

## User Review Required

> [!WARNING]
> **Data Model Change:** This change will replace the single `guestId` field on reservations with a new `guests: ReservationGuest[]` structure. Because `guestId` is used extensively across the app (in bookings, billing, guest profiles, check-in/out), these components will be refactored to read from the new structure.

## Open Questions

> [!IMPORTANT]
> 1. In `ReservationGuests`, should we replace `guestId` entirely with a `guests` array, or do you prefer to keep `guestId` on the Reservation model as a shortcut for the primary guest? (The plan assumes replacing it completely for consistency, but accessing `guests.find(g => g.isPrimary)` where the primary guest is needed).
> 2. For the `ReservationGuests` type, is `{ guestId: number, isPrimary: boolean }` sufficient?

## Proposed Changes

---

### Data Models & Store
Refactor the underlying data models to support multiple guests.

#### [MODIFY] [index.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/types/index.ts)
- Add `ReservationGuest` interface: `{ guestId: number; isPrimary: boolean; }`
- Update `Reservation` interface to replace `guestId: number | null` with `guests: ReservationGuest[]`.

#### [MODIFY] [reservations.ts](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/stores/reservations.ts)
- Update `addReservation` method signature to accept `guests`.
- Update the mock data in `seed()` method or any initial state if present.
- Add helper method `getPrimaryGuest(reservation: Reservation)` to easily fetch the primary guest across the app.

---

### Front Desk Booking Flow
Update the new reservation form to allow multiple guests.

#### [MODIFY] [new.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/pages/frontdesk/bookings/new.vue)
- Update the Guest selection UI to use `USelectMenu` with `multiple` enabled.
- Add a secondary UI step (e.g., radio buttons or a dropdown) to let the user choose which of the selected guests is the primary guest.
- Pass the mapped array of `ReservationGuest` objects to `reservationsStore.addReservation`.

---

### Group Reservations
Update the room blocking and assignment flow to support assigning multiple guests.

#### [MODIFY] [[id].vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/pages/frontdesk/groups/[id].vue)
- Refactor the "Reservations Tab" to display an array of guests instead of a single guest.
- Provide a UI for assigning multiple guests to a group room block and selecting the primary guest (e.g., a multi-select dropdown with a primary indicator).
- Update the `assignGuest` and `unassignGuest` functions to manage the `guests` array.

---

### Cross-Cutting Fixes
Since `guestId` was used to identify the main guest for a booking, many other views must be updated to reference the primary guest from the new `guests` array.

#### [MODIFY] [index.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/pages/frontdesk/bookings/index.vue)
- Update datatable columns to display all guests or primary guest.

#### [MODIFY] [[id].vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/pages/frontdesk/bookings/[id].vue)
- Update reservation details to show all guests assigned.

#### [MODIFY] [checkin.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/pages/frontdesk/checkin.vue) & [checkout.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/pages/frontdesk/checkout.vue)
- Fetch the primary guest to display in the header and form.

#### [MODIFY] [index.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/pages/frontdesk/index.vue) (Dashboard)
- Update arrivals and departures logic to use the primary guest.

#### [MODIFY] [invoices.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/pages/billing/invoices.vue), [index.vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/pages/billing/index.vue), [[id].vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/pages/billing/folios/[id].vue)
- Folios currently have a `guestId` which could remain as the primary guest being billed, but reservation displays need to be updated.

#### [MODIFY] [[id].vue](file:///c:/Users/laixa/OneDrive/Desktop/code/presidio/app/pages/frontdesk/guests/[id].vue)
- Update guest profile history to filter reservations where the `guests` array contains this `guestId`.

## Verification Plan

### Manual Verification
1. Open "New Reservation", select multiple guests, mark one as primary, and save. Verify the reservation appears correctly in the datatable.
2. Open a Group Booking, assign multiple guests to a single room block, set the primary guest.
3. Check the Guest Directory for both the primary and additional guests, ensuring the stay shows up in both of their histories.
4. Perform a check-in and verify it defaults to the primary guest.
