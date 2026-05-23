// ============================================================================
// Service: Guest
// ============================================================================
// Abstracts guest operations with simulated latency.
// Swap internals with $fetch('/api/guests/...') for real backend.

import type { Guest } from '~/types'

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

export const GuestService = {
    async getAll(): Promise<Guest[]> {
        await delay(300)
        const store = useGuestsStore()
        return store.guests
    },

    async getById(id: number): Promise<Guest | undefined> {
        await delay(200)
        const store = useGuestsStore()
        return store.getById(id)
    },

    async create(data: Omit<Guest, 'id'>): Promise<Guest> {
        await delay(500)
        const store = useGuestsStore()
        return store.addGuest(data)
    },

    async update(id: number, data: Partial<Omit<Guest, 'id'>>): Promise<void> {
        await delay(500)
        const store = useGuestsStore()
        store.updateGuest(id, data)
    },

    async remove(id: number): Promise<void> {
        await delay(500)
        const store = useGuestsStore()
        store.deleteGuest(id)
    }
}
