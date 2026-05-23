import { useStorage } from '@vueuse/core'

import type { AppLog } from '~/types'

export const useLogger = (namespace: string = 'default') => {
    const logs = useStorage<AppLog[]>(`app-logs-${namespace}`, [])

    const addLog = (message: string, state: string, level: 'success' | 'info' | 'warn' | 'error' = 'info') => {
        const newLog: AppLog = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            level,
            state,
            message
        }

        // Add to the beginning of the array and limit to 50 logs
        logs.value = [newLog, ...logs.value].slice(0, 50)
    }

    const clearLogs = () => {
        logs.value = []
    }

    return {
        logs,
        addLog,
        clearLogs
    }
}
