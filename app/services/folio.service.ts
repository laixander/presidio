// ============================================================================
// Service: Folio
// ============================================================================
// Abstracts folio/billing operations with simulated latency.
// Swap internals with $fetch('/api/folios/...') for real backend.

import type { Folio, Charge, Payment } from '~/types'

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

export const FolioService = {
    async getAll(): Promise<Folio[]> {
        await delay(300)
        const store = useFoliosStore()
        return store.folios
    },

    async getById(id: number): Promise<Folio | undefined> {
        await delay(200)
        const store = useFoliosStore()
        return store.getById(id)
    },

    async create(data: Omit<Folio, 'id' | 'folioNumber'>): Promise<Folio> {
        await delay(500)
        const store = useFoliosStore()
        return store.addFolio(data)
    },

    async addCharge(data: Omit<Charge, 'id'>): Promise<Charge> {
        await delay(500)
        const store = useFoliosStore()
        return store.addCharge(data)
    },

    async applyPayment(data: Omit<Payment, 'id'>): Promise<Payment> {
        await delay(500)
        const store = useFoliosStore()
        return store.addPayment(data)
    },

    async settle(folioId: number): Promise<void> {
        await delay(500)
        const store = useFoliosStore()
        store.settleFolio(folioId)
    },

    async getCharges(folioId: number): Promise<Charge[]> {
        await delay(200)
        const store = useFoliosStore()
        return store.getChargesForFolio(folioId)
    },

    async getPayments(folioId: number): Promise<Payment[]> {
        await delay(200)
        const store = useFoliosStore()
        return store.getPaymentsForFolio(folioId)
    }
}
