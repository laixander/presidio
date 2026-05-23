// ============================================================================
// Service: Housekeeping
// ============================================================================
// Abstracts housekeeping operations with simulated latency.
// Swap internals with $fetch('/api/housekeeping/...') for real backend.

import type { HousekeepingTask, TaskStatus } from '~/types'

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

export const HousekeepingService = {
    async getAll(): Promise<HousekeepingTask[]> {
        await delay(300)
        const store = useHousekeepingStore()
        return store.tasks
    },

    async getForRoom(roomId: number): Promise<HousekeepingTask[]> {
        await delay(200)
        const store = useHousekeepingStore()
        return store.getTasksForRoom(roomId)
    },

    async create(data: Omit<HousekeepingTask, 'id'>): Promise<HousekeepingTask> {
        await delay(500)
        const store = useHousekeepingStore()
        return store.addTask(data)
    },

    async setStatus(id: number, status: TaskStatus): Promise<void> {
        await delay(300)
        const store = useHousekeepingStore()
        store.setTaskStatus(id, status)
    },

    async assign(taskId: number, userId: number): Promise<void> {
        await delay(300)
        const store = useHousekeepingStore()
        store.assignTask(taskId, userId)
    },

    async remove(id: number): Promise<void> {
        await delay(500)
        const store = useHousekeepingStore()
        store.deleteTask(id)
    }
}
