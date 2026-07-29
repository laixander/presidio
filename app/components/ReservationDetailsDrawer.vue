<script setup lang="ts">
import { computed } from 'vue'
import type { Reservation } from '~/types'
import StatusBadge from '~/components/StatusBadge.vue'
import GuestAvatar from '~/components/GuestAvatar.vue'
import { UBadge } from '#components'

const props = defineProps<{
    reservation: Reservation | null
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const reservationsStore = useReservationsStore()
const guestsStore = useGuestsStore()
const roomsStore = useRoomsStore()
const foliosStore = useFoliosStore()
const router = useRouter()

const primaryGuestId = computed(() => props.reservation ? reservationsStore.getPrimaryGuestId(props.reservation) : undefined)
const primaryGuest = computed(() => primaryGuestId.value ? guestsStore.getById(primaryGuestId.value) : undefined)
const additionalGuests = computed(() => props.reservation?.guests.filter(g => !g.isPrimary).map(g => guestsStore.getById(g.guestId)) || [])
const roomType = computed(() => props.reservation ? roomsStore.roomTypes.find(rt => rt.id === props.reservation?.roomTypeId) : undefined)
const room = computed(() => props.reservation?.roomId ? roomsStore.rooms.find(r => r.id === props.reservation?.roomId) : undefined)
const folio = computed(() => props.reservation ? foliosStore.folios.find(f => f.reservationId === props.reservation?.id) : undefined)

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

const nights = computed(() => {
    if (!props.reservation) return 0
    const msPerDay = 1000 * 60 * 60 * 24
    return Math.max(1, Math.round((new Date(props.reservation.checkOutDate).getTime() - new Date(props.reservation.checkInDate).getTime()) / msPerDay))
})
</script>

<template>
    <UDrawer v-model:open="isOpen" direction="right" inset class="min-w-[500px]">
        <template #header>
            <div class="flex items-center justify-between w-full">
                <div>
                    <div v-if="reservation" class="text-2xl font-bold flex items-center gap-2">
                        Booking {{ reservation.bookingRef }}
                        <StatusBadge :status="reservation.status" />
                    </div>
                    <div v-else class="text-2xl font-bold flex items-center gap-2">
                        Loading...
                    </div>
                </div>
            </div>
        </template>

        <template #body v-if="reservation">
            <div class="flex flex-col gap-6 mt-2">
                <!-- Quick Actions -->
                <div v-if="reservation.status === 'Pending' || reservation.status === 'Confirmed' || reservation.status === 'In-House' || folio" class="flex flex-wrap items-center gap-3 bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl border border-default">
                    <div class="text-sm font-semibold text-muted mr-auto flex items-center gap-2">
                        <UIcon name="i-lucide-zap" class="size-4" />
                        Quick Actions
                    </div>
                    <UButton 
                        v-if="reservation.status === 'Pending' || reservation.status === 'Confirmed'"
                        label="Check-In" 
                        icon="i-lucide-log-in" 
                        color="primary"
                        @click="router.push(`/frontdesk/checkin?id=${reservation.id}`)" 
                    />
                    <UButton 
                        v-if="reservation.status === 'In-House'"
                        label="Check-Out" 
                        icon="i-lucide-log-out" 
                        color="error" 
                        variant="soft"
                        @click="router.push(`/frontdesk/checkout?id=${reservation.id}`)" 
                    />
                    <UButton 
                        v-if="folio"
                        label="Folio" 
                        icon="i-lucide-receipt-text" 
                        color="neutral" 
                        variant="soft"
                        @click="router.push(`/billing/folios/${folio.id}`)"
                    />
                </div>

                <!-- Guest Info -->
                <UCard variant="subtle" class="shadow-sm">
                    <template #header>
                        <div class="flex items-center gap-2 font-semibold">
                            <UIcon name="i-lucide-user" class="text-primary size-5" />
                            Guest Information
                        </div>
                    </template>
                    <div class="space-y-4">
                        <div v-if="primaryGuest" class="flex items-start gap-4">
                            <ULink :to="`/frontdesk/guests/${primaryGuest.id}`" class="block hover:opacity-80 transition-opacity">
                                <GuestAvatar :guest="primaryGuest" size="lg" />
                            </ULink>
                            <div class="space-y-2">
                                <div>
                                    <div class="font-bold text-lg flex items-center gap-2">
                                        {{ primaryGuest.firstName }} {{ primaryGuest.lastName }}
                                        <UBadge size="xs" variant="subtle" color="primary">Primary</UBadge>
                                    </div>
                                    <div class="text-sm text-muted">{{ primaryGuest.email }}</div>
                                    <div class="text-sm text-muted">{{ primaryGuest.phone }}</div>
                                </div>
                                <div class="flex gap-2 mt-2">
                                    <UBadge v-if="primaryGuest.isVip" color="warning" variant="subtle" icon="i-lucide-crown">VIP</UBadge>
                                    <UBadge v-if="primaryGuest.company" color="neutral" variant="subtle" icon="i-lucide-building">{{ primaryGuest.company }}</UBadge>
                                </div>
                            </div>
                        </div>
                        <div v-else class="text-muted italic flex items-center justify-center p-4">
                            Primary guest unassigned
                        </div>
                        
                        <div v-if="additionalGuests.length > 0" class="pt-4 border-t border-default space-y-2">
                            <h4 class="text-sm font-semibold text-muted">Additional Guests</h4>
                            <div class="flex flex-wrap gap-2">
                                <div v-for="g in additionalGuests" :key="g?.id" class="flex items-center gap-2 border border-default p-1.5 pr-3 rounded-full bg-white dark:bg-neutral-950">
                                    <GuestAvatar v-if="g" :guest="g" size="sm" />
                                    <span v-if="g" class="text-sm font-medium">{{ guestsStore.getFullName(g) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </UCard>

                <!-- Stay Info -->
                <UCard variant="subtle" class="shadow-sm">
                    <template #header>
                        <div class="flex items-center gap-2 font-semibold">
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
                <UCard variant="subtle" class="shadow-sm">
                    <template #header>
                        <div class="flex items-center gap-2 font-semibold">
                            <UIcon name="i-lucide-door-open" class="text-primary size-5" />
                            Accommodation
                        </div>
                    </template>
                    <div class="grid grid-cols-2 gap-6">
                        <div>
                            <div class="text-sm text-muted mb-1">Requested Room Type</div>
                            <div class="font-medium">{{ roomType?.name || 'Unknown' }}</div>
                        </div>
                        <div>
                            <div class="text-sm text-muted mb-1">Assigned Room</div>
                            <div v-if="room" class="flex items-center gap-2">
                                <span class="font-medium text-primary">{{ room.number }}</span>
                                <UBadge color="neutral" variant="soft" size="xs">{{ room.floor }}</UBadge>
                            </div>
                            <div v-else class="text-muted italic">Not assigned yet</div>
                        </div>
                    </div>
                </UCard>
            </div>
        </template>
        
        <template #body v-else>
            <div class="flex flex-col items-center justify-center py-12 text-muted">
                <UIcon name="i-lucide-calendar" class="w-12 h-12 mb-4 opacity-50" />
                <p>No reservation selected.</p>
            </div>
        </template>
    </UDrawer>
</template>
