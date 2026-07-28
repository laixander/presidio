<script setup lang="ts">
import { computed } from 'vue'
import { UCard, UBadge, UButton, UTooltip } from '#components'
import type { Room, CleanStatus, RoomCondition } from '~/types'

const props = defineProps<{
    room: Room
}>()

const roomsStore = useRoomsStore()
const housekeepingStore = useHousekeepingStore()
const toast = useAppToast()

const activeTasksCount = computed(() => housekeepingStore.getTasksForRoom(props.room.id).filter(t => t.status !== 'Completed').length)

const getCleanColor = (status: CleanStatus) => {
    switch (status) {
        case 'Clean': return 'success'
        case 'Dirty': return 'error'
        case 'Pickup': return 'warning'
        case 'Inspected': return 'primary'
        default: return 'neutral'
    }
}

const getConditionColor = (condition: RoomCondition) => {
    return condition === 'Maintenance' ? 'error' : 'success'
}

// Actions
const updateCleanStatus = (status: CleanStatus) => {
    roomsStore.updateRoom(props.room.id, { cleanStatus: status })
    toast.success('Room Updated', `Room ${props.room.number} marked as ${status}.`)
}

const toggleMaintenance = () => {
    const newCondition = props.room.condition === 'Maintenance' ? 'Normal' : 'Maintenance'
    if (newCondition === 'Maintenance') {
        const updates: Partial<Room> = { condition: 'Maintenance' }
        if (props.room.cleanStatus === 'Clean' || props.room.cleanStatus === 'Inspected') {
            updates.cleanStatus = 'Pickup'
        }
        roomsStore.updateRoom(props.room.id, updates)
        toast.error('Maintenance Alert', `Room ${props.room.number} is now on Maintenance.`)
    } else {
        roomsStore.updateRoom(props.room.id, { condition: 'Normal' })
        toast.success('Maintenance Resolved', `Room ${props.room.number} is back to Normal condition.`)
    }
}
</script>

<template>
    <UCard 
        variant="subtle"
        class="relative transition-all duration-200 shadow-sm"
        :class="[
            room.condition === 'Maintenance' ? 'ring-2 ring-error-500/50 dark:ring-error-400/50 bg-error-50 dark:bg-error-950/20' : 
            room.cleanStatus === 'Dirty' ? 'ring-2 ring-warning-500/30' : 
            'hover:ring-2 hover:ring-primary-500/30'
        ]"
        :ui="{ root: (room.condition === 'Maintenance' || room.cleanStatus === 'Dirty' || room.cleanStatus === 'Pickup') ? 'overflow-visible' : '', body: 'p-4 sm:p-5' }"
    >
        <!-- Maintenance Alert Overlay -->
        <div v-if="room.condition === 'Maintenance'" class="absolute -top-2 -right-2">
            <UTooltip text="Room out of order">
                <div class="bg-error-500 text-white rounded-full p-1 shadow-md flex items-center justify-center animate-pulse">
                    <UIcon name="i-lucide-wrench" class="size-4" />
                </div>
            </UTooltip>
        </div>

        <!-- Dirty/Pickup Alert Overlay -->
        <div v-if="room.cleanStatus === 'Dirty' && room.condition === 'Normal'" class="absolute -top-2 -right-2">
            <UTooltip text="Room needs cleaning">
                <div class="bg-warning-500 text-white rounded-full p-1 shadow-md flex items-center justify-center animate-pulse">
                    <UIcon name="i-lucide-trash-2" class="size-4" />
                </div>
            </UTooltip>
        </div>
        <div v-if="room.cleanStatus === 'Pickup' && room.condition === 'Normal'" class="absolute -top-2 -right-2">
            <UTooltip text="Room needs pickup">
                <div class="bg-warning-500 text-white rounded-full p-1 shadow-md flex items-center justify-center animate-pulse">
                    <UIcon name="i-lucide-brush-cleaning" class="size-4" />
                </div>
            </UTooltip>
        </div>

        <!-- Header: Room Number and Occupancy -->
        <div class="flex justify-between items-start mb-4">
            <div>
                <h3 class="text-2xl font-black font-mono tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
                    {{ room.number }}
                </h3>
                <span class="text-xs text-muted font-medium uppercase tracking-widest mt-1 block">
                    Floor {{ room.floor }}
                </span>
            </div>
            <UBadge 
                :color="room.occupancyStatus === 'Occupied' ? 'primary' : 'neutral'" 
                :variant="room.occupancyStatus === 'Occupied' ? 'solid' : 'soft'"
                size="sm"
            >
                {{ room.occupancyStatus }}
            </UBadge>
        </div>

        <!-- Status Badges -->
        <div class="flex flex-wrap gap-2">
            <UBadge :color="getCleanColor(room.cleanStatus)" variant="subtle" size="sm" class="flex items-center gap-1">
                <UIcon :name="room.cleanStatus === 'Clean' || room.cleanStatus === 'Inspected' ? 'i-lucide-sparkles' : 'i-lucide-trash-2'" class="size-3" />
                {{ room.cleanStatus }}
            </UBadge>
            
            <UBadge v-if="activeTasksCount > 0" color="neutral" variant="soft" size="sm" class="flex items-center gap-1 font-mono">
                <UIcon name="i-lucide-clipboard-list" class="size-3" />
                {{ activeTasksCount }} Task{{ activeTasksCount !== 1 ? 's' : '' }}
            </UBadge>
        </div>

    </UCard>
</template>
