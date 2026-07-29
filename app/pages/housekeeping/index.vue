<script setup lang="ts">
/**
 * ============================================================================
 * Page: Housekeeping Dashboard (/housekeeping)
 * ============================================================================
 * Provides an overview of all room statuses for housekeeping management.
 * Features KPIs and a filterable grid of physical rooms.
 */
import { ref, computed } from 'vue'
import type { CleanStatus, Room } from '~/types'
import RoomStatusCard from '~/components/housekeeping/RoomStatusCard.vue'
import NewTaskModal from '~/components/housekeeping/NewTaskModal.vue'
import RoomDetailsDrawer from '~/components/housekeeping/RoomDetailsDrawer.vue'
import { UButton, UBadge, UIcon } from '#components'

definePageMeta({
    title: 'Housekeeping',
    layout: 'dashboard',
    isTable: true,
})

const roomsStore = useRoomsStore()

const isDrawerOpen = ref(false)
const selectedRoom = ref<Room | null>(null)

const openRoomDetails = (room: Room) => {
    selectedRoom.value = room
    isDrawerOpen.value = true
}

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

// ============================================================================
// Kanban Logic
// ============================================================================
const viewMode = ref<'grid' | 'kanban'>('grid')

const kanbanColumns = [
    { id: 'Dirty', title: 'Dirty', color: 'error', icon: 'i-lucide-trash-2' },
    { id: 'Pickup', title: 'Pickup', color: 'warning', icon: 'i-lucide-brush-cleaning' },
    { id: 'Clean', title: 'Clean', color: 'primary', icon: 'i-lucide-sparkles' },
    { id: 'Inspected', title: 'Inspected', color: 'success', icon: 'i-lucide-check-circle' },
    { id: 'Maintenance', title: 'Maintenance', color: 'error', icon: 'i-lucide-wrench' }
]

const isDragging = ref(false)
const dragging = ref<{ roomId: number; fromColumnId: string } | null>(null)
const dragOver = ref<{ columnId: string; roomId: number | null } | null>(null)

const isDraggingCard = (id: number) => dragging.value?.roomId === id
const isColumnOver = (columnId: string) => dragOver.value?.columnId === columnId
const isCardOver = (id: number) => dragOver.value?.roomId === id

const onCardDragStart = (e: DragEvent, roomId: number, columnId: string) => {
    isDragging.value = true
    dragging.value = { roomId, fromColumnId: columnId }
    if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move'
    }
}

const onCardDragOver = (roomId: number, columnId: string) => {
    if (!dragging.value) return
    if (dragOver.value?.roomId === roomId && dragOver.value?.columnId === columnId) return
    dragOver.value = { columnId, roomId }
}

const onColumnDragOver = (columnId: string) => {
    if (!dragging.value) return
    if (dragOver.value?.columnId === columnId && dragOver.value?.roomId === null) return
    dragOver.value = { columnId, roomId: null }
}

const moveRoom = (roomId: number, toColumnId: string) => {
    const room = roomsStore.rooms.find(r => r.id === roomId)
    if (room) {
        if (toColumnId === 'Maintenance') {
            const updates: Partial<Room> = { condition: 'Maintenance' }
            if (room.cleanStatus === 'Clean' || room.cleanStatus === 'Inspected') {
                updates.cleanStatus = 'Pickup'
            }
            roomsStore.updateRoom(roomId, updates)
        } else {
            roomsStore.updateRoom(roomId, { cleanStatus: toColumnId as CleanStatus, condition: 'Normal' })
        }
    }
}

const onDrop = (toColumnId: string) => {
    if (!dragging.value) return
    const { roomId } = dragging.value
    moveRoom(roomId, toColumnId)
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
        let cards = roomsStore.rooms
        if (col.id === 'Maintenance') {
            cards = cards.filter(r => r.condition === 'Maintenance')
        } else {
            cards = cards.filter(r => r.cleanStatus === col.id && r.condition !== 'Maintenance')
        }
        
        // Sort naturally
        cards = cards.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }))

        return {
            ...col,
            cards
        }
    })
})

const authStore = useDemoAuth()
const isAuthorized = computed(() => ['Administrator', 'Housekeeping'].includes(authStore.currentRole.value ?? ''))

const isNewTaskModalOpen = ref(false)
</script>

<template>
    <AuthGate v-if="!isAuthorized" title="Access Denied" description="You must be Housekeeping staff or an Administrator to access the Room Status Board." icon="i-lucide-lock" />

    <template v-else>
        <UPageCard title="Housekeeping"
            description="Room Status Board"
            variant="naked" orientation="horizontal" class="rounded-none p-4 sm:p-6">
        </UPageCard>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 sm:px-6">
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
        <USeparator class="mt-4 sm:mt-6" />
        
        <!-- Controls -->
        <div class="p-4 sm:px-6 flex justify-between items-center border-b border-default shrink-0">
            <h2 class="text-lg font-semibold flex items-center gap-2">
                <UIcon name="i-lucide-door-open" class="text-primary" />
                Live Inventory ({{ filteredRooms.length }})
            </h2>
            <div class="flex gap-4 items-center">
                <div v-if="viewMode === 'grid'" class="flex items-center">
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
                <UTabs :items="[{ icon: 'i-lucide-kanban', value: 'kanban' }, { icon: 'i-lucide-grid-3x3', value: 'grid' }]"
                    v-model="viewMode" :content="false" size="xs" />
            </div>
        </div>

        <!-- Kanban View -->
        <template v-if="viewMode === 'kanban'">
            <div class="flex-1 min-h-0 flex flex-col bg-neutral-50 dark:bg-neutral-900/30">
                <div class="flex-1 flex gap-4 overflow-x-auto scrollbar p-4 sm:p-6">
                    <div v-for="column in displayColumns" :key="column.id" class="flex flex-col w-80 shrink-0 gap-2">
                        <!-- Column header -->
                        <div class="flex items-center gap-2 p-2 rounded-xl shrink-0">
                            <UChip :color="column.color as any" size="2xl" standalone inset />
                            <UIcon :name="column.icon" class="size-4 text-muted shrink-0" />
                            <span class="text-sm font-semibold truncate">{{ column.title }}</span>
                            <UBadge :label="String(column.cards.length)" variant="soft" color="neutral" class="ml-auto shrink-0 font-mono" />
                        </div>

                        <!-- Drop zone -->
                        <div class="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar rounded-xl p-2 transition-all duration-150"
                            :class="isColumnOver(column.id) ? 'bg-primary/5 ring-2 ring-primary/30 ring-dashed' : 'bg-elevated/40'" 
                            @dragover.prevent="onColumnDragOver(column.id)"
                            @drop.prevent="onDrop(column.id)" 
                            @dragend="onDragEnd">
                            
                            <template v-for="room in column.cards" :key="room.id">
                                <div class="relative">
                                    <div v-if="isCardOver(room.id)" class="absolute -top-[5px] left-1 right-1 h-0.5 rounded-full bg-primary z-10 pointer-events-none" />
                                    
                                    <div 
                                        class="group transition-all select-none shrink-0 cursor-pointer active:cursor-default"
                                        :class="[isDraggingCard(room.id) && 'opacity-40 scale-95']" 
                                        draggable="true"
                                        @dragstart="onCardDragStart($event, room.id, column.id)"
                                        @dragover.prevent.stop="onCardDragOver(room.id, column.id)"
                                        @drop.prevent.stop="onDrop(column.id)" 
                                        @dragend="onDragEnd"
                                        @click="openRoomDetails(room)"
                                    >
                                        <RoomStatusCard :room="room" />
                                    </div>
                                </div>
                            </template>
                            
                            <Empty v-if="column.cards.length === 0" 
                                title="No rooms" 
                                description="Drop a room here" 
                                icon="i-lucide-inbox"
                                class="flex-1 py-4 bg-transparent border-0" 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <!-- Room Grid -->
        <template v-else>
            <div class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar">
                <div v-if="filteredRooms.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 p-4 sm:p-6">
                    <RoomStatusCard 
                        v-for="room in filteredRooms" 
                        :key="room.id" 
                        :room="room" 
                        @click="openRoomDetails(room)"
                    />
                </div>
                
                <div v-else class="flex flex-col items-center justify-center py-20 border-2 border-dashed border-default rounded-xl m-4 sm:m-6">
                    <UIcon name="i-lucide-search-x" class="size-12 text-neutral-300 mb-4" />
                    <h3 class="text-lg font-semibold">No rooms match this filter</h3>
                    <p class="text-muted text-sm mt-1">Try selecting a different status filter.</p>
                    <UButton label="Clear Filters" variant="soft" color="neutral" class="mt-4" @click="currentFilter = 'All'" />
                </div>
            </div>
        </template>

        <RoomDetailsDrawer 
            v-model:open="isDrawerOpen" 
            :room="selectedRoom" 
            @new-task="isNewTaskModalOpen = true" 
        />

        <NewTaskModal v-model="isNewTaskModalOpen" :preselected-room-id="selectedRoom?.id" />
    </template>
</template>
