# AuthGate Implementation Plan

To safely introduce the interactive role-based access pattern without breaking the app, we will use a purely client-side template guard approach. This avoids router redirects, allowing users to safely hit unauthorized pages and gracefully switch roles using the `UserMenu` to reveal the content.

## Proposed Changes

### 1. New Component
#### [NEW] [AuthGate.vue](file:///Users/lnaguit/Desktop/code/presidio/app/components/AuthGate.vue)
- A highly reusable full-screen component that displays an access denied message with a customizable title, description, and icon.

### 2. Guarding the Admin Module
- **Required Roles:** `Administrator`
- **Files Modified:** 
  - `app/pages/admin/index.vue`
  - `app/pages/admin/rooms.vue`
  - `app/pages/admin/simulation.vue`
  - `app/pages/admin/simulation-logs.vue`
- **Change:** Wrap the page layout in a reactive `<template v-else>`, protected by the `<AuthGate>`.

### 3. Guarding the Front Desk Module
- **Required Roles:** `Administrator`, `Front Desk`
- **Files Modified:** 
  - `app/pages/frontdesk/index.vue`
  - `app/pages/frontdesk/guests.vue`
  - `app/pages/frontdesk/bookings/index.vue`
  - `app/pages/frontdesk/bookings/[id].vue`
- **Change:** Apply the `isAuthorized` computed guard and `AuthGate`.

### 4. Guarding the Billing Module
- **Required Roles:** `Administrator`, `Billing`
- **Files Modified:** 
  - `app/pages/billing/index.vue`
  - `app/pages/billing/folios/[id].vue`
- **Change:** Apply the `isAuthorized` computed guard and `AuthGate`.

### 5. Guarding the Housekeeping Module
- **Required Roles:** `Administrator`, `Housekeeping`
- **Files Modified:** 
  - `app/pages/housekeeping/index.vue`
  - `app/pages/housekeeping/tasks.vue`
- **Change:** Apply the `isAuthorized` computed guard and `AuthGate`.

## Verification Plan

### Automated Tests
- Nuxt typecheck will verify that `authStore.currentRole.value` interacts correctly with the `SystemRole` types across all guarded pages.

### Manual Verification
- Log out (so `currentRole` is null). 
- Attempt to navigate to `/housekeeping`. The `AuthGate` should successfully intercept the page rendering and display "Access Denied".
- Without leaving the page, open the `UserMenu` in the sidebar and switch your role to `Housekeeping`.
- Verify that the `AuthGate` instantly disappears and the Housekeeping dashboard beautifully mounts on screen.
