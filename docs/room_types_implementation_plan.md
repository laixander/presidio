# Goal: Implement Room Type Management

Currently, the `settings.vue` page only allows editing the base rates of existing room types. The implementation plan (`presidio_implementation_plan.md`) states that this page should handle **"room type config, rate management"**. To fully support "room type config", we need to allow creating, updating, and deleting room types.

## Open Questions

> [!IMPORTANT]
> **Inline Editing vs Modal**
> Should we allow inline editing directly in the table (like how base rates are currently edited), or should we use an "Add / Edit Room Type" modal for a cleaner experience when adding new room types? I recommend adding a "New Room Type" button that opens a modal, and keeping the base rate inline-editable for quick rate adjustments, while adding an "Edit" action to the row to edit name/capacity. Let me know your preference!

> [!WARNING]
> **Deleting Room Types**
> If a room type is currently assigned to a room, deleting it could cause issues. We will need to prevent deletion if rooms are actively using that room type.

## Proposed Changes

### 1. Update the Rooms Store (`app/stores/rooms.ts`)
We need to add actions to manage room types.

#### [MODIFY] [app/stores/rooms.ts](file:///Users/lnaguit/Desktop/code/presidio/app/stores/rooms.ts)
- Add `addRoomType` action
- Add `updateRoomType` action
- Add `deleteRoomType` action (with a check to ensure no rooms are using it before deletion)

---

### 2. Update Settings Page (`app/pages/admin/settings.vue`)
We will add the UI elements required to manage room types fully.

#### [MODIFY] [app/pages/admin/settings.vue](file:///Users/lnaguit/Desktop/code/presidio/app/pages/admin/settings.vue)
- Add a **"+ New Room Type"** button in the header of the Room Types card.
- Add an **Action Menu** column to the table with "Edit" and "Delete" options.
- Create a Slideover or Modal containing a form to input:
  - Name
  - Max Occupancy
  - Base Rate
- Wire up the save and delete functionality to the store actions.

## Verification Plan

### Manual Verification
1. Navigate to Admin > Settings > Room Types.
2. Click "+ New Room Type", fill out the form, and verify it appears in the table.
3. Edit an existing room type's name and occupancy.
4. Attempt to delete a room type. Verify that it works (or blocks deletion if rooms are assigned to it).
5. Verify that creating a new room type makes it available in the Rooms page when creating a new room.
