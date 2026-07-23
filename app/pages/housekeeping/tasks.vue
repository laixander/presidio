<script setup lang="ts">
/**
 * ============================================================================
 * Page: Housekeeping Tasks (/housekeeping/tasks)
 * ============================================================================
 * Detailed data table of all pending and completed housekeeping tasks.
 */
import { h, computed, ref } from 'vue'
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import { UButton, UDropdownMenu, UBadge, UFieldGroup, UChip, UCard } from '#components'

import type { HousekeepingTask, TaskStatus, TaskType } from '~/types'

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
    if (task.roomId) {
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
    }
    
    toast.success('Task Completed', `Task #${task.id} has been marked as completed.`)
}

// ============================================================================
// Kanban Logic
// ============================================================================
const viewMode = ref<'table' | 'kanban'>('kanban')

const kanbanColumns = [
    { id: 'Pending', title: 'To Clean', color: 'neutral', icon: 'i-lucide-file-text' },
    { id: 'In Progress', title: 'In Progress', color: 'primary', icon: 'i-lucide-play-circle' },
    { id: 'Completed', title: 'Done', color: 'success', icon: 'i-lucide-check-circle' }
]

const isDragging = ref(false)
const dragging = ref<{ taskId: number; fromColumnId: TaskStatus } | null>(null)
const dragOver = ref<{ columnId: TaskStatus; taskId: number | null } | null>(null)

const isDraggingCard = (id: number) => dragging.value?.taskId === id
const isColumnOver = (columnId: TaskStatus) => dragOver.value?.columnId === columnId
const isCardOver = (id: number) => dragOver.value?.taskId === id

const onCardDragStart = (e: DragEvent, taskId: number, columnId: TaskStatus) => {
    isDragging.value = true
    dragging.value = { taskId, fromColumnId: columnId }
    if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move'
    }
}

const onCardDragOver = (taskId: number, columnId: TaskStatus) => {
    if (!dragging.value) return
    if (dragOver.value?.taskId === taskId && dragOver.value?.columnId === columnId) return
    dragOver.value = { columnId, taskId }
}

const onColumnDragOver = (columnId: TaskStatus) => {
    if (!dragging.value) return
    if (dragOver.value?.columnId === columnId && dragOver.value?.taskId === null) return
    dragOver.value = { columnId, taskId: null }
}

const moveTask = (taskId: number, fromColumnId: TaskStatus, toColumnId: TaskStatus) => {
    const task = housekeepingStore.tasks.find(t => t.id === taskId)
    if (task && task.status !== toColumnId) {
        if (toColumnId === 'In Progress') {
            handleStartTask(task)
        } else if (toColumnId === 'Completed') {
            handleFinishTask(task)
        } else {
            housekeepingStore.setTaskStatus(taskId, 'Pending')
            toast.success('Status updated', 'Task returned to Pending')
        }
    }
}

const onDrop = (toColumnId: TaskStatus) => {
    if (!dragging.value) return
    const { taskId, fromColumnId } = dragging.value
    moveTask(taskId, fromColumnId, toColumnId)
    dragging.value = null
    dragOver.value = null
    setTimeout(() => { isDragging.value = false }, 50)
}

const onDragEnd = () => {
    dragging.value = null
    dragOver.value = null
    setTimeout(() => { isDragging.value = false }, 50)
}

const displayColumns = computed(() => {
    return kanbanColumns.map(col => {
        return {
            ...col,
            cards: housekeepingStore.tasks.filter(t => t.status === col.id)
        }
    })
})

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
            <div class="p-4 sm:p-6 border-b border-default shrink-0">
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
                
                <div class="flex gap-2">
                    <UFieldGroup size="sm">
                        <UButton 
                            icon="i-lucide-layout-kanban" 
                            :color="viewMode === 'kanban' ? 'primary' : 'neutral'"
                            :variant="viewMode === 'kanban' ? 'soft' : 'ghost'"
                            @click="viewMode = 'kanban'"
                        />
                        <UButton 
                            icon="i-lucide-list" 
                            :color="viewMode === 'table' ? 'primary' : 'neutral'"
                            :variant="viewMode === 'table' ? 'soft' : 'ghost'"
                            @click="viewMode = 'table'"
                        />
                    </UFieldGroup>
                </div>
            </div>

            <!-- Kanban View -->
            <template v-if="viewMode === 'kanban'">
                <div class="flex-1 min-h-0 flex flex-col bg-neutral-50 dark:bg-neutral-900/30">
                    <div class="flex-1 flex gap-3 overflow-x-auto scrollbar p-4">
                        <div v-for="column in displayColumns" :key="column.id" class="flex flex-col w-80 shrink-0 gap-2">
                            <!-- Column header -->
                            <div class="flex items-center gap-2 p-2 rounded-xl shrink-0">
                                <UChip :color="column.color as any" size="2xl" standalone inset />
                                <UIcon :name="column.icon" class="size-4 text-muted shrink-0" />
                                <span class="text-sm font-semibold truncate">{{ column.title }}</span>
                                <UBadge :label="String(column.cards.length)" variant="soft" color="neutral" class="ml-auto shrink-0 font-mono" />
                            </div>

                            <!-- Drop zone -->
                            <div class="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto scrollbar rounded-xl p-2 transition-all duration-150"
                                :class="isColumnOver(column.id as TaskStatus) ? 'bg-primary/5 ring-2 ring-primary/30 ring-dashed' : 'bg-elevated/40'" 
                                @dragover.prevent="onColumnDragOver(column.id as TaskStatus)"
                                @drop.prevent="onDrop(column.id as TaskStatus)" 
                                @dragend="onDragEnd">
                                
                                <template v-for="task in column.cards" :key="task.id">
                                    <div class="relative">
                                        <div v-if="isCardOver(task.id)" class="absolute -top-[5px] left-1 right-1 h-0.5 rounded-full bg-primary z-10 pointer-events-none" />
                                        
                                        <UCard :ui="{ root: 'ring-0 border border-default', body: 'sm:p-4 relative space-y-2' }"
                                            class="group transition-all select-none shrink-0 cursor-pointer active:cursor-default hover:border-primary/30 hover:shadow-sm" 
                                            :class="[isDraggingCard(task.id) && 'opacity-40 scale-95']" 
                                            draggable="true"
                                            @dragstart="onCardDragStart($event, task.id, column.id as TaskStatus)"
                                            @dragover.prevent.stop="onCardDragOver(task.id, column.id as TaskStatus)"
                                            @drop.prevent.stop="onDrop(column.id as TaskStatus)" 
                                            @dragend="onDragEnd">
                                            
                                            <div class="flex items-start justify-between gap-2">
                                                <p class="text-sm font-medium leading-snug text-highlighted line-clamp-1">
                                                    Task #{{ task.id }}
                                                </p>
                                                <UBadge :label="getTaskLocation(task)" color="neutral" variant="soft" size="xs" class="shrink-0" />
                                            </div>
                                            
                                            <p class="text-xs text-muted leading-relaxed line-clamp-2">
                                                {{ task.notes || 'No description provided.' }}
                                            </p>
                                            
                                            <div class="flex justify-between items-center pt-2">
                                                <div class="flex items-center gap-1">
                                                    <UBadge :label="task.taskType" :color="getTaskColor(task.taskType)" variant="subtle" size="xs" />
                                                </div>
                                                <div class="flex items-center gap-1 text-muted text-xs">
                                                    <UIcon name="i-lucide-clock" class="w-3.5 h-3.5 shrink-0" />
                                                    {{ formatDate(task.createdAt) }}
                                                </div>
                                            </div>
                                        </UCard>
                                    </div>
                                </template>
                                
                                <Empty v-if="column.cards.length === 0" 
                                    title="No tasks" 
                                    description="Drop a task here" 
                                    icon="i-lucide-inbox"
                                    class="flex-1 py-4 bg-transparent border-0" 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </template>

            <!-- Data Table -->
            <UTable 
                v-else
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
