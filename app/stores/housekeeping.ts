// ============================================================================
// Store: Housekeeping
// ============================================================================
// Store: Housekeeping
// ============================================================================
// Manages housekeeping tasks, room status updates, and task assignments.

import { defineStore } from 'pinia'
import type { HousekeepingTask, TaskStatus, StaffAssignment, Room } from '~/types'



export const useHousekeepingStore = defineStore('housekeeping', () => {
    const trainingStore = useTrainingStore()
    const getStorageKey = () => trainingStore.activeSessionId ? `presidio-housekeeping-${trainingStore.activeSessionId}` : 'presidio-housekeeping'
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
        const stored = localStorage.getItem(getStorageKey())
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
            localStorage.setItem(getStorageKey(), JSON.stringify({ tasks: tasks.value, assignments: assignments.value }))
        }
    }

    // ============================================================================
    // Getters
    // ============================================================================

    const pendingTasks = computed(() => tasks.value.filter(t => t.status === 'Pending'))

    const inProgressTasks = computed(() => tasks.value.filter(t => t.status === 'In Progress'))

    const completedTasks = computed(() => tasks.value.filter(t => t.status === 'Completed'))

    const unassignedTasks = computed(() => tasks.value.filter(t => !t.assignedTo))

    const statusCounts = computed(() => ({
        pending: pendingTasks.value.length,
        inProgress: inProgressTasks.value.length,
        completed: completedTasks.value.length,
        unassigned: unassignedTasks.value.length
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
        
        // Automatically update room condition based on the new task
        if (task.roomId) {
            const roomsStore = useRoomsStore()
            const room = roomsStore.rooms.find(r => r.id === task.roomId)
            if (room) {
                const logger = useLogger('housekeeping')
                if (task.taskType === 'Cleaning' || task.taskType === 'Turn-down') {
                    if (room.cleanStatus === 'Clean' || room.cleanStatus === 'Inspected') {
                        roomsStore.updateRoom(room.id, { cleanStatus: 'Dirty' })
                        logger.addLog(`Room ${room.number} automatically marked Dirty due to new Task #${task.id}`, 'Task', 'info')
                    }
                } else if (task.taskType === 'Maintenance') {
                    if (room.condition === 'Normal') {
                        const updates: Partial<Room> = { condition: 'Maintenance' }
                        if (room.cleanStatus === 'Clean' || room.cleanStatus === 'Inspected') {
                            updates.cleanStatus = 'Pickup'
                        }
                        roomsStore.updateRoom(room.id, updates)
                        logger.addLog(`Room ${room.number} placed on Maintenance due to new Task #${task.id}`, 'Task', 'info')
                    }
                }
            }
        }

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

    const startTask = (task: HousekeepingTask) => {
        setTaskStatus(task.id, 'In Progress')
    }

    const completeTask = (task: HousekeepingTask) => {
        setTaskStatus(task.id, 'Completed')
        
        // Automatically update the associated room if applicable
        if (task.roomId) {
            const roomsStore = useRoomsStore()
            const room = roomsStore.rooms.find(r => r.id === task.roomId)
            if (room) {
                const logger = useLogger('housekeeping')
                if (task.taskType === 'Cleaning' || task.taskType === 'Turn-down') {
                    roomsStore.updateRoom(room.id, { cleanStatus: 'Clean' })
                    logger.addLog(`Room ${room.number} automatically marked Clean via Task #${task.id}`, 'Task', 'success')
                } else if (task.taskType === 'Maintenance') {
                    roomsStore.updateRoom(room.id, { condition: 'Normal' })
                    logger.addLog(`Room ${room.number} maintenance resolved via Task #${task.id}`, 'Task', 'success')
                }
            }
        }
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
            localStorage.removeItem(getStorageKey())
        }
    }

    return {
        // State
        tasks, assignments, isLoading, isHydrated,
        // Getters
        pendingTasks, inProgressTasks, completedTasks, statusCounts, getTasksForRoom, getTasksForUser, getAssignmentsForUser,
        // Actions
        hydrate, addTask, updateTask, setTaskStatus, startTask, completeTask, assignTask, deleteTask, addAssignment, removeAssignment, seed, clear
    }
})
