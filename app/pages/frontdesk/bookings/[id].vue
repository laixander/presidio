<script setup lang="ts">
/**
 * ============================================================================
 * Page: Reservation Details (/frontdesk/bookings/[id])
 * ============================================================================
 * Displays the complete details of a specific guest reservation.
 * Includes guest information, stay dates, assigned room, and quick actions.
 */
import { computed } from 'vue'
import { UBadge } from '#components'
import StatusBadge from '~/components/StatusBadge.vue'
import GuestAvatar from '~/components/GuestAvatar.vue'

definePageMeta({
    title: 'Reservation Details',
    layout: 'dashboard'
})

const route = useRoute()
const router = useRouter()
const reservationsStore = useReservationsStore()
const guestsStore = useGuestsStore()
const roomsStore = useRoomsStore()
const foliosStore = useFoliosStore()

const resId = computed(() => parseInt(route.params.id as string, 10))
const reservation = computed(() => reservationsStore.getById(resId.value))

const guest = computed(() => reservation.value ? guestsStore.getById(reservation.value.guestId) : undefined)
const roomType = computed(() => reservation.value ? roomsStore.roomTypes.find(rt => rt.id === reservation.value?.roomTypeId) : undefined)
const room = computed(() => reservation.value?.roomId ? roomsStore.rooms.find(r => r.id === reservation.value?.roomId) : undefined)
const folio = computed(() => foliosStore.folios.find(f => f.reservationId === resId.value))

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

const nights = computed(() => {
    if (!reservation.value) return 0
    const msPerDay = 1000 * 60 * 60 * 24
    return Math.max(1, Math.round((new Date(reservation.value.checkOutDate).getTime() - new Date(reservation.value.checkInDate).getTime()) / msPerDay))
})
</script>

<template>
    <div v-if="reservation" class="space-y-6 max-w-4xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div class="flex items-center gap-4">
                <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" @click="router.push('/frontdesk/bookings')" />
                <div>
                    <div class="flex items-center gap-3">
                        <h1 class="text-2xl font-bold">Booking {{ reservation.bookingRef }}</h1>
                        <StatusBadge :status="reservation.status" />
                    </div>
                </div>
            </div>
        </div>

        <ClientOnly>
            <Teleport to="#header-actions-teleport">
                <UButton 
                    v-if="reservation.status === 'Pending' || reservation.status === 'Confirmed'"
                    label="Check-In Guest" 
                    icon="i-lucide-log-in" 
                    color="primary"
                    @click="router.push(`/frontdesk/checkin?id=${reservation.id}`)" 
                />
                <UButton 
                    v-if="reservation.status === 'In-House'"
                    label="Check-Out Guest" 
                    icon="i-lucide-log-out" 
                    color="error" 
                    variant="soft"
                    @click="router.push(`/frontdesk/checkout?id=${reservation.id}`)" 
                />
                <UButton 
                    v-if="folio"
                    label="View Folio" 
                    icon="i-lucide-receipt" 
                    color="neutral" 
                    variant="outline"
                    @click="router.push(`/billing/folios/${folio.id}`)"
                />
            </Teleport>
        </ClientOnly>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Guest Info -->
            <UCard class="shadow-sm">
                <template #header>
                    <div class="flex items-center gap-2 font-semibold text-lg">
                        <UIcon name="i-lucide-user" class="text-primary size-5" />
                        Guest Information
                    </div>
                </template>
                <div v-if="guest" class="flex items-start gap-4">
                    <GuestAvatar :guest="guest" size="lg" />
                    <div class="space-y-2">
                        <div>
                            <div class="font-bold text-lg">{{ guest.firstName }} {{ guest.lastName }}</div>
                            <div class="text-sm text-muted">{{ guest.email }}</div>
                            <div class="text-sm text-muted">{{ guest.phone }}</div>
                        </div>
                        <div class="flex gap-2 mt-2">
                            <UBadge v-if="guest.isVip" color="warning" variant="subtle" icon="i-lucide-crown">VIP</UBadge>
                            <UBadge v-if="guest.company" color="neutral" variant="subtle" icon="i-lucide-building">{{ guest.company }}</UBadge>
                        </div>
                    </div>
                </div>
            </UCard>

            <!-- Stay Info -->
            <UCard class="shadow-sm">
                <template #header>
                    <div class="flex items-center gap-2 font-semibold text-lg">
                        <UIcon name="i-lucide-calendar" class="text-primary size-5" />
                        Stay Details
                    </div>
                </template>
                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <div class="text-sm text-muted mb-1">Check-In</div>
                            <div class="font-medium">{{ formatDate(reservation.checkInDate) }}</div>
                        </div>
                        <div>
                            <div class="text-sm text-muted mb-1">Check-Out</div>
                            <div class="font-medium">{{ formatDate(reservation.checkOutDate) }}</div>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4 pt-4 border-t border-default">
                        <div>
                            <div class="text-sm text-muted mb-1">Duration</div>
                            <div class="font-medium">{{ nights }} Night{{ nights > 1 ? 's' : '' }}</div>
                        </div>
                        <div>
                            <div class="text-sm text-muted mb-1">Source</div>
                            <div class="font-medium">{{ reservation.source }}</div>
                        </div>
                    </div>
                </div>
            </UCard>

            <!-- Room Info -->
            <UCard class="shadow-sm md:col-span-2">
                <template #header>
                    <div class="flex items-center gap-2 font-semibold text-lg">
                        <UIcon name="i-lucide-door-open" class="text-primary size-5" />
                        Accommodation
                    </div>
                </template>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                        <div class="text-sm text-muted mb-1">Requested Room Type</div>
                        <div class="font-medium text-lg">{{ roomType?.name || 'Unknown' }}</div>
                    </div>
                    <div>
                        <div class="text-sm text-muted mb-1">Assigned Room</div>
                        <div v-if="room" class="flex items-center gap-2">
                            <span class="font-medium text-lg text-primary">{{ room.number }}</span>
                            <UBadge color="neutral" variant="soft">{{ room.floor }}</UBadge>
                        </div>
                        <div v-else class="text-muted italic">Not assigned yet</div>
                    </div>
                </div>
            </UCard>
        </div>
    </div>
    
    <div v-else class="flex flex-col items-center justify-center py-20">
        <UIcon name="i-lucide-file-question" class="size-16 text-neutral-300 mb-4" />
        <h2 class="text-xl font-bold">Reservation Not Found</h2>
        <p class="text-muted mt-2 mb-6">The requested booking could not be found or has been deleted.</p>
        <UButton label="Return to Bookings" color="primary" @click="router.push('/frontdesk/bookings')" />
    </div>
</template>
