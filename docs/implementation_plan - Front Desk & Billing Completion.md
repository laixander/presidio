# Front Desk & Billing Completion Plan

We will complete the core operational flow by building the two missing detail pages in the Front Desk and Billing modules.

## User Review Required
Please review the proposed UI components and data bindings. 

## Open Questions
- For Invoices, should we display a simulated "Print/Download PDF" button that just shows a success toast for the demo, or actually try to generate a real PDF client-side? (I plan to use a simulated toast for the demo unless requested otherwise).

## Proposed Changes

---

### Front Desk Module

#### [NEW] [frontdesk/guests/[id].vue](file:///Users/lnaguit/Desktop/code/presidio/app/pages/frontdesk/guests/[id].vue)
- **Purpose**: Detailed Guest Profile view.
- **Layout**: 
  - Header: Guest Avatar, Name, VIP Status badge.
  - Left Column: Contact info (Email, Phone, Company) in a `UCard`.
  - Right Column: Stay History (a `DataTable` showing past and upcoming reservations for this `guestId`).
- **Data Binding**:
  - `guestsStore.getById(route.params.id)`
  - A computed property filtering `reservationsStore.reservations` where `guestId === route.params.id`.
- **Security**: `<AuthGate>` checking for `Administrator` or `Front Desk`.

---

### Billing Module

#### [NEW] [billing/invoices.vue](file:///Users/lnaguit/Desktop/code/presidio/app/pages/billing/invoices.vue)
- **Purpose**: A list of all settled/closed folios, acting as the Invoice history.
- **Layout**:
  - A `DataTable` showing Folio #, Guest Name, Close Date, and Total Amount Paid.
  - An "Actions" column with a "View Invoice" button.
- **Data Binding**:
  - A computed property filtering `foliosStore.folios` where `status === 'Settled' || status === 'Closed'`.
- **Security**: `<AuthGate>` checking for `Administrator` or `Billing`.

## Verification Plan

### Manual Verification
1. Navigate to Front Desk -> Guests. Click on a guest row or an "Actions -> View Profile" button. Verify the URL routes to `/frontdesk/guests/[id]` and displays the correct guest data and their reservations.
2. Navigate to Billing -> Invoices. Verify it only shows folios that have been settled, and displays the correct total paid amount.
3. Test both pages with a user role that does NOT have access (e.g., Housekeeping) and verify the `AuthGate` blocks access.
