// ============================================================================
// Store: Rooms
// ============================================================================
// Manages room inventory, room types, and room status updates.

import { defineStore } from 'pinia'
import type { Room, RoomType } from '~/types'

const ROOMS_KEY = 'presidio-rooms'
const ROOM_TYPES_KEY = 'presidio-room-types'

export const useRoomsStore = defineStore('rooms', () => {
    // ============================================================================
    // State
    // ============================================================================
    const rooms = ref<Room[]>([])
    const roomTypes = ref<RoomType[]>([])
    const isLoading = ref(false)
    const isHydrated = ref(false)

    // ============================================================================
    // Persistence
    // ============================================================================

    const persist = () => {
        if (import.meta.client) {
            localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms.value))
            localStorage.setItem(ROOM_TYPES_KEY, JSON.stringify(roomTypes.value))
        }
    }

    const hydrate = () => {
        if (import.meta.server || isHydrated.value) return
        const storedRooms = localStorage.getItem(ROOMS_KEY)
        const storedTypes = localStorage.getItem(ROOM_TYPES_KEY)
        if (storedRooms) rooms.value = JSON.parse(storedRooms)
        if (storedTypes) roomTypes.value = JSON.parse(storedTypes)
        isHydrated.value = true
    }

    // ============================================================================
    // Getters
    // ============================================================================

    const availableRooms = computed(() =>
        rooms.value.filter(r => r.occupancyStatus === 'Vacant' && r.cleanStatus === 'Clean' && r.condition === 'Normal')
    )

    const occupancyRate = computed(() => {
        if (rooms.value.length === 0) return 0
        const occupied = rooms.value.filter(r => r.occupancyStatus === 'Occupied').length
        return Math.round((occupied / rooms.value.length) * 100)
    })

    const roomsByStatus = computed(() => ({
        vacantClean: rooms.value.filter(r => r.occupancyStatus === 'Vacant' && r.cleanStatus === 'Clean').length,
        vacantDirty: rooms.value.filter(r => r.occupancyStatus === 'Vacant' && r.cleanStatus === 'Dirty').length,
        vacantPickup: rooms.value.filter(r => r.occupancyStatus === 'Vacant' && r.cleanStatus === 'Pickup').length,
        occupied: rooms.value.filter(r => r.occupancyStatus === 'Occupied').length,
        maintenance: rooms.value.filter(r => r.condition === 'Maintenance').length
    }))

    /**
     * Get the RoomType object for a given room.
     */
    const getRoomType = (room: Room): RoomType | undefined =>
        roomTypes.value.find(rt => rt.id === room.roomTypeId)

    /**
     * Get the effective nightly rate for a room (override or base rate).
     */
    const getEffectiveRate = (room: Room): number =>
        room.rateOverride ?? (getRoomType(room)?.baseRate ?? 0)

    // ============================================================================
    // Actions
    // ============================================================================

    const addRoom = (data: Omit<Room, 'id'>): Room => {
        const newId = rooms.value.length > 0 ? Math.max(...rooms.value.map(r => r.id)) + 1 : 1
        const room: Room = { id: newId, ...data }
        rooms.value.push(room)
        persist()
        return room
    }

    const updateRoom = (id: number, data: Partial<Omit<Room, 'id'>>) => {
        const room = rooms.value.find(r => r.id === id)
        if (room) {
            Object.assign(room, data)
            persist()
        }
    }

    const deleteRoom = (id: number) => {
        rooms.value = rooms.value.filter(r => r.id !== id)
        persist()
    }

    /**
     * Bulk-set rooms and room types (used by seeder).
     */
    const seed = (newRooms: Room[], newRoomTypes: RoomType[]) => {
        rooms.value = newRooms
        roomTypes.value = newRoomTypes
        persist()
    }

    const clear = () => {
        rooms.value = []
        roomTypes.value = []
        if (import.meta.client) {
            localStorage.removeItem(ROOMS_KEY)
            localStorage.removeItem(ROOM_TYPES_KEY)
        }
    }

    return {
        // State
        rooms, roomTypes, isLoading, isHydrated,
        // Getters
        availableRooms, occupancyRate, roomsByStatus, getRoomType, getEffectiveRate,
        // Actions
        hydrate, addRoom, updateRoom, deleteRoom, seed, clear
    }
})
