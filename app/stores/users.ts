import { defineStore } from 'pinia'
import type { StaffUser, SystemRole } from '~/types'

const STORAGE_KEY = 'presidio-users'

export const useUsersStore = defineStore('users', () => {
    // ============================================================================
    // State
    // ============================================================================
    const users = ref<StaffUser[]>([])
    const isHydrated = ref(false)

    // ============================================================================
    // Persistence
    // ============================================================================

    const persist = () => {
        if (import.meta.client) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(users.value))
        }
    }

    const hydrate = () => {
        if (import.meta.server || isHydrated.value) return
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            users.value = JSON.parse(stored)
        } else {
            // Initial mock data
            users.value = [
                { id: 1, name: 'Alice Admin', email: 'alice@presidio.com', password: 'password', role: 'Administrator', isActive: true },
                { id: 2, name: 'Frank Frontdesk', email: 'frank@presidio.com', password: 'password', role: 'Front Desk', isActive: true },
                { id: 3, name: 'Bill Billing', email: 'bill@presidio.com', password: 'password', role: 'Billing', isActive: true },
                { id: 4, name: 'Helen Housekeeping', email: 'helen@presidio.com', password: 'password', role: 'Housekeeping', isActive: true }
            ]
            persist()
        }
        isHydrated.value = true
    }

    // ============================================================================
    // Getters
    // ============================================================================

    const getById = (id: number): StaffUser | undefined => users.value.find(u => u.id === id)
    const activeUsers = computed(() => users.value.filter(u => u.isActive))

    // ============================================================================
    // Actions
    // ============================================================================

    const addUser = (userData: Omit<StaffUser, 'id'>) => {
        const newId = users.value.length > 0 ? Math.max(...users.value.map(u => u.id)) + 1 : 1
        const newUser: StaffUser = { id: newId, ...userData }
        users.value.push(newUser)
        persist()
        return newUser
    }

    const updateUser = (id: number, updates: Partial<Omit<StaffUser, 'id'>>) => {
        const index = users.value.findIndex(u => u.id === id)
        if (index !== -1) {
            const user = users.value[index]
            if (user) {
                Object.assign(user, updates)
                persist()
            }
        }
    }

    const deleteUser = (id: number) => {
        const index = users.value.findIndex(u => u.id === id)
        if (index !== -1) {
            users.value.splice(index, 1)
            persist()
        }
    }

    const seed = (newUsers: StaffUser[]) => {
        users.value = newUsers
        persist()
    }

    const clear = () => {
        users.value = []
        if (import.meta.client) {
            localStorage.removeItem(STORAGE_KEY)
        }
    }

    return {
        users,
        isHydrated,
        hydrate,
        getById,
        activeUsers,
        addUser,
        updateUser,
        deleteUser,
        seed,
        clear
    }
})
