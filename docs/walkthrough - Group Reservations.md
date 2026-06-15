# Group Reservations Walkthrough

The **Group Reservations** module has been implemented, empowering the Front Desk to handle corporate bookings, events, and block off multiple rooms at once.

## What's Included?
- **Groups Store**: A dedicated `useGroupsStore` managing both the group details and the associated room blocks.
- **Seeder Integration**: The `useDemoSeeder` now procedurally generates realistic group bookings with 5-30 guests each, along with various blocked rooms that are set as 'Blocked', 'Reserved', or 'Released'.
- **Hydration Fixes**: Added proper `localStorage` hydration during the app startup via `presidio.client.ts` ensuring that group data persists through page reloads.
- **Auth Flicker Fix**: Upgraded `useDemoAuth` to utilize Nuxt's `useCookie` instead of `localStorage`, resolving a jarring issue where the SSR login page would flash before redirecting back to the dashboard.
