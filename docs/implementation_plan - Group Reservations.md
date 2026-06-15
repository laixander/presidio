# Group Reservations Implementation Plan

## Overview
Adds support for managing group reservations (corporate bookings, events, and room blocks) as part of the Front Desk operations.

## Proposed Changes
1. **Types**: Define `GroupReservation` and `RoomBlock` in `app/types/index.ts`.
2. **State Management**: Create a new Pinia store `useGroupsStore` (`app/stores/groups.ts`) to manage group reservations and room blocks.
3. **Data Hydration**: Update `app/plugins/presidio.client.ts` to hydrate `useGroupsStore` from `localStorage` on application startup.
4. **Mock Data Generation**: Update `app/composables/useDemoSeeder.ts` to procedurally generate mock group bookings and room blocks.
5. **UI Pages**: 
   - `app/pages/frontdesk/groups/index.vue`: Directory to list all group reservations.
   - `app/pages/frontdesk/groups/[id].vue`: Detail view for a specific group reservation and its room blocks.
