// ============================================================================
// Mock Data: Folios, Charges & Payments
// ============================================================================
// 5 open folios with itemized charges and partial payments.

import type { Folio, Charge, Payment } from '~/types'

export const mockFolios: Folio[] = [
    { id: 1, folioNumber: 'FOL-001', guestId: 1, reservationId: 1, status: 'Open', balance: 9500, openedAt: '2026-05-20T14:00:00Z' },
    { id: 2, folioNumber: 'FOL-002', guestId: 2, reservationId: 2, status: 'Open', balance: 3700, openedAt: '2026-05-21T15:00:00Z' },
    { id: 3, folioNumber: 'FOL-003', guestId: 3, reservationId: 3, status: 'Open', balance: 22500, openedAt: '2026-05-19T12:00:00Z' },
    { id: 4, folioNumber: 'FOL-004', guestId: 5, reservationId: 5, status: 'Open', balance: 6600, openedAt: '2026-05-22T14:30:00Z' },
    { id: 5, folioNumber: 'FOL-005', guestId: 8, reservationId: 8, status: 'Open', balance: 3600, openedAt: '2026-05-22T16:00:00Z' }
]

export const mockCharges: Charge[] = [
    // ── Folio 1 (Juan Dela Cruz — Room 101, Standard) ─────────────────────
    { id: 1, folioId: 1, description: 'Room Charge — Standard (3 nights)', type: 'Room Charge', unitPrice: 2500, quantity: 3, total: 7500, postedAt: '2026-05-20T14:00:00Z' },
    { id: 2, folioId: 1, description: 'Mini Bar — Assorted beverages', type: 'Mini Bar', unitPrice: 450, quantity: 1, total: 450, postedAt: '2026-05-21T22:30:00Z' },
    { id: 3, folioId: 1, description: 'Restaurant — Dinner for 2', type: 'Restaurant', unitPrice: 1200, quantity: 1, total: 1200, postedAt: '2026-05-21T20:00:00Z' },
    { id: 4, folioId: 1, description: 'Laundry — Express service', type: 'Laundry', unitPrice: 350, quantity: 1, total: 350, postedAt: '2026-05-22T09:00:00Z' },

    // ── Folio 2 (Maria Santos — Room 103, Deluxe) ─────────────────────────
    { id: 5, folioId: 2, description: 'Room Charge — Deluxe (2 nights)', type: 'Room Charge', unitPrice: 4200, quantity: 2, total: 8400, postedAt: '2026-05-21T15:00:00Z' },
    { id: 6, folioId: 2, description: 'Mini Bar — Snacks & water', type: 'Mini Bar', unitPrice: 300, quantity: 1, total: 300, postedAt: '2026-05-22T23:15:00Z' },

    // ── Folio 3 (Michael Tan — Room 301, Executive Suite) ─────────────────
    { id: 7, folioId: 3, description: 'Room Charge — Executive Suite (4 nights)', type: 'Room Charge', unitPrice: 8500, quantity: 4, total: 34000, postedAt: '2026-05-19T12:00:00Z' },
    { id: 8, folioId: 3, description: 'Restaurant — Business dinner (5 pax)', type: 'Restaurant', unitPrice: 3500, quantity: 1, total: 3500, postedAt: '2026-05-20T21:00:00Z' },
    { id: 9, folioId: 3, description: 'Mini Bar — Premium selection', type: 'Mini Bar', unitPrice: 800, quantity: 1, total: 800, postedAt: '2026-05-21T01:00:00Z' },
    { id: 10, folioId: 3, description: 'Laundry — Suit pressing', type: 'Laundry', unitPrice: 700, quantity: 1, total: 700, postedAt: '2026-05-20T08:00:00Z' },
    { id: 11, folioId: 3, description: 'Airport transfer — Sedan', type: 'Misc', unitPrice: 3500, quantity: 1, total: 3500, postedAt: '2026-05-19T11:00:00Z' },

    // ── Folio 4 (Carlos Garcia — Room 201, Deluxe) ────────────────────────
    { id: 12, folioId: 4, description: 'Room Charge — Deluxe (1 night)', type: 'Room Charge', unitPrice: 4200, quantity: 1, total: 4200, postedAt: '2026-05-22T14:30:00Z' },
    { id: 13, folioId: 4, description: 'Restaurant — Lunch buffet', type: 'Restaurant', unitPrice: 2200, quantity: 1, total: 2200, postedAt: '2026-05-23T12:30:00Z' },
    { id: 14, folioId: 4, description: 'Mini Bar — Soft drinks', type: 'Mini Bar', unitPrice: 200, quantity: 1, total: 200, postedAt: '2026-05-22T19:00:00Z' },

    // ── Folio 5 (Patricia Villanueva — Room 206, Standard) ────────────────
    { id: 15, folioId: 5, description: 'Room Charge — Standard (1 night)', type: 'Room Charge', unitPrice: 2500, quantity: 1, total: 2500, postedAt: '2026-05-22T16:00:00Z' },
    { id: 16, folioId: 5, description: 'Mini Bar — Wine & cheese', type: 'Mini Bar', unitPrice: 600, quantity: 1, total: 600, postedAt: '2026-05-22T22:00:00Z' },
    { id: 17, folioId: 5, description: 'Parking fee — Overnight', type: 'Misc', unitPrice: 500, quantity: 1, total: 500, postedAt: '2026-05-22T16:00:00Z' }
]

export const mockPayments: Payment[] = [
    // Folio 2 — partial cash payment
    { id: 1, folioId: 2, amount: 5000, method: 'Cash', paymentDate: '2026-05-21T16:00:00Z' },
    // Folio 3 — large credit card deposit
    { id: 2, folioId: 3, amount: 20000, method: 'Credit Card', paymentDate: '2026-05-19T12:30:00Z' }
]
