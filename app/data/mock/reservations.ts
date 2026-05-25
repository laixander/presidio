// ============================================================================
// Mock Data: Reservations
// ============================================================================
// 10 reservations with varied statuses, linked to guests and rooms.

import type { Reservation } from '~/types'

export const mockReservations: Reservation[] = [
    {
        id: 1,
        bookingRef: 'PRS-10001',
        guestId: 1,
        roomTypeId: 1,
        roomId: 1,
        checkInDate: '2026-05-20',
        checkOutDate: '2026-05-25',
        status: 'In-House',
        source: 'Walk-in'
    },
    {
        id: 2,
        bookingRef: 'PRS-10002',
        guestId: 2,
        roomTypeId: 1,
        roomId: 3,
        checkInDate: '2026-05-21',
        checkOutDate: '2026-05-24',
        status: 'In-House',
        source: 'Phone'
    },
    {
        id: 3,
        bookingRef: 'PRS-10003',
        guestId: 3,
        roomTypeId: 2,
        roomId: 12,
        checkInDate: '2026-05-19',
        checkOutDate: '2026-05-26',
        status: 'In-House',
        source: 'Corporate'
    },
    {
        id: 4,
        bookingRef: 'PRS-10004',
        guestId: 4,
        roomTypeId: 1,
        roomId: null,
        checkInDate: '2026-05-25',
        checkOutDate: '2026-05-28',
        status: 'Pending',
        source: 'OTA'
    },
    {
        id: 5,
        bookingRef: 'PRS-10005',
        guestId: 5,
        roomTypeId: 2,
        roomId: 6,
        checkInDate: '2026-05-22',
        checkOutDate: '2026-05-25',
        status: 'In-House',
        source: 'Corporate'
    },
    {
        id: 6,
        bookingRef: 'PRS-10006',
        guestId: 6,
        roomTypeId: 3,
        roomId: null,
        checkInDate: '2026-05-24',
        checkOutDate: '2026-05-27',
        status: 'Confirmed',
        source: 'Phone'
    },
    {
        id: 7,
        bookingRef: 'PRS-10007',
        guestId: 7,
        roomTypeId: 1,
        roomId: 8,
        checkInDate: '2026-05-21',
        checkOutDate: '2026-05-23',
        status: 'In-House',
        source: 'Walk-in'
    },
    {
        id: 8,
        bookingRef: 'PRS-10008',
        guestId: 8,
        roomTypeId: 3,
        roomId: 11,
        checkInDate: '2026-05-22',
        checkOutDate: '2026-05-26',
        status: 'In-House',
        source: 'OTA'
    },
    {
        id: 9,
        bookingRef: 'PRS-10009',
        guestId: 9,
        roomTypeId: 4,
        roomId: 15,
        checkInDate: '2026-05-20',
        checkOutDate: '2026-05-24',
        status: 'In-House',
        source: 'Corporate'
    },
    {
        id: 10,
        bookingRef: 'PRS-10010',
        guestId: 10,
        roomTypeId: 2,
        roomId: null,
        checkInDate: '2026-05-18',
        checkOutDate: '2026-05-21',
        status: 'Cancelled',
        source: 'Phone'
    }
]
