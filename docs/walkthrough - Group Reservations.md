# Group Reservations Walkthrough

The **Group Reservations** module has been implemented, empowering the Front Desk to handle corporate bookings, events, and block off multiple rooms at once.

## What's Included?
- **Groups Store**: A dedicated `useGroupsStore` managing both the group details and the associated room blocks.
- **Seeder Integration**: The `useDemoSeeder` now procedurally generates realistic group bookings with 5-30 guests each, along with various blocked rooms that are set as 'Blocked', 'Reserved', or 'Released'.
- **Hydration Fixes**: Added proper `localStorage` hydration during the app startup via `presidio.client.ts` ensuring that group data persists through page reloads.
- **Auth Flicker Fix**: Upgraded `useDemoAuth` to utilize Nuxt's `useCookie` instead of `localStorage`, resolving a jarring issue where the SSR login page would flash before redirecting back to the dashboard.

## Recent Updates
- **Edit Group Details**: Added a reusable `GroupModal` component, launched via an "Edit Details" button on the Group Details page, allowing seamless updates to group information without losing context.
- **Cancel Group**: Integrated a "Cancel Group" feature in both the List and Card views' dropdown menus on the main groups page, protected by a `ConfirmationModal`. Cancelling automatically updates the group status and releases any unreserved 'Blocked' rooms back to availability.
- **List and Card Views**: The main groups dashboard now supports a dynamic toggle between a data-dense Table view and a visual Card grid view, complete with responsive search filtering.
- **Dynamic Guest Unassignment**: In the Group Details -> Reservations tab, added the ability to quickly unassign a guest from a pending/confirmed reservation, making the room available for re-assignment.
