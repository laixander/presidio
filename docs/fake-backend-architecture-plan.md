# Fake Backend Architecture Plan

## Overview

This architecture uses:

- localStorage as persistence
- Pinia as reactive state management
- mock data as the fake database
- services as the API abstraction layer

The goal is to simulate a real backend environment while keeping the application fully frontend-based.

This setup is ideal for:

- SaaS demos
- HRIS prototypes
- admin dashboards
- offline development
- UI/UX testing
- boilerplates
- investor demos

---

# Core Architecture

```txt
UI Components
      ↓
Service Layer
      ↓
Pinia Store
      ↓
localStorage
      ↓
Mock Seed Data
```

---

# Data Lifecycle

## Empty State

Fresh application state with no saved data.

```txt
localStorage = empty
```

UI shows:

- onboarding
- empty state
- seed demo CTA

---

## Seeded State

Application loads demo data.

```txt
Seed Files → Pinia → localStorage
```

This creates a fully interactive demo environment.

---

## Persisted State

User modifications persist across reloads.

```txt
localStorage → Pinia → UI
```

The application behaves like a real database-backed system.

---

# Recommended Folder Structure

```txt
/mock-data
    employees.ts
    loans.ts
    users.ts

/services
    employee.service.ts
    loan.service.ts

/stores
    employees.ts
    loans.ts
    auth.ts

/plugins
    init.client.ts

/core
    storage.ts
    seeder.ts
```

---

# Final Architecture Philosophy

```txt
Pinia = application memory
localStorage = persistence layer
Mock data = fake backend database
Services = API abstraction layer
UI = presentation layer
```

This structure creates a maintainable, scalable frontend-only application architecture that behaves similarly to a real backend-driven system.
