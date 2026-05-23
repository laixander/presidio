// ============================================================================
// Middleware: auth (global)
// ============================================================================
// Redirects unauthenticated users to the login page.
// On the login page, if a role is already set, redirects to dashboard.

export default defineNuxtRouteMiddleware((to) => {
    const { currentRole } = useDemoAuth()

    // Allow access to the login page
    if (to.path === '/') {
        // If already logged in, redirect to dashboard
        if (currentRole.value) {
            return navigateTo('/dashboard')
        }
        return
    }

    // Protect all other routes — redirect to login if no role is set
    if (!currentRole.value) {
        return navigateTo('/')
    }
})
