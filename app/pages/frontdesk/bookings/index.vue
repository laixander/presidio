<script setup lang="ts">
/**
 * ============================================================================
 * Page: Reservations Directory (/frontdesk/bookings)
 * ============================================================================
 * This page acts as the central hub for all guest bookings. It displays a 
 * comprehensive data table of all reservations, regardless of their status.
 * It provides action menus to route users into specific operational flows 
 * like Check-In, Check-Out, or viewing details.
 */
import { h, ref, useTemplateRef } from 'vue'
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import { UButton, UDropdownMenu, UIcon } from '#components'

import type { Reservation } from '~/types'
import StatusBadge from '~/components/StatusBadge.vue'
import GuestAvatar from '~/components/GuestAvatar.vue'

definePageMeta({
    title: 'Reservations',
    layout: 'dashboard',
    isTable: true,
    headerActions: [
        { label: 'New Booking', icon: 'i-lucide-plus', event: 'newBooking', color: 'primary' }
    ]
})

const reservationsStore = useReservationsStore()
const guestsStore = useGuestsStore()
const roomsStore = useRoomsStore()
const router = useRouter()
const events = useEvents()

events.on('newBooking', () => {
    router.push('/frontdesk/bookings/new')
})

// ============================================================================
// Table Configuration
// ============================================================================
// Defines the columns for the Reservations data table.
// We use Vue's h() render function to inject custom components (like StatusBadge)
// directly into the table cells.
const columns: TableColumn<Reservation>[] = [
    {
        accessorKey: 'bookingRef',
        header: 'Booking Ref',
        cell: ({ row }) => h('span', { class: 'font-semibold' }, row.original.bookingRef)
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
        accessorKey: 'checkInDate',
        header: 'Check-In',
        cell: ({ row }) => h('span', { class: 'text-sm' }, row.original.checkInDate)
    },
    {
        accessorKey: 'checkOutDate',
        header: 'Check-Out',
        cell: ({ row }) => h('span', { class: 'text-sm' }, row.original.checkOutDate)
    },
    {
        id: 'room',
        header: 'Room',
        cell: ({ row }) => {
            const roomId = row.original.roomId
            if (!roomId) return h('span', { class: 'text-muted text-xs' }, 'Unassigned')
            const room = roomsStore.rooms.find(r => r.id === roomId)
            return room ? h('span', { class: 'font-medium' }, room.number) : h('span', { class: 'text-muted' }, '?')
        }
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
            const res = row.original
            
            // Build the contextual action menu for each reservation row
            const group: DropdownMenuItem[] = [
                {
                    label: 'View Details',
                    icon: 'i-lucide-eye',
                    onSelect: () => router.push(`/frontdesk/bookings/${res.id}`)
                }
            ]
            
            // Only show Check-In if the guest hasn't arrived yet
            if (res.status === 'Pending' || res.status === 'Confirmed') {
                group.push({
                    label: 'Check-In',
                    icon: 'i-lucide-log-in',
                    color: 'primary',
                    onSelect: () => router.push(`/frontdesk/checkin?id=${res.id}`)
                })
            }
            if (res.status === 'In-House') {
                group.push({
                    label: 'Check-Out',
                    icon: 'i-lucide-log-out',
                    color: 'error',
                    onSelect: () => router.push(`/frontdesk/checkout?id=${res.id}`)
                })
            }

            const items: DropdownMenuItem[][] = [group]

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
</script>

<template>
    <UPageCard title="Reservations"
        description="Manage all guest bookings, arrivals, and departures."
        variant="naked" orientation="horizontal" class="border-b border-default rounded-none p-4 sm:p-6">
        <div class="flex justify-end gap-2 flex-1">
            <TableGlobalFilter v-model="globalFilter" placeholder="Search bookings..." />
            <TableColumnToggle :table="table" />
        </div>
    </UPageCard>

    <UTable sticky ref="table" :data="reservationsStore.reservations" :columns="columns"
        :loading="reservationsStore.isLoading" v-model:column-visibility="columnVisibility"
        v-model:global-filter="globalFilter" :ui="{ th: 'sm:px-6', td: 'sm:px-6' }" class="flex-1 scrollbar">
        <template #empty>
            <Empty :loading="reservationsStore.isLoading" title="No reservations found"
                description="Your reservations directory is empty."
                icon="i-lucide-calendar" loading-title="Loading Reservations"
                loading-description="Please wait while we fetch the reservations.">
                <template #action>
                    <UButton label="Create Reservation" icon="i-lucide-plus" color="primary" size="lg"
                        @click="router.push('/frontdesk/bookings/new')" />
                </template>
            </Empty>
        </template>
    </UTable>
</template>
