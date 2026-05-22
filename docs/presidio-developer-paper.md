# Presidio Developer Paper

**Project Title:** Presidio Hotel Property Management System  
**Target Client:** N/A

---

# 1. Executive Summary

The PRESIDIO is a web-based Property Management System developed by Centralized Cloud Computing International Inc. to streamline and centralize hotel operations through a unified, role-based platform. The system supports key operational departments including Administration, Front Desk, Billing, and Housekeeping, providing each role with dedicated dashboards, tools, and workflows tailored to their operational responsibilities.

PRESIDIO centralizes reservation management, guest monitoring, room assignment, housekeeping status tracking, folio and billing management, payment processing, and operational reporting within a single integrated environment. Through centralized dashboards and real-time operational monitoring, the platform provides visibility into occupancy, bookings, room statuses, guest activities, and revenue performance, enabling improved operational coordination and faster decision-making.

The platform also features an Operational Simulation Engine that enables administrators, educators, and trainees to simulate hotel workflows such as bookings, check-ins, check-outs, billing operations, and housekeeping activities. This supports onboarding, workflow testing, and hospitality training scenarios, positioning PRESIDIO as both an operational management solution and a training-oriented hotel simulation platform.

Through its web-based architecture, role-based workspaces, and centralized operational tools, PRESIDIO improves operational efficiency, reduces manual coordination, enhances workflow visibility, and supports modern hospitality management within a unified digital environment.

---

# 2. Architecture Overview

The system follows a Software-as-a-Service (SaaS) architecture model where hotel operations are centralized into a cloud-based web platform accessible through role-based user accounts.

## 2.1 Tech Stack

| Category | Technologies |
|---|---|
| Architecture | SaaS (Software-as-a-Service), Multi-Tenant Web Architecture |
| Frontend | Nuxt3, Nuxt UI v4, Tailwind CSS (via Nuxt UI), Pinia |
| Backend | Node.js (Express.js API), TypeScript, Sequelize ORM |
| Authentication & Security | JWT, bcrypt, CORS, Helmet |
| Database | PostgreSQL |
| Caching & Storage | Redis, MinIO |
| Analytics & Reporting | Chart.js (via Vue Chart.js), jsPDF, jsPDF AutoTable, XLSX |
| AI Layer | Ollama (Local LLM Inference), n8n AI Workflow Automation |
| Deployment & DevOps | Docker, Helm, Kubernetes (Optional) |

---

# 3. Modules and Key Features

| Module | Description |
|---|---|
| Profiles Management | Manages guest profiles, guest history, VIP tagging, company references, and profile-linked reservation records. |
| Reservation Management | Handles booking creation, reservation search, reservation modification, cancellations, room assignment, and workflow coordination. |
| Groups & Blocks | Supports group reservations, room blocks, conferences, company bookings, tours, and large-scale accommodation coordination. |
| Front Desk Operations | Handles guest arrivals, check-in, check-out, walk-in reservations, and in-house guest monitoring. |
| Cashier & Billing | Handles folio management, charge posting, payment processing, invoice generation, and settlement workflows. |
| Rooms Management | Manages room occupancy, housekeeping status, maintenance coordination, and room monitoring. |
| Analytics & Reporting | Generates operational summaries, booking analytics, revenue reports, and exportable management insights. |
| Security & Access Control | Implements role-based authentication, protected APIs, and audit logging. |

---

# 4. User Roles

| Role | Capabilities |
|---|---|
| Administrator | Manage users, configure system settings, monitor dashboards, generate reports, and configure simulation environments. |
| Front Desk | Create reservations, assign rooms, perform check-ins/check-outs, and manage booking operations. |
| Billing Officer | Manage guest folios, process payments, generate invoices, and monitor billing transactions. |
| Housekeeping | Update room clean status, manage housekeeping tasks, and monitor room conditions. |

---

# 5. User Stories

## 5.1 Authentication & Access

- As a User, I should be able to log in securely using my assigned credentials.
- As a User, I should be redirected to the correct workspace based on my assigned operational role.
- As a User, I should be able to log out securely from the platform.
- As an Administrator, I should be able to manage user accounts and role assignments.
- As a User, I should be able to access either Simulation Mode or Live Operation Mode depending on my environment permissions.

## 5.2 Reservation Management

- As a Front Desk Officer, I should be able to create a reservation for a guest.
- As a Front Desk Officer, I should be able to search existing reservations.
- As a Front Desk Officer, I should be able to modify reservation details.
- As a Front Desk Officer, I should be able to cancel reservations.
- As a Front Desk Officer, I should be able to assign rooms to reservations.

## 5.3 Guest Profiles

- As a Front Desk Officer, I should be able to create guest profiles.
- As a Front Desk Officer, I should be able to link reservations to guest profiles.
- As a Front Desk Officer, I should be able to view guest history and previous stays.
- As a Front Desk Officer, I should be able to tag VIP guests.

## 5.4 Billing & Folio Management

- As a Billing Officer, I should be able to open and manage guest folios.
- As a Billing Officer, I should be able to post additional charges to folios.
- As a Billing Officer, I should be able to apply guest payments.
- As a Billing Officer, I should be able to process settlements.
- As a Billing Officer, I should be able to generate invoices and receipts.

---

# 6. Process Flow

## 6.1 Administrator Module

- Manage Users
- Add Rooms
- Configure System Settings
- Override Folio Adjustments
- Monitor Operational Dashboards
- Generate Reports
- Configure Simulation Settings

## 6.2 Front Desk Module

- Search Room Availability
- Create Reservation
- Guest Profile Linking
- Assign Room
- Process Guest Check-In
- Monitor In-House Guests
- Process Guest Check-Out

## 6.3 Billing Module

- Open Guest Folio
- Post Folio Charges
- Apply Payments
- Generate Invoice
- Process Folio Settlement
- Close Folio

---

# 7. Entity Relationship Diagram

https://dbdiagram.io/d/presidio_erd-6a0d29439f1f8ec47b59e44b
