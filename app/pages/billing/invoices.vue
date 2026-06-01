<script setup lang="ts">
import { computed, h } from 'vue'
import { UBadge, UButton } from '#components'
import type { TableColumn } from '@nuxt/ui'
import type { Folio } from '~/types'

definePageMeta({
    title: 'Invoices',
    layout: 'dashboard',
    isTable: true,
})

const foliosStore = useFoliosStore()
const guestsStore = useGuestsStore()
const authStore = useDemoAuth()
const toast = useAppToast()

const isAuthorized = computed(() => ['Administrator', 'Billing'].includes(authStore.currentRole.value as string))

// Filter to only closed or settled folios
const invoiceFolios = computed(() => 
    foliosStore.folios.filter(f => f.status === 'Closed' || f.status === 'Settled')
)

const columns: TableColumn<Folio>[] = [
    { 
        accessorKey: 'folioNumber', 
        header: 'Invoice #',
        cell: ({ row }) => h('span', { class: 'font-semibold' }, row.original.folioNumber)
    },
    { 
        id: 'guest', 
        header: 'Guest',
        cell: ({ row }) => h('span', { class: 'font-medium' }, getGuestName(row.original.guestId))
    },
    { 
        accessorKey: 'status', 
        header: 'Status',
        cell: ({ row }) => h(UBadge, { 
            color: row.original.status === 'Settled' ? 'success' : 'neutral',
            variant: 'subtle',
            size: 'sm'
        }, () => row.original.status)
    },
    { 
        id: 'total', 
        header: 'Total Paid',
        cell: ({ row }) => h('span', { class: 'font-medium text-neutral-900 dark:text-white' }, formatCurrency(getTotalPaid(row.original.id)))
    },
    { 
        id: 'actions', 
        header: 'Actions',
        cell: ({ row }) => h(UButton, {
            icon: 'i-lucide-download',
            color: 'neutral',
            variant: 'ghost',
            size: 'sm',
            onClick: () => downloadPdf(row.original)
        }, () => 'Download')
    }
]

const getGuestName = (guestId: number) => {
    const guest = guestsStore.getById(guestId)
    return guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown'
}

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val)
}

const getTotalPaid = (folioId: number) => {
    const payments = foliosStore.getPaymentsForFolio(folioId)
    return payments.reduce((sum, p) => sum + p.amount, 0)
}

const downloadPdf = (folio: Folio) => {
    toast.success('Invoice Generated', `Invoice ${folio.folioNumber} has been generated as a PDF.`)
}
</script>

<template>
    <AuthGate v-if="!isAuthorized" title="Access Denied" description="You must be Billing staff or an Administrator to view Invoices." icon="i-lucide-lock" />

    <template v-else>
        <UPageCard title="Invoices & History"
            description="View and download settled folios and billing history."
            variant="naked" orientation="horizontal" class="border-b border-default rounded-none p-4 sm:p-6" />

        <UTable :data="invoiceFolios" :columns="columns" :loading="foliosStore.isLoading" :ui="{ th: 'sm:px-6', td: 'sm:px-6' }" class="flex-1 overflow-y-auto scrollbar">
            <template #empty>
                <Empty 
                    :loading="foliosStore.isLoading" 
                    title="No Invoices Found"
                    description="There are no settled invoices in the system."
                    icon="i-lucide-receipt" 
                />
            </template>
        </UTable>
    </template>
</template>
