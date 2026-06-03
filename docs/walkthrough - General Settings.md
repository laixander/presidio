# Walkthrough: General Settings

I have fully connected the **General Settings** tab to a new Pinia store, meaning the settings are now globally accessible and saved persistently in the browser!

## Changes Made

### 1. Created `app/stores/settings.ts`
- Added a new store with state for `hotelName`, `timezone`, `currency`, and `taxRate`.
- Added persistence via `localStorage` so settings aren't lost when you refresh the page.
- Created an `updateSettings` action to apply changes.

### 2. Connected Settings UI
- Updated `app/pages/admin/settings.vue` to read from `useSettingsStore()`.
- Modifying the Hotel Name or Tax Rate and clicking **Save Changes** now correctly persists the data.

### 3. Updated Demo Seeder
- Hooked the new `settingsStore` into the `resetAll` method inside `useDemoSeeder.ts`.
- When you use the dev tools to reset the system, the General Settings will revert to their defaults (`Presidio Hotel & Resort`, `12%` tax).
- Registered the store for hydration on application startup in the `presidio.client.ts` plugin.

## Verification
- Navigate to **Settings > General Settings**.
- Change the **Hotel Name** to something else and click **Save Changes**.
- Refresh the browser—you'll see that your changes are saved.
- Use the **DevTool** to "Reset System", and the settings will revert to the default state.
