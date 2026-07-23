<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps<{
    modelValue: boolean
    reservationId: number | null
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
}>()

const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

const reservationsStore = useReservationsStore()
const guestsStore = useGuestsStore()
const roomsStore = useRoomsStore()
const foliosStore = useFoliosStore()
const toast = useAppToast()
const logger = useLogger('frontdesk')

const reservation = computed(() => props.reservationId ? reservationsStore.getById(props.reservationId) : undefined)
const guest = computed(() => {
    if (!reservation.value) return undefined
    const primaryGuest = reservation.value.guests?.find(g => g.isPrimary) || reservation.value.guests?.[0]
    return primaryGuest ? guestsStore.getById(primaryGuest.guestId) : undefined
})
const roomType = computed(() => reservation.value ? roomsStore.roomTypes.find(rt => rt.id === reservation.value?.roomTypeId) : undefined)

const selectedRoomId = ref<number>(0)

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

watch(() => props.modelValue, (newVal) => {
    if (newVal && reservation.value) {
        if (reservation.value.roomId) {
            selectedRoomId.value = reservation.value.roomId
        } else {
            selectedRoomId.value = 0
        }
    }
})

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
    toast.success('Check-In Successful', `${guestsStore.getFullName(guest.value)} has been checked into the system.`)

    emit('success')
    isOpen.value = false
}
</script>

<template>
    <USlideover v-model:open="isOpen">
        <template #header>
            <div class="flex items-center justify-between w-full">
                <h3 class="text-base font-semibold leading-6 flex items-center gap-2">
                    <UIcon name="i-lucide-log-in" class="text-primary" /> Check-In Guest
                </h3>
                <UButton color="neutral" variant="ghost" icon="i-lucide-x" class="-my-1" @click="isOpen = false" />
            </div>
        </template>

        <template #body>
            <div v-if="reservation && guest" class="space-y-6">
                <!-- Guest Info -->
                <div class="space-y-4">
                    <h4 class="text-sm font-semibold uppercase tracking-wider text-muted">Guest</h4>
                    <div class="flex items-start gap-4">
                        <GuestAvatar :guest="guest" size="md" />
                        <div>
                            <div class="font-bold">{{ guestsStore.getFullName(guest) }}</div>
                            <div class="text-xs text-muted">{{ guest.email }}</div>
                        </div>
                    </div>
                </div>

                <USeparator />

                <!-- Room Assignment -->
                <div class="space-y-4">
                    <h4 class="text-sm font-semibold uppercase tracking-wider text-muted">Room Assignment</h4>

                    <div
                        class="flex justify-between items-center p-3 rounded-md bg-neutral-50 dark:bg-neutral-900 border border-default text-sm">
                        <div>
                            <div class="text-muted mb-1">Requested Type</div>
                            <div class="font-semibold">{{ roomType?.name || 'Unknown' }}</div>
                        </div>
                        <UBadge color="neutral" variant="soft">{{ availableRooms.length }} Available</UBadge>
                    </div>

                    <UFormField label="Select Physical Room" name="roomId">
                        <USelect v-model.number="selectedRoomId" :items="roomOptions"
                            placeholder="Select a vacant room..." icon="i-lucide-door-open" class="w-full" size="lg" />
                    </UFormField>
                </div>

                <USeparator />

                <div class="space-y-3 text-sm">
                    <h4 class="text-sm font-semibold uppercase tracking-wider text-muted">Summary</h4>
                    <div class="flex justify-between">
                        <span class="text-muted">Check-In</span>
                        <span class="font-medium">{{ reservation.checkInDate }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-muted">Check-Out</span>
                        <span class="font-medium">{{ reservation.checkOutDate }}</span>
                    </div>
                </div>
            </div>
            <div v-else class="p-6 text-center text-muted">
                <UIcon name="i-lucide-loader-2" class="size-6 animate-spin mx-auto" />
                <p class="mt-2 text-sm">Loading...</p>
            </div>
        </template>

        <template #footer>
            <div class="flex justify-end gap-3 w-full">
                <UButton label="Cancel" color="neutral" variant="ghost" @click="isOpen = false" />
                <UButton label="Confirm Check-In" color="primary" icon="i-lucide-check-circle"
                    :disabled="!selectedRoomId" @click="confirmCheckIn" />
            </div>
        </template>
    </USlideover>
</template>