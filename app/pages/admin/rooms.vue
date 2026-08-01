<script setup lang="ts">
// ============================================================================
// Imports
// ============================================================================
import { h, ref, useTemplateRef } from 'vue'
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import { useOverlay } from '#imports'
import { UButton, UBadge, UDropdownMenu } from '#components'

import type { Room } from '~/types'
import RoomModal from '~/components/RoomModal.vue'
import ConfirmationModal from '~/components/ConfirmationModal.vue'
import StatusBadge from '~/components/StatusBadge.vue'
import AdminFloorPlan from '~/components/admin/AdminFloorPlan.vue'
import RoomDetailsDrawer from '~/components/RoomDetailsDrawer.vue'

// ============================================================================
// Page Configuration
// ============================================================================
definePageMeta({
    title: 'Room Management',
    layout: 'dashboard',
    isTable: true,
    // headerActions: [
    //     { label: 'History', icon: 'i-lucide-history', event: 'viewRoomLogs', variant: 'soft' },
    //     { label: 'Add Room', icon: 'i-lucide-plus', event: 'addRoom', color: 'primary' }
    // ]
})

// ============================================================================
// Composables & State
// ============================================================================
const roomsStore = useRoomsStore()
const events = useEvents()
const overlay = useOverlay()
const logger = useLogger('rooms')
const toast = useAppToast()

const roomModal = overlay.create(RoomModal)
const confirmModal = overlay.create(ConfirmationModal)

const isAddRoomOpen = ref(false)
const isDrawerOpen = ref(false)
const isDetailsDrawerOpen = ref(false)
const selectedRoom = ref<Room | null>(null)

// ============================================================================
// Event Listeners
// ============================================================================
events.on('addRoom', () => {
    isAddRoomOpen.value = true
})
events.on('viewRoomLogs', () => {
    isDrawerOpen.value = true
})

// ============================================================================
// Methods
// ============================================================================

async function handleAddRoom(roomData: Omit<Room, 'id'>) {
    roomsStore.addRoom(roomData)
    logger.addLog(`Added room: ${roomData.number}`, 'Created', 'success')
    toast.success('Room Added', `Room ${roomData.number} has been created.`)
    isAddRoomOpen.value = false
}

function handleEditRoom(room: Room) {
    roomModal.open({
        room,
        title: 'Edit Room',
        onSubmit: async (roomData: Omit<Room, 'id'>) => {
            confirmModal.open({
                title: 'Confirm Changes',
                description: `Are you sure you want to save changes to Room ${room.number}?`,
                confirmLabel: 'Save Changes',
                confirmColor: 'warning',
                onConfirm: () => {
                    roomsStore.updateRoom(room.id, roomData)
                    logger.addLog(`Updated room: ${roomData.number}`, 'Updated', 'warn')
                    toast.success('Room Updated', `Room ${roomData.number} has been updated.`)
                }
            })
        }
    })
}

function handleDeleteRoom(room: Room) {
    confirmModal.open({
        title: 'Delete Room',
        description: `Are you sure you want to delete Room ${room.number}? This action cannot be undone.`,
        confirmLabel: 'Delete',
        confirmColor: 'error',
        onConfirm: () => {
            roomsStore.deleteRoom(room.id)
            logger.addLog(`Deleted room: ${room.number}`, 'Deleted', 'error')
            toast.success('Room Deleted', `Room ${room.number} has been removed.`)
        }
    })
}

function handleViewDetails(room: Room) {
    selectedRoom.value = room
    isDetailsDrawerOpen.value = true
}

// ============================================================================
// Table Configuration
// ============================================================================

const columns: TableColumn<Room>[] = [
    {
        accessorKey: 'id',
        header: getSortableHeader('ID'),
        cell: ({ row }) => `${row.getValue('id')}`
    },
    {
        accessorKey: 'number',
        header: getSortableHeader('Room'),
        cell: ({ row }) => h('span', { class: 'font-semibold' }, `${row.getValue('number')}`)
    },
    {
        accessorKey: 'floor',
        header: getSortableHeader('Floor'),
        cell: ({ row }) => `Floor ${row.getValue('floor')}`
    },
    {
        id: 'type',
        header: 'Type',
        cell: ({ row }) => {
            const roomType = roomsStore.getRoomType(row.original)
            return h(StatusBadge, {
                status: roomType?.name || 'Unknown'
            })
        }
    },
    {
        id: 'rate',
        header: 'Rate / Night',
        cell: ({ row }) => {
            const rate = roomsStore.getEffectiveRate(row.original)
            const isOverride = row.original.rateOverride !== null
            return h('span', { class: isOverride ? 'text-primary font-semibold' : '' },
                `₱${rate.toLocaleString()}${isOverride ? ' ★' : ''}`
            )
        }
    },
    {
        accessorKey: 'occupancyStatus',
        header: getSortableHeader('Occupancy'),
        cell: ({ row }) => {
            const status = row.getValue('occupancyStatus') as string
            return h(StatusBadge, {
                status,
            })
        }
    },
    {
        accessorKey: 'cleanStatus',
        header: getSortableHeader('Clean Status'),
        cell: ({ row }) => {
            const status = row.getValue('cleanStatus') as string
            return h(StatusBadge, {
                status,
            })
        }
    },
    {
        accessorKey: 'condition',
        header: getSortableHeader('Condition'),
        cell: ({ row }) => {
            const condition = row.getValue('condition') as string
            if (condition === 'Normal') return condition
            return h(StatusBadge, {
                status: condition,
            })
        }
    }
]

const table = useTemplateRef('table')
const globalFilter = ref('')
const columnVisibility = ref({
    id: false
})
const viewMode = ref<'list' | 'card' | 'floorplan'>('list')
const authStore = useDemoAuth()

const filteredRooms = computed(() => {
    if (!globalFilter.value) return roomsStore.rooms
    const search = globalFilter.value.toLowerCase()
    return roomsStore.rooms.filter(room => {
        const typeName = roomsStore.getRoomType(room)?.name || ''
        return (
            room.number.toLowerCase().includes(search) ||
            room.floor.toString().includes(search) ||
            room.occupancyStatus.toLowerCase().includes(search) ||
            room.cleanStatus.toLowerCase().includes(search) ||
            room.condition.toLowerCase().includes(search) ||
            typeName.toLowerCase().includes(search)
        )
    })
})

const isAuthorized = computed(() => authStore.currentRole.value === 'Administrator')
</script>

<template>
    <AuthGate v-if="!isAuthorized" title="Access Denied"
        description="You must be an Administrator to access Room Management." icon="i-lucide-lock" />

    <template v-else>
        <UPageCard title="Room Management" description="Manage hotel room inventory, status, and pricing."
            variant="naked" orientation="horizontal" class="border-b border-default rounded-none p-4 sm:p-6">
            <div class="flex justify-end gap-2 flex-1">
                <TableGlobalFilter v-model="globalFilter" />
                <TableColumnToggle v-if="viewMode === 'list'" :table="table" />
                <UTabs :items="[{ icon: 'i-lucide-grid-3x3', value: 'card' }, { icon: 'i-lucide-list', value: 'list' }, { icon: 'i-lucide-bed-double', value: 'floorplan' }]"
                    v-model="viewMode" :content="false" size="xs" />
            </div>
        </UPageCard>

        <ClientOnly>
            <Teleport to="#header-actions-teleport">
                <UButton icon="i-lucide-history" color="neutral" variant="soft" @click="events.emit('viewRoomLogs')">
                    Recent Activity</UButton>
                <UButton icon="i-lucide-plus" color="primary" @click="events.emit('addRoom')">Add Room</UButton>
            </Teleport>
        </ClientOnly>

        <!-- List (table) view -->
        <UTable v-if="viewMode === 'list'" sticky ref="table" :data="roomsStore.rooms" :columns="columns"
            :loading="roomsStore.isLoading" v-model:column-visibility="columnVisibility"
            v-model:global-filter="globalFilter" :ui="{ th: 'sm:px-6', td: 'sm:px-6 cursor-pointer', tr: 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer' }" class="flex-1 scrollbar"
            @select="(e, row) => handleViewDetails(row.original)">
            <template #empty>
                <Empty :loading="roomsStore.isLoading" title="No rooms found"
                    description="There are currently no rooms to display. Add a new room to get started."
                    icon="i-lucide-bed-double" loading-title="Loading Rooms"
                    loading-description="Please wait while we fetch your room inventory.">
                    <template #action>
                        <UButton label="Add First Room" icon="i-lucide-plus" color="primary" size="lg"
                            @click="events.emit('addRoom')" />
                    </template>
                </Empty>
            </template>
        </UTable>

        <!-- Card grid view -->
        <div v-else-if="viewMode === 'card'" class="flex-1 overflow-y-auto scrollbar p-4 sm:p-6">
            <Empty v-if="!roomsStore.isLoading && !filteredRooms.length" title="No rooms found"
                description="There are currently no rooms to display. Add a new room to get started."
                icon="i-lucide-bed-double">
                <template #action>
                    <UButton label="Add First Room" icon="i-lucide-plus" color="primary" size="lg"
                        @click="events.emit('addRoom')" />
                </template>
            </Empty>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <UCard v-for="room in filteredRooms" :key="room.id" variant="subtle"
                    class="hover:ring-2 hover:ring-primary transition-all duration-200 shadow-sm cursor-pointer"
                    @click="handleViewDetails(room)">
                    <template #header>
                        <div class="flex items-start justify-between">
                            <div>
                                <p class="text-xs text-muted">Floor {{ room.floor }}</p>
                                <h3 class="text-lg font-bold">Room {{ room.number }}</h3>
                            </div>
                            <StatusBadge :status="roomsStore.getRoomType(room)?.name || 'Unknown'" class="mt-1" />
                        </div>
                    </template>

                    <div
                        class="*:py-2 *:first:pt-0 *:last:pb-0 *:flex *:items-center *:justify-between text-sm divide-y divide-default">
                        <div>
                            <span class="text-muted">Rate / Night</span>
                            <span :class="room.rateOverride !== null ? 'text-primary font-semibold' : ''">
                                ₱{{ roomsStore.getEffectiveRate(room).toLocaleString() }}{{ room.rateOverride !== null ?
                                ' ★' :
                                '' }}
                            </span>
                        </div>
                        <div>
                            <span class="text-muted">Occupancy</span>
                            <StatusBadge :status="room.occupancyStatus" />
                        </div>
                        <div>
                            <span class="text-muted">Clean Status</span>
                            <StatusBadge :status="room.cleanStatus" />
                        </div>
                        <div>
                            <span class="text-muted">Condition</span>
                            <StatusBadge v-if="room.condition !== 'Normal'" :status="room.condition" />
                            <span v-else class="text-default">Normal</span>
                        </div>
                    </div>
                </UCard>
            </div>
        </div>

        <!-- Floor Plan view -->
        <AdminFloorPlan v-else-if="viewMode === 'floorplan'" :rooms="filteredRooms" @edit="handleEditRoom" @delete="handleDeleteRoom" @select="handleViewDetails" />

        <RoomModal v-model:open="isAddRoomOpen" @submit="handleAddRoom" />
        <RoomDetailsDrawer v-model:open="isDetailsDrawerOpen" :room="selectedRoom" @edit="handleEditRoom" @delete="handleDeleteRoom" />

        <!-- ================================================================ -->
        <!-- Logs Drawer                                                       -->
        <!-- ================================================================ -->
        <LogsDrawer v-model:open="isDrawerOpen" namespace="rooms" />
    </template>
</template>
