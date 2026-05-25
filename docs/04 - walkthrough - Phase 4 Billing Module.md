# Phase 4: Billing Module Complete

We have successfully implemented the Billing and Cashier module. This introduces a robust financial tracking system directly into the PMS.

## What Was Built

### 1. Billing Dashboard (`/billing`)
The main dashboard gives the Cashier a bird's-eye view of all hotel financials.
- **KPI Cards:** Automatically calculates Total Revenue (all posted charges) and Total Collected (all applied payments) across the entire system.
- **Folios Table:** A complete directory of all guest folios (Open, Closed, and Settled) highlighting the live outstanding balances.

### 2. Folio Details (`/billing/folios/[id]`)
Clicking into a folio opens the detailed ledger view for that specific guest stay.
- **Split-Ledger View:** Charges are neatly listed on the left, and Payments on the right, providing a clear visual distinction between debits and credits.
- **Real-time Balance:** A large, color-coded balance indicator automatically updates as you interact with the folio.

### 3. Financial Modals
- **Post Charge Modal:** Allows you to post manual charges (e.g., Room Service, Laundry, Mini Bar) to the folio with automatic total calculation.
- **Apply Payment Modal:** Allows you to record payments (Cash, Credit Card, Bank Transfer) against the outstanding balance.
- **Settle Folio:** A strict validation button that only unlocks when the Balance hits exactly `₱0.00`.

## Validation

1. Head to the new **Billing** page from the sidebar.
2. Select any **Open Folio**.
3. Try posting a `Restaurant` charge for `₱2,000`. Watch the balance increase and turn red.
4. Try to click **Settle Folio**. You will receive an error because there is an outstanding balance!
5. Click **Apply Payment**, pay the exact balance due via `Credit Card`.
6. Watch the balance turn green (`₱0.00`) and successfully **Settle** the folio!

> [!TIP]
> **Check-Out Integration**
> Remember how we built the Check-Out blocker in Phase 3? Now that you can successfully settle a folio to zero, you can return to the Front Desk and successfully Check-Out that guest!
