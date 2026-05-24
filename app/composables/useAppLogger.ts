// ============================================================================
// Composable: useAppLogger
// ============================================================================
// Domain-specific logging helpers. Wraps useLogger with semantic methods
// so views never call addLog() directly with raw strings.

import { useLogger } from './useLogger'

export const useAppLogger = () => {
    const userLogger = useLogger('users')
    const roomLogger = useLogger('rooms')

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
        },

        // ============================================================================
        // Rooms
        // ============================================================================
        logRoomAdded(number: string | number) {
            roomLogger.addLog(`Added room: ${number}`, 'Created', 'success')
        },
        logRoomUpdated(number: string | number) {
            roomLogger.addLog(`Updated room: ${number}`, 'Updated', 'warn')
        },
        logRoomDeleted(number: string | number) {
            roomLogger.addLog(`Deleted room: ${number}`, 'Deleted', 'error')
        }
    }
}
