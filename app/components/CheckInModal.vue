<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import StatusBadge from '~/components/StatusBadge.vue'
import GuestAvatar from '~/components/GuestAvatar.vue'

const props = defineProps<{
    reservationId?: number
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const reservationsStore = useReservationsStore()
const guestsStore = useGuestsStore()
const roomsStore = useRoomsStore()
const foliosStore = useFoliosStore()
const toast = useAppToast()
const logger = useLogger('frontdesk')

const reservation = computed(() => props.reservationId ? reservationsStore.getById(props.reservationId) : undefined)
const guest = computed(() => {
    if (!reservation.value) return undefined
    const primaryGuestId = reservationsStore.getPrimaryGuestId(reservation.value)
    return primaryGuestId ? guestsStore.getById(primaryGuestId) : undefined
})
const roomType = computed(() => reservation.value ? roomsStore.roomTypes.find(rt => rt.id === reservation.value?.roomTypeId) : undefined)

const selectedRoomId = ref<number | undefined>(undefined)

const availableRooms = computed(() => {
    if (!reservation.value) return []
    return roomsStore.availableRooms.filter(r => r.roomTypeId === reservation.value?.roomTypeId)
})

const roomOptions = computed(() =>
    availableRooms.value.map(r => ({
        label: `Room ${r.number}`,
        value: r.id
    }))
)

watch(isOpen, (newVal) => {
    if (newVal) {
        if (!reservation.value || !['Pending', 'Confirmed'].includes(reservation.value.status)) {
            toast.error('Invalid Check-In', 'This reservation cannot be checked in.')
            isOpen.value = false
            return
        }
        selectedRoomId.value = reservation.value.roomId || undefined
    } else {
        selectedRoomId.value = undefined
    }
})

const emit = defineEmits(['success'])

const confirmCheckIn = () => {
    if (!reservation.value || !guest.value) return

    if (!selectedRoomId.value) {
        toast.error('Room Required', 'Please assign a room before checking in.')
        return
    }

    reservationsStore.updateReservation(reservation.value.id, {
        roomId: selectedRoomId.value,
        status: 'In-House'
    })

    roomsStore.updateRoom(selectedRoomId.value, {
        occupancyStatus: 'Occupied'
    })

    const newFolio = foliosStore.addFolio({
        guestId: guest.value.id,
        reservationId: reservation.value.id,
        status: 'Open',
        balance: 0,
        openedAt: new Date().toISOString()
    })

    logger.addLog(`Checked in ${guestsStore.getFullName(guest.value)} to Room ${roomsStore.rooms.find(r => r.id === selectedRoomId.value)?.number}`, 'Checked In', 'success')
    toast.success('Check-In Successful', `${guestsStore.getFullName(guest.value)} has been checked into the system. Folio ${newFolio.folioNumber} created.`)

    isOpen.value = false
    emit('success')
}
</script>

<template>
    <UModal v-model:open="isOpen" :ui="{ content: 'sm:max-w-4xl' }">
        <template #header>
            <div class="flex items-center gap-4">
                <div>
                    <h1 class="text-2xl font-bold">Check-In Guest</h1>
                    <p class="text-muted" v-if="reservation">Booking {{ reservation.bookingRef }}</p>
                </div>
            </div>
        </template>
        <template #body>
            <div v-if="reservation && guest" class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Left Column: Details -->
                <div class="md:col-span-2 space-y-6">
                    <!-- Guest Info -->
                    <UCard variant="subtle">
                        <template #header>
                            <h3 class="font-semibold text-lg flex items-center gap-2">
                                <UIcon name="i-lucide-user" class="text-primary" />
                                Guest Information
                            </h3>
                        </template>
                        <div class="flex items-start gap-4">
                            <GuestAvatar :guest="guest" size="lg" />
                            <div>
                                <div class="text-xl font-bold">{{ guestsStore.getFullName(guest) }}
                                    <UBadge v-if="guest.isVip" label="VIP" color="primary" size="xs" variant="subtle" />
                                </div>
                                <div class="text-sm text-muted mt-1 space-y-1">
                                    <div v-if="guest.email" class="flex items-center gap-2">
                                        <UIcon name="i-lucide-mail" class="size-4" /> {{ guest.email }}
                                    </div>
                                    <div v-if="guest.phone" class="flex items-center gap-2">
                                        <UIcon name="i-lucide-phone" class="size-4" /> {{ guest.phone }}
                                    </div>
                                    <div v-if="guest.company" class="flex items-center gap-2">
                                        <UIcon name="i-lucide-building" class="size-4" /> {{ guest.company }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </UCard>

                    <!-- Room Assignment -->
                    <UCard variant="subtle">
                        <template #header>
                            <h3 class="font-semibold text-lg flex items-center gap-2">
                                <UIcon name="i-lucide-key" class="text-primary" />
                                Room Assignment
                            </h3>
                        </template>
                        <div class="space-y-4">
                            <div class="flex justify-between items-center p-3 rounded-md bg-white dark:bg-neutral-900 border border-default">
                                <div>
                                    <div class="text-xs text-muted font-medium uppercase tracking-wider mb-1">Requested Type</div>
                                    <div class="font-semibold">{{ roomType?.name || 'Unknown' }}</div>
                                </div>
                                <UBadge color="neutral" variant="soft">{{ availableRooms.length }} Available</UBadge>
                            </div>
                            <UFormField label="Assign physical room number" name="roomId">
                                <USelect v-model.number="selectedRoomId" :items="roomOptions"
                                    placeholder="Select a clean, vacant room..." icon="i-lucide-door-open" class="w-full"
                                    size="lg" />
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
                            <UButton label="Confirm Check-In" color="primary" size="xl" block icon="i-lucide-check-circle"
                                :disabled="!selectedRoomId" @click="confirmCheckIn" />
                            <p class="text-xs text-center mt-3 text-primary-600 dark:text-primary-400">This will assign the room and open a billing folio.</p>
                        </div>
                    </UCard>
                </div>
            </div>
            <div v-else class="py-12 text-center">
                <UIcon name="i-lucide-loader-2" class="size-8 animate-spin mx-auto text-primary" />
                <p class="mt-4 text-muted">Loading reservation data...</p>
            </div>
        </template>
    </UModal>
</template>
