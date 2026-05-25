<script setup lang="ts">
/**
 * ============================================================================
 * Page: Folio Detail (/billing/folios/[id])
 * ============================================================================
 * Detailed view for a specific guest folio. Displays itemized charges and
 * applied payments. Allows the cashier to post new charges, apply payments,
 * and settle the folio to a zero balance.
 */
import { ref, computed } from 'vue'
import { h } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { UBadge } from '#components'

import type { Charge, Payment } from '~/types'
import StatusBadge from '~/components/StatusBadge.vue'
import GuestAvatar from '~/components/GuestAvatar.vue'
import ChargeModal from '~/components/ChargeModal.vue'
import PaymentModal from '~/components/PaymentModal.vue'

definePageMeta({
    title: 'Folio Details',
    layout: 'dashboard'
})

const route = useRoute()
const router = useRouter()
const foliosStore = useFoliosStore()
const guestsStore = useGuestsStore()
const reservationsStore = useReservationsStore()
const toast = useAppToast()
const logger = useLogger('billing')

const folioId = computed(() => parseInt(route.params.id as string, 10))
const folio = computed(() => foliosStore.getById(folioId.value))

// Safely resolve relations
const reservation = computed(() => folio.value ? reservationsStore.getById(folio.value.reservationId) : undefined)
const guest = computed(() => reservation.value ? guestsStore.getById(reservation.value.guestId) : undefined)

// Collections
const charges = computed(() => foliosStore.getChargesForFolio(folioId.value))
const payments = computed(() => foliosStore.getPaymentsForFolio(folioId.value))
const totalCharges = computed(() => charges.value.reduce((s, c) => s + c.total, 0))
const totalPayments = computed(() => payments.value.reduce((s, p) => s + p.amount, 0))

const formatCurrency = (amount: number) => `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
}

// ============================================================================
// Modals State & Handlers
// ============================================================================
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

const handleSettleFolio = () => {
    if (!folio.value) return
    if (folio.value.balance > 0) {
        toast.error('Outstanding Balance', 'Cannot settle a folio with an outstanding balance.')
        return
    }
    
    foliosStore.settleFolio(folio.value.id)
    logger.addLog(`Settled Folio #${folio.value.folioNumber}`, 'Settlement', 'success')
    toast.success('Folio Settled', `Folio ${folio.value.folioNumber} has been closed.`)
}

// ============================================================================
// Table Configurations
// ============================================================================
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
</script>

<template>
    <div v-if="folio" class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div class="flex items-center gap-4">
                <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" @click="router.push('/billing')" />
                <div>
                    <div class="flex items-center gap-3">
                        <h1 class="text-2xl font-bold">Folio {{ folio.folioNumber }}</h1>
                        <StatusBadge :status="folio.status" />
                    </div>
                    <div v-if="guest && reservation" class="text-muted mt-1 text-sm flex items-center gap-2">
                        <GuestAvatar :guest="guest" size="sm" />
                        <span>{{ guest.firstName }} {{ guest.lastName }}</span>
                        <span class="text-neutral-300 mx-1">•</span>
                        <span>Ref: {{ reservation.bookingRef }}</span>
                    </div>
                </div>
            </div>
            
            <div class="flex items-center gap-4">
                <div class="text-right">
                    <div class="text-sm text-muted uppercase tracking-wider font-semibold">Balance Due</div>
                    <div class="text-3xl font-bold font-mono" :class="folio.balance > 0 ? 'text-error-600 dark:text-error-400' : 'text-success-600 dark:text-success-400'">
                        {{ formatCurrency(folio.balance) }}
                    </div>
                </div>
            </div>
        </div>

        <ClientOnly>
            <Teleport to="#header-actions-teleport">
                <UButton 
                    v-if="folio.status === 'Open'"
                    label="Post Charge" 
                    icon="i-lucide-plus" 
                    color="primary" variant="soft"
                    @click="showChargeModal = true" 
                />
                <UButton 
                    v-if="folio.status === 'Open'"
                    label="Apply Payment" 
                    icon="i-lucide-banknote" 
                    color="primary" variant="soft"
                    @click="showPaymentModal = true" 
                />
                <UButton 
                    v-if="folio.status === 'Open'"
                    label="Settle Folio" 
                    icon="i-lucide-check-circle" 
                    color="primary" 
                    :disabled="folio.balance > 0"
                    @click="handleSettleFolio" 
                />
                <UButton 
                    v-if="folio.status === 'Settled' || folio.status === 'Closed'"
                    label="Print Invoice" 
                    icon="i-lucide-printer" 
                    color="neutral" 
                    variant="outline"
                />
            </Teleport>
        </ClientOnly>
        
        <!-- Split View: Charges & Payments -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <!-- Charges Table -->
            <UCard variant="subtle" :ui="{ body: 'p-0 sm:p-0' }" class="shadow-sm">
                <template #header>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2 font-semibold">
                            <UIcon name="i-lucide-receipt-text" class="text-primary size-5" />
                            Posted Charges
                        </div>
                        <UBadge variant="soft" color="neutral">{{ charges.length }}</UBadge>
                    </div>
                </template>
                <UTable :columns="chargeColumns" :data="charges">
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
            <UCard variant="subtle" :ui="{ root: 'flex flex-col flex-1 min-h-0', body: 'p-0 sm:p-0 flex-1' }" class="shadow-sm">
                <template #header>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2 font-semibold">
                            <UIcon name="i-lucide-wallet" class="text-success size-5" />
                            Applied Payments
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
                        Total Payments: <span class="font-mono ml-2" :class="totalPayments > 0 ? 'text-success-600 dark:text-success-400' : ''">{{ totalPayments > 0 ? '- ' : '' }}{{ formatCurrency(totalPayments) }}</span>
                    </div>
                </template>
            </UCard>
        </div>

        <ChargeModal 
            v-model:open="showChargeModal" 
            :folioId="folio.id"
            @submit="handlePostCharge" 
        />
        
        <PaymentModal 
            v-model:open="showPaymentModal" 
            :folioId="folio.id"
            :balanceDue="folio.balance"
            @submit="handleApplyPayment" 
        />
    </div>
    <div v-else class="flex flex-col items-center justify-center py-20">
        <UIcon name="i-lucide-file-question" class="size-16 text-neutral-300 mb-4" />
        <h2 class="text-xl font-bold">Folio Not Found</h2>
        <p class="text-muted mt-2 mb-6">The requested folio could not be found or has been deleted.</p>
        <UButton label="Return to Billing" color="primary" @click="router.push('/billing')" />
    </div>
</template>
