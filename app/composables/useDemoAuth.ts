// ============================================================================
// Composable: useDemoAuth
// ============================================================================
// Simulates a user session and role-based access for the demo.
// Manages the active role in useState (SSR-safe) + localStorage (persistence).

import type { SystemRole } from '~/types'

// Re-export so SystemRole remains auto-importable via composables
export type { SystemRole } from '~/types'

const STORAGE_KEY = 'presidio-auth-role'

export const useDemoAuth = () => {
    // Default to null — user must select a role on the login page
    const currentRole = useState<SystemRole | null>('presidio-auth-role', () => null)
    const isHydrated = ref(false)

    const load = () => {
        if (import.meta.server) return
        const storedRole = localStorage.getItem(STORAGE_KEY) as SystemRole | null
        if (storedRole) {
            currentRole.value = storedRole
        }

        isHydrated.value = true
    }

    // Eagerly load from localStorage on the client.
    // This must NOT use onMounted because the composable is also
    // called from route middleware (no active component instance).
    if (import.meta.client && !isHydrated.value) {
        // load()
        onMounted(load)
    }

    const setRole = (role: SystemRole) => {
        currentRole.value = role
        if (import.meta.client) {
            localStorage.setItem(STORAGE_KEY, role)
        }
    }

    const logout = () => {
        currentRole.value = null
        if (import.meta.client) {
            localStorage.removeItem(STORAGE_KEY)
        }
    }

    const isLoggedIn = computed(() => currentRole.value !== null)

    return {
        currentRole,
        isHydrated,
        isLoggedIn,
        setRole,
        logout
    }
}
