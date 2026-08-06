<script setup lang="ts">
import { computed, ref } from 'vue'
import { h } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { UBadge } from '#components'

import type { Folio, Charge, Payment } from '~/types'
import StatusBadge from '~/components/StatusBadge.vue'
import GuestAvatar from '~/components/GuestAvatar.vue'
import ChargeModal from '~/components/ChargeModal.vue'
import PaymentModal from '~/components/PaymentModal.vue'

const props = defineProps<{
    folio: Folio | null
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const router = useRouter()
const foliosStore = useFoliosStore()
const guestsStore = useGuestsStore()
const reservationsStore = useReservationsStore()
const toast = useAppToast()
const logger = useLogger('billing')

// Safely resolve relations
const reservation = computed(() => props.folio ? reservationsStore.getById(props.folio.reservationId) : undefined)
const guest = computed(() => props.folio ? guestsStore.getById(props.folio.guestId) : undefined)

// Collections
const charges = computed(() => props.folio ? foliosStore.getChargesForFolio(props.folio.id) : [])
const payments = computed(() => props.folio ? foliosStore.getPaymentsForFolio(props.folio.id) : [])
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
    logger.addLog(`Posted charge: ${data.type} (${formatCurrency(data.total)}) to Folio #${props.folio?.folioNumber}`, 'Charge', 'success')
    toast.success('Charge Posted', `${data.type} has been successfully added to the folio.`)
}

const handleApplyPayment = (data: any) => {
    foliosStore.addPayment(data)
    logger.addLog(`Applied payment: ${data.method} (${formatCurrency(data.amount)}) to Folio #${props.folio?.folioNumber}`, 'Payment', 'success')
    toast.success('Payment Applied', `${formatCurrency(data.amount)} payment was successfully recorded.`)
}

const handleSettleFolio = () => {
    if (!props.folio) return
    if (props.folio.balance > 0) {
        toast.error('Outstanding Balance', 'Cannot settle a folio with an outstanding balance.')
        return
    }

    foliosStore.settleFolio(props.folio.id)
    logger.addLog(`Settled Folio #${props.folio.folioNumber}`, 'Settlement', 'success')
    toast.success('Folio Settled', `Folio ${props.folio.folioNumber} has been closed.`)
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
    <UDrawer v-model:open="isOpen" direction="right" inset class="min-w-[900px]">
        <template #header>
            <div class="flex items-center justify-between w-full">
                <div v-if="folio" class="flex items-center gap-4">
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
                <div v-else class="text-2xl font-bold">
                    Loading...
                </div>
                <div v-if="folio" class="flex items-center gap-4">
                    <div class="text-right mr-4">
                        <div class="text-sm text-muted uppercase tracking-wider font-semibold">Balance Due</div>
                        <div class="text-2xl font-bold font-mono"
                            :class="folio.balance > 0 ? 'text-error-600 dark:text-error-400' : 'text-success-600 dark:text-success-400'">
                            {{ formatCurrency(folio.balance) }}
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <template #body v-if="folio">
            <div class="space-y-6">
                <!-- Actions -->
                <UCard :ui="{ body: 'sm:p-4 flex flex-col lg:flex-row gap-3' }">
                    <div class="text-sm font-semibold text-muted flex items-center gap-2 w-full shadow-sm">
                        <UIcon name="i-lucide-zap" class="size-4" />
                        Quick Actions
                    </div>
                    <div class="flex gap-2">
                        <UButton v-if="folio.status === 'Open'" label="Post Charge" icon="i-lucide-plus" variant="soft"
                        @click="showChargeModal = true" />
                        <UButton v-if="folio.status === 'Open'" label="Apply Payment" icon="i-lucide-banknote"
                            variant="soft" @click="showPaymentModal = true" />
                        <UButton v-if="folio.status === 'Open'" label="Settle Folio" icon="i-lucide-check-circle"
                            :disabled="folio.balance > 0" @click="handleSettleFolio" />
                        <UButton v-if="folio.status === 'Settled' || folio.status === 'Closed'" label="Print Invoice"
                            icon="i-lucide-printer" color="neutral" variant="soft" />
                    </div>
                </UCard>

                <!-- Split View: Charges & Payments -->
                <div class="flex flex-col gap-6">

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
                        <UTable :columns="chargeColumns" :data="charges" class="max-h-[500px] overflow-y-auto scrollbar">
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
                    <UCard variant="subtle" :ui="{ body: 'p-0 sm:p-0' }" class="shadow-sm">
                        <template #header>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2 font-semibold">
                                    <UIcon name="i-lucide-wallet" class="text-success size-5" />
                                    Applied Payments
                                </div>
                                <UBadge variant="soft" color="neutral">{{ payments.length }}</UBadge>
                            </div>
                        </template>
                        <UTable :columns="paymentColumns" :data="payments" class="max-h-[500px] overflow-y-auto scrollbar">
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
                                    :class="totalPayments > 0 ? 'text-success-600 dark:text-success-400' : ''">{{
                                    totalPayments > 0 ? '- ' : '' }}{{ formatCurrency(totalPayments) }}</span>
                            </div>
                        </template>
                    </UCard>
                </div>

                <ChargeModal v-model:open="showChargeModal" :folioId="folio.id" @submit="handlePostCharge" />

                <PaymentModal v-model:open="showPaymentModal" :folioId="folio.id" :balanceDue="folio.balance"
                    @submit="handleApplyPayment" />
            </div>
        </template>
        <template #body v-else>
            <div class="flex flex-col items-center justify-center py-12 text-muted">
                <UIcon name="i-lucide-receipt-text" class="w-12 h-12 mb-4 opacity-50" />
                <p>No folio selected.</p>
            </div>
        </template>
    </UDrawer>
</template>
