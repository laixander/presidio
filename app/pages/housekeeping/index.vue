<script setup lang="ts">
/**
 * ============================================================================
 * Page: Housekeeping Dashboard (/housekeeping)
 * ============================================================================
 * Provides an overview of all room statuses for housekeeping management.
 * Features KPIs and a filterable grid of physical rooms.
 */
import { ref, computed } from 'vue'
import type { CleanStatus } from '~/types'
import RoomStatusCard from '~/components/housekeeping/RoomStatusCard.vue'

definePageMeta({
    title: 'Housekeeping',
    layout: 'dashboard'
})

const roomsStore = useRoomsStore()

// Total dirty rooms (Vacant or Occupied)
const totalDirty = computed(() => roomsStore.rooms.filter(r => r.cleanStatus === 'Dirty').length)
// Total clean rooms
const totalClean = computed(() => roomsStore.rooms.filter(r => r.cleanStatus === 'Clean' || r.cleanStatus === 'Inspected').length)

// Filter State
const filterOptions = [
    { label: 'All Rooms', value: 'All' },
    { label: 'Dirty', value: 'Dirty' },
    { label: 'Clean', value: 'Clean' },
    { label: 'Inspected', value: 'Inspected' },
    { label: 'Maintenance', value: 'Maintenance' }
]

const currentFilter = ref('All')

// Filtered Rooms List
const filteredRooms = computed(() => {
    let list = roomsStore.rooms
    if (currentFilter.value === 'Dirty') list = list.filter(r => r.cleanStatus === 'Dirty')
    if (currentFilter.value === 'Clean') list = list.filter(r => r.cleanStatus === 'Clean')
    if (currentFilter.value === 'Inspected') list = list.filter(r => r.cleanStatus === 'Inspected')
    if (currentFilter.value === 'Maintenance') list = list.filter(r => r.condition === 'Maintenance')
    
    // Sort by room number naturally
    return list.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }))
})
</script>

<template>
    <div class="flex-1 flex flex-col h-full space-y-6 max-w-7xl mx-auto w-full">
        <!-- Dashboard Header & KPIs -->
        <div>
            <div class="flex justify-between items-center mb-6">
                <h1 class="text-2xl font-bold">Room Status Board</h1>
                <UButton label="View Tasks" icon="i-lucide-list-todo" color="primary" variant="soft" to="/housekeeping/tasks" />
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                    title="Dirty Rooms" 
                    :value="totalDirty" 
                    icon="i-lucide-trash-2" 
                    trend="Needs immediate cleaning"
                    trend-direction="down"
                    color="warning"
                />
                <StatCard 
                    title="Ready Rooms" 
                    :value="roomsStore.roomsByStatus.vacantClean" 
                    icon="i-lucide-sparkles" 
                    trend="Vacant & Clean"
                    trend-direction="up"
                    color="success"
                />
                <StatCard 
                    title="Maintenance" 
                    :value="roomsStore.roomsByStatus.maintenance" 
                    icon="i-lucide-wrench" 
                    trend="Out of order"
                    trend-direction="flat"
                    color="error"
                />
            </div>
        </div>
        
        <!-- Controls -->
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4 py-2">
            <h2 class="text-lg font-semibold flex items-center gap-2">
                <UIcon name="i-lucide-door-open" class="text-primary" />
                Live Inventory ({{ filteredRooms.length }})
            </h2>
            <div class="flex gap-2 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-lg border border-default">
                <button 
                    v-for="opt in filterOptions" 
                    :key="opt.value"
                    @click="currentFilter = opt.value"
                    class="px-4 py-1.5 text-sm font-medium rounded-md transition-colors"
                    :class="currentFilter === opt.value ? 'bg-white dark:bg-neutral-800 shadow-sm text-primary' : 'text-muted hover:text-neutral-900 dark:hover:text-white'"
                >
                    {{ opt.label }}
                </button>
            </div>
        </div>

        <!-- Room Grid -->
        <div v-if="filteredRooms.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
            <RoomStatusCard 
                v-for="room in filteredRooms" 
                :key="room.id" 
                :room="room" 
            />
        </div>
        
        <div v-else class="flex flex-col items-center justify-center py-20 border-2 border-dashed border-default rounded-xl">
            <UIcon name="i-lucide-search-x" class="size-12 text-neutral-300 mb-4" />
            <h3 class="text-lg font-semibold">No rooms match this filter</h3>
            <p class="text-muted text-sm mt-1">Try selecting a different status filter.</p>
            <UButton label="Clear Filters" variant="soft" color="neutral" class="mt-4" @click="currentFilter = 'All'" />
        </div>
    </div>
</template>
