// ============================================================================
// Store: Folios
// ============================================================================
// Manages billing folios, charges, payments, and balance calculations.

import { defineStore } from 'pinia'
import type { Folio, Charge, Payment } from '~/types'

const FOLIOS_KEY = 'presidio-folios'
const CHARGES_KEY = 'presidio-charges'
const PAYMENTS_KEY = 'presidio-payments'

export const useFoliosStore = defineStore('folios', () => {
    // ============================================================================
    // State
    // ============================================================================
    const folios = ref<Folio[]>([])
    const charges = ref<Charge[]>([])
    const payments = ref<Payment[]>([])
    const isLoading = ref(false)
    const isHydrated = ref(false)

    // ============================================================================
    // Persistence
    // ============================================================================

    const persist = () => {
        if (import.meta.client) {
            localStorage.setItem(FOLIOS_KEY, JSON.stringify(folios.value))
            localStorage.setItem(CHARGES_KEY, JSON.stringify(charges.value))
            localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments.value))
        }
    }

    const hydrate = () => {
        if (import.meta.server || isHydrated.value) return
        const storedFolios = localStorage.getItem(FOLIOS_KEY)
        const storedCharges = localStorage.getItem(CHARGES_KEY)
        const storedPayments = localStorage.getItem(PAYMENTS_KEY)
        if (storedFolios) folios.value = JSON.parse(storedFolios)
        if (storedCharges) charges.value = JSON.parse(storedCharges)
        if (storedPayments) payments.value = JSON.parse(storedPayments)
        isHydrated.value = true
    }

    // ============================================================================
    // Getters
    // ============================================================================

    const openFolios = computed(() => folios.value.filter(f => f.status === 'Open'))

    const totalRevenue = computed(() =>
        charges.value.reduce((sum, c) => sum + c.total, 0)
    )

    const totalPayments = computed(() =>
        payments.value.reduce((sum, p) => sum + p.amount, 0)
    )

    /**
     * Get all charges for a specific folio.
     */
    const getChargesForFolio = (folioId: number): Charge[] =>
        charges.value.filter(c => c.folioId === folioId)

    /**
     * Get all payments for a specific folio.
     */
    const getPaymentsForFolio = (folioId: number): Payment[] =>
        payments.value.filter(p => p.folioId === folioId)

    /**
     * Find a folio by ID.
     */
    const getById = (id: number): Folio | undefined => folios.value.find(f => f.id === id)

    /**
     * Recalculate and update a folio's balance from its charges and payments.
     */
    const recalculateBalance = (folioId: number) => {
        const folioCharges = getChargesForFolio(folioId)
        const folioPayments = getPaymentsForFolio(folioId)
        const totalCharges = folioCharges.reduce((sum, c) => sum + c.total, 0)
        const totalPaid = folioPayments.reduce((sum, p) => sum + p.amount, 0)

        const folio = folios.value.find(f => f.id === folioId)
        if (folio) {
            folio.balance = totalCharges - totalPaid
        }
    }

    // ============================================================================
    // Actions
    // ============================================================================

    const addFolio = (data: Omit<Folio, 'id' | 'folioNumber'>): Folio => {
        const newId = folios.value.length > 0 ? Math.max(...folios.value.map(f => f.id)) + 1 : 1
        const folioNumber = `FOL-${String(newId).padStart(3, '0')}`
        const folio: Folio = { id: newId, folioNumber, ...data }
        folios.value.push(folio)
        persist()
        return folio
    }

    const addCharge = (data: Omit<Charge, 'id'>): Charge => {
        const newId = charges.value.length > 0 ? Math.max(...charges.value.map(c => c.id)) + 1 : 1
        const charge: Charge = { id: newId, ...data }
        charges.value.push(charge)
        recalculateBalance(data.folioId)
        persist()
        return charge
    }

    const addPayment = (data: Omit<Payment, 'id'>): Payment => {
        const newId = payments.value.length > 0 ? Math.max(...payments.value.map(p => p.id)) + 1 : 1
        const payment: Payment = { id: newId, ...data }
        payments.value.push(payment)
        recalculateBalance(data.folioId)
        persist()
        return payment
    }

    /**
     * Settle and close a folio (marks status as 'Settled').
     */
    const settleFolio = (folioId: number) => {
        const folio = folios.value.find(f => f.id === folioId)
        if (folio) {
            folio.status = 'Settled'
            folio.balance = 0
            persist()
        }
    }

    /**
     * Bulk-set folios, charges, and payments (used by seeder).
     */
    const seed = (newFolios: Folio[], newCharges: Charge[], newPayments: Payment[]) => {
        folios.value = newFolios
        charges.value = newCharges
        payments.value = newPayments
        persist()
    }

    const clear = () => {
        folios.value = []
        charges.value = []
        payments.value = []
        if (import.meta.client) {
            localStorage.removeItem(FOLIOS_KEY)
            localStorage.removeItem(CHARGES_KEY)
            localStorage.removeItem(PAYMENTS_KEY)
        }
    }

    return {
        // State
        folios, charges, payments, isLoading, isHydrated,
        // Getters
        openFolios, totalRevenue, totalPayments, getChargesForFolio, getPaymentsForFolio, getById,
        // Actions
        hydrate, addFolio, addCharge, addPayment, settleFolio, recalculateBalance, seed, clear
    }
})
