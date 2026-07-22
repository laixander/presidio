# Walkthrough: Multiple Guest Selection

I've successfully updated the application to support assigning multiple guests to a single reservation while preserving the ability to identify a primary guest. 

## Changes Made

### 1. Data Model Refactoring
* **Types (`app/types/index.ts`)**: Deprecated the single `guestId` on the `Reservation` interface. Introduced an array of `ReservationGuest` objects under the `guests` property. Each object holds a `guestId` and an `isPrimary` boolean flag.
* **Stores**: 
    * `reservations.ts`: Updated to support `guests` instead of `guestId`. Added a `getPrimaryGuestId(reservation)` helper to simplify retrieving the primary guest across the app.
    * `groups.ts`: Updated the group reservation initial state to initialize `guests` instead of `guestId`.

### 2. UI Updates
* **New Reservation Form (`app/pages/frontdesk/bookings/new.vue`)**:
    * Transitioned the guest selection input to use `USelectMenu` with the `multiple` property.
    * Added a primary guest selector that appears when guests are chosen, allowing the user to pick which of the assigned guests is the primary one.
    * Added a reactive `watch` that automatically selects the first selected guest as the primary guest for a frictionless UX.
* **Group Room Blocking (`app/pages/frontdesk/groups/[id].vue`)**:
    * Refactored the "Assign Guest" functionality to allow assigning multiple guests to a blocked room.
    * Displayed assigned guests as a list.
    * Added a quick action (star button) next to each guest to mark them as the primary guest for the room.

### 3. System-Wide References
* Systematically replaced all usages of `reservation.guestId` with the new `reservationsStore.getPrimaryGuestId(reservation)` helper in the following areas:
    * Frontdesk Dashboards (`frontdesk/index.vue`, `admin/index.vue`)
    * Booking Lists & Details (`bookings/index.vue`, `bookings/[id].vue`)
    * Operations (`checkin.vue`, `checkout.vue`)
    * Guest Profile History (`guests/[id].vue`)
    * Billing Integration (`folios/[id].vue`)
* Simulated data generation scripts (`useSimulation.ts`, `useDemoSeeder.ts`) were also updated to properly seed the new `guests` array schema.

## Validation Results
* Data is correctly structured.
* Forms handle the new data type seamlessly.
* All external module dependencies correctly reference the assigned primary guest.
* The feature meets the core requirements of the group reservation process.
