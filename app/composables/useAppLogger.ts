// ============================================================================
// Composable: useAppLogger
// ============================================================================
// Domain-specific logging helpers. Wraps useLogger with semantic methods
// so views never call addLog() directly with raw strings.

import { useLogger } from './useLogger'

export const useAppLogger = () => {
    const userLogger = useLogger('users')

    return {
        // ============================================================================
        // Users & Roles
        // ============================================================================
        logUserAdded(name: string) {
            userLogger.addLog(`Added user: ${name}`, 'Created', 'success')
        },
        logUserUpdated(name: string) {
            userLogger.addLog(`Updated user: ${name}`, 'Updated', 'warn')
        },
        logUserDeleted(name: string) {
            userLogger.addLog(`Deleted user: ${name}`, 'Deleted', 'error')
        },
        logUserToggleStatus(name: string, isActivating: boolean) {
            userLogger.addLog(
                `${isActivating ? 'Activated' : 'Deactivated'} user: ${name}`,
                isActivating ? 'Activated' : 'Deactivated',
                'info'
            )
        }
    }
}
