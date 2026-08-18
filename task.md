# Simulation/Training Module Tasks

## 1. State Management & Data Segregation
- [x] Create `app/stores/training.ts` to manage training session state.
- [x] Modify `app/stores/reservations.ts` to use dynamic storage key prefix.
- [x] Modify `app/stores/folios.ts` to use dynamic storage key prefix.
- [x] Modify `app/stores/groups.ts` to use dynamic storage key prefix.
- [x] Modify `app/stores/guests.ts` to use dynamic storage key prefix.
- [x] Modify `app/stores/housekeeping.ts` to use dynamic storage key prefix.
- [x] Modify `app/stores/inventory.ts` to use dynamic storage key prefix.
- [x] Modify `app/stores/rooms.ts` to use dynamic storage key prefix.
- [x] Modify `app/stores/settings.ts` to use dynamic storage key prefix.
- [x] Modify `app/stores/users.ts` to use dynamic storage key prefix.

## 2. Real-Time Communication Layer
- [x] Create `server/api/training/join.post.ts` for joining/creating sessions.
- [x] Create `server/api/training/broadcast.post.ts` for pushing events.
- [x] Create `server/routes/training/stream.ts` for SSE stream.
- [x] Create `app/composables/useTrainingSync.ts` to connect to SSE.

## 3. Teacher Controls
- [x] Update `app/pages/admin/simulation.vue` with Session setup and broadcast features.
- [x] Create `app/components/TeacherGuidesPanel.vue`.

## 4. Student View & Guided Elements
- [x] Create `app/pages/training/join.vue` for students to join.
- [x] Update `app/layouts/dashboard.vue` to show Training Mode banner.
- [x] Create `app/components/TrainingSpotlight.vue`.
- [x] Integrate spotlight via `data-guide` attributes.
- [x] Update `app/composables/useSimulation.ts` to be callable from the sync stream.
