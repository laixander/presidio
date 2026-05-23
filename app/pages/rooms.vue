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

// ============================================================================
// Page Configuration
// ============================================================================
definePageMeta({
    title: 'Room Management',
    isTable: true,
    headerActions: [
        { label: 'Add Room', icon: 'i-lucide-plus', event: 'addRoom', color: 'primary' }
    ]
})

// ============================================================================
// Composables & State
// ============================================================================
const roomsStore = useRoomsStore()
const events = useEvents()
const overlay = useOverlay()
const toast = useAppToast()

const roomModal = overlay.create(RoomModal)
const confirmModal = overlay.create(ConfirmationModal)

const isAddRoomOpen = ref(false)

// ============================================================================
// Event Listeners
// ============================================================================
events.on('addRoom', () => {
    isAddRoomOpen.value = true
})

// ============================================================================
// Methods
// ============================================================================

async function handleAddRoom(roomData: Omit<Room, 'id'>) {
    roomsStore.addRoom(roomData)
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
            toast.success('Room Deleted', `Room ${room.number} has been removed.`)
        }
    })
}

// ============================================================================
// Helpers
// ============================================================================

type BadgeColor = 'error' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'neutral'

function getOccupancyColor(status: string): BadgeColor {
    return status === 'Occupied' ? 'warning' : 'success'
}

function getCleanColor(status: string): BadgeColor {
    const map: Record<string, BadgeColor> = {
        'Clean': 'success',
        'Inspected': 'primary',
        'Dirty': 'error',
        'Pickup': 'warning'
    }
    return map[status] || 'neutral'
}

function getConditionColor(condition: string): BadgeColor {
    return condition === 'Maintenance' ? 'error' : 'neutral'
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
            return h(UBadge, {
                label: roomType?.name || 'Unknown',
                variant: 'subtle',
                color: 'primary'
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
            return h(UBadge, {
                label: status,
                color: getOccupancyColor(status),
                variant: 'subtle'
            })
        }
    },
    {
        accessorKey: 'cleanStatus',
        header: getSortableHeader('Clean Status'),
        cell: ({ row }) => {
            const status = row.getValue('cleanStatus') as string
            return h(UBadge, {
                label: status,
                color: getCleanColor(status),
                variant: 'subtle'
            })
        }
    },
    {
        accessorKey: 'condition',
        header: getSortableHeader('Condition'),
        cell: ({ row }) => {
            const condition = row.getValue('condition') as string
            if (condition === 'Normal') return condition
            return h(UBadge, {
                label: condition,
                color: getConditionColor(condition),
                variant: 'subtle'
            })
        }
    },
    {
        id: 'actions',
        meta: { class: { td: 'text-right' } },
        cell: ({ row }) => {
            const items: DropdownMenuItem[][] = [
                [
                    {
                        label: 'Edit',
                        icon: 'i-lucide-edit',
                        onSelect: () => handleEditRoom(row.original)
                    }
                ],
                [
                    {
                        label: 'Delete',
                        icon: 'i-lucide-trash',
                        color: 'error',
                        onSelect: () => handleDeleteRoom(row.original)
                    }
                ]
            ]

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

const table = useTemplateRef('table')
const globalFilter = ref('')
const columnVisibility = ref({
    id: false
})
</script>

<template>
    <UPageCard title="Room Management"
        description="Manage hotel room inventory, status, and pricing."
        variant="naked" orientation="horizontal" class="border-b border-default rounded-none p-4 sm:p-6">
        <div class="flex justify-end gap-2 flex-1">
            <TableGlobalFilter v-model="globalFilter" />
            <TableColumnToggle :table="table" />
        </div>
    </UPageCard>

    <UTable sticky ref="table" :data="roomsStore.rooms" :columns="columns" :loading="roomsStore.isLoading"
        v-model:column-visibility="columnVisibility" v-model:global-filter="globalFilter"
        :ui="{ th: 'sm:px-6', td: 'sm:px-6' }" class="flex-1 scrollbar">
        <template #empty>
            <Empty :loading="roomsStore.isLoading" title="No rooms found"
                description="Your room inventory is empty. Click 'Deploy Demo Data' to populate or add rooms manually."
                icon="i-lucide-bed-double" loading-title="Loading Rooms"
                loading-description="Please wait while we fetch your room inventory.">
                <template #action>
                    <UButton label="Add First Room" icon="i-lucide-plus" color="primary" size="lg"
                        @click="events.emit('addRoom')" />
                </template>
            </Empty>
        </template>
    </UTable>

    <RoomModal v-model:open="isAddRoomOpen" @submit="handleAddRoom" />
</template>
