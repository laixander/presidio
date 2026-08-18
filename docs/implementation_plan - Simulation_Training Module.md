# Simulation/Training Module Implementation Plan

This plan details the implementation of a synchronized, multi-client Simulation & Training Engine for the Presidio Hotel PMS. It allows teachers to create training sessions, broadcast simulated events to connected students, and keeps each student's database state strictly segregated.

## Open Questions

> [!IMPORTANT]
> **Real-time Communication:** Does the deployment environment support WebSockets, or should we fall back to Server-Sent Events (SSE) or simple API polling for the teacher-student syncing? (Nitro WebSockets or SSE are recommended).
>
> **Highlighting Library:** For the "highlighted/guided elements" on the student view, do you have a preference for a library (e.g., `driver.js`, `vue-tour`) or should we build a lightweight custom spotlight component?
>
> **Initial State:** When a student joins a session, should they start with a completely empty database, or should the teacher "seed" initial data (like a predefined set of rooms and existing reservations) to all students to ensure everyone has the exact same starting scenario?

## Proposed Architecture

1. **Data Segregation (Local Storage Namespacing):**
   Currently, the application is entirely client-side, storing data in the browser's `localStorage` (e.g., `presidio-reservations`). 
   To achieve data segregation without needing a centralized database per student, we will introduce a `useTrainingStore` that holds the current Training Session ID (e.g., `TRN-1234`). All Pinia stores will dynamically prefix their storage keys with this Session ID when active (e.g., `presidio-reservations-TRN-1234`), ensuring the student's training data is completely isolated from their main data and from other students' data.

2. **Real-time Syncing (Nitro SSE / Polling):**
   We will implement a lightweight signaling backend using Nuxt Nitro. Teachers will send simulation triggers to a `/api/training/broadcast` endpoint. Students subscribed to the session will receive these events in real-time and execute the simulation logic (like generating a booking or highlighting a UI element) inside their own isolated local database.

## Proposed Changes

### 1. State Management & Data Segregation

#### [MODIFY] `app/stores/*.ts` (all stores)
- Update the hardcoded `STORAGE_KEY` logic to use a dynamic prefix based on the active session.
- Ensure the `hydrate` and `persist` methods read/write to the correctly namespaced key so normal hotel data isn't overwritten during a training session.

#### [NEW] `app/stores/training.ts`
- Create a new store to manage the current training session state (Session ID, Role: 'Teacher' | 'Student', Connection Status).

---

### 2. Real-Time Communication Layer

#### [NEW] `server/api/training/join.post.ts`
- Nitro endpoint for students/teachers to join or create a specific session room.

#### [NEW] `server/api/training/broadcast.post.ts`
- Nitro endpoint for the teacher to push simulation events (e.g., `CMD_START_SIM`, `CMD_GENERATE_BOOKING`, `CMD_HIGHLIGHT_ELEMENT`).

#### [NEW] `server/routes/training/stream.ts`
- Server-Sent Events (SSE) route to push real-time commands to connected students in a session.

#### [NEW] `app/composables/useTrainingSync.ts`
- Client-side composable to handle connecting to the stream, listening for teacher commands, and dispatching local Pinia actions accordingly.

---

### 3. Teacher Controls

#### [MODIFY] `app/pages/admin/simulation.vue`
- Add a "Create Training Session" setup screen.
- Modify the existing Engine Control UI so that instead of just generating local events, it calls the `/api/training/broadcast` endpoint to instruct all connected students to generate events simultaneously.
- Display a list or count of "Connected Students" for the active session.

#### [NEW] `app/components/TeacherGuidesPanel.vue`
- A panel in the teacher's UI allowing them to explicitly trigger "Highlight 'Check In' button" or "Show Guide Overlay" to all student screens.

---

### 4. Student View & Guided Elements

#### [NEW] `app/pages/training/join.vue`
- A dedicated page for students to enter a Session ID and their Name to join a teacher's simulation.

#### [MODIFY] `app/layouts/dashboard.vue`
- Add a persistent warning banner when in Training Mode (e.g., "⚠️ Training Session: TRN-1234 Active. Data is sandboxed.").
- Initialize `useTrainingSync()` to listen for events globally if a session is active.

#### [NEW] `app/components/TrainingSpotlight.vue`
- A component responsible for dimming the screen and highlighting specific UI elements (via CSS selectors) when the teacher triggers a "guided" event.

#### [MODIFY] `app/composables/useSimulation.ts`
- Refactor the existing logic so the core functions (`generateBooking`, `generateCheckIn`, etc.) can be called discretely by the sync listener when a command is received from the teacher.

## Verification Plan

### Manual Verification
1. Open two separate browser windows (Window A for Teacher, Window B for Student).
2. **Teacher (A):** Navigates to Simulation UI and creates a session (e.g., `TRN-ABC`).
3. **Student (B):** Navigates to Join page and enters `TRN-ABC`. Verify student's local data starts fresh and is segregated from their normal data.
4. **Teacher (A):** Starts the simulation engine. 
5. **Student (B):** Verify that the student's browser begins automatically receiving bookings and check-ins in real-time, matching the teacher's pace.
6. **Teacher (A):** Triggers a "Highlight Element" command.
7. **Student (B):** Verify the student's UI spotlights the correct element (e.g., dimming the background and highlighting the Front Desk tab).
