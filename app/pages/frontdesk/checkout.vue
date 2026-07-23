<script setup lang="ts">
/**
 * ============================================================================
 * Page: Check-Out Flow Wizard (/frontdesk/checkout)
 * ============================================================================
 * Handles the departure logic for a guest in 3 steps:
 * 1. Checkout Summary
 * 2. Folio Settlement
 * 3. Invoice Generation
 */
import { ref, computed, onMounted, h } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { UBadge } from '#components'
import GuestAvatar from '~/components/GuestAvatar.vue'
import ChargeModal from '~/components/ChargeModal.vue'
import PaymentModal from '~/components/PaymentModal.vue'
import type { Charge, Payment } from '~/types'

definePageMeta({
    title: 'Check-Out Wizard',
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

const currentStep = ref(1)

const resId = computed(() => parseInt(route.query.id as string, 10))
const reservation = computed(() => reservationsStore.getById(resId.value))
const guest = computed(() => {
    if (!reservation.value) return undefined
    const primaryGuest = reservation.value.guests?.find(g => g.isPrimary) || reservation.value.guests?.[0]
    return primaryGuest ? guestsStore.getById(primaryGuest.guestId) : undefined
})
const room = computed(() => reservation.value?.roomId ? roomsStore.rooms.find(r => r.id === reservation.value?.roomId) : undefined)
const roomType = computed(() => room.value ? roomsStore.getRoomType(room.value) : undefined)

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
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
}

const canCheckout = computed(() => {
    return folio.value && Math.abs(folio.value.balance) < 0.01
})

const totalCharges = computed(() => charges.value.reduce((s, c) => s + c.total, 0))
const totalPayments = computed(() => payments.value.reduce((s, p) => s + p.amount, 0))

// Modals for Step 2
const showChargeModal = ref(false)
const showPaymentModal = ref(false)

const handlePostCharge = (data: any) => {
    foliosStore.addCharge(data)
    logger.addLog(`Posted charge: ${data.type} (${formatCurrency(data.total)}) to Folio #${folio.value?.folioNumber}`, 'Charge', 'success')
    toast.success('Charge Posted', `${data.type} has been successfully added to the folio.`)
}

const handleApplyPayment = (data: any) => {
    foliosStore.addPayment(data)
    logger.addLog(`Applied payment: ${data.method} (${formatCurrency(data.amount)}) to Folio #${folio.value?.folioNumber}`, 'Payment', 'success')
    toast.success('Payment Applied', `${formatCurrency(data.amount)} payment was successfully recorded.`)
}

const chargeColumns: TableColumn<Charge>[] = [
    {
        accessorKey: 'postedAt',
        header: 'Date',
        cell: ({ row }) => h('span', { class: 'text-sm text-muted' }, formatDate(row.original.postedAt))
    },
    {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => h('span', { class: 'font-medium text-sm' }, row.original.type)
    },
    {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => h('span', { class: 'text-sm' }, row.original.description)
    },
    {
        accessorKey: 'total',
        header: 'Amount',
        meta: { class: { th: 'text-right', td: 'text-right' } },
        cell: ({ row }) => h('span', { class: 'font-mono text-sm' }, formatCurrency(row.original.total))
    }
]

const paymentColumns: TableColumn<Payment>[] = [
    {
        accessorKey: 'paymentDate',
        header: 'Date',
        cell: ({ row }) => h('span', { class: 'text-sm text-muted' }, formatDate(row.original.paymentDate))
    },
    {
        accessorKey: 'method',
        header: 'Method',
        cell: ({ row }) => h(UBadge, { color: 'neutral', variant: 'soft' }, () => row.original.method)
    },
    {
        accessorKey: 'amount',
        header: 'Amount',
        meta: { class: { th: 'text-right', td: 'text-right' } },
        cell: ({ row }) => h('span', { class: 'font-mono text-sm text-success-600 dark:text-success-400 font-semibold' }, `- ${formatCurrency(row.original.amount)}`)
    }
]

const confirmCheckOut = () => {
    if (!reservation.value || !guest.value || !folio.value || !room.value) return

    if (Math.abs(folio.value.balance) >= 0.01) {
        toast.error('Balance Outstanding', 'Folio balance must be zero before checking out.')
        return
    }

    // Update reservation status
    reservationsStore.updateReservation(reservation.value.id, {
        status: 'Done'
    })

    // Settle Folio
    foliosStore.settleFolio(folio.value.id)

    // Update room status
    roomsStore.updateRoom(room.value.id, {
        occupancyStatus: 'Vacant',
        cleanStatus: 'Dirty'
    })

    logger.addLog(`Checked out ${guestsStore.getFullName(guest.value)} from Room ${room.value.number}`, 'Checked Out', 'success')
    toast.success('Check-Out Successful', `${guestsStore.getFullName(guest.value)} has been checked out.`)

    // Move to Invoice step
    currentStep.value = 3
}

const printInvoice = () => {
    window.print()
}

const steps = [
    { title: 'Checkout Details', description: 'Review guest information' },
    { title: 'Folio Settlement', description: 'Review and settle charges' },
    { title: 'Final Invoice', description: 'Print or send invoice' }
]
</script>

<template>
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6">
        <div class="mb-6 flex items-center gap-4">
            <UButton v-if="currentStep === 1" icon="i-lucide-arrow-left" color="neutral" variant="ghost"
                @click="router.back()" />
            <UButton v-else-if="currentStep === 2" icon="i-lucide-arrow-left" color="neutral" variant="ghost"
                @click="currentStep = 1" />
            <div>
                <h1 class="text-2xl font-bold">Check-Out Guest</h1>
                <p class="text-muted" v-if="reservation">Booking {{ reservation.bookingRef }}</p>
            </div>
        </div>

        <!-- Stepper -->
        <div class="mb-8">
            <div class="flex items-center justify-between relative">
                <div
                    class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-neutral-300 dark:bg-neutral-700 z-10 rounded-full">
                </div>
                <div class="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-500 transition-all duration-300 z-10 rounded-full"
                    :style="{ width: `${((currentStep - 1) / 2) * 100}%` }"></div>

                <div v-for="(step, index) in steps" :key="index"
                    class="flex flex-col items-center gap-2 bg-default px-4 z-10 relative">
                    <div class="size-10 rounded-full flex items-center justify-center font-bold border-2 transition-colors duration-300"
                        :class="[
                            currentStep > index + 1 ? 'bg-primary-500 border-primary-500 text-white' :
                                currentStep === index + 1 ? 'border-primary-500 text-primary-500 bg-white dark:bg-neutral-900' :
                                    'border-neutral-300 dark:border-neutral-700 text-neutral-400 bg-white dark:bg-neutral-900'
                        ]">
                        <UIcon v-if="currentStep > index + 1" name="i-lucide-check" class="size-5" />
                        <span v-else>{{ index + 1 }}</span>
                    </div>
                    <div class="text-center">
                        <div class="text-sm font-semibold"
                            :class="currentStep >= index + 1 ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'">
                            {{ step.title }}</div>
                        <div class="text-xs text-neutral-500 hidden sm:block">{{ step.description }}</div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="reservation && guest && folio">

            <!-- STEP 1: CHECKOUT SUMMARY -->
            <div v-if="currentStep === 1" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <UCard variant="subtle" class="shadow-sm">
                        <template #header>
                            <h3 class="font-semibold text-lg flex items-center gap-2">
                                <UIcon name="i-lucide-user" class="text-primary" /> Guest Details
                            </h3>
                        </template>
                        <div class="flex items-start gap-4">
                            <GuestAvatar :guest="guest" size="lg" />
                            <div>
                                <div class="text-xl font-bold">{{ guestsStore.getFullName(guest) }}</div>
                                <div class="text-sm text-muted mt-2 space-y-1">
                                    <div class="flex items-center gap-2">
                                        <UIcon name="i-lucide-phone" class="text-neutral-400" /> {{ guest.phone }}
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <UIcon name="i-lucide-mail" class="text-neutral-400" /> {{ guest.email }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </UCard>
                    <UCard variant="subtle" class="shadow-sm">
                        <template #header>
                            <div class="flex justify-between items-center">
                                <h3 class="font-semibold text-lg flex items-center gap-2">
                                    <UIcon name="i-lucide-door-closed" class="text-primary" /> Room {{ room?.number }}
                                </h3>
                                <UBadge color="primary" variant="subtle">{{ roomType?.name }}</UBadge>
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
                                    <div class="text-sm text-muted mb-1">Guests</div>
                                    <div class="font-medium">{{ reservation.guests.length }} Guests</div>
                                </div>
                                <div>
                                    <div class="text-sm text-muted mb-1">Folio Balance</div>
                                    <div class="font-medium"
                                        :class="folio.balance > 0 ? 'text-error-600' : 'text-success-600'">
                                        {{ formatCurrency(folio.balance) }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </UCard>
                </div>
                <div class="flex justify-end mt-8">
                    <UButton label="Next: Review Folio" icon="i-lucide-arrow-right" trailing color="primary" size="lg"
                        @click="currentStep = 2" />
                </div>
            </div>

            <!-- STEP 2: FOLIO SETTLEMENT -->
            <div v-else-if="currentStep === 2" class="space-y-6">
                <!-- Header -->

                <UCard variant="subtle" class="shadow-sm"
                    :ui="{ body: 'flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:p-4' }">
                    <div>
                        <div class="flex items-center gap-3">
                            <h2 class="text-xl font-bold">Folio {{ folio.folioNumber }}</h2>
                            <UBadge :color="folio.balance === 0 ? 'success' : 'warning'" variant="soft">
                                {{ folio.balance === 0 ? 'Ready to Check-out' : 'Balance Outstanding' }}
                            </UBadge>
                        </div>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="text-right">
                            <div class="text-sm text-muted uppercase tracking-wider font-semibold">Balance Due</div>
                            <div class="text-3xl font-bold font-mono"
                                :class="folio.balance > 0 ? 'text-error-600 dark:text-error-400' : 'text-success-600 dark:text-success-400'">
                                {{ formatCurrency(folio.balance) }}
                            </div>
                        </div>
                    </div>
                </UCard>

                <div class="flex gap-4 justify-end">
                    <UButton label="Post Charge" icon="i-lucide-plus" variant="soft" @click="showChargeModal = true" />
                    <UButton label="Apply Payment" icon="i-lucide-banknote" variant="soft"
                        @click="showPaymentModal = true" />
                </div>

                <!-- Split View: Charges & Payments -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Charges Table -->
                    <UCard variant="subtle" :ui="{ body: 'p-0 sm:p-0' }" class="shadow-sm">
                        <template #header>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2 font-semibold">
                                    <UIcon name="i-lucide-receipt-text" class="text-primary size-5" /> Posted Charges
                                </div>
                                <UBadge variant="soft" color="neutral">{{ charges.length }}</UBadge>
                            </div>
                        </template>
                        <UTable :columns="chargeColumns" :data="charges" class="scrollbar">
                            <template #empty>
                                <div class="p-8 text-center text-muted text-sm flex flex-col items-center">
                                    <UIcon name="i-lucide-file-x" class="size-8 text-neutral-300 mb-2" />
                                    No charges have been posted yet.
                                </div>
                            </template>
                        </UTable>
                        <template #footer>
                            <div class="text-right font-semibold text-sm">
                                Total Charges: <span class="font-mono ml-2">{{ formatCurrency(totalCharges) }}</span>
                            </div>
                        </template>
                    </UCard>

                    <!-- Payments Table -->
                    <UCard variant="subtle" :ui="{ root: 'flex flex-col flex-1 min-h-0', body: 'p-0 sm:p-0 flex-1' }"
                        class="shadow-sm">
                        <template #header>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2 font-semibold">
                                    <UIcon name="i-lucide-wallet" class="text-success size-5" /> Applied Payments
                                </div>
                                <UBadge variant="soft" color="neutral">{{ payments.length }}</UBadge>
                            </div>
                        </template>
                        <UTable :columns="paymentColumns" :data="payments">
                            <template #empty>
                                <div class="p-8 text-center text-muted text-sm flex flex-col items-center">
                                    <UIcon name="i-lucide-credit-card" class="size-8 text-neutral-300 mb-2" />
                                    No payments have been applied yet.
                                </div>
                            </template>
                        </UTable>
                        <template #footer>
                            <div class="text-right font-semibold text-sm">
                                Total Payments: <span class="font-mono ml-2"
                                    :class="totalPayments > 0 ? 'text-success-600 dark:text-success-400' : ''">
                                    {{ totalPayments > 0 ? '- ' : '' }}{{ formatCurrency(totalPayments) }}
                                </span>
                            </div>
                        </template>
                    </UCard>
                </div>

                <div class="flex justify-between items-center mt-8 p-6 bg-white dark:bg-neutral-900 rounded-xl border-2 transition-colors duration-300 shadow-sm"
                    :class="canCheckout ? 'border-success-500' : 'border-neutral-200 dark:border-neutral-800'">
                    <div class="flex items-center gap-4">
                        <div class="size-12 rounded-full flex items-center justify-center transition-colors duration-300"
                            :class="canCheckout ? 'bg-success-100 text-success-600 dark:bg-success-900/30' : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800'">
                            <UIcon :name="canCheckout ? 'i-lucide-check' : 'i-lucide-lock'" class="size-6" />
                        </div>
                        <div>
                            <div class="font-bold text-lg"
                                :class="canCheckout ? 'text-success-700 dark:text-success-400' : 'text-neutral-500'">
                                {{ canCheckout ? 'Ready to Check-Out' : 'Action Required' }}
                            </div>
                            <div class="text-sm text-muted">
                                {{ canCheckout ?
                                    'Folio balance is zero. You may proceed.' :
                                    'Folio must be settled to a zero balance to continue.'
                                }}
                            </div>
                        </div>
                    </div>
                    <UButton label="Confirm Check-Out" icon="i-lucide-check-circle" size="xl"
                        :color="canCheckout ? 'success' : 'neutral'" :disabled="!canCheckout"
                        @click="confirmCheckOut" />
                </div>
            </div>

            <!-- STEP 3: INVOICE -->
            <div v-else-if="currentStep === 3" class="space-y-6">

                <div class="text-center py-8">
                    <div
                        class="size-20 bg-success-100 dark:bg-success-900/30 text-success-600 mx-auto rounded-full flex items-center justify-center mb-4">
                        <UIcon name="i-lucide-check-circle-2" class="size-10" />
                    </div>
                    <h2 class="text-3xl font-bold mb-2">Check-Out Complete</h2>
                    <p class="text-muted">The reservation has been completed and the room marked for housekeeping.</p>
                </div>

                <!-- Invoice Document Preview -->
                <div class="max-w-3xl mx-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm rounded-xl overflow-hidden print:shadow-none print:border-none print:w-full"
                    id="invoice-doc">
                    <div
                        class="p-8 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex justify-between items-start">
                        <div>
                            <div class="font-bold text-2xl mb-1">Presidio Hotel</div>
                            <div class="text-sm text-muted">123 Hospitality Ave, Suite 100<br />Metro City, MC
                                12345<br />frontdesk@presidio.com</div>
                        </div>
                        <div class="text-right">
                            <h3 class="text-3xl font-black text-primary-600 mb-2">INVOICE</h3>
                            <div class="text-sm"><span class="text-muted">Folio No:</span> {{ folio.folioNumber }}</div>
                            <div class="text-sm"><span class="text-muted">Date:</span> {{ new
                                Date().toLocaleDateString() }}</div>
                        </div>
                    </div>

                    <div class="p-8">
                        <div class="flex justify-between mb-8">
                            <div>
                                <div class="text-xs text-muted uppercase font-bold tracking-wider mb-2">Bill To</div>
                                <div class="font-bold text-lg">{{ guestsStore.getFullName(guest) }}</div>
                                <div class="text-sm text-muted">{{ guest.email }}<br />{{ guest.phone }}</div>
                            </div>
                            <div class="text-right">
                                <div class="text-xs text-muted uppercase font-bold tracking-wider mb-2">Stay Details
                                </div>
                                <div class="text-sm"><span class="text-muted">Room:</span> {{ room?.number }}</div>
                                <div class="text-sm"><span class="text-muted">Arrival:</span> {{ reservation.checkInDate
                                    }}</div>
                                <div class="text-sm"><span class="text-muted">Departure:</span> {{
                                    reservation.checkOutDate }}</div>
                            </div>
                        </div>

                        <div class="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden mb-8">
                            <table class="w-full text-sm">
                                <thead
                                    class="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800">
                                    <tr>
                                        <th class="text-left py-3 px-4 font-semibold text-muted uppercase text-xs">Date
                                        </th>
                                        <th class="text-left py-3 px-4 font-semibold text-muted uppercase text-xs">
                                            Description</th>
                                        <th class="text-right py-3 px-4 font-semibold text-muted uppercase text-xs">
                                            Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="c in charges" :key="'c-' + c.id"
                                        class="border-b border-neutral-100 dark:border-neutral-800/50">
                                        <td class="py-3 px-4">{{ formatDate(c.postedAt) }}</td>
                                        <td class="py-3 px-4">{{ c.description }} <span
                                                class="text-xs text-muted ml-1">({{ c.type
                                                }})</span></td>
                                        <td class="py-3 px-4 text-right font-mono">{{ formatCurrency(c.total) }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="flex justify-end">
                            <div class="w-64 space-y-3">
                                <div class="flex justify-between text-sm">
                                    <span class="text-muted">Subtotal</span>
                                    <span class="font-mono">{{ formatCurrency(totalCharges) }}</span>
                                </div>
                                <div class="flex justify-between text-sm text-success-600">
                                    <span class="text-muted">Payments Applied</span>
                                    <span class="font-mono">- {{ formatCurrency(totalPayments) }}</span>
                                </div>
                                <div
                                    class="flex justify-between font-bold text-lg pt-3 border-t border-neutral-200 dark:border-neutral-800">
                                    <span>Balance Due</span>
                                    <span class="font-mono text-success-600">{{ formatCurrency(0) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex justify-center gap-4 mt-8 print:hidden">
                    <UButton label="Print Invoice" icon="i-lucide-printer" color="neutral" variant="soft" size="lg"
                        @click="printInvoice" />
                    <UButton label="Return to Frontdesk" icon="i-lucide-home" color="primary" size="lg"
                        @click="router.push('/frontdesk')" />
                </div>
            </div>

            <ChargeModal v-model:open="showChargeModal" :folioId="folio.id" @submit="handlePostCharge" />
            <PaymentModal v-model:open="showPaymentModal" :folioId="folio.id" :balanceDue="folio.balance"
                @submit="handleApplyPayment" />

        </div>

        <div v-else class="py-12 text-center">
            <UIcon name="i-lucide-loader-2" class="size-8 animate-spin mx-auto text-primary" />
            <p class="mt-4 text-muted">Loading reservation data...</p>
        </div>
    </div>
</template>

<style>
@media print {
    body * {
        visibility: hidden;
    }

    #invoice-doc,
    #invoice-doc * {
        visibility: visible;
    }

    #invoice-doc {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
    }
}
</style>
