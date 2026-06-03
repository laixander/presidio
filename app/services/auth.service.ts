// ============================================================================
// Service: Auth
// ============================================================================
// Abstracts authentication operations with simulated latency.
// Swap internals with $fetch('/api/auth/...') for real backend.

import type { SystemRole, StaffUser } from '~/types'
import { useUsersStore } from '~/stores/users'

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

export const AuthService = {
    /**
     * Simulate login — find matching staff user by role.
     */
    async login(role: SystemRole): Promise<StaffUser | null> {
        await delay(500)
        return useUsersStore().users.find(u => u.role === role) ?? null
    },

    /**
     * Simulate logout.
     */
    async logout(): Promise<void> {
        await delay(200)
    },

    /**
     * Get all staff users.
     */
    async getStaffUsers(): Promise<StaffUser[]> {
        await delay(300)
        return useUsersStore().users
    }
}
