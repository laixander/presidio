<script setup lang="ts">
import { computed } from 'vue'
import type { Room } from '~/types'
import StatusBadge from '~/components/StatusBadge.vue'
import { UDropdownMenu, UButton, UCard, UTooltip } from '#components'

const props = defineProps<{
    rooms: Room[]
}>()

const emit = defineEmits<{
    edit: [room: Room]
    delete: [room: Room]
    select: [room: Room]
}>()

const roomsStore = useRoomsStore()

// Group rooms by floor, sorted by floor number descending or ascending.
const floors = computed(() => {
    const grouped = props.rooms.reduce((acc, room) => {
        const floorRooms = acc[room.floor]
        if (floorRooms) {
            floorRooms.push(room)
        } else {
            acc[room.floor] = [room]
        }
        return acc
    }, {} as Record<number, Room[]>)

    // Sort floors (highest first)
    const sortedFloors = Object.keys(grouped)
        .map(Number)
        .sort((a, b) => b - a)

    return sortedFloors.map(floor => ({
        floor,
        // Sort rooms by number on the floor
        rooms: (grouped[floor] || []).sort((a, b) => a.number.localeCompare(b.number))
    }))
})

// Visual mapping for room statuses
function getRoomClasses(room: Room) {
    const classes = []
    
    // Occupancy Status
    if (room.occupancyStatus === 'Occupied') {
        classes.push('bg-primary/10 dark:bg-primary/20')
    } else {
        classes.push('bg-default')
    }

    // Clean Status Border Colors
    if (room.cleanStatus === 'Clean' || room.cleanStatus === 'Inspected') {
        classes.push('border-success')
    } else if (room.cleanStatus === 'Dirty') {
        classes.push('border-error')
    } else if (room.cleanStatus === 'Pickup') {
        classes.push('border-warning')
    }

    if (room.condition === 'Maintenance') {
        classes.push('border-dashed bg-error/10 opacity-75')
    }
    
    return classes.join(' ')
}
</script>

<template>
    <UCard variant="soft" :ui="{ root: 'rounded-none', body: 'flex flex-wrap items-center gap-6 text-sm sm:py-4' }" class="shadow-sm">
            <div class="flex items-center gap-3">
                <span class="font-semibold text-muted mr-1">Occupancy:</span>
                <div class="flex items-center gap-1.5"><div class="w-4 h-4 rounded bg-primary/20 border-2 border-transparent"></div><span>Occupied</span></div>
                <div class="flex items-center gap-1.5"><div class="w-4 h-4 rounded bg-default border-2 border-muted"></div><span>Vacant</span></div>
            </div>
            
            <div class="hidden sm:block w-px h-6 bg-accented"></div>

            <div class="flex items-center gap-3">
                <span class="font-semibold text-muted mr-1">Clean Status (Border):</span>
                <div class="flex items-center gap-1.5"><div class="w-4 h-4 rounded border-2 border-success bg-default"></div><span>Clean</span></div>
                <div class="flex items-center gap-1.5"><div class="w-4 h-4 rounded border-2 border-error bg-default"></div><span>Dirty</span></div>
                <div class="flex items-center gap-1.5"><div class="w-4 h-4 rounded border-2 border-warning bg-default"></div><span>Pickup</span></div>
            </div>

            <div class="hidden sm:block w-px h-6 bg-accented"></div>

            <div class="flex items-center gap-3">
                <span class="font-semibold text-muted mr-1">Condition:</span>
                <div class="flex items-center gap-1.5">
                    <div class="w-4 h-4 rounded border-2 border-dashed border-error/50 bg-error/10 flex items-center justify-center">
                        <UIcon name="i-lucide-wrench" class="w-2.5 h-2.5 text-error" />
                    </div>
                    <span>Maintenance</span>
                </div>
            </div>
        </UCard>
    <div class="flex-1 overflow-y-auto scrollbar p-4 sm:p-6 space-y-8 bg-default/30">
        
        <!-- Legend -->
        <div v-if="floors.length === 0" class="flex flex-col items-center justify-center py-12 text-muted">
            <UIcon name="i-lucide-map" class="w-12 h-12 mb-4 opacity-50" />
            <p>No rooms available to display.</p>
        </div>

        <section v-for="floorData in floors" :key="floorData.floor" class="space-y-4">
            <!-- Floor Header -->
            <div class="flex items-center gap-4">
                <div class="h-px flex-1 bg-default" />
                <h2 class="text-lg font-bold text-muted uppercase tracking-wider">
                    Floor {{ floorData.floor }}
                </h2>
                <div class="h-px flex-1 bg-default" />
            </div>

            <!-- Floor Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                <div 
                    v-for="room in floorData.rooms" 
                    :key="room.id"
                    @click="emit('select', room)"
                    :class="[
                        'relative group flex flex-col rounded-xl border-2 transition-all duration-200 p-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
                        getRoomClasses(room)
                    ]"
                >
                    <!-- Quick Actions Menu -->
                    <div class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <UDropdownMenu 
                            :items="[[
                                { label: 'View Details', icon: 'i-lucide-eye', onSelect: () => emit('select', room) },
                                { label: 'Edit', icon: 'i-lucide-edit', onSelect: () => emit('edit', room) }
                            ], [
                                { label: 'Delete', icon: 'i-lucide-trash', color: 'error', onSelect: () => emit('delete', room) }
                            ]]" 
                            :content="{ align: 'end' }" 
                            size="sm"
                        >
                            <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" size="xs" />
                        </UDropdownMenu>
                    </div>

                    <div class="flex items-center justify-between mb-2">
                        <span class="text-xl font-black">{{ room.number }}</span>
                        <UTooltip :text="room.condition" v-if="room.condition !== 'Normal'">
                            <UIcon name="i-lucide-wrench" class="w-4 h-4 text-error" />
                        </UTooltip>
                    </div>
                    
                    <div class="mt-auto space-y-1.5">
                        <div class="text-[10px] uppercase font-semibold text-muted tracking-wide truncate">
                            {{ roomsStore.getRoomType(room)?.name || 'Unknown Type' }}
                        </div>
                        <div class="flex items-center justify-between">
                            <!-- Small colored dots for status -->
                            <div class="flex gap-1.5">
                                <UTooltip :text="`Occupancy: ${room.occupancyStatus}`">
                                    <div :class="[
                                        'w-2 h-2 rounded-full',
                                        room.occupancyStatus === 'Occupied' ? 'bg-primary' : 'bg-success'
                                    ]" />
                                </UTooltip>
                                <UTooltip :text="`Clean: ${room.cleanStatus}`">
                                    <div :class="[
                                        'w-2 h-2 rounded-full',
                                        room.cleanStatus === 'Clean' || room.cleanStatus === 'Inspected' ? 'bg-success' : 
                                        room.cleanStatus === 'Dirty' ? 'bg-error' : 'bg-warning'
                                    ]" />
                                </UTooltip>
                            </div>
                            
                            <span class="text-xs font-medium" :class="room.rateOverride !== null ? 'text-primary' : ''">
                                ₱{{ (roomsStore.getEffectiveRate(room) / 1000).toFixed(1) }}k
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>
