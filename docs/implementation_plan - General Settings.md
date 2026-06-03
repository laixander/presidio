# Goal: Make General Settings Functional

Currently, the **General Settings** tab in `app/pages/admin/settings.vue` is just a UI placeholder. The data (`hotelName`, `timezone`, `currency`, `taxRate`) is stored as a local `ref` with mock data and isn't saved anywhere when you click "Save Changes". 

While the original `presidio_implementation_plan.md` lists "General config" for this page, it didn't explicitly outline a Pinia store for it in the architecture (likely keeping it simple for the MVP). However, to make this truly aligned and functional, we should create a store to persist these settings so they can be accessed globally (e.g., displaying the `hotelName` in reports or using `taxRate` in the billing module).

## Proposed Changes

### 1. Create a Settings Store (`app/stores/settings.ts`)
We will create a new Pinia store to manage global application settings.

#### [NEW] [app/stores/settings.ts](file:///Users/lnaguit/Desktop/code/presidio/app/stores/settings.ts)
- Define state for: `hotelName`, `timezone`, `currency`, `taxRate`.
- Implement `persist` and `hydrate` methods using `localStorage` (similar to other stores).
- Add an `updateSettings` action to save new values.
- Add a `clear` action to reset to defaults.

### 2. Connect Settings Page (`app/pages/admin/settings.vue`)
We will wire the existing UI to the new store.

#### [MODIFY] [app/pages/admin/settings.vue](file:///Users/lnaguit/Desktop/code/presidio/app/pages/admin/settings.vue)
- Import and use `useSettingsStore`.
- Pre-fill the `generalState` form with data from the store.
- Update the `saveGeneralSettings` function to call `settingsStore.updateSettings(...)` instead of just showing a mock toast.

### 3. Update the Seeder (`app/composables/useDemoSeeder.ts`)
Ensure the settings store is reset when the system is cleared.

#### [MODIFY] [app/composables/useDemoSeeder.ts](file:///Users/lnaguit/Desktop/code/presidio/app/composables/useDemoSeeder.ts)
- Add `settingsStore` to the reset process in `resetAll`.

## Verification Plan
1. Go to Admin > Settings > General Settings.
2. Change the "Hotel Name" and "Tax Rate", then click Save.
3. Refresh the page to verify that the new settings persist.
4. Use the DevTools to "Reset System" and verify the settings revert to their default state.
