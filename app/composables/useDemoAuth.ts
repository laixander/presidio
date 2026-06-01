// ============================================================================
// Composable: useDemoAuth
// ============================================================================
// Simulates a user session and role-based access for the demo.
// Manages the active role in useState (SSR-safe) + localStorage (persistence).

import type { SystemRole } from '~/types'

// Re-export so SystemRole remains auto-importable via composables
export type { SystemRole } from '~/types'

const STORAGE_KEY = 'presidio-auth-role'
const STORAGE_PAGES_KEY = 'presidio-auth-pages'

export const useDemoAuth = () => {
    // Default to null — user must select a role on the login page
    const currentRole = useState<SystemRole | null>('presidio-auth-role', () => null)
    const showAllPages = useState<boolean>('presidio-auth-pages', () => false)
    const isHydrated = ref(false)

    const load = () => {
        if (import.meta.server) return
        const storedRole = localStorage.getItem(STORAGE_KEY) as SystemRole | null
        if (storedRole) {
            currentRole.value = storedRole
        }
        
        const storedPages = localStorage.getItem(STORAGE_PAGES_KEY)
        if (storedPages !== null) {
            showAllPages.value = storedPages === 'true'
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

    const setShowAllPages = (show: boolean) => {
        showAllPages.value = show
        if (import.meta.client) {
            localStorage.setItem(STORAGE_PAGES_KEY, String(show))
        }
    }

    const isLoggedIn = computed(() => currentRole.value !== null)

    return {
        currentRole,
        showAllPages,
        isHydrated,
        isLoggedIn,
        setRole,
        setShowAllPages,
        logout
    }
}
