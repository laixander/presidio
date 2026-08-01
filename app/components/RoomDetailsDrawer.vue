<script setup lang="ts">
import { computed } from 'vue'
import type { Room } from '~/types'
import StatusBadge from '~/components/StatusBadge.vue'

const props = defineProps<{
    room: Room | null
}>()

const emit = defineEmits<{
    (e: 'edit', room: Room): void
    (e: 'delete', room: Room): void
}>()

const isOpen = defineModel<boolean>('open', { default: false })
const roomsStore = useRoomsStore()

const roomType = computed(() => {
    return props.room ? roomsStore.getRoomType(props.room) : null
})
</script>

<template>
    <UDrawer v-model:open="isOpen" direction="right" inset class="min-w-[500px]">
        <template #header>
            <div class="flex items-center justify-between w-full">
                <div>
                    <div class="text-2xl font-bold flex items-center gap-2">
                        Room {{ room?.number }}
                        <StatusBadge v-if="room?.condition !== 'Normal'" :status="room?.condition || ''" />
                    </div>
                    <div class="text-sm text-muted">Floor {{ room?.floor }} &bull; {{ roomType?.name || 'Unknown Type' }}</div>
                </div>
            </div>
        </template>

        <template #body v-if="room">
            <div class="flex flex-col gap-6 mt-4">
                
                <!-- Quick Actions -->
                <div class="flex flex-wrap items-center gap-3 bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl border border-default">
                    <div class="text-sm font-semibold text-muted mr-auto flex items-center gap-2">
                        <UIcon name="i-lucide-zap" class="size-4" />
                        Quick Actions
                    </div>
                    
                    <UButton 
                        label="Edit Room" 
                        icon="i-lucide-pencil" 
                        color="neutral" 
                        variant="soft"
                        @click="emit('edit', room)" 
                    />
                    
                    <UButton 
                        label="Delete Room" 
                        icon="i-lucide-trash" 
                        color="error" 
                        variant="soft"
                        @click="emit('delete', room)" 
                    />
                </div>
                
                <!-- Status Section -->
                <div class="space-y-4">
                    <h3 class="text-sm font-bold text-muted uppercase tracking-wider">Current Status</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <UCard variant="subtle" :ui="{ body: 'sm:p-4' }" class="shadow-sm">
                            <div class="text-sm text-dimmed">Occupancy</div>
                            <div class="flex items-center gap-2 mt-2">
                                <StatusBadge :status="room.occupancyStatus" />
                            </div>
                        </UCard>
                        <UCard variant="subtle" :ui="{ body: 'sm:p-4' }" class="shadow-sm">
                            <div class="text-sm text-dimmed">Housekeeping</div>
                            <div class="flex items-center gap-2 mt-2">
                                <StatusBadge :status="room.cleanStatus" />
                            </div>
                        </UCard>
                    </div>
                </div>

                <!-- Pricing Section -->
                <div class="space-y-4">
                    <h3 class="text-sm font-bold text-muted uppercase tracking-wider">Pricing</h3>
                    <UCard variant="subtle" :ui="{ body: 'sm:p-4 flex flex-col gap-2' }" class="shadow-sm">
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-dimmed">Base Rate</span>
                            <span>₱{{ roomType?.baseRate.toLocaleString() || '0' }}</span>
                        </div>
                        <div v-if="room.rateOverride !== null" class="flex justify-between items-center text-sm">
                            <span class="text-dimmed">Override Rate</span>
                            <span class="text-primary font-bold">₱{{ room.rateOverride.toLocaleString() }}</span>
                        </div>
                        <div class="h-px bg-muted my-1"></div>
                        <div class="flex justify-between items-center font-bold">
                            <span>Effective Rate</span>
                            <span class="text-lg">₱{{ roomsStore.getEffectiveRate(room).toLocaleString() }}</span>
                        </div>
                    </UCard>
                </div>

                <!-- Room Details -->
                <div class="space-y-4">
                    <h3 class="text-sm font-bold text-muted uppercase tracking-wider">Details</h3>
                    <UCard variant="subtle" :ui="{ body: 'sm:p-0 overflow-hidden text-sm' }" class="shadow-sm">
                        <div class="flex justify-between p-3 border-b border-default">
                            <span class="text-dimmed">Max Occupancy</span>
                            <span class="font-medium">{{ roomType?.maxOccupancy || 'N/A' }} Persons</span>
                        </div>
                        <div class="flex justify-between p-3 border-b border-default">
                            <span class="text-dimmed">Type ID</span>
                            <span class="font-medium">{{ room.roomTypeId }}</span>
                        </div>
                        <div class="flex justify-between p-3">
                            <span class="text-dimmed">Room ID</span>
                            <span class="font-medium">{{ room.id }}</span>
                        </div>
                    </UCard>
                </div>

            </div>
        </template>
        
        <template #body v-else>
            <div class="flex flex-col items-center justify-center py-12 text-muted">
                <UIcon name="i-lucide-bed-double" class="w-12 h-12 mb-4 opacity-50" />
                <p>No room selected.</p>
            </div>
        </template>
    </UDrawer>
</template>
