// ============================================================================
// Types Definition
// ============================================================================
// Contains all global interfaces and types used across the application.

// ============================================================================
// Existing Types (Agent Reference Pages)
// ============================================================================

/**
 * Represents a system user (used by agent table reference).
 */
export interface User {
  id: number
  name: string
  email: string
  role: string
  status: 'Active' | 'Inactive'
}

/**
 * Represents an actionable item in headers.
 */
export interface HeaderAction {
  label: string
  icon: string
  event?: string
  color?: string
  variant?: string
  size?: string
}

/**
 * Represents an application log entry.
 */
export interface AppLog {
  id: string
  message: string
  state: string
  level: 'success' | 'info' | 'warn' | 'error'
  timestamp: string
}

// ============================================================================
// Presidio Hotel PMS Types
// ============================================================================

/**
 * System roles for role-based access control.
 */
export type SystemRole = 'Administrator' | 'Front Desk' | 'Billing' | 'Housekeeping'

/**
 * Represents a hotel staff member.
 */
export interface StaffUser {
  id: number
  name: string
  email: string
  password: string
  role: SystemRole
  isActive: boolean
}

/**
 * Represents a hotel guest profile.
 */
export interface Guest {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  isVip: boolean
  company: string | null
}

/**
 * Defines a category of room (e.g., Standard, Deluxe).
 */
export interface RoomType {
  id: number
  name: string
  baseRate: number
  maxOccupancy: number
}

// ── Room Status Enums ─────────────────────────────────────────────────────

export type OccupancyStatus = 'Vacant' | 'Occupied'

export type CleanStatus = 'Clean' | 'Dirty' | 'Pickup' | 'Inspected'

export type RoomCondition = 'Normal' | 'Maintenance'

/**
 * Represents a physical hotel room.
 */
export interface Room {
  id: number
  number: string
  floor: number
  roomTypeId: number
  rateOverride: number | null
  occupancyStatus: OccupancyStatus
  cleanStatus: CleanStatus
  condition: RoomCondition
}

// ── Reservation Types ─────────────────────────────────────────────────────

export type ReservationStatus = 'Pending' | 'Confirmed' | 'In-House' | 'Done' | 'Cancelled'

export type BookingSource = 'Walk-in' | 'Phone' | 'OTA' | 'Corporate'

/**
 * Represents a guest reservation / booking.
 */
export interface Reservation {
  id: number
  bookingRef: string
  guestId: number
  roomId: number | null
  checkInDate: string
  checkOutDate: string
  status: ReservationStatus
  source: BookingSource
}

// ── Billing Types ─────────────────────────────────────────────────────────

export type FolioStatus = 'Open' | 'Closed' | 'Settled'

/**
 * Represents a guest billing folio.
 */
export interface Folio {
  id: number
  folioNumber: string
  guestId: number
  reservationId: number
  status: FolioStatus
  balance: number
  openedAt: string
}

export type ChargeType = 'Room Charge' | 'Mini Bar' | 'Restaurant' | 'Laundry' | 'Misc'

/**
 * Represents a charge posted to a folio.
 */
export interface Charge {
  id: number
  folioId: number
  description: string
  type: ChargeType
  unitPrice: number
  quantity: number
  total: number
  postedAt: string
}

export type PaymentMethod = 'Cash' | 'Credit Card' | 'Bank Transfer'

/**
 * Represents a payment applied to a folio.
 */
export interface Payment {
  id: number
  folioId: number
  amount: number
  method: PaymentMethod
  paymentDate: string
}

// ── Housekeeping Types ────────────────────────────────────────────────────

export type TaskType = 'Cleaning' | 'Turn-down' | 'Maintenance'

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed'

/**
 * Represents a housekeeping task assigned to a room.
 */
export interface HousekeepingTask {
  id: number
  roomId: number
  assignedTo: number | null
  taskType: TaskType
  status: TaskStatus
  createdAt: string
  completedAt: string | null
}

// ── Audit Types ───────────────────────────────────────────────────────────

/**
 * Represents an audit trail entry.
 */
export interface AuditLog {
  id: number
  userId: number
  action: string
  entity: string
  entityId: number
  timestamp: string
}
