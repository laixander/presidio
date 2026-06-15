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
    // Use cookies instead of localStorage so the server has access to auth state
    // during initial SSR render. This prevents flickering and unwanted redirects.
    const currentRole = useCookie<SystemRole | null>(STORAGE_KEY, { default: () => null })
    const showAllPages = useCookie<boolean>(STORAGE_PAGES_KEY, { default: () => false })
    const isHydrated = ref(true)

    const setRole = (role: SystemRole) => {
        currentRole.value = role
    }

    const logout = () => {
        currentRole.value = null
    }

    const setShowAllPages = (show: boolean) => {
        showAllPages.value = show
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
