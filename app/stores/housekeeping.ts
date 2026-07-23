// ============================================================================
// Store: Housekeeping
// ============================================================================
// Manages housekeeping tasks, room status updates, and task assignments.

import { defineStore } from 'pinia'
import type { HousekeepingTask, TaskStatus, StaffAssignment } from '~/types'

const STORAGE_KEY = 'presidio-housekeeping'

export const useHousekeepingStore = defineStore('housekeeping', () => {
    // ============================================================================
    // State
    // ============================================================================
    const tasks = ref<HousekeepingTask[]>([])
    const assignments = ref<StaffAssignment[]>([])
    const isLoading = ref(false)
    const isHydrated = ref(false)

    // ============================================================================
    // Persistence
    // ============================================================================

    const hydrate = () => {
        if (import.meta.server || isHydrated.value) return
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            const data = JSON.parse(stored)
            if (Array.isArray(data)) {
                tasks.value = data // backward compatibility
            } else {
                tasks.value = data.tasks || []
                assignments.value = data.assignments || []
            }
        }
        isHydrated.value = true
    }

    const persist = () => {
        if (import.meta.client) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks: tasks.value, assignments: assignments.value }))
        }
    }

    // ============================================================================
    // Getters
    // ============================================================================

    const pendingTasks = computed(() => tasks.value.filter(t => t.status === 'Pending'))

    const inProgressTasks = computed(() => tasks.value.filter(t => t.status === 'In Progress'))

    const completedTasks = computed(() => tasks.value.filter(t => t.status === 'Completed'))

    const statusCounts = computed(() => ({
        pending: pendingTasks.value.length,
        inProgress: inProgressTasks.value.length,
        completed: completedTasks.value.length
    }))

    /**
     * Get all tasks for a specific room.
     */
    const getTasksForRoom = (roomId: number): HousekeepingTask[] =>
        tasks.value.filter(t => t.roomId === roomId)

    /**
     * Get all tasks assigned to a specific user.
     */
    const getTasksForUser = (userId: number): HousekeepingTask[] =>
        tasks.value.filter(t => t.assignedTo === userId)
        
    const getAssignmentsForUser = (userId: number): StaffAssignment[] =>
        assignments.value.filter(a => a.userId === userId)

    // ============================================================================
    // Actions
    // ============================================================================

    const addTask = (data: Omit<HousekeepingTask, 'id'>): HousekeepingTask => {
        const newId = tasks.value.length > 0 ? Math.max(...tasks.value.map(t => t.id)) + 1 : 1
        const task: HousekeepingTask = { id: newId, ...data }
        tasks.value.push(task)
        persist()
        return task
    }

    const updateTask = (id: number, data: Partial<Omit<HousekeepingTask, 'id'>>) => {
        const task = tasks.value.find(t => t.id === id)
        if (task) {
            Object.assign(task, data)
            persist()
        }
    }

    /**
     * Transition a task to a new status. Automatically sets completedAt when completed.
     */
    const setTaskStatus = (id: number, status: TaskStatus) => {
        const update: Partial<HousekeepingTask> = { status }
        if (status === 'Completed') {
            update.completedAt = new Date().toISOString()
        }
        updateTask(id, update)
    }

    /**
     * Assign a task to a user.
     */
    const assignTask = (taskId: number, userId: number) => {
        updateTask(taskId, { assignedTo: userId })
    }

    const deleteTask = (id: number) => {
        tasks.value = tasks.value.filter(t => t.id !== id)
        persist()
    }

    const addAssignment = (data: Omit<StaffAssignment, 'id'>): StaffAssignment => {
        const newId = assignments.value.length > 0 ? Math.max(...assignments.value.map(a => a.id)) + 1 : 1
        const assignment: StaffAssignment = { id: newId, ...data }
        assignments.value.push(assignment)
        persist()
        return assignment
    }

    const removeAssignment = (id: number) => {
        assignments.value = assignments.value.filter(a => a.id !== id)
        persist()
    }

    /**
     * Bulk-set tasks (used by seeder).
     */
    const seed = (newTasks: HousekeepingTask[], newAssignments: StaffAssignment[] = []) => {
        tasks.value = newTasks
        assignments.value = newAssignments
        persist()
    }

    const clear = () => {
        tasks.value = []
        assignments.value = []
        if (import.meta.client) {
            localStorage.removeItem(STORAGE_KEY)
        }
    }

    return {
        // State
        tasks, assignments, isLoading, isHydrated,
        // Getters
        pendingTasks, inProgressTasks, completedTasks, statusCounts, getTasksForRoom, getTasksForUser, getAssignmentsForUser,
        // Actions
        hydrate, addTask, updateTask, setTaskStatus, assignTask, deleteTask, addAssignment, removeAssignment, seed, clear
    }
})
