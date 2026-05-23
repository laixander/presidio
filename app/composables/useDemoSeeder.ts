// ============================================================================
// Composable: useDemoSeeder
// ============================================================================
// Handles mass-seeding and resetting of ALL application data for demo purposes.
// Seeds both the legacy user table (agent reference) and all Presidio stores.

import { mockStaffUsers } from '~/data/mock/users'
import { mockGuests } from '~/data/mock/guests'
import { mockRooms, mockRoomTypes } from '~/data/mock/rooms'
import { mockReservations } from '~/data/mock/reservations'
import { mockFolios, mockCharges, mockPayments } from '~/data/mock/folios'
import { mockTasks } from '~/data/mock/tasks'

export const useDemoSeeder = () => {
    // Legacy composable (agent table reference)
    const { setUsers, clear: clearUsers } = useUsers()

    // Presidio Pinia stores
    const roomsStore = useRoomsStore()
    const guestsStore = useGuestsStore()
    const reservationsStore = useReservationsStore()
    const foliosStore = useFoliosStore()
    const housekeepingStore = useHousekeepingStore()

    /**
     * Seed all stores with mock data.
     */
    const seedAll = async () => {
        // Legacy: seed agent table users from API
        try {
            const data = await $fetch('/api/users')
            setUsers(data as any[])
        } catch {
            // API endpoint may not exist — skip legacy seeding
        }

        // Presidio stores: seed from local mock data
        roomsStore.seed(mockRooms, mockRoomTypes)
        guestsStore.seed(mockGuests)
        reservationsStore.seed(mockReservations)
        foliosStore.seed(mockFolios, mockCharges, mockPayments)
        housekeepingStore.seed(mockTasks)
    }

    /**
     * Clear all local storage data across every store.
     */
    const resetAll = async () => {
        clearUsers(true)
        roomsStore.clear()
        guestsStore.clear()
        reservationsStore.clear()
        foliosStore.clear()
        housekeepingStore.clear()
    }

    return {
        seedAll,
        resetAll,
        // Expose mock data for direct access if needed
        mockStaffUsers,
        mockGuests,
        mockRooms,
        mockRoomTypes,
        mockReservations,
        mockFolios,
        mockCharges,
        mockPayments,
        mockTasks
    }
}
