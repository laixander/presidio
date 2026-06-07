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
    // headerActions: [
    //     { label: 'New Booking', icon: 'i-lucide-plus', event: 'newBooking', color: 'primary' }
    // ]
})

const reservationsStore = useReservationsStore()
const guestsStore = useGuestsStore()
const roomsStore = useRoomsStore()
const router = useRouter()
const events = useEvents()

const isDrawerOpen = ref(false)

events.on('newBooking', () => {
    router.push('/frontdesk/bookings/new')
})

events.on('viewReservationLogs', () => {
    isDrawerOpen.value = true
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
const authStore = useDemoAuth()
const isAuthorized = computed(() => ['Administrator', 'Front Desk'].includes(authStore.currentRole.value ?? ''))

const viewMode = ref<'list' | 'card'>('list')

const filteredReservations = computed(() => {
    if (!globalFilter.value) return reservationsStore.reservations
    const q = globalFilter.value.toLowerCase()
    return reservationsStore.reservations.filter(res => {
        const guest = guestsStore.getById(res.guestId)
        const guestName = guest ? `${guest.firstName} ${guest.lastName}`.toLowerCase() : ''
        return res.bookingRef.toLowerCase().includes(q) || guestName.includes(q)
    })
})

const getRoomNumber = (roomId: number | null | undefined) => {
    if (!roomId) return 'Unassigned'
    const room = roomsStore.rooms.find(r => r.id === roomId)
    return room ? room.number : '?'
}
</script>

<template>
    <AuthGate v-if="!isAuthorized" title="Access Denied" description="You must be Front Desk staff or an Administrator to access Reservations." icon="i-lucide-lock" />

    <template v-else>
        <UPageCard title="Reservations"
            description="Manage all guest bookings, arrivals, and departures."
            variant="naked" orientation="horizontal" class="border-b border-default rounded-none p-4 sm:p-6">
            <div class="flex justify-end gap-2 flex-1">
                <TableGlobalFilter v-model="globalFilter" placeholder="Search bookings..." />
                <TableColumnToggle v-if="viewMode === 'list'" :table="table" />
                <UTabs :items="[{ icon: 'i-lucide-grid-3x3', value: 'card' }, { icon: 'i-lucide-list', value: 'list' }]"
                    v-model="viewMode" :content="false" size="xs" />
            </div>
        </UPageCard>

        <ClientOnly>
            <Teleport to="#header-actions-teleport">
                <UButton icon="i-lucide-history" color="neutral" variant="soft" @click="events.emit('viewReservationLogs')">Recent Activity</UButton>
                <UButton icon="i-lucide-plus" color="primary" @click="events.emit('newBooking')">New Booking</UButton>
            </Teleport>
        </ClientOnly>

        <UTable v-if="viewMode === 'list'" sticky ref="table" :data="reservationsStore.reservations" :columns="columns"
            :loading="reservationsStore.isLoading" v-model:column-visibility="columnVisibility"
            v-model:global-filter="globalFilter" :ui="{ th: 'sm:px-6', td: 'sm:px-6' }" class="flex-1 scrollbar">
            <template #empty>
                <Empty :loading="reservationsStore.isLoading" title="No reservations found"
                    description="There are currently no reservations to display. Create a new reservation to get started."
                    icon="i-lucide-calendar" loading-title="Loading Reservations"
                    loading-description="Please wait while we fetch the reservations.">
                    <template #action>
                        <UButton label="Create Reservation" icon="i-lucide-plus" color="primary" size="lg"
                            @click="router.push('/frontdesk/bookings/new')" />
                    </template>
                </Empty>
            </template>
        </UTable>

        <!-- Card Grid View -->
        <div v-else class="flex-1 overflow-y-auto scrollbar p-4 sm:p-6">
            <Empty v-if="!reservationsStore.isLoading && !filteredReservations.length"
                title="No reservations found"
                description="There are currently no reservations to display. Create a new reservation to get started."
                icon="i-lucide-calendar">
                <template #action>
                    <UButton label="Create Reservation" icon="i-lucide-plus" color="primary" size="lg"
                        @click="router.push('/frontdesk/bookings/new')" />
                </template>
            </Empty>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <UCard v-for="res in filteredReservations" :key="res.id" variant="subtle"
                    class="hover:ring-2 hover:ring-primary transition-all duration-200 shadow-sm flex flex-col h-full"
                    :ui="{ body: 'flex-1', header: 'pb-2' }">
                    <template #header>
                        <div class="flex items-start justify-between">
                            <div>
                                <h3 class="text-sm font-bold font-mono tracking-wider">{{ res.bookingRef }}</h3>
                                <StatusBadge :status="res.status" class="mt-1" />
                            </div>
                            
                            <UDropdownMenu :items="[
                                [
                                    { label: 'View Details', icon: 'i-lucide-eye', onSelect: () => router.push(`/frontdesk/bookings/${res.id}`) }
                                ],
                                [
                                    ...(res.status === 'Pending' || res.status === 'Confirmed' ? [{ label: 'Check-In', icon: 'i-lucide-log-in', color: 'primary' as const, onSelect: () => router.push(`/frontdesk/checkin?id=${res.id}`) }] : []),
                                    ...(res.status === 'In-House' ? [{ label: 'Check-Out', icon: 'i-lucide-log-out', color: 'error' as const, onSelect: () => router.push(`/frontdesk/checkout?id=${res.id}`) }] : [])
                                ]
                            ]" :content="{ align: 'end' }">
                                <UButton icon="i-lucide-more-vertical" color="neutral" variant="ghost" size="sm" />
                            </UDropdownMenu>
                        </div>
                    </template>
                    
                    <div class="space-y-4">
                        <!-- Guest Info -->
                        <div class="flex items-center gap-3">
                            <GuestAvatar v-if="guestsStore.getById(res.guestId)" :guest="guestsStore.getById(res.guestId)!" size="sm" />
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-semibold truncate">{{ guestsStore.getById(res.guestId) ? guestsStore.getFullName(guestsStore.getById(res.guestId)!) : 'Unknown Guest' }}</p>
                            </div>
                        </div>

                        <div class="*:py-2 *:first:pt-0 *:last:pb-0 *:flex *:items-center *:justify-between text-sm divide-y divide-default">
                            <div>
                                <span class="text-muted">Check-In</span>
                                <span>{{ res.checkInDate }}</span>
                            </div>
                            <div>
                                <span class="text-muted">Check-Out</span>
                                <span>{{ res.checkOutDate }}</span>
                            </div>
                            <div>
                                <span class="text-muted">Room:</span>
                                <span :class="{ 'text-muted italic': !res.roomId }">
                                    {{ getRoomNumber(res.roomId) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </UCard>
            </div>
        </div>

        <!-- ================================================================ -->
        <!-- Logs Drawer                                                       -->
        <!-- ================================================================ -->
        <LogsDrawer v-model:open="isDrawerOpen" namespace="reservations" />
    </template>
</template>
