# Phase 5: Housekeeping Module

This plan covers the implementation of the Housekeeping module, giving staff a centralized dashboard to track room statuses, flip dirty rooms, and manage housekeeping tasks.

## Proposed Changes

### 1. Room Status Grid
#### [NEW] [index.vue](file:///Users/lnaguit/Desktop/code/presidio/app/pages/housekeeping/index.vue)
- **KPI Dashboard:** Top-level metrics for Total Dirty Rooms, Vacant & Clean (ready), and Rooms on Maintenance.
- **Room Grid:** A responsive grid layout of all physical rooms in the hotel, utilizing the new `RoomStatusCard` component.
- **Filters:** A segmented control to filter the grid by Clean Status (All, Dirty, Clean, Inspected).

### 2. Room Status Card Component
#### [NEW] [RoomStatusCard.vue](file:///Users/lnaguit/Desktop/code/presidio/app/components/housekeeping/RoomStatusCard.vue)
- A highly visual card component representing a single physical room.
- **Status Badges:** Clearly displays `OccupancyStatus` (Vacant/Occupied) and `CleanStatus` (Clean/Dirty/Pickup/Inspected).
- **Maintenance Flag:** Prominently alerts if `RoomCondition` is 'Maintenance'.
- **Quick Actions:** Buttons to directly flip a room's status (e.g., "Mark Clean" for a dirty room, "Inspect" for a clean room, "Report Issue" for maintenance). 
- Actions interact directly with the `useRoomsStore()` to persist changes instantly.

### 3. Housekeeping Tasks List
#### [NEW] [tasks.vue](file:///Users/lnaguit/Desktop/code/presidio/app/pages/housekeeping/tasks.vue)
- A detailed data table specifically for assigned housekeeping tasks.
- **Columns:** Room Number, Task Type (Cleaning / Turn-down / Maintenance), Assigned To, Status (Pending / In Progress / Complete).
- **Actions:** Quick-action buttons in the table rows to advance a task's status (e.g., clicking "Start" moves it to In Progress, "Finish" moves to Complete and automatically updates the associated room's clean status to 'Clean').

## User Review Required

> [!NOTE]
> **Component Architecture**
> The `RoomStatusCard` will encapsulate all the logic for determining which buttons to show based on the room's current state (e.g., you can't "Mark Clean" a room that is already clean). Does this localized logic approach work for you?

## Verification Plan

### Automated Tests
- Run `bun run typecheck` to ensure the new Housekeeping Vue components strictly adhere to the `OccupancyStatus`, `CleanStatus`, and `RoomCondition` string literals defined in `types/index.ts`.

### Manual Verification
- Navigate to the Housekeeping dashboard.
- Observe the initial room grid and verify KPI counts match the data.
- Click "Mark Clean" on a Dirty room and verify the KPI updates immediately.
- Use the quick filters to isolate only "Dirty" rooms.
- Verify that a room checked out in Phase 3 shows up accurately here as "Dirty".
