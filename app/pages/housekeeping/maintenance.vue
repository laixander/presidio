<script setup lang="ts">
import { h, ref, computed } from 'vue'
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import { UButton, UDropdownMenu, UBadge, UModal, UFormField, USelect, UInput, UTextarea } from '#components'
import type { HousekeepingTask, TaskStatus, CommonArea, Room } from '~/types'
import { size } from 'zod'

definePageMeta({
    title: 'Maintenance Reporting',
    layout: 'dashboard',
    isTable: true,
    // headerActions: [
    //     { label: 'Report Issue', icon: 'i-lucide-triangle-alert', event: 'openMaintenanceModal', size: 'sm', color: 'error', variant: 'solid' }
    // ]
})

const events = useEvents()
const housekeepingStore = useHousekeepingStore()
const roomsStore = useRoomsStore()
const toast = useAppToast()

// Form state
const isModalOpen = ref(false)
const formData = ref({
    locationType: 'Room' as 'Room' | 'Area',
    roomId: undefined as number | undefined,
    area: 'Lobby' as CommonArea,
    notes: ''
})

events.on('openMaintenanceModal', () => {
    isModalOpen.value = true
    formData.value = {
        locationType: 'Room',
        roomId: undefined,
        area: 'Lobby',
        notes: ''
    }
})

const areas: CommonArea[] = ['Lobby', 'Pool', 'Gym', 'Restaurant', 'Hallways', 'Parking', 'Elevators', 'Other']

const handleSave = () => {
    if (formData.value.locationType === 'Room' && !formData.value.roomId) {
        toast.error('Missing required field', 'Please select a room.')
        return
    }
    if (!formData.value.notes) {
        toast.error('Missing required field', 'Please provide a description of the issue.')
        return
    }
    
    housekeepingStore.addTask({
        roomId: formData.value.locationType === 'Room' ? (formData.value.roomId ?? null) : null,
        area: formData.value.locationType === 'Area' ? formData.value.area : null,
        assignedTo: null,
        taskType: 'Maintenance',
        status: 'Pending',
        notes: formData.value.notes,
        createdAt: new Date().toISOString(),
        completedAt: null
    })
    
    if (formData.value.locationType === 'Room' && formData.value.roomId) {
        const room = roomsStore.rooms.find(r => r.id === formData.value.roomId)
        if (room) {
            const updates: Partial<Room> = { condition: 'Maintenance' }
            if (room.cleanStatus === 'Clean' || room.cleanStatus === 'Inspected') {
                updates.cleanStatus = 'Pickup'
            }
            roomsStore.updateRoom(formData.value.roomId, updates)
        }
    }
    
    toast.success('Issue Reported', 'The maintenance issue has been logged.')
    isModalOpen.value = false
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
    toast.success('Task Started', `Maintenance Task #${task.id} is now in progress.`)
}

const handleFinishTask = (task: HousekeepingTask) => {
    housekeepingStore.setTaskStatus(task.id, 'Completed')
    
    if (task.roomId) {
        roomsStore.updateRoom(task.roomId, { condition: 'Normal' })
    }
    
    toast.success('Task Completed', `Maintenance Task #${task.id} has been marked as completed.`)
}

const maintenanceTasks = computed(() => housekeepingStore.tasks.filter(t => t.taskType === 'Maintenance'))

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
                const room = roomsStore.rooms.find((r: Room) => r.id === row.original.roomId)
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
        accessorKey: 'notes',
        header: 'Issue Description',
        cell: ({ row }) => h('span', { class: 'text-sm' }, row.original.notes || '-')
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => h(UBadge, { color: getStatusColor(row.original.status), variant: 'solid', size: 'sm' }, () => row.original.status)
    },
    {
        accessorKey: 'createdAt',
        header: 'Reported',
        cell: ({ row }) => {
            const date = new Date(row.original.createdAt)
            return h('span', { class: 'text-sm text-muted' }, date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
        }
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

const viewMode = ref<'list' | 'card'>('list')
const globalFilter = ref('')
const table = useTemplateRef('table')
const columnVisibility = ref({
    id: true
})

const filteredTasks = computed(() => {
    if (!globalFilter.value) return maintenanceTasks.value
    const search = globalFilter.value.toLowerCase()
    return maintenanceTasks.value.filter(task => {
        const roomMatch = task.roomId ? `room ${roomsStore.rooms.find((r: Room) => r.id === task.roomId)?.number}`.includes(search) : false
        const areaMatch = task.area ? task.area.toLowerCase().includes(search) : false
        const notesMatch = task.notes ? task.notes.toLowerCase().includes(search) : false
        const statusMatch = task.status ? task.status.toLowerCase().includes(search) : false
        return roomMatch || areaMatch || notesMatch || statusMatch
    })
})
</script>

<template>
    <AuthGate v-if="!isAuthorized" title="Access Denied" description="You must be Housekeeping staff or an Administrator to access Maintenance Reporting." icon="i-lucide-lock" />

    <template v-else>
        <UPageCard title="Maintenance Reporting"
            description="Track and report maintenance issues across rooms and common areas."
            variant="naked" orientation="horizontal" class="border-b border-default rounded-none p-4 sm:p-6">
            <div class="flex justify-end gap-2 flex-1">
                <TableGlobalFilter v-model="globalFilter" placeholder="Search guests..." />
                <TableColumnToggle v-if="viewMode === 'list'" :table="table" />
                <UTabs :items="[{ icon: 'i-lucide-grid-3x3', value: 'card' }, { icon: 'i-lucide-list', value: 'list' }]"
                    v-model="viewMode" :content="false" size="xs" />
            </div>
        </UPageCard>

        <ClientOnly>
            <Teleport to="#header-actions-teleport">
                <UButton icon="i-lucide-triangle-alert" color="error" variant="soft" @click="events.emit('openMaintenanceModal')">
                    Report Issue
                </UButton>
            </Teleport>
        </ClientOnly>
        
        <UTable 
            v-if="viewMode === 'list'"
            ref="table"
            sticky 
            :data="maintenanceTasks" 
            :columns="columns"
            :loading="housekeepingStore.isLoading" 
            v-model:global-filter="globalFilter"
            v-model:column-visibility="columnVisibility"
            :ui="{ th: 'sm:px-6', td: 'sm:px-6' }" 
            class="flex-1 overflow-y-auto scrollbar"
        >
            <template #empty>
                <Empty 
                    :loading="housekeepingStore.isLoading" 
                    title="No maintenance tasks"
                    description="There are currently no maintenance issues reported."
                    icon="i-lucide-wrench" 
                />
            </template>
        </UTable>

        <div v-else class="flex-1 overflow-y-auto scrollbar p-4 sm:p-6">
            <Empty v-if="!housekeepingStore.isLoading && !filteredTasks.length"
                title="No maintenance tasks"
                description="There are currently no maintenance issues reported."
                icon="i-lucide-wrench" />

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <UCard v-for="task in filteredTasks" :key="task.id" variant="subtle"
                    class="hover:ring-2 hover:ring-primary transition-all duration-200 shadow-sm flex flex-col">
                    <template #header>
                        <div class="flex items-start justify-between">
                            <div>
                                <h3 class="text-lg font-bold flex items-center gap-2">
                                    <template v-if="task.roomId">Room {{ roomsStore.rooms.find((r: Room) => r.id === task.roomId)?.number || 'Unknown' }}</template>
                                    <template v-else-if="task.area">{{ task.area }}</template>
                                </h3>
                                <p class="text-xs text-muted">ID: #{{ task.id }}</p>
                            </div>
                            <UBadge :color="getStatusColor(task.status)" variant="subtle" size="sm">{{ task.status }}</UBadge>
                        </div>
                    </template>

                    <div class="flex-1 text-sm text-foreground whitespace-pre-wrap">
                        {{ task.notes || 'No description provided.' }}
                    </div>

                    <template #footer>
                        <div class="flex justify-between items-center">
                            <span class="text-xs text-muted">
                                {{ new Date(task.createdAt).toLocaleDateString() }}
                            </span>
                            <div class="flex gap-2">
                                <UButton v-if="task.status === 'Pending'" size="xs" color="primary" variant="soft" icon="i-lucide-play" @click="handleStartTask(task)">Start</UButton>
                                <UButton v-if="task.status === 'Pending' || task.status === 'In Progress'" size="xs" color="success" variant="soft" icon="i-lucide-check-circle" @click="handleFinishTask(task)">Complete</UButton>
                            </div>
                        </div>
                    </template>
                </UCard>
            </div>
        </div>

        <UModal v-model:open="isModalOpen" title="Report Maintenance Issue" description="Log a new issue for a room or common area.">
            <template #body>
                <form @submit.prevent="handleSave" class="space-y-4">
                    <UFormField label="Location Type">
                        <div class="flex gap-4">
                            <label class="flex items-center gap-2">
                                <input type="radio" v-model="formData.locationType" value="Room" class="text-primary" />
                                Room
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="radio" v-model="formData.locationType" value="Area" class="text-primary" />
                                Common Area
                            </label>
                        </div>
                    </UFormField>
                    
                    <UFormField v-if="formData.locationType === 'Room'" label="Room">
                        <USelect v-model="formData.roomId" :items="roomsStore.rooms.map(r => ({ label: `Room ${r.number}`, value: r.id }))" placeholder="Select Room" class="w-full" />
                    </UFormField>
                    
                    <UFormField v-if="formData.locationType === 'Area'" label="Common Area">
                        <USelect v-model="formData.area" :items="areas" class="w-full" />
                    </UFormField>
                    
                    <UFormField label="Issue Description">
                        <UTextarea v-model="formData.notes" placeholder="Describe the issue..." :rows="3" class="w-full" />
                    </UFormField>

                    <div class="flex justify-end gap-3 mt-6">
                        <UButton label="Cancel" color="neutral" variant="ghost" @click="isModalOpen = false" />
                        <UButton type="submit" label="Report Issue" color="error" />
                    </div>
                </form>
            </template>
        </UModal>
    </template>
</template>
