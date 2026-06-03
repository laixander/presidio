// ============================================================================
// Mock Data: Housekeeping Tasks
// ============================================================================
// 8 tasks with varied types and statuses across multiple rooms.

import type { HousekeepingTask } from '~/types'

export const mockTasks: HousekeepingTask[] = [
    {
        id: 1,
        roomId: 4,
        assignedTo: 4,
        taskType: 'Cleaning',
        status: 'Pending',
        createdAt: '2026-05-23T08:00:00Z',
        completedAt: null
    },
    {
        id: 2,
        roomId: 9,
        assignedTo: 4,
        taskType: 'Cleaning',
        status: 'In Progress',
        createdAt: '2026-05-23T07:30:00Z',
        completedAt: null
    },
    {
        id: 3,
        roomId: 14,
        assignedTo: null,
        taskType: 'Cleaning',
        status: 'Pending',
        createdAt: '2026-05-23T09:00:00Z',
        completedAt: null
    },
    {
        id: 4,
        roomId: 7,
        assignedTo: 4,
        taskType: 'Cleaning',
        status: 'Completed',
        createdAt: '2026-05-23T06:00:00Z',
        completedAt: '2026-05-23T07:15:00Z'
    },
    {
        id: 5,
        roomId: 16,
        assignedTo: 4,
        taskType: 'Turn-down',
        status: 'Completed',
        createdAt: '2026-05-22T18:00:00Z',
        completedAt: '2026-05-22T18:30:00Z'
    },
    {
        id: 6,
        roomId: 10,
        assignedTo: null,
        taskType: 'Maintenance',
        status: 'Pending',
        createdAt: '2026-05-22T14:00:00Z',
        completedAt: null
    },
    {
        id: 7,
        roomId: 1,
        assignedTo: 4,
        taskType: 'Turn-down',
        status: 'Pending',
        createdAt: '2026-05-23T17:00:00Z',
        completedAt: null
    },
    {
        id: 8,
        roomId: 15,
        assignedTo: 4,
        taskType: 'Turn-down',
        status: 'Pending',
        createdAt: '2026-05-23T17:00:00Z',
        completedAt: null
    }
]
