// ============================================================================
// Store: Reservations
// ============================================================================
// Manages bookings, status transitions, and operational counts.

import { defineStore } from 'pinia'
import type { Reservation, ReservationStatus } from '~/types'

const STORAGE_KEY = 'presidio-reservations'

export const useReservationsStore = defineStore('reservations', () => {
    // ============================================================================
    // State
    // ============================================================================
    const reservations = ref<Reservation[]>([])
    const isLoading = ref(false)
    const isHydrated = ref(false)

    // ============================================================================
    // Persistence
    // ============================================================================

    const persist = () => {
        if (import.meta.client) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations.value))
        }
    }

    const hydrate = () => {
        if (import.meta.server || isHydrated.value) return
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) reservations.value = JSON.parse(stored)
        isHydrated.value = true
    }

    // ============================================================================
    // Getters
    // ============================================================================

    const statusCounts = computed(() => {
        const counts: Record<ReservationStatus, number> = {
            'Pending': 0,
            'Confirmed': 0,
            'In-House': 0,
            'Done': 0,
            'Cancelled': 0
        }
        reservations.value.forEach(r => { counts[r.status]++ })
        return counts
    })

    const totalBookings = computed(() => reservations.value.length)

    const inHouseGuests = computed(() =>
        reservations.value.filter(r => r.status === 'In-House')
    )

    /**
     * Reservations arriving today (check-in date matches today).
     */
    const arrivalsToday = computed(() => {
        const today = new Date().toISOString().split('T')[0]
        return reservations.value.filter(
            r => r.checkInDate === today && (r.status === 'Confirmed' || r.status === 'Pending')
        )
    })

    /**
     * Reservations departing today (check-out date matches today).
     */
    const departuresToday = computed(() => {
        const today = new Date().toISOString().split('T')[0]
        return reservations.value.filter(
            r => r.checkOutDate === today && r.status === 'In-House'
        )
    })

    /**
     * Find a reservation by ID.
     */
    const getById = (id: number): Reservation | undefined =>
        reservations.value.find(r => r.id === id)

    // ============================================================================
    // Actions
    // ============================================================================

    /**
     * Generate the next booking reference (PRS-XXXXX format).
     */
    const generateBookingRef = (): string => {
        const maxRef = reservations.value.reduce((max, r) => {
            const num = parseInt(r.bookingRef.replace('PRS-', ''))
            return num > max ? num : max
        }, 10000)
        return `PRS-${maxRef + 1}`
    }

    const addReservation = (data: Omit<Reservation, 'id' | 'bookingRef'>): Reservation => {
        const newId = reservations.value.length > 0 ? Math.max(...reservations.value.map(r => r.id)) + 1 : 1
        const reservation: Reservation = {
            id: newId,
            bookingRef: generateBookingRef(),
            ...data
        }
        reservations.value.push(reservation)
        persist()
        return reservation
    }

    const updateReservation = (id: number, data: Partial<Omit<Reservation, 'id' | 'bookingRef'>>) => {
        const reservation = reservations.value.find(r => r.id === id)
        if (reservation) {
            Object.assign(reservation, data)
            persist()
        }
    }

    /**
     * Transition a reservation to a new status.
     */
    const setStatus = (id: number, status: ReservationStatus) => {
        updateReservation(id, { status })
    }

    const deleteReservation = (id: number) => {
        reservations.value = reservations.value.filter(r => r.id !== id)
        persist()
    }

    /**
     * Bulk-set reservations (used by seeder).
     */
    const seed = (newReservations: Reservation[]) => {
        reservations.value = newReservations
        persist()
    }

    const clear = () => {
        reservations.value = []
        if (import.meta.client) {
            localStorage.removeItem(STORAGE_KEY)
        }
    }

    return {
        // State
        reservations, isLoading, isHydrated,
        // Getters
        statusCounts, totalBookings, inHouseGuests, arrivalsToday, departuresToday, getById,
        // Actions
        hydrate, generateBookingRef, addReservation, updateReservation, setStatus, deleteReservation, seed, clear
    }
})
