# Administrator Module Implementation Plan

We will now focus on completing the remaining management pages in the Administrator module. 

> [!NOTE]
> Originally, the plan listed `admin/guests.vue` as a separate page. Since we already built a highly capable Guest Directory and Profile view in the Front Desk module (`/frontdesk/guests`), I propose we do NOT duplicate it. Instead, Administrators can simply access the Front Desk guest directory via the sidebar.

## Open Questions

1. **Authentication Mode**: We currently use a mock `useDemoAuth` store with `localStorage`. When building `admin/users.vue`, do you want me to create a mock `usersStore` to save/edit users locally, or should we leave the user table static/read-only for now until we hook up the backend API in the future? (I recommend a mock `usersStore` for a fully functional frontend demo).
2. **Settings Scope**: For `admin/settings.vue`, I plan to include tabs for "General Settings" (hotel name, timezone) and "Room Types" (editing base rates and max occupancy). Does this sound sufficient for the demo?

## Proposed Changes

---

### [NEW] `app/stores/users.ts`
- **State**: Array of `StaffUser` objects (id, name, email, role, isActive).
- **Actions**: `addUser`, `updateUser`, `deleteUser`.
- **Mock Data**: Pre-populated with one user for each department role.

### [NEW] `app/pages/admin/users.vue`
- **Purpose**: Manage staff accounts and role assignments.
- **Layout**: 
  - `UTable` listing users.
  - "Add User" button opening a `UModal` with a form.
  - Row actions to Edit or Delete users.
- **Data Binding**: `usersStore`.

### [NEW] `app/pages/admin/settings.vue`
- **Purpose**: Global system configuration.
- **Layout**: 
  - A `UTabs` component dividing the settings logically.
  - **Tab 1: General**: Read-only form for Hotel Name, Address, Timezone.
  - **Tab 2: Room Types**: A table listing `roomTypes` from `roomsStore`, with the ability to edit Base Rates and Max Occupancy.
- **Data Binding**: `roomsStore.roomTypes`.

### [NEW] `app/pages/admin/reports.vue`
- **Purpose**: Read-only analytics and reports.
- **Layout**: 
  - `vue-chartjs` Line Chart showing simulated revenue trend over the last 7 days (mock data).
  - KPI cards summarizing Total Revenue (from `foliosStore`), Total Bookings (from `reservationsStore`), and Average Occupancy.
  - A mock "Export to PDF/Excel" button that triggers a success toast.

### [MODIFY] `app/layouts/dashboard.vue`
- Add "Users", "Settings", and "Reports" links to the sidebar navigation under the Administrator view.

---

## Verification Plan

### Manual Verification
1. Login as Administrator. Verify the new sidebar links are present.
2. Navigate to **Users**. Add a new user, edit an existing one, and delete one. Verify the store updates correctly.
3. Navigate to **Settings**. Switch to the Room Types tab and edit a base rate. Verify the `roomsStore` is updated.
4. Navigate to **Reports**. Ensure the charts render without crashing and the KPI values accurately reflect the store totals.
5. Login as any other role (e.g. Housekeeping) and verify that these Admin-only pages are inaccessible (blocked by `AuthGate`).
