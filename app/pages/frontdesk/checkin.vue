<script setup lang="ts">
/**
 * ============================================================================
 * Page: Check-In Flow (/frontdesk/checkin)
 * ============================================================================
 * This page orchestrates the multi-step process of checking a guest into the hotel.
 * It connects 3 major stores:
 * 1. Reservations (Status change)
 * 2. Rooms (Assigning physical room & marking it Occupied)
 * 3. Folios (Generating the billing folio)
 */
import { ref, computed, onMounted } from 'vue'

definePageMeta({
    title: 'Check-In Guest',
    layout: 'dashboard'
})

const route = useRoute()
const router = useRouter()
const reservationsStore = useReservationsStore()
const guestsStore = useGuestsStore()
const roomsStore = useRoomsStore()
const foliosStore = useFoliosStore()
const toast = useAppToast()
const logger = useLogger('frontdesk')

const resId = computed(() => parseInt(route.query.id as string, 10))
const reservation = computed(() => reservationsStore.getById(resId.value))
const guest = computed(() => reservation.value ? guestsStore.getById(reservation.value.guestId) : undefined)
const roomType = computed(() => reservation.value ? roomsStore.roomTypes.find(rt => rt.id === reservation.value?.roomTypeId) : undefined)

const selectedRoomId = ref<number>(0)

// ============================================================================
// Available Room Filter
// ============================================================================
// Filters the physical room inventory to only show rooms that are:
// - Vacant
// - Clean
// - Match the requested RoomType of the reservation
const availableRooms = computed(() => {
    if (!reservation.value) return []
    // Filter rooms that are Vacant, Clean, and match the Room Type
    return roomsStore.availableRooms.filter(r => r.roomTypeId === reservation.value?.roomTypeId)
})

const roomOptions = computed(() => 
    availableRooms.value.map(r => ({
        label: `Room ${r.number}`,
        value: r.id
    }))
)

onMounted(() => {
    if (!reservation.value || !['Pending', 'Confirmed'].includes(reservation.value.status)) {
        toast.error('Invalid Check-In', 'This reservation cannot be checked in.')
        router.push('/frontdesk')
        return
    }
    
    // Auto-select room if one is already assigned
    if (reservation.value.roomId) {
        selectedRoomId.value = reservation.value.roomId
    }
})

const confirmCheckIn = () => {
    if (!reservation.value || !guest.value) return
    
    if (!selectedRoomId.value) {
        toast.error('Room Required', 'Please assign a room before checking in.')
        return
    }
    
    // ========================================================================
    // Orchestrated State Updates
    // ========================================================================
    
    // 1. Assign room to reservation & update status
    reservationsStore.updateReservation(reservation.value.id, {
        roomId: selectedRoomId.value,
        status: 'In-House'
    })
    
    // 2. Update room occupancy
    roomsStore.updateRoom(selectedRoomId.value, {
        occupancyStatus: 'Occupied'
    })
    
    // 3. Generate Folio
    const newFolio = foliosStore.addFolio({
        guestId: guest.value.id,
        reservationId: reservation.value.id,
        status: 'Open',
        balance: 0,
        openedAt: new Date().toISOString()
    })
    
    logger.addLog(`Checked in ${guestsStore.getFullName(guest.value)} to Room ${roomsStore.rooms.find(r => r.id === selectedRoomId.value)?.number}`, 'Checked In', 'success')
    toast.success('Check-In Successful', `${guestsStore.getFullName(guest.value)} has been checked into the system. Folio ${newFolio.folioNumber} created.`)
    
    router.push('/frontdesk')
}
</script>

<template>
    <div class="max-w-4xl mx-auto py-6 px-4 sm:px-6">
        <div class="mb-6 flex items-center gap-4">
            <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" @click="router.back()" />
            <div>
                <h1 class="text-2xl font-bold">Check-In Guest</h1>
                <p class="text-muted" v-if="reservation">Booking {{ reservation.bookingRef }}</p>
            </div>
        </div>

        <div v-if="reservation && guest" class="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <!-- Left Column: Details -->
            <div class="md:col-span-2 space-y-6">
                
                <!-- Guest Info -->
                <UCard>
                    <template #header>
                        <h3 class="font-semibold text-lg flex items-center gap-2">
                            <UIcon name="i-lucide-user" class="text-primary" />
                            Guest Information
                        </h3>
                    </template>
                    <div class="flex items-start gap-4">
                        <GuestAvatar :guest="guest" size="lg" />
                        <div>
                            <div class="text-xl font-bold">{{ guestsStore.getFullName(guest) }} <UBadge v-if="guest.isVip" label="VIP" color="primary" size="xs" variant="subtle" /></div>
                            <div class="text-sm text-muted mt-1 space-y-1">
                                <div v-if="guest.email" class="flex items-center gap-2"><UIcon name="i-lucide-mail" class="size-4" /> {{ guest.email }}</div>
                                <div v-if="guest.phone" class="flex items-center gap-2"><UIcon name="i-lucide-phone" class="size-4" /> {{ guest.phone }}</div>
                                <div v-if="guest.company" class="flex items-center gap-2"><UIcon name="i-lucide-building" class="size-4" /> {{ guest.company }}</div>
                            </div>
                        </div>
                    </div>
                </UCard>
                
                <!-- Room Assignment -->
                <UCard>
                    <template #header>
                        <h3 class="font-semibold text-lg flex items-center gap-2">
                            <UIcon name="i-lucide-key" class="text-primary" />
                            Room Assignment
                        </h3>
                    </template>
                    
                    <div class="space-y-4">
                        <div class="flex justify-between items-center p-3 rounded-md bg-neutral-50 dark:bg-neutral-900 border border-default">
                            <div>
                                <div class="text-xs text-muted font-medium uppercase tracking-wider mb-1">Requested Type</div>
                                <div class="font-semibold">{{ roomType?.name || 'Unknown' }}</div>
                            </div>
                            <UBadge color="neutral" variant="soft">{{ availableRooms.length }} Available</UBadge>
                        </div>
                        
                        <UFormField label="Assign physical room number" name="roomId">
                            <USelect 
                                v-model.number="selectedRoomId" 
                                :items="roomOptions" 
                                placeholder="Select a clean, vacant room..." 
                                icon="i-lucide-door-open" 
                                class="w-full" 
                                size="lg"
                            />
                        </UFormField>
                    </div>
                </UCard>
            </div>
            
            <!-- Right Column: Summary & Action -->
            <div class="space-y-6">
                <UCard class="bg-primary-50 dark:bg-primary-950/20 border-primary-200 dark:border-primary-800">
                    <h3 class="font-bold text-lg mb-4 text-primary-900 dark:text-primary-100">Stay Summary</h3>
                    
                    <div class="space-y-3 text-sm">
                        <div class="flex justify-between pb-2 border-b border-primary-200 dark:border-primary-800/50">
                            <span class="text-primary-600 dark:text-primary-400">Check-In</span>
                            <span class="font-medium">{{ reservation.checkInDate }}</span>
                        </div>
                        <div class="flex justify-between pb-2 border-b border-primary-200 dark:border-primary-800/50">
                            <span class="text-primary-600 dark:text-primary-400">Check-Out</span>
                            <span class="font-medium">{{ reservation.checkOutDate }}</span>
                        </div>
                        <div class="flex justify-between pb-2 border-b border-primary-200 dark:border-primary-800/50">
                            <span class="text-primary-600 dark:text-primary-400">Source</span>
                            <span class="font-medium">{{ reservation.source }}</span>
                        </div>
                        <div class="flex justify-between pt-2">
                            <span class="text-primary-600 dark:text-primary-400">Status</span>
                            <StatusBadge :status="reservation.status" />
                        </div>
                    </div>
                    
                    <div class="mt-8 pt-4 border-t border-primary-200 dark:border-primary-800/50">
                        <UButton 
                            label="Confirm Check-In" 
                            color="primary" 
                            size="xl" 
                            block 
                            icon="i-lucide-check-circle"
                            :disabled="!selectedRoomId"
                            @click="confirmCheckIn"
                        />
                        <p class="text-xs text-center mt-3 text-primary-600 dark:text-primary-400">This will assign the room and open a billing folio.</p>
                    </div>
                </UCard>
            </div>
            
        </div>
        
        <div v-else class="py-12 text-center">
            <UIcon name="i-lucide-loader-2" class="size-8 animate-spin mx-auto text-primary" />
            <p class="mt-4 text-muted">Loading reservation data...</p>
        </div>
    </div>
</template>
