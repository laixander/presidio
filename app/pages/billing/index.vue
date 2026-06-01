<script setup lang="ts">
/**
 * ============================================================================
 * Page: Billing Dashboard (/billing)
 * ============================================================================
 * The main directory for the Cashier module. Displays high-level financial 
 * KPIs and a comprehensive table of all guest folios.
 */
import { h, ref, useTemplateRef } from 'vue'
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import { UButton, UDropdownMenu } from '#components'

import type { Folio } from '~/types'
import StatusBadge from '~/components/StatusBadge.vue'
import GuestAvatar from '~/components/GuestAvatar.vue'

definePageMeta({
    title: 'Billing',
    layout: 'dashboard',
    isTable: true
})

const foliosStore = useFoliosStore()
const guestsStore = useGuestsStore()
const reservationsStore = useReservationsStore()
const router = useRouter()

const formatCurrency = (amount: number) => `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`

// ============================================================================
// Table Configuration
// ============================================================================
const columns: TableColumn<Folio>[] = [
    {
        accessorKey: 'folioNumber',
        header: 'Folio #',
        cell: ({ row }) => h('span', { class: 'font-semibold' }, row.original.folioNumber)
    },
    {
        id: 'guest',
        header: 'Guest',
        cell: ({ row }) => {
            const guest = guestsStore.getById(row.original.guestId)
            return guest ? h(GuestAvatar, { guest, size: 'sm', showDetails: true }) : h('span', { class: 'text-muted italic' }, 'Unknown')
        }
    },
    {
        id: 'reservation',
        header: 'Booking Ref',
        cell: ({ row }) => {
            const res = reservationsStore.getById(row.original.reservationId)
            return h('span', { class: 'text-sm text-muted' }, res?.bookingRef || 'N/A')
        }
    },
    {
        accessorKey: 'balance',
        header: 'Balance Due',
        cell: ({ row }) => h('span', { 
            class: ['font-bold', row.original.balance > 0 ? 'text-error-600 dark:text-error-400' : 'text-success-600 dark:text-success-400'] 
        }, formatCurrency(row.original.balance))
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => h(StatusBadge, { status: row.original.status })
    },
    {
        id: 'actions',
        meta: { class: { td: 'text-right' } },
        cell: ({ row }) => {
            const folio = row.original
            const items: DropdownMenuItem[][] = [
                [
                    {
                        label: 'View Folio Details',
                        icon: 'i-lucide-receipt',
                        onSelect: () => router.push(`/billing/folios/${folio.id}`)
                    }
                ]
            ]

            return h(UDropdownMenu, {
                items,
                content: { align: 'end' },
                size: 'sm'
            }, {
                default: () => h(UButton, {
                    icon: 'i-lucide-ellipsis-vertical',
                    color: 'neutral',
                    variant: 'ghost',
                    size: 'sm'
                })
            })
        }
    }
]

const table = useTemplateRef('table')
const globalFilter = ref('')
const columnVisibility = ref({})
const authStore = useDemoAuth()
const isAuthorized = computed(() => ['Administrator', 'Billing'].includes(authStore.currentRole.value ?? ''))
</script>

<template>
    <AuthGate v-if="!isAuthorized" title="Access Denied" description="You must be Billing staff or an Administrator to access the Billing module." icon="i-lucide-lock" />

    <template v-else>
        <!-- Dashboard Header -->
        <UPageCard title="Folios & Billing" description="Billing dashboard and folio management."
        variant="naked" orientation="horizontal" class="rounded-none p-4 sm:p-6" />

        <!-- KPIs -->
        <div class="px-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
                title="Open Folios" 
                :value="foliosStore.openFolios.length" 
                icon="i-lucide-folder-open" 
                trend="Requires settlement"
                trend-direction="flat"
            />
            <StatCard 
                title="Total Revenue" 
                :value="formatCurrency(foliosStore.totalRevenue)" 
                icon="i-lucide-trending-up" 
                trend="All charges posted"
                trend-direction="up"
            />
            <StatCard 
                title="Total Collected" 
                :value="formatCurrency(foliosStore.totalPayments)" 
                icon="i-lucide-wallet" 
                trend="Payments received"
                trend-direction="up"
            />
        </div>
        <USeparator class="mt-6" />

        <!-- Table Toolbar -->
        <div class="p-4 sm:px-6 flex justify-between items-center border-b border-default shrink-0">
            <div class="font-semibold text-lg flex items-center gap-2">
                <UIcon name="i-lucide-file-text" class="text-primary" />
                All Folios
            </div>
            <div class="flex gap-2">
                <TableGlobalFilter v-model="globalFilter" placeholder="Search folios..." />
                <TableColumnToggle :table="table" />
            </div>
        </div>

        <!-- Data Table -->
        <UTable 
            sticky 
            ref="table" 
            :data="foliosStore.folios" 
            :columns="columns"
            :loading="foliosStore.isLoading" 
            v-model:column-visibility="columnVisibility"
            v-model:global-filter="globalFilter" 
            :ui="{ th: 'sm:px-6', td: 'sm:px-6' }" 
            class="flex-1 overflow-y-auto scrollbar"
        >
            <template #empty>
                <Empty 
                    :loading="foliosStore.isLoading" 
                    title="No folios found"
                    description="There are no billing folios in the system."
                    icon="i-lucide-receipt" 
                />
            </template>
        </UTable>
    </template>
</template>
