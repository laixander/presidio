# Simulation and Training Module: Walkthrough

The Simulation and Training module has been successfully implemented and integrated into the Presidio application. This module allows an administrator or teacher to run a live, interactive hotel simulation that synchronizes in real-time with connected student sessions. Student data is carefully sandboxed to prevent pollution of the main application state.

## 1. Data Segregation & State Management
We introduced a centralized `useTrainingStore` which tracks active training sessions, the user's role (Teacher or Student), and their connection status.
All core Pinia stores (`reservations`, `folios`, `groups`, `guests`, `housekeeping`, `inventory`, `rooms`, `settings`, `users`) were refactored to dynamically generate their `localStorage` keys.
- **Normal Operation:** Uses `STORAGE_KEY = 'presidio_<store>'`.
- **Training Session Active:** Uses `STORAGE_KEY = 'presidio_trn_<sessionId>_<store>'`.
This ensures that when a student joins a session, their local data is instantly swapped to a clean slate unique to that session, preserving the main data.

## 2. Real-Time Communication Layer (Nitro SSE)
We built a real-time Server-Sent Events (SSE) system directly into the Nuxt Nitro backend:
- **`server/api/training/join.post.ts`**: Endpoint for creating or joining a session.
- **`server/routes/training/stream.ts`**: The SSE connection endpoint where clients listen for real-time commands.
- **`server/api/training/broadcast.post.ts`**: The endpoint used by the teacher to push commands to all connected students in the session.
- **`app/composables/useTrainingSync.ts`**: A client-side composable that manages the EventSource connection and executes incoming commands (e.g., `START`, `PAUSE`, `HIGHLIGHT`) on the student's local simulation engine.

## 3. Teacher Controls (Admin Panel)
The Simulation Engine page (`/admin/simulation`) has been upgraded to act as the Teacher's command center:
- **Session Management:** The teacher can dynamically generate a session ID and create a new training session.
- **Broadcasting Transport Controls:** The Start, Pause, Reset, and Step controls now use `useTrainingSync().broadcast()` to ensure all connected students follow along simultaneously. The simulation engine speed is also synchronized.
- **Teacher Guides Panel:** A newly added component (`TeacherGuidesPanel.vue`) allows the teacher to explicitly trigger UI highlights on the students' screens (e.g., "Highlight Front Desk Tab", "Highlight Check-In Button").

## 4. Student View & Guided Elements
- **Student Join Portal (`/training/join`)**: A simple portal where students input the Session ID provided by the teacher to connect.
- **Training Mode Banner**: The `dashboard.vue` layout was updated to display a persistent warning banner when a training session is active, reminding the user that data is sandboxed.
- **Training Spotlight Component**: We built `TrainingSpotlight.vue`, an interactive overlay that visually highlights specific UI elements based on CSS selectors (using `data-guide` attributes). When the teacher broadcasts a highlight command, the spotlight smoothly focuses on the targeted element (like the "Check-In" button) across all student screens.

## Next Steps
You can now test this by:
1. Opening two browser windows.
2. In Window 1 (Teacher), go to **Admin > Engine Control**, create a session, and note the Session ID.
3. In Window 2 (Student), navigate to `/training/join` and input the Session ID.
4. From the Teacher window, start the simulation or trigger a highlight, and observe the Student window syncing in real-time.
