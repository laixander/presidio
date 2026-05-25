<script setup lang="ts">
import { computed } from 'vue'
import { UCard, UBadge, UButton, UTooltip } from '#components'
import type { Room, CleanStatus, RoomCondition } from '~/types'

const props = defineProps<{
    room: Room
}>()

const roomsStore = useRoomsStore()
const toast = useAppToast()

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
    roomsStore.updateRoom(props.room.id, { condition: newCondition })
    if (newCondition === 'Maintenance') {
        toast.error('Maintenance Alert', `Room ${props.room.number} is now on Maintenance.`)
    } else {
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
        :ui="{ root: room.condition === 'Maintenance' ? 'overflow-visible' : '', body: 'p-4 sm:p-5' }"
    >
        <!-- Maintenance Alert Overlay -->
        <div v-if="room.condition === 'Maintenance'" class="absolute -top-3 -right-3">
            <UTooltip text="Room out of order">
                <div class="bg-error-500 text-white rounded-full p-1.5 shadow-md flex items-center justify-center animate-pulse">
                    <UIcon name="i-lucide-wrench" class="size-4" />
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
        <div class="flex flex-wrap gap-2 mb-6">
            <UBadge :color="getCleanColor(room.cleanStatus)" variant="subtle" size="sm" class="flex items-center gap-1">
                <UIcon :name="room.cleanStatus === 'Clean' || room.cleanStatus === 'Inspected' ? 'i-lucide-sparkles' : 'i-lucide-trash-2'" class="size-3" />
                {{ room.cleanStatus }}
            </UBadge>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-2 gap-2 mt-auto">
            <!-- Dynamic primary action based on clean status -->
            <UButton 
                v-if="room.cleanStatus === 'Dirty' && room.condition === 'Normal'"
                label="Mark Clean" 
                icon="i-lucide-check-circle-2" 
                color="success" 
                variant="soft" 
                size="sm"
                block
                @click="updateCleanStatus('Clean')" 
            />
            
            <UButton 
                v-else-if="room.cleanStatus === 'Clean' && room.condition === 'Normal'"
                label="Inspect" 
                icon="i-lucide-search" 
                color="primary" 
                variant="soft" 
                size="sm"
                block
                @click="updateCleanStatus('Inspected')" 
            />
            
            <UButton 
                v-else-if="room.cleanStatus === 'Pickup' && room.condition === 'Normal'"
                label="Finish Pickup" 
                icon="i-lucide-brush-cleaning" 
                color="success" 
                variant="soft" 
                size="sm"
                block
                @click="updateCleanStatus('Clean')" 
            />
            
            <UButton 
                v-else-if="room.cleanStatus === 'Inspected' && room.condition === 'Normal'"
                label="Make Dirty" 
                icon="i-lucide-alert-circle" 
                color="warning" 
                variant="ghost" 
                size="sm"
                block
                @click="updateCleanStatus('Dirty')" 
            />
            
            <div v-else-if="room.condition === 'Maintenance'" class="col-span-1 text-xs text-error-600 font-medium flex items-center justify-center">
                Out of Order
            </div>

            <!-- Maintenance Toggle Action -->
            <UButton 
                v-if="room.condition === 'Normal'"
                label="Report" 
                icon="i-lucide-wrench" 
                color="neutral" 
                variant="ghost" 
                size="sm"
                block
                @click="toggleMaintenance" 
            />
            <UButton 
                v-else
                label="Resolve" 
                icon="i-lucide-check" 
                color="success" 
                variant="solid" 
                size="sm"
                block
                @click="toggleMaintenance" 
            />
        </div>
    </UCard>
</template>
