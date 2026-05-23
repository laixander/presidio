// ============================================================================
// Service: Room
// ============================================================================
// Abstracts room operations with simulated latency.
// Swap internals with $fetch('/api/rooms/...') for real backend.

import type { Room, RoomType, CleanStatus, OccupancyStatus } from '~/types'

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

export const RoomService = {
    async getAll(): Promise<Room[]> {
        await delay(300)
        const store = useRoomsStore()
        return store.rooms
    },

    async getRoomTypes(): Promise<RoomType[]> {
        await delay(200)
        const store = useRoomsStore()
        return store.roomTypes
    },

    async create(data: Omit<Room, 'id'>): Promise<Room> {
        await delay(500)
        const store = useRoomsStore()
        return store.addRoom(data)
    },

    async update(id: number, data: Partial<Omit<Room, 'id'>>): Promise<void> {
        await delay(500)
        const store = useRoomsStore()
        store.updateRoom(id, data)
    },

    async updateCleanStatus(id: number, status: CleanStatus): Promise<void> {
        await delay(300)
        const store = useRoomsStore()
        store.updateRoom(id, { cleanStatus: status })
    },

    async updateOccupancy(id: number, status: OccupancyStatus): Promise<void> {
        await delay(300)
        const store = useRoomsStore()
        store.updateRoom(id, { occupancyStatus: status })
    },

    async remove(id: number): Promise<void> {
        await delay(500)
        const store = useRoomsStore()
        store.deleteRoom(id)
    }
}
