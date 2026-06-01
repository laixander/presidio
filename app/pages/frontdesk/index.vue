<script setup lang="ts">
// ============================================================================
// Page Configuration
// ============================================================================
definePageMeta({
    title: 'Front Desk',
    layout: 'dashboard',
    headerActions: [
        { label: 'Search Availability', icon: 'i-lucide-search', event: 'searchAvailability', color: 'primary' }
    ]
})

// ============================================================================
// Composables & Stores
// ============================================================================
import { h } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { UButton, UBadge } from '#components'

const roomsStore = useRoomsStore()
const reservationsStore = useReservationsStore()
const guestsStore = useGuestsStore()
const router = useRouter()
const events = useEvents()

events.on('searchAvailability', () => {
    router.push('/frontdesk/search')
})

// ============================================================================
// Computed: Quick Info Panels
// ============================================================================

const arrivalsList = computed(() => {
    return reservationsStore.arrivalsToday.map(r => {
        const guest = guestsStore.getById(r.guestId)
        const room = r.roomId ? roomsStore.rooms.find(rm => rm.id === r.roomId) : null
        return {
            id: r.id,
            guestName: guest ? guestsStore.getFullName(guest) : 'Unknown',
            roomNumber: room?.number ?? 'Unassigned',
            bookingRef: r.bookingRef,
            status: r.status
        }
    })
})

const departuresList = computed(() => {
    return reservationsStore.departuresToday.map(r => {
        const guest = guestsStore.getById(r.guestId)
        const room = r.roomId ? roomsStore.rooms.find(rm => rm.id === r.roomId) : null
        return {
            id: r.id,
            guestName: guest ? guestsStore.getFullName(guest) : 'Unknown',
            roomNumber: room?.number ?? '—',
            bookingRef: r.bookingRef,
            status: r.status
        }
    })
})

// ============================================================================
// Table Configurations
// ============================================================================

const arrivalColumns: TableColumn<typeof arrivalsList.value[0]>[] = [
    {
        accessorKey: 'guestName',
        header: 'Guest Name',
        cell: ({ row }) => h('span', { class: 'font-medium' }, row.getValue('guestName'))
    },
    {
        accessorKey: 'roomNumber',
        header: 'Room',
        cell: ({ row }) => h(UBadge, { variant: 'subtle', color: 'neutral' }, () => `Room ${row.getValue('roomNumber')}`)
    },
    {
        id: 'actions',
        meta: { class: { td: 'text-right' } },
        cell: ({ row }) => {
            const status = row.original.status
            if (status === 'In-House') return h('span', { class: 'text-xs text-success-600 font-medium' }, 'Checked In')
            
            return h(UButton, {
                label: 'Check-In',
                size: 'xs',
                color: 'primary',
                onClick: () => { router.push(`/frontdesk/checkin?id=${row.original.id}`) }
            })
        }
    }
]

const departureColumns: TableColumn<typeof departuresList.value[0]>[] = [
    {
        accessorKey: 'guestName',
        header: 'Guest Name',
        cell: ({ row }) => h('span', { class: 'font-medium' }, row.getValue('guestName'))
    },
    {
        accessorKey: 'roomNumber',
        header: 'Room',
        cell: ({ row }) => h(UBadge, { variant: 'subtle', color: 'neutral' }, () => `Room ${row.getValue('roomNumber')}`)
    },
    {
        id: 'actions',
        meta: { class: { td: 'text-right' } },
        cell: ({ row }) => {
            const status = row.original.status
            if (status === 'Done') return h('span', { class: 'text-xs text-success-600 font-medium' }, 'Checked Out')
            
            return h(UButton, {
                label: 'Check-Out',
                size: 'xs',
                color: 'error',
                variant: 'soft',
                onClick: () => { router.push(`/frontdesk/checkout?id=${row.original.id}`) }
            })
        }
    }
]

const authStore = useDemoAuth()
const isAuthorized = computed(() => ['Administrator', 'Front Desk'].includes(authStore.currentRole.value ?? ''))
</script>

<template>
    <AuthGate v-if="!isAuthorized" title="Access Denied" description="You must be Front Desk staff or an Administrator to access this module." icon="i-lucide-lock" />

    <template v-else>
        <UPageCard title="Front Desk Overview" description="Manage today's arrivals, departures, and in-house guests."
            variant="naked" orientation="horizontal" class="rounded-none" />

        <!-- ── KPI Stat Cards ──────────────────────────────────────────────── -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
            <StatCard title="In-House Guests" :value="reservationsStore.inHouseGuests.length" icon="i-lucide-users"
                :trend="`${reservationsStore.totalBookings} total bookings`"
                trend-direction="flat" />
            <StatCard title="Arrivals Today" :value="arrivalsList.length" icon="i-lucide-log-in"
                :trend="`${arrivalsList.filter(a => a.status === 'In-House').length} checked in`"
                trend-direction="flat" />
            <StatCard title="Departures Today" :value="departuresList.length" icon="i-lucide-log-out"
                :trend="`${departuresList.filter(d => d.status === 'Done').length} checked out`"
                trend-direction="flat" />
            <StatCard title="Vacant Rooms" :value="roomsStore.availableRooms.length" icon="i-lucide-door-open"
                :trend="`Out of ${roomsStore.rooms.length} total`"
                trend-direction="flat" />
        </div>

        <!-- ── Arrivals & Departures Tables ────────────────────────────────── -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6">
            
            <!-- Today's Arrivals -->
            <UCard variant="subtle" class="shadow-sm" :ui="{ body: 'p-0 sm:p-0' }">
                <template #header>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <UIcon name="i-lucide-log-in" class="size-5 text-primary" />
                            <h3 class="text-base font-semibold">Today's Arrivals</h3>
                        </div>
                        <UBadge variant="soft" :color="arrivalsList.length > 0 ? 'primary' : 'neutral'">
                            {{ arrivalsList.length }}
                        </UBadge>
                    </div>
                </template>
                
                <UTable :data="arrivalsList" :columns="arrivalColumns" class="scrollbar">
                    <template #empty>
                        <div class="text-sm text-muted py-8 text-center flex flex-col items-center gap-2">
                            <UIcon name="i-lucide-check-circle-2" class="size-8 text-neutral-300" />
                            No arrivals scheduled for today.
                        </div>
                    </template>
                </UTable>
            </UCard>

            <!-- Today's Departures -->
            <UCard variant="subtle" class="shadow-sm" :ui="{ body: 'p-0 sm:p-0' }">
                <template #header>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <UIcon name="i-lucide-log-out" class="size-5 text-primary" />
                            <h3 class="text-base font-semibold">Today's Departures</h3>
                        </div>
                        <UBadge variant="soft" :color="departuresList.length > 0 ? 'warning' : 'neutral'">
                            {{ departuresList.length }}
                        </UBadge>
                    </div>
                </template>

                <UTable :data="departuresList" :columns="departureColumns" class="scrollbar">
                    <template #empty>
                        <div class="text-sm text-muted py-8 text-center flex flex-col items-center gap-2">
                            <UIcon name="i-lucide-check-circle-2" class="size-8 text-neutral-300" />
                            No departures scheduled for today.
                        </div>
                    </template>
                </UTable>
            </UCard>
        </div>
    </template>
</template>
