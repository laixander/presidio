<script setup lang="ts">
/**
 * ============================================================================
 * Page: Check-Out Flow (/frontdesk/checkout)
 * ============================================================================
 * Handles the departure logic for a guest.
 * Enforces a strict business rule: A guest CANNOT be checked out if their 
 * billing folio has an outstanding balance.
 */
import { ref, computed, onMounted } from 'vue'

definePageMeta({
    title: 'Check-Out Guest',
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
const room = computed(() => reservation.value?.roomId ? roomsStore.rooms.find(r => r.id === reservation.value?.roomId) : undefined)

// Find the associated folio
const folio = computed(() => foliosStore.folios.find(f => f.reservationId === resId.value))
const charges = computed(() => folio.value ? foliosStore.getChargesForFolio(folio.value.id) : [])
const payments = computed(() => folio.value ? foliosStore.getPaymentsForFolio(folio.value.id) : [])

onMounted(() => {
    if (!reservation.value || reservation.value.status !== 'In-House') {
        toast.error('Invalid Check-Out', 'This reservation is not currently in-house.')
        router.push('/frontdesk')
        return
    }
})

const formatCurrency = (amount: number) => `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`

const canCheckout = computed(() => {
    return folio.value && folio.value.balance === 0
})

const confirmCheckOut = () => {
    if (!reservation.value || !guest.value || !folio.value || !room.value) return
    
    if (folio.value.balance !== 0) {
        toast.error('Balance Outstanding', 'Folio balance must be zero before checking out.')
        return
    }
    
    // ========================================================================
    // Orchestrated State Updates
    // ========================================================================
    
    // 1. Update reservation status
    reservationsStore.updateReservation(reservation.value.id, {
        status: 'Done'
    })
    
    // 2. Settle Folio
    foliosStore.settleFolio(folio.value.id)
    
    // 3. Update room status to Vacant & Dirty (alerts housekeeping)
    roomsStore.updateRoom(room.value.id, {
        occupancyStatus: 'Vacant',
        cleanStatus: 'Dirty'
    })
    
    logger.addLog(`Checked out ${guestsStore.getFullName(guest.value)} from Room ${room.value.number}`, 'Checked Out', 'success')
    toast.success('Check-Out Successful', `${guestsStore.getFullName(guest.value)} has been checked out. Room ${room.value.number} marked as dirty.`)
    
    router.push('/frontdesk')
}
</script>

<template>
    <div class="max-w-4xl mx-auto py-6 px-4 sm:px-6">
        <div class="mb-6 flex items-center gap-4">
            <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" @click="router.back()" />
            <div>
                <h1 class="text-2xl font-bold">Check-Out Guest</h1>
                <p class="text-muted" v-if="reservation">Booking {{ reservation.bookingRef }}</p>
            </div>
        </div>

        <div v-if="reservation && guest && folio" class="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <!-- Left Column: Details -->
            <div class="md:col-span-2 space-y-6">
                
                <!-- Guest & Room Info -->
                <UCard>
                    <div class="flex justify-between items-start">
                        <div class="flex items-start gap-4">
                            <GuestAvatar :guest="guest" size="lg" />
                            <div>
                                <div class="text-xl font-bold">{{ guestsStore.getFullName(guest) }}</div>
                                <div class="text-sm text-muted mt-1">
                                    Check-In: {{ reservation.checkInDate }} <br />
                                    Check-Out: {{ reservation.checkOutDate }}
                                </div>
                            </div>
                        </div>
                        
                        <div class="text-right">
                            <div class="text-sm text-muted uppercase tracking-wider font-semibold mb-1">Room</div>
                            <div class="text-3xl font-black text-primary">{{ room?.number || '?' }}</div>
                        </div>
                    </div>
                </UCard>
                
                <!-- Folio Summary (View only) -->
                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="font-semibold text-lg flex items-center gap-2">
                                <UIcon name="i-lucide-receipt" class="text-primary" />
                                Folio {{ folio.folioNumber }}
                            </h3>
                            <UBadge :color="folio.balance === 0 ? 'success' : 'error'" variant="subtle">
                                Balance: {{ formatCurrency(folio.balance) }}
                            </UBadge>
                        </div>
                    </template>
                    
                    <div class="space-y-6">
                        <!-- Charges -->
                        <div>
                            <h4 class="text-sm font-semibold text-muted mb-3 uppercase">Charges</h4>
                            <div v-if="charges.length > 0" class="space-y-2">
                                <div v-for="c in charges" :key="c.id" class="flex justify-between text-sm py-1 border-b border-default border-dashed">
                                    <span>{{ c.description }} (x{{ c.quantity }})</span>
                                    <span>{{ formatCurrency(c.total) }}</span>
                                </div>
                                <div class="flex justify-between text-sm font-bold pt-2">
                                    <span>Total Charges</span>
                                    <span>{{ formatCurrency(charges.reduce((sum, c) => sum + c.total, 0)) }}</span>
                                </div>
                            </div>
                            <div v-else class="text-sm text-muted italic">No charges posted.</div>
                        </div>
                        
                        <!-- Payments -->
                        <div>
                            <h4 class="text-sm font-semibold text-muted mb-3 uppercase">Payments</h4>
                            <div v-if="payments.length > 0" class="space-y-2">
                                <div v-for="p in payments" :key="p.id" class="flex justify-between text-sm py-1 border-b border-default border-dashed text-success-600">
                                    <span>Payment - {{ p.method }}</span>
                                    <span>-{{ formatCurrency(p.amount) }}</span>
                                </div>
                                <div class="flex justify-between text-sm font-bold pt-2 text-success-600">
                                    <span>Total Paid</span>
                                    <span>-{{ formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0)) }}</span>
                                </div>
                            </div>
                            <div v-else class="text-sm text-muted italic">No payments applied.</div>
                        </div>
                    </div>
                </UCard>
            </div>
            
            <!-- Right Column: Action -->
            <div class="space-y-6">
                <UCard class="border-2" :class="canCheckout ? 'border-success-200 dark:border-success-800 bg-success-50 dark:bg-success-950/20' : 'border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-950/20'">
                    
                    <div class="text-center mb-6">
                        <UIcon :name="canCheckout ? 'i-lucide-check-circle-2' : 'i-lucide-alert-circle'" class="size-16 mb-2" :class="canCheckout ? 'text-success-500' : 'text-error-500'" />
                        <h3 class="font-bold text-lg" :class="canCheckout ? 'text-success-900 dark:text-success-100' : 'text-error-900 dark:text-error-100'">
                            {{ canCheckout ? 'Ready for Check-Out' : 'Outstanding Balance' }}
                        </h3>
                    </div>
                    
                    <div v-if="!canCheckout" class="text-sm text-center text-error-700 dark:text-error-300 mb-6">
                        Guest has an outstanding balance of <strong>{{ formatCurrency(folio.balance) }}</strong>. <br/><br/>
                        Please route to the Billing module to settle the folio before proceeding.
                    </div>
                    
                    <div v-else class="text-sm text-center text-success-700 dark:text-success-300 mb-6">
                        Zero balance confirmed. Room will be marked as vacant and dirty for housekeeping.
                    </div>
                    
                    <UButton 
                        v-if="!canCheckout"
                        label="Go to Billing Module" 
                        color="error" 
                        variant="soft"
                        size="lg" 
                        block 
                        icon="i-lucide-external-link"
                        @click="router.push('/billing')"
                    />
                    
                    <UButton 
                        v-else
                        label="Confirm Check-Out" 
                        color="success" 
                        size="xl" 
                        block 
                        icon="i-lucide-log-out"
                        @click="confirmCheckOut"
                    />
                </UCard>
            </div>
            
        </div>
        
        <div v-else class="py-12 text-center">
            <UIcon name="i-lucide-loader-2" class="size-8 animate-spin mx-auto text-primary" />
            <p class="mt-4 text-muted">Loading reservation data...</p>
        </div>
    </div>
</template>
