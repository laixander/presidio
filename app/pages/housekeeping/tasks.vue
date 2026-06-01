<script setup lang="ts">
/**
 * ============================================================================
 * Page: Housekeeping Tasks (/housekeeping/tasks)
 * ============================================================================
 * Detailed data table of all pending and completed housekeeping tasks.
 */
import { h, computed } from 'vue'
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import { UButton, UDropdownMenu, UBadge } from '#components'

import type { HousekeepingTask, TaskStatus, TaskType } from '~/types'
import { mockStaffUsers } from '~/data/mock/users'

definePageMeta({
    title: 'Housekeeping Tasks',
    layout: 'dashboard',
    isTable: true,
    headerActions: [
        { label: 'Live Dashboard', icon: 'i-lucide-layout-dashboard', event: 'goDashboard', color: 'primary', variant: 'soft' }
    ]
})

const router = useRouter()
const events = useEvents()
const housekeepingStore = useHousekeepingStore()
const roomsStore = useRoomsStore()
const toast = useAppToast()
const logger = useLogger('housekeeping')

events.on('goDashboard', () => {
    router.push('/housekeeping')
})

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
}

const getTaskColor = (type: TaskType) => {
    switch(type) {
        case 'Cleaning': return 'primary'
        case 'Turn-down': return 'neutral'
        case 'Maintenance': return 'warning'
        default: return 'neutral'
    }
}

const getStatusColor = (status: TaskStatus) => {
    switch(status) {
        case 'Pending': return 'neutral'
        case 'In Progress': return 'primary'
        case 'Completed': return 'success'
        default: return 'neutral'
    }
}

const handleStartTask = (task: HousekeepingTask) => {
    housekeepingStore.setTaskStatus(task.id, 'In Progress')
    toast.success('Task Started', `Task #${task.id} is now in progress.`)
}

const handleFinishTask = (task: HousekeepingTask) => {
    housekeepingStore.setTaskStatus(task.id, 'Completed')
    
    // Automatically update the associated room if applicable
    const room = roomsStore.rooms.find(r => r.id === task.roomId)
    if (room) {
        if (task.taskType === 'Cleaning' || task.taskType === 'Turn-down') {
            roomsStore.updateRoom(room.id, { cleanStatus: 'Clean' })
            logger.addLog(`Room ${room.number} automatically marked Clean via Task #${task.id}`, 'Task', 'success')
        } else if (task.taskType === 'Maintenance') {
            roomsStore.updateRoom(room.id, { condition: 'Normal' })
            logger.addLog(`Room ${room.number} maintenance resolved via Task #${task.id}`, 'Task', 'success')
        }
    }
    
    toast.success('Task Completed', `Task #${task.id} has been marked as completed.`)
}

// ============================================================================
// Table Configuration
// ============================================================================
const columns: TableColumn<HousekeepingTask>[] = [
    {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => h('span', { class: 'text-sm text-muted' }, `#${row.original.id}`)
    },
    {
        id: 'room',
        header: 'Room',
        cell: ({ row }) => {
            const room = roomsStore.rooms.find(r => r.id === row.original.roomId)
            return h('div', { class: 'flex items-center gap-2 font-mono font-bold' }, [
                room?.number || 'Unknown'
            ])
        }
    },
    {
        accessorKey: 'taskType',
        header: 'Task Type',
        cell: ({ row }) => h(UBadge, { color: getTaskColor(row.original.taskType), variant: 'subtle', size: 'sm' }, () => row.original.taskType)
    },
    {
        id: 'assignedTo',
        header: 'Assigned To',
        cell: ({ row }) => {
            if (!row.original.assignedTo) return h('span', { class: 'text-muted italic text-sm' }, 'Unassigned')
            const user = mockStaffUsers.find(u => u.id === row.original.assignedTo)
            return h('span', { class: 'text-sm font-medium' }, user ? user.name : 'Unknown')
        }
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => h(UBadge, { color: getStatusColor(row.original.status), variant: 'solid', size: 'sm' }, () => row.original.status)
    },
    {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => h('span', { class: 'text-sm text-muted' }, formatDate(row.original.createdAt))
    },
    {
        id: 'actions',
        meta: { class: { td: 'text-right' } },
        cell: ({ row }) => {
            const task = row.original
            const actionItems: DropdownMenuItem[] = []
            
            if (task.status === 'Pending') {
                actionItems.push({
                    label: 'Start Task',
                    icon: 'i-lucide-play',
                    onSelect: () => handleStartTask(task)
                })
            }
            if (task.status === 'Pending' || task.status === 'In Progress') {
                actionItems.push({
                    label: 'Complete Task',
                    icon: 'i-lucide-check-circle',
                    onSelect: () => handleFinishTask(task)
                })
            }

            // Only show dropdown if there are actions
            if (actionItems.length === 0) return null

            const items: DropdownMenuItem[][] = [actionItems]

            return h(UDropdownMenu, {
                items,
                content: { align: 'end' },
                size: 'sm'
            }, {
                default: () => h(UButton, {
                    icon: 'i-lucide-ellipsis-vertical',
                    color: 'neutral',
                    variant: 'ghost',
                    size: 'sm'
                })
            })
        }
    }
]

const authStore = useDemoAuth()
const isAuthorized = computed(() => ['Administrator', 'Housekeeping'].includes(authStore.currentRole.value ?? ''))
</script>

<template>
    <AuthGate v-if="!isAuthorized" title="Access Denied" description="You must be Housekeeping staff or an Administrator to access the Task queue." icon="i-lucide-lock" />

    <template v-else>
        <div class="flex-1 flex flex-col h-full">
            <!-- Dashboard Header & KPIs -->
            <div class="p-4 sm:p-6 border-b border-default bg-neutral-50 dark:bg-neutral-900 shrink-0">
                <h1 class="text-2xl font-bold mb-6">Task Queue</h1>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard 
                        title="Pending Tasks" 
                        :value="housekeepingStore.statusCounts.pending" 
                        icon="i-lucide-clock" 
                        trend="Awaiting assignment/start"
                        trend-direction="flat"
                        color="warning"
                    />
                    <StatCard 
                        title="In Progress" 
                        :value="housekeepingStore.statusCounts.inProgress" 
                        icon="i-lucide-play-circle" 
                        trend="Currently being worked on"
                        trend-direction="flat"
                        color="primary"
                    />
                    <StatCard 
                        title="Completed Today" 
                        :value="housekeepingStore.statusCounts.completed" 
                        icon="i-lucide-check-circle-2" 
                        trend="Great job!"
                        trend-direction="up"
                        color="success"
                    />
                </div>
            </div>
            
            <!-- Table Toolbar -->
            <div class="p-4 sm:px-6 flex justify-between items-center border-b border-default shrink-0">
                <div class="font-semibold text-lg flex items-center gap-2">
                    <UIcon name="i-lucide-clipboard-list" class="text-primary" />
                    All Tasks
                </div>
            </div>

            <!-- Data Table -->
            <UTable 
                sticky 
                :data="housekeepingStore.tasks" 
                :columns="columns"
                :loading="housekeepingStore.isLoading" 
                :ui="{ th: 'sm:px-6', td: 'sm:px-6' }" 
                class="flex-1 overflow-y-auto scrollbar"
            >
                <template #empty>
                    <Empty 
                        :loading="housekeepingStore.isLoading" 
                        title="No tasks found"
                        description="There are currently no housekeeping tasks in the queue."
                        icon="i-lucide-clipboard-check" 
                    />
                </template>
            </UTable>
        </div>
    </template>
</template>
