# Dynamic Procedural Mock Data Generation

Currently, the `seederCount` input in `DevToolModal` serves as a rigid upper boundary clipping predefined static arrays in `app/data/mock/`. This limits the amount of realistic demo data you can generate and causes unbalanced ratios between modules when you want to scale up. 

This plan proposes migrating to a fully dynamic procedural generation model using `@faker-js/faker`. The `seederCount` will act as a baseline multiplier (e.g., number of rooms), and all other modules will scale proportionately to simulate a real-world hotel.

## User Review Required

> [!WARNING]
> This change will replace the static, hand-written mock files located in `app/data/mock/*.ts` with an on-the-fly generation engine. The data will be different (randomized but realistic) each time you "Deploy Demo Data". 

## Open Questions

> [!IMPORTANT]
> 1. **Localization**: The current mock data features Philippine names and phone numbers (e.g., "Juan Dela Cruz"). Do you want the faker engine to specifically target Philippine locales (`en_PH`) for names/addresses, or should it use global default data?
> 2. **Staff Users**: Currently there are exactly 4 staff members (one for each role). Should we keep staff members static (so you always know the exact login credentials like `admin123`), or should those scale up dynamically too?

## Proposed Changes

### Dependencies
- **[NEW] `@faker-js/faker`**: Add to `devDependencies` in `package.json` to generate realistic names, emails, dates, and reference numbers.

---

### `app/composables/useDemoSeeder.ts`
We will rewrite the `seedAll` function to ignore static arrays and procedurally generate the entities using `faker`. 

**Scaling Logic based on `seederCount` (e.g., if set to 50):**
- **Rooms**: Exact match (50 rooms).
- **Guests**: Scale 3x (150 guests).
- **Reservations**: Scale 0.8x (40 reservations to simulate 80% occupancy).
- **Folios**: 1 folio per reservation (40 folios), with each folio generating 2-5 itemized `Charges` and 1 `Payment`.
- **Housekeeping Tasks**: Scale 0.6x (30 tasks).

#### [MODIFY] [useDemoSeeder.ts](file:///Users/lnaguit/Desktop/code/presidio/app/composables/useDemoSeeder.ts)
- Import faker and set the locale if necessary.
- Write factory loops for Guests, Rooms, Reservations, Folios, Charges, Payments, and Tasks.
- Enforce referential integrity (e.g., picking a random `guest.id` for a new reservation instead of just assigning random numbers).

---

### `app/data/mock/`
We will remove the static mock files to clean up the codebase.
#### [DELETE] [users.ts](file:///Users/lnaguit/Desktop/code/presidio/app/data/mock/users.ts)
#### [DELETE] [guests.ts](file:///Users/lnaguit/Desktop/code/presidio/app/data/mock/guests.ts)
#### [DELETE] [rooms.ts](file:///Users/lnaguit/Desktop/code/presidio/app/data/mock/rooms.ts)
#### [DELETE] [reservations.ts](file:///Users/lnaguit/Desktop/code/presidio/app/data/mock/reservations.ts)
#### [DELETE] [folios.ts](file:///Users/lnaguit/Desktop/code/presidio/app/data/mock/folios.ts)
#### [DELETE] [tasks.ts](file:///Users/lnaguit/Desktop/code/presidio/app/data/mock/tasks.ts)

## Verification Plan
### Automated & Manual Testing
- Set `seederCount` to 100 in the DevTool Settings, save, and click "Deploy Demo Data".
- Verify that exactly 100 rooms, 300 guests, and ~80 reservations are populated in the application UI without lagging the browser.
- Verify relational mapping (e.g., clicking on a folio charge links properly to an existing active reservation).
