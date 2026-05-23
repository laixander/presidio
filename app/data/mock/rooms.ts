// ============================================================================
// Mock Data: Rooms & Room Types
// ============================================================================
// 4 room types and 16 rooms across 3 floors with varied statuses.

import type { Room, RoomType } from '~/types'

export const mockRoomTypes: RoomType[] = [
    { id: 1, name: 'Standard', baseRate: 2500, maxOccupancy: 2 },
    { id: 2, name: 'Deluxe', baseRate: 4200, maxOccupancy: 2 },
    { id: 3, name: 'Family', baseRate: 5800, maxOccupancy: 4 },
    { id: 4, name: 'Executive Suite', baseRate: 8500, maxOccupancy: 2 }
]

export const mockRooms: Room[] = [
    // ── Floor 1 ───────────────────────────────────────────────────────────
    { id: 1, number: '101', floor: 1, roomTypeId: 1, rateOverride: null, occupancyStatus: 'Occupied', cleanStatus: 'Clean', condition: 'Normal' },
    { id: 2, number: '102', floor: 1, roomTypeId: 1, rateOverride: null, occupancyStatus: 'Vacant', cleanStatus: 'Clean', condition: 'Normal' },
    { id: 3, number: '103', floor: 1, roomTypeId: 2, rateOverride: null, occupancyStatus: 'Occupied', cleanStatus: 'Clean', condition: 'Normal' },
    { id: 4, number: '104', floor: 1, roomTypeId: 2, rateOverride: null, occupancyStatus: 'Vacant', cleanStatus: 'Dirty', condition: 'Normal' },
    { id: 5, number: '105', floor: 1, roomTypeId: 1, rateOverride: null, occupancyStatus: 'Vacant', cleanStatus: 'Clean', condition: 'Normal' },

    // ── Floor 2 ───────────────────────────────────────────────────────────
    { id: 6, number: '201', floor: 2, roomTypeId: 2, rateOverride: null, occupancyStatus: 'Occupied', cleanStatus: 'Clean', condition: 'Normal' },
    { id: 7, number: '202', floor: 2, roomTypeId: 3, rateOverride: null, occupancyStatus: 'Vacant', cleanStatus: 'Inspected', condition: 'Normal' },
    { id: 8, number: '203', floor: 2, roomTypeId: 3, rateOverride: null, occupancyStatus: 'Occupied', cleanStatus: 'Clean', condition: 'Normal' },
    { id: 9, number: '204', floor: 2, roomTypeId: 2, rateOverride: null, occupancyStatus: 'Vacant', cleanStatus: 'Pickup', condition: 'Normal' },
    { id: 10, number: '205', floor: 2, roomTypeId: 1, rateOverride: null, occupancyStatus: 'Vacant', cleanStatus: 'Clean', condition: 'Maintenance' },
    { id: 11, number: '206', floor: 2, roomTypeId: 1, rateOverride: null, occupancyStatus: 'Occupied', cleanStatus: 'Clean', condition: 'Normal' },

    // ── Floor 3 ───────────────────────────────────────────────────────────
    { id: 12, number: '301', floor: 3, roomTypeId: 4, rateOverride: null, occupancyStatus: 'Occupied', cleanStatus: 'Clean', condition: 'Normal' },
    { id: 13, number: '302', floor: 3, roomTypeId: 4, rateOverride: null, occupancyStatus: 'Vacant', cleanStatus: 'Clean', condition: 'Normal' },
    { id: 14, number: '303', floor: 3, roomTypeId: 3, rateOverride: null, occupancyStatus: 'Vacant', cleanStatus: 'Dirty', condition: 'Normal' },
    { id: 15, number: '304', floor: 3, roomTypeId: 2, rateOverride: null, occupancyStatus: 'Occupied', cleanStatus: 'Clean', condition: 'Normal' },
    { id: 16, number: '305', floor: 3, roomTypeId: 1, rateOverride: null, occupancyStatus: 'Vacant', cleanStatus: 'Inspected', condition: 'Normal' }
]
