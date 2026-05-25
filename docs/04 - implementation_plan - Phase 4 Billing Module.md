# Phase 4: Billing Module

This plan covers the implementation of the Cashier/Billing module, handling guest folios, posting charges, and processing payments.

## Proposed Changes

### 1. Billing Dashboard / Folios Directory
#### [MODIFY] [index.vue](file:///Users/lnaguit/Desktop/code/presidio/app/pages/billing/index.vue)
- **KPI Cards:** Top-level stats for Total Revenue, Total Payments Collected, and count of Open Folios.
- **Data Table:** Replace the current placeholder with a fully functional `UTable` listing all folios.
- **Columns:** Folio Number, Guest Name, Reservation Ref, Status (Open/Closed/Settled), Balance Due.
- **Actions:** View Details button routing to the specific folio page.

### 2. Folio Detail View
#### [NEW] [folios/[id].vue](file:///Users/lnaguit/Desktop/code/presidio/app/pages/billing/folios/[id].vue)
- **Folio Header:** Displays Guest Name, Room Number, Folio Number, and a large color-coded Balance badge.
- **Charges Section (Left Pane):** Data table of all charges posted to the folio.
- **Payments Section (Right Pane):** Data table of all payments applied to the folio.
- **Actions Row:** 
  - `+ Post Charge` (Opens modal)
  - `+ Apply Payment` (Opens modal)
  - `Settle Folio` (Disabled unless Balance == 0)

### 3. Financial Modals
#### [NEW] [ChargeModal.vue](file:///Users/lnaguit/Desktop/code/presidio/app/components/ChargeModal.vue)
- Zod-validated form to post a new charge to a folio.
- **Fields:** Type (Room Charge, Restaurant, Laundry, etc.), Description, Unit Price, Quantity.
- Automatically updates the `foliosStore` total charges and recalculates the balance.

#### [NEW] [PaymentModal.vue](file:///Users/lnaguit/Desktop/code/presidio/app/components/PaymentModal.vue)
- Zod-validated form to apply a payment against the folio balance.
- **Fields:** Method (Cash, Credit Card, Bank Transfer), Amount (defaults to the outstanding balance).
- Automatically updates the `foliosStore` total payments and recalculates the balance.

## User Review Required

> [!NOTE]
> **Layout Approach**
> The original architecture plan mentioned a split-pane layout (sidebar list + right panel detail) for the Billing Dashboard. To keep the UI consistent with the Front Desk and Admin modules (and much cleaner for mobile views), I propose using the standard **Data Table Directory -> Detail Page** routing structure instead. Is this acceptable?

## Verification Plan

### Automated Tests
- Run `bun run typecheck` to ensure the new financial Vue components strictly type-check against the Folio, Charge, and Payment interfaces.

### Manual Verification
- Navigate to the Billing dashboard and view the KPI cards.
- Click into an Open Folio.
- Add a Restaurant charge for ₱1,500 and verify the Balance updates.
- Apply a Cash payment for ₱1,500 and verify the Balance hits ₱0.
- Verify that the Check-Out blocker on the Front Desk now allows the guest to depart.
