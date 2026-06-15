// ============================================================================
// Store: Groups
// ============================================================================
// Manages group reservations and room blocks.

import { defineStore } from 'pinia'
import type { GroupReservation, RoomBlock, ReservationStatus } from '~/types'

const STORAGE_KEY_GROUPS = 'presidio-groups'
const STORAGE_KEY_BLOCKS = 'presidio-blocks'

export const useGroupsStore = defineStore('groups', () => {
    const reservationsStore = useReservationsStore()
    const roomsStore = useRoomsStore()

    // ============================================================================
    // State
    // ============================================================================
    const groups = ref<GroupReservation[]>([])
    const blocks = ref<RoomBlock[]>([])
    const isLoading = ref(false)
    const isHydrated = ref(false)

    // ============================================================================
    // Persistence
    // ============================================================================
    const persist = () => {
        if (import.meta.client) {
            localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(groups.value))
            localStorage.setItem(STORAGE_KEY_BLOCKS, JSON.stringify(blocks.value))
        }
    }

    const hydrate = () => {
        if (import.meta.server || isHydrated.value) return
        const storedGroups = localStorage.getItem(STORAGE_KEY_GROUPS)
        if (storedGroups) groups.value = JSON.parse(storedGroups)
        const storedBlocks = localStorage.getItem(STORAGE_KEY_BLOCKS)
        if (storedBlocks) blocks.value = JSON.parse(storedBlocks)
        isHydrated.value = true
    }

    // ============================================================================
    // Getters
    // ============================================================================
    const getGroupById = (id: number): GroupReservation | undefined =>
        groups.value.find(g => g.id === id)

    const getBlocksForGroup = (groupId: number): RoomBlock[] =>
        blocks.value.filter(b => b.groupId === groupId)

    const totalGroups = computed(() => groups.value.length)

    // ============================================================================
    // Actions - Groups
    // ============================================================================
    const addGroup = (data: Omit<GroupReservation, 'id'>): GroupReservation => {
        const newId = groups.value.length > 0 ? Math.max(...groups.value.map(g => g.id)) + 1 : 1
        const group: GroupReservation = { id: newId, ...data }
        groups.value.push(group)
        persist()
        return group
    }

    const updateGroup = (id: number, data: Partial<Omit<GroupReservation, 'id'>>) => {
        const group = groups.value.find(g => g.id === id)
        if (group) {
            Object.assign(group, data)
            persist()
        }
    }

    const deleteGroup = (id: number) => {
        groups.value = groups.value.filter(g => g.id !== id)
        blocks.value = blocks.value.filter(b => b.groupId !== id)
        persist()
    }

    // ============================================================================
    // Actions - Blocks
    // ============================================================================
    const addRoomBlock = (groupId: number, roomId: number): RoomBlock => {
        const newId = blocks.value.length > 0 ? Math.max(...blocks.value.map(b => b.id)) + 1 : 1
        const block: RoomBlock = {
            id: newId,
            groupId,
            roomId,
            reservationId: null,
            status: 'Blocked'
        }
        blocks.value.push(block)
        persist()
        return block
    }

    const removeRoomBlock = (blockId: number) => {
        const block = blocks.value.find(b => b.id === blockId)
        if (block && block.status === 'Blocked') {
            blocks.value = blocks.value.filter(b => b.id !== blockId)
            persist()
        }
    }

    const reserveBlockedRooms = (groupId: number) => {
        const group = getGroupById(groupId)
        if (!group) return

        const groupBlocks = getBlocksForGroup(groupId).filter(b => b.status === 'Blocked')
        groupBlocks.forEach(block => {
            const room = roomsStore.rooms.find(r => r.id === block.roomId)
            if (room) {
                // Create actual reservation with guestId = null
                const reservation = reservationsStore.addReservation({
                    guestId: null, // Nullable guestId
                    groupId: group.id,
                    roomTypeId: room.roomTypeId,
                    roomId: room.id,
                    checkInDate: group.checkInDate,
                    checkOutDate: group.checkOutDate,
                    status: 'Pending',
                    source: 'Corporate' // Defaulting to corporate for groups
                })
                
                // Update block status
                block.reservationId = reservation.id
                block.status = 'Reserved'
            }
        })
        persist()
    }

    const seed = (initialGroups: any[], initialBlocks: any[]) => {
        groups.value = initialGroups
        blocks.value = initialBlocks
        persist()
    }

    const clear = () => {
        groups.value = []
        blocks.value = []
        if (import.meta.client) {
            localStorage.removeItem(STORAGE_KEY_GROUPS)
            localStorage.removeItem(STORAGE_KEY_BLOCKS)
        }
    }

    return {
        // State
        groups, blocks, isLoading, isHydrated,
        // Getters
        getGroupById, getBlocksForGroup, totalGroups,
        // Actions
        hydrate, addGroup, updateGroup, deleteGroup, addRoomBlock, removeRoomBlock, reserveBlockedRooms, seed, clear
    }
})
