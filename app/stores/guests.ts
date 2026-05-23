// ============================================================================
// Store: Guests
// ============================================================================
// Manages guest profiles, VIP filtering, and search.

import { defineStore } from 'pinia'
import type { Guest } from '~/types'

const STORAGE_KEY = 'presidio-guests'

export const useGuestsStore = defineStore('guests', () => {
    // ============================================================================
    // State
    // ============================================================================
    const guests = ref<Guest[]>([])
    const isLoading = ref(false)
    const isHydrated = ref(false)

    // ============================================================================
    // Persistence
    // ============================================================================

    const persist = () => {
        if (import.meta.client) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(guests.value))
        }
    }

    const hydrate = () => {
        if (import.meta.server || isHydrated.value) return
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) guests.value = JSON.parse(stored)
        isHydrated.value = true
    }

    // ============================================================================
    // Getters
    // ============================================================================

    const vipGuests = computed(() => guests.value.filter(g => g.isVip))

    const totalGuests = computed(() => guests.value.length)

    /**
     * Get a guest's full display name.
     */
    const getFullName = (guest: Guest): string => `${guest.firstName} ${guest.lastName}`

    /**
     * Find a guest by ID.
     */
    const getById = (id: number): Guest | undefined => guests.value.find(g => g.id === id)

    // ============================================================================
    // Actions
    // ============================================================================

    const addGuest = (data: Omit<Guest, 'id'>): Guest => {
        const newId = guests.value.length > 0 ? Math.max(...guests.value.map(g => g.id)) + 1 : 1
        const guest: Guest = { id: newId, ...data }
        guests.value.push(guest)
        persist()
        return guest
    }

    const updateGuest = (id: number, data: Partial<Omit<Guest, 'id'>>) => {
        const guest = guests.value.find(g => g.id === id)
        if (guest) {
            Object.assign(guest, data)
            persist()
        }
    }

    const deleteGuest = (id: number) => {
        guests.value = guests.value.filter(g => g.id !== id)
        persist()
    }

    /**
     * Bulk-set guests (used by seeder).
     */
    const seed = (newGuests: Guest[]) => {
        guests.value = newGuests
        persist()
    }

    const clear = () => {
        guests.value = []
        if (import.meta.client) {
            localStorage.removeItem(STORAGE_KEY)
        }
    }

    return {
        // State
        guests, isLoading, isHydrated,
        // Getters
        vipGuests, totalGuests, getFullName, getById,
        // Actions
        hydrate, addGuest, updateGuest, deleteGuest, seed, clear
    }
})
