// ============================================================================
// Composable: useAppLogger
// ============================================================================
// Domain-specific logging helpers. Wraps useLogger with semantic methods
// so views never call addLog() directly with raw strings.

import { useLogger } from './useLogger'

export const useAppLogger = () => {
    const userLogger = useLogger('users')
    const roomLogger = useLogger('rooms')
    const reservationLogger = useLogger('reservations')
    const guestLogger = useLogger('guests')
    const simulationActionLogger = useLogger('simulation-actions')
    const reportsLogger = useLogger('reports')
    const settingsLogger = useLogger('settings')

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
        // Reports
        // ============================================================================
        logReportExported(format: string) {
            reportsLogger.addLog(`Exported ${format} report`, 'Export', 'success')
        },

        // ============================================================================
        // Settings
        // ============================================================================
        logSettingsUpdated() {
            settingsLogger.addLog('General Settings Updated', 'System', 'success')
        },
        logRoomTypeAdded(name: string) {
            settingsLogger.addLog(`Room Type Added: ${name}`, 'Rooms', 'success')
        },
        logRoomTypeUpdated(name: string) {
            settingsLogger.addLog(`Room Type Updated: ${name}`, 'Rooms', 'warn')
        },
        logRoomTypeDeleted(name: string) {
            settingsLogger.addLog(`Room Type Deleted: ${name}`, 'Rooms', 'error')
        },

        // ============================================================================
        // Simulation Actions
        // ============================================================================
        logSimulationEngineStarted() {
            simulationActionLogger.addLog('Simulation Engine Started', 'System', 'info')
        },
        logSimulationEnginePaused() {
            simulationActionLogger.addLog('Simulation Engine Paused', 'System', 'warn')
        },
        logSimulationEngineStopped() {
            simulationActionLogger.addLog('Simulation Engine Stopped', 'System', 'warn')
        },
        logSimulationCountersReset() {
            simulationActionLogger.addLog('Simulation Counters Reset', 'System', 'info')
        },
        logSimulationEngineStepped() {
            simulationActionLogger.addLog('Simulation Engine Stepped', 'System', 'info')
        },
        logSimulationLogsCleared() {
            simulationActionLogger.addLog('Simulation Logs Cleared', 'System', 'warn')
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
        },

        // ============================================================================
        // Guests
        // ============================================================================
        logGuestAdded(name: string) {
            guestLogger.addLog(`Added guest: ${name}`, 'Created', 'success')
        },
        logGuestUpdated(name: string) {
            guestLogger.addLog(`Updated guest: ${name}`, 'Updated', 'warn')
        },
        logGuestDeleted(name: string) {
            guestLogger.addLog(`Deleted guest: ${name}`, 'Deleted', 'error')
        },

        // ============================================================================
        // Reservations
        // ============================================================================
        logReservationAdded(bookingRef: string) {
            reservationLogger.addLog(`Created reservation: ${bookingRef}`, 'Created', 'success')
        },
        logReservationUpdated(bookingRef: string) {
            reservationLogger.addLog(`Updated reservation: ${bookingRef}`, 'Updated', 'warn')
        },
        logReservationDeleted(bookingRef: string) {
            reservationLogger.addLog(`Deleted reservation: ${bookingRef}`, 'Deleted', 'error')
        },
        logReservationViewed(bookingRef: string) {
            reservationLogger.addLog(`Viewed reservation: ${bookingRef}`, 'Viewed', 'info')
        }
    }
}
