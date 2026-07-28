<script setup lang="ts">
/**
 * ============================================================================
 * Page: Housekeeping Tasks (/housekeeping/tasks)
 * ============================================================================
 * Detailed data table of all pending and completed housekeeping tasks.
 */
import { h, computed, ref } from 'vue'
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import { UButton, UDropdownMenu, UBadge, UFieldGroup, UChip, UCard, UModal, UFormField, USelect, URadioGroup, UTextarea } from '#components'

import type { HousekeepingTask, TaskStatus, TaskType } from '~/types'

definePageMeta({
    title: 'Housekeeping Tasks',
    layout: 'dashboard',
    isTable: true,
    headerActions: [
        { label: 'New Task', icon: 'i-lucide-plus', event: 'openTaskModal', color: 'primary', variant: 'solid' },
        { label: 'Live Dashboard', icon: 'i-lucide-layout-dashboard', event: 'goDashboard', color: 'neutral', variant: 'soft' }
    ]
})

const router = useRouter()
const events = useEvents()
const housekeepingStore = useHousekeepingStore()
const roomsStore = useRoomsStore()
const usersStore = useUsersStore()
const toast = useAppToast()
const logger = useLogger('housekeeping')

events.on('goDashboard', () => {
    router.push('/housekeeping')
})

// ============================================================================
// New Task Modal Logic
// ============================================================================
const isModalOpen = ref(false)

events.on('openTaskModal', () => {
    isModalOpen.value = true
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



const getTaskLocation = (task: HousekeepingTask) => {
    if (task.roomId) {
        const room = roomsStore.rooms.find(r => r.id === task.roomId)
        return `Room ${room?.number || 'Unknown'}`
    } else if (task.area) {
        return task.area
    }
    return 'Unknown'
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
        id: 'location',
        header: 'Location',
        cell: ({ row }) => {
            if (row.original.roomId) {
                const room = roomsStore.rooms.find(r => r.id === row.original.roomId)
                return h('div', { class: 'flex items-center gap-2 font-mono font-bold' }, [
                    `Room ${room?.number || 'Unknown'}`
                ])
            } else if (row.original.area) {
                return h('div', { class: 'flex items-center gap-2 font-semibold text-primary' }, [
                    row.original.area
                ])
            }
            return h('span', { class: 'text-muted' }, 'Unknown')
        }
    },
    {
        id: 'notes',
        header: 'Notes',
        cell: ({ row }) => h('span', { class: 'text-sm text-muted line-clamp-1 max-w-[150px]', title: row.original.notes || '' }, row.original.notes || '-')
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
            const userStore = useUsersStore()
            const user = userStore.users.find(u => u.id === row.original.assignedTo)
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
                    onSelect: () => {
                        housekeepingStore.startTask(task)
                        toast.success('Task Started', `Task #${task.id} is now in progress.`)
                    }
                })
            }
            if (task.status === 'Pending' || task.status === 'In Progress') {
                actionItems.push({
                    label: 'Complete Task',
                    icon: 'i-lucide-check-circle',
                    onSelect: () => {
                        housekeepingStore.completeTask(task)
                        toast.success('Task Completed', `Task #${task.id} has been marked as completed.`)
                    }
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
        <UPageCard title="Task Queue"
            description="Manage the housekeeping task queue."
            variant="naked" orientation="horizontal" class="rounded-none p-4 sm:p-6">
        </UPageCard>

        <!-- Dashboard Header & KPIs -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 px-4 sm:px-6">
            <StatCard 
                title="To Clean" 
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
                title="Completed" 
                :value="housekeepingStore.statusCounts.completed" 
                icon="i-lucide-check-circle-2" 
                trend="Finished tasks"
                trend-direction="flat"
                color="success"
            />
            <StatCard 
                title="Unassigned" 
                :value="housekeepingStore.statusCounts.unassigned" 
                icon="i-lucide-user-minus" 
                trend="Needs assignment"
                trend-direction="flat"
                color="error"
            />
        </div>
        <USeparator class="mt-4 sm:mt-6" />

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

        <NewTaskModal v-model="isModalOpen" />
    </template>
</template>
