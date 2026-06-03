# Backend Handover Guideline: Transitioning from Mock to Real Data

This document outlines the steps required for a backend developer to transition the Presidio PMS frontend from its current local-storage mock data environment to a real production-ready backend API.

## Overview of Current State
Currently, the application relies on an in-browser procedural generator (`useDemoSeeder.ts` utilizing `@faker-js/faker`) and local storage to persist data. The UI components are fully reactive and read exclusively from Pinia state management stores (`app/stores/*.ts`).

Because the UI components are decoupled from the data fetching logic, **you do not need to modify the Vue components directly**. You only need to update how the Pinia stores hydrate their data.

---

## Step 1: Remove Demo Utilities & Cleanup Code

The application ships with development utilities that populate the mock data. These should be deleted prior to production deployment, but **only after** you have successfully connected the API. This ensures you have visual mock data to test against while building the backend.

### Files to Delete
- `app/components/DemoFab.vue` (The floating action button)
- `app/components/DevToolModal.vue` (The settings modal for the seeder)
- `app/composables/useDemoSeeder.ts` (The faker.js procedural data generator)
- `app/composables/useDevSettings.ts` (Cookie persistence for demo tools)

### Code Cleanup
**In `app/app.vue`:**
- Remove the `<DemoFab />` and `<DevToolModal />` component references from the template.
- Remove the script logic that imports `useDevSettings` and checks for developer query parameters (like `isDevMode`).

**In `package.json`:**
- Remove the `@faker-js/faker` package from `devDependencies`. You can do this by running:
  ```bash
  bun remove @faker-js/faker
  ```

---

## Step 2: Implement API Fetching in Pinia Stores

Currently, every Pinia store (`rooms`, `reservations`, `folios`, `tasks`, etc.) has three specific functions built for the demo. 

**Code to Delete in Stores (`app/stores/*.ts`):**
1. `persist()`: Used to save state to the browser's local storage.
2. `seed()`: Used by the demo seeder to inject fake data.
3. `hydrate()`: Used to load data from local storage on page refresh.

**What to add:**
You must replace the old `hydrate()` logic with network requests to your REST or GraphQL backend.

### Example Transformation (`useGuestsStore.ts`)

**New (API Backend):**
```typescript
const fetchGuests = async () => {
    if (isHydrated.value) return
    isLoading.value = true
    try {
        // Fetch from your new backend endpoint
        const data = await $fetch('https://api.yourhotel.com/v1/guests', {
            headers: { Authorization: `Bearer ${useAuth().token}` }
        })
        guests.value = data
        isHydrated.value = true
    } catch (error) {
        console.error('Failed to fetch guests', error)
    } finally {
        isLoading.value = false
    }
}
```

---

## Step 3: Update the Authentication Service

The authentication logic is abstracted in `app/services/auth.service.ts`. Currently, it simulates a network delay (e.g., `await delay(500)`) and grabs a user from the local Pinia store.

### Action Required
Delete all simulated delays and dummy logic. Refactor `AuthService.login()` to POST credentials to your backend's authentication endpoint (e.g., `/api/auth/login`), retrieve a JWT or session cookie, and return the authenticated `StaffUser` object.

```typescript
// Proposed update for auth.service.ts
export const AuthService = {
    async login(credentials: LoginCredentials): Promise<StaffUser | null> {
        try {
            const response = await $fetch('https://api.yourhotel.com/v1/auth/login', {
                method: 'POST',
                body: credentials
            })
            
            // Store token securely (e.g., using Nuxt useCookie)
            const tokenCookie = useCookie('auth_token')
            tokenCookie.value = response.token

            return response.user
        } catch (error) {
            throw new Error('Invalid credentials')
        }
    },
    // Update logout() and getStaffUsers() similarly
}
```

---

## Step 4: Handle Mutations (POST/PUT/DELETE)

Currently, actions like `updateUser` or `addGuest` simply push data into the local Vue `ref` arrays and call `persist()` to save to localStorage. 

You will need to update these Pinia actions to send the mutation to the API first. If the API responds with a success status (200/201), you then update the local Vue `ref` so the UI reacts instantly without requiring a full page reload.

> [!TIP]
> Use Nuxt's built-in `$fetch` for API calls, as it automatically handles SSR compatibility and provides excellent TypeScript inference.
