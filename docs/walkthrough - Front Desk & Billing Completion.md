# Feature Walkthrough: Front Desk & Billing Completion

We've successfully completed the core operational flow for the Presidio Hotel PMS by implementing the two final pieces of the Front Desk and Billing modules! 

## What We Built

### 1. Detailed Guest Profile 
**Location:** [frontdesk/guests/[id].vue](file:///Users/lnaguit/Desktop/code/presidio/app/pages/frontdesk/guests/[id].vue)

When Front Desk staff click on a guest from the directory, they are now taken to a dedicated, beautiful profile page. 
- **Guest Card:** A sleek left-hand panel displaying their Avatar, VIP status (if applicable), Email, Phone, and Company.
- **Stay History:** A dedicated table on the right that pulls all reservations linked to this guest from the `reservationsStore`. You can see their past, present, and future bookings at a glance, complete with color-coded status badges and clickable Booking Reference links.

### 2. Invoices Dashboard
**Location:** [billing/invoices.vue](file:///Users/lnaguit/Desktop/code/presidio/app/pages/billing/invoices.vue)

The Billing module is now complete with a historical ledger of all closed and settled folios.
- **Historical Ledger:** Automatically filters the `foliosStore` to only show folios with a `Settled` or `Closed` status. 
- **Automated Calculations:** It dynamically looks up the guest's full name and calculates the exact `Total Paid` based on the sum of all payments applied to that folio.
- **PDF Generation:** We added a "Download" button that simulates the generation of a PDF invoice with a clean success notification (toast).
- **Navigation:** Easily accessible directly from the main sidebar under the Billing module.

## Security & Access
Both of these new pages are strictly protected by our robust `<AuthGate>` component.
- The **Guest Profile** is locked down to the `Administrator` and `Front Desk` roles.
- The **Invoices** page is locked down to the `Administrator` and `Billing` roles.

If anyone else (like Housekeeping) tries to navigate directly to these URLs, they will gracefully hit the "Access Denied" lock screen.

---

> [!TIP]
> **Try it out!** 
> Head over to the **Front Desk** dashboard and click on any guest in the directory to view their new detailed profile. Then, switch your role to **Billing** and check out the new **Invoices** tab in the sidebar!
