// ============================================================================
// Service: Reservation
// ============================================================================
// Abstracts reservation operations with simulated latency.
// Swap internals with $fetch('/api/reservations/...') for real backend.

import type { Reservation, ReservationStatus } from '~/types'

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

export const ReservationService = {
    async getAll(): Promise<Reservation[]> {
        await delay(300)
        const store = useReservationsStore()
        return store.reservations
    },

    async getById(id: number): Promise<Reservation | undefined> {
        await delay(200)
        const store = useReservationsStore()
        return store.getById(id)
    },

    async create(data: Omit<Reservation, 'id' | 'bookingRef'>): Promise<Reservation> {
        await delay(500)
        const store = useReservationsStore()
        return store.addReservation(data)
    },

    async update(id: number, data: Partial<Omit<Reservation, 'id' | 'bookingRef'>>): Promise<void> {
        await delay(500)
        const store = useReservationsStore()
        store.updateReservation(id, data)
    },

    async setStatus(id: number, status: ReservationStatus): Promise<void> {
        await delay(300)
        const store = useReservationsStore()
        store.setStatus(id, status)
    },

    async cancel(id: number): Promise<void> {
        await delay(500)
        const store = useReservationsStore()
        store.setStatus(id, 'Cancelled')
    },

    async remove(id: number): Promise<void> {
        await delay(500)
        const store = useReservationsStore()
        store.deleteReservation(id)
    }
}
