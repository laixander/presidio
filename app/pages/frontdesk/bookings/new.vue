<script setup lang="ts">
/**
 * ============================================================================
 * Page: Create Reservation (/frontdesk/bookings/new)
 * ============================================================================
 * The primary form for adding a new booking into the PMS.
 * It uses Zod for strict form validation. If accessed from the Search page,
 * it will automatically pre-fill the dates and room type via query parameters.
 */
import { ref, reactive, onMounted } from 'vue'
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
    title: 'New Reservation',
    layout: 'dashboard'
})

const route = useRoute()
const router = useRouter()
const guestsStore = useGuestsStore()
const roomsStore = useRoomsStore()
const reservationsStore = useReservationsStore()
const toast = useAppToast()
const logger = useLogger('reservations')

const guestOptions = computed(() => 
    guestsStore.guests.map(g => ({
        label: `${g.firstName} ${g.lastName} ${g.email ? `(${g.email})` : ''}`,
        value: g.id
    }))
)

const roomTypeOptions = computed(() => 
    roomsStore.roomTypes.map(rt => ({
        label: rt.name,
        value: rt.id
    }))
)

const sourceOptions = ['Walk-in', 'Phone', 'OTA', 'Corporate']
const statusOptions = ['Pending', 'Confirmed']

const schema = z.object({
    guestId: z.number().min(1, 'Please select a guest'),
    checkInDate: z.string().min(1, 'Check-in date is required'),
    checkOutDate: z.string().min(1, 'Check-out date is required'),
    roomTypeId: z.number().min(1, 'Please select a room type'),
    source: z.enum(['Walk-in', 'Phone', 'OTA', 'Corporate']),
    status: z.enum(['Pending', 'Confirmed'])
})

type Schema = z.output<typeof schema>

const state = reactive({
    guestId: 0,
    checkInDate: '',
    checkOutDate: '',
    roomTypeId: 0,
    source: 'Walk-in' as const,
    status: 'Confirmed' as const
})

onMounted(() => {
    // Pre-fill from query params if coming from Search page
    if (route.query.checkIn) state.checkInDate = route.query.checkIn as string
    if (route.query.checkOut) state.checkOutDate = route.query.checkOut as string
    if (route.query.roomTypeId) state.roomTypeId = parseInt(route.query.roomTypeId as string, 10)
})

const handleSubmit = (event: FormSubmitEvent<Schema>) => {
    // We pass `roomId: null` because in real-world PMS logic, physical rooms 
    // are often not assigned until the day of arrival to allow for inventory optimization.
    const reservation = reservationsStore.addReservation({
        guestId: event.data.guestId,
        roomTypeId: event.data.roomTypeId,
        roomId: null, // Room assignment happens at Check-In
        checkInDate: event.data.checkInDate,
        checkOutDate: event.data.checkOutDate,
        status: event.data.status,
        source: event.data.source
    })
    
    logger.addLog(`Created reservation ${reservation.bookingRef} for Guest ID ${reservation.guestId}`, 'Created', 'success')
    toast.success('Reservation Created', `Booking ${reservation.bookingRef} has been successfully created.`)
    
    router.push('/frontdesk/bookings')
}
</script>

<template>
    <div class="max-w-3xl mx-auto py-6 px-4 sm:px-6">
        <div class="mb-6 flex items-center gap-4">
            <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" @click="router.back()" />
            <div>
                <h1 class="text-2xl font-bold">New Reservation</h1>
                <p class="text-muted">Create a new guest booking.</p>
            </div>
        </div>

        <UCard>
            <UForm :schema="schema" :state="state" class="space-y-6" @submit="handleSubmit">
                
                <!-- Guest Selection -->
                <div class="space-y-4">
                    <h3 class="text-lg font-medium border-b border-default pb-2">1. Guest Details</h3>
                    <UFormField label="Select Guest" name="guestId">
                        <USelect v-model.number="state.guestId" :items="guestOptions" placeholder="Search or select a guest..." class="w-full" />
                        <template #help>
                            <span class="text-xs text-muted">Guest not listed? <ULink to="/frontdesk/guests" class="text-primary font-medium">Go to Guests directory to add them.</ULink></span>
                        </template>
                    </UFormField>
                </div>

                <!-- Stay Details -->
                <div class="space-y-4 pt-4">
                    <h3 class="text-lg font-medium border-b border-default pb-2">2. Stay Details</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <UFormField label="Check-In Date" name="checkInDate">
                            <UInput v-model="state.checkInDate" type="date" icon="i-lucide-calendar-days" class="w-full" />
                        </UFormField>
                        <UFormField label="Check-Out Date" name="checkOutDate">
                            <UInput v-model="state.checkOutDate" type="date" icon="i-lucide-calendar-days" class="w-full" />
                        </UFormField>
                    </div>
                    
                    <UFormField label="Room Type" name="roomTypeId">
                        <USelect v-model.number="state.roomTypeId" :items="roomTypeOptions" placeholder="Select room type..." icon="i-lucide-bed-double" class="w-full" />
                    </UFormField>
                </div>

                <!-- Booking Meta -->
                <div class="space-y-4 pt-4">
                    <h3 class="text-lg font-medium border-b border-default pb-2">3. Booking Details</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <UFormField label="Booking Source" name="source">
                            <USelect v-model="state.source" :items="sourceOptions" icon="i-lucide-globe" class="w-full" />
                        </UFormField>
                        <UFormField label="Initial Status" name="status">
                            <USelect v-model="state.status" :items="statusOptions" icon="i-lucide-info" class="w-full" />
                        </UFormField>
                    </div>
                </div>

                <div class="pt-6 flex justify-end gap-3">
                    <UButton label="Cancel" color="neutral" variant="ghost" @click="router.push('/frontdesk/bookings')" />
                    <UButton type="submit" label="Create Reservation" color="primary" size="lg" icon="i-lucide-check" />
                </div>
            </UForm>
        </UCard>
    </div>
</template>
