<script setup lang="ts">
import { h, ref, computed } from 'vue'
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import { UButton, UDropdownMenu, UBadge, UModal, UFormField, USelect, UInput, UTextarea } from '#components'
import type { HousekeepingTask, TaskStatus, CommonArea, Room } from '~/types'

definePageMeta({
    title: 'Maintenance Reporting',
    layout: 'dashboard',
    isTable: true,
    headerActions: [
        { label: 'Report Issue', icon: 'i-lucide-triangle-alert', event: 'openMaintenanceModal', color: 'error', variant: 'solid' }
    ]
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
        roomsStore.updateRoom(formData.value.roomId, { condition: 'Maintenance' })
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
</script>

<template>
    <AuthGate v-if="!isAuthorized" title="Access Denied" description="You must be Housekeeping staff or an Administrator to access Maintenance Reporting." icon="i-lucide-lock" />

    <template v-else>
        <div class="flex-1 flex flex-col h-full">
            <div class="p-4 sm:p-6 border-b border-default shrink-0">
                <h1 class="text-2xl font-bold mb-2">Maintenance Reporting</h1>
                <p class="text-muted">Track and report maintenance issues across rooms and common areas.</p>
            </div>
            
            <UTable 
                sticky 
                :data="maintenanceTasks" 
                :columns="columns"
                :loading="housekeepingStore.isLoading" 
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
