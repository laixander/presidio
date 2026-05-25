# Phase 6: Simulation Engine Complete

We have successfully implemented the Simulation Engine! This is the crown jewel of the Presidio demo, allowing you to artificially generate hotel activity to test how the system holds up under pressure.

## What Was Built

### 1. The Simulation Brain (`useSimulation`)
A robust state-machine composable that runs a background timer loop (`setInterval`). On every tick, it uses weighted probability to generate a random action.
- **Auto-Booking:** Generates a random guest and booking dates.
- **Auto-Check-In:** Finds pending reservations, finds clean vacant rooms of the required type, assigns them, and opens a billing folio.
- **Auto-Charge:** Finds open folios and randomly posts itemized charges (e.g., Mini Bar, Laundry).
- **Auto-Check-Out:** Automatically settles balances (pays by Credit Card) and checks out guests, leaving their rooms Dirty.
- **Auto-Housekeeping:** Flips Dirty/Pickup rooms back to Clean.

### 2. Engine Control Panel (`/admin/simulation`)
A massive command center to orchestrate the simulation.
- **Status Dashboard:** Watch the Engine Ticks and Events Generated counters climb in real-time. The State indicator features a spinning loader when running.
- **Transport Controls:** START, PAUSE, STEP, and RESET. You can pause the simulation at any time, or click "Step" to manually force exactly 1 engine tick.
- **Engine Speed:** A slider to control the tick interval (from 500ms to 10 seconds).
- **Probability Matrix:** Sliders to adjust the likelihood of specific events. Want to simulate a massive wave of morning departures? Crank Check-Outs to 100%!

### 3. Simulation Activity Feed (`/admin/simulation-logs`)
A real-time terminal-like feed of exactly what the engine is doing under the hood.
- Displays timestamps down to the millisecond.
- Color-coded badges for event severity (`info`, `success`, `warning`, `error`).
- Detailed messages (e.g., "Simulated Charge: Restaurant for ₱1500 to Folio FOL-004").

## Validation

1. Navigate to the **Engine Control** via the path `/admin/simulation`.
2. Ensure Engine Speed is set to a moderate pace (e.g., 2000ms).
3. Click **START**. You will see the State change to "Running" and the Engine Ticks counter will begin incrementing.
4. Keep an eye on "Events Generated". Once it goes up, click the **View Logs** button in the top right.
5. Watch the Activity Feed stream in real-time! You will see bookings, check-ins, charges, and housekeeping tasks being executed autonomously.
6. Now, open a second browser tab and go to the **Front Desk** or **Billing** dashboards. You will see the data updating and populating *live* right before your eyes as the background simulation does its work!
