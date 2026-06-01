<script setup lang="ts">
// ============================================================================
// Page Configuration
// ============================================================================
definePageMeta({
    title: 'Dashboard',
    layout: 'dashboard'
})

// ============================================================================
// Imports
// ============================================================================
import { Doughnut, Bar } from 'vue-chartjs'

// ============================================================================
// Composables & Stores
// ============================================================================
const { palette, legendLabels, doughnutOptions, defaultOptions, doughnutDataset, barDataset } = useChart()

const roomsStore = useRoomsStore()
const authStore = useDemoAuth()

const isAuthorized = computed(() => authStore.currentRole.value === 'Administrator')
const reservationsStore = useReservationsStore()
const foliosStore = useFoliosStore()
const guestsStore = useGuestsStore()
const housekeepingStore = useHousekeepingStore()

// ============================================================================
// Computed: KPI Values
// ============================================================================

const openBalance = computed(() =>
    foliosStore.openFolios.reduce((sum, f) => sum + f.balance, 0)
)

const formatCurrency = (amount: number) =>
    `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 0 })}`

// ============================================================================
// Computed: Charts
// ============================================================================

const roomStatusData = computed(() => ({
    labels: ['Vacant Clean', 'Occupied', 'Vacant Dirty', 'Pickup', 'Maintenance'],
    datasets: [doughnutDataset({
        label: 'Room Status',
        data: [
            roomsStore.roomsByStatus.vacantClean,
            roomsStore.roomsByStatus.occupied,
            roomsStore.roomsByStatus.vacantDirty,
            roomsStore.roomsByStatus.vacantPickup,
            roomsStore.roomsByStatus.maintenance
        ]
    })]
}))

const reservationStatusData = computed(() => ({
    labels: ['Pending', 'Confirmed', 'In-House', 'Done', 'Cancelled'],
    datasets: [barDataset({
        label: 'Reservations',
        data: [
            reservationsStore.statusCounts.Pending,
            reservationsStore.statusCounts.Confirmed,
            reservationsStore.statusCounts['In-House'],
            reservationsStore.statusCounts.Done,
            reservationsStore.statusCounts.Cancelled
        ]
    })]
}))

// ============================================================================
// Computed: Quick Info Panels
// ============================================================================

const departuresList = computed(() =>
    reservationsStore.departuresToday.map(r => {
        const guest = guestsStore.getById(r.guestId)
        const room = roomsStore.rooms.find(rm => rm.id === r.roomId)
        return {
            guestName: guest ? guestsStore.getFullName(guest) : 'Unknown',
            roomNumber: room?.number ?? '—',
            bookingRef: r.bookingRef
        }
    })
)

const hkSummary = computed(() => housekeepingStore.statusCounts)
</script>

<template>
    <AuthGate v-if="!isAuthorized" title="Access Denied" description="You must be an Administrator to access the Admin Dashboard." icon="i-lucide-lock" />

    <template v-else>
    <UPageCard title="Dashboard" description="Hotel operations overview and key performance indicators."
        variant="naked" orientation="horizontal" class="rounded-none" />

    <!-- ── KPI Stat Cards ──────────────────────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
        <StatCard title="Occupancy Rate" :value="`${roomsStore.occupancyRate}%`" icon="i-lucide-building"
            :trend="`${roomsStore.roomsByStatus.occupied} of ${roomsStore.rooms.length} rooms`"
            trend-direction="flat" />
        <StatCard title="In-House Guests" :value="reservationsStore.inHouseGuests.length" icon="i-lucide-users"
            :trend="`${reservationsStore.totalBookings} total bookings`"
            trend-direction="flat" />
        <StatCard title="Arrivals Today" :value="reservationsStore.arrivalsToday.length" icon="i-lucide-log-in"
            :trend="`${reservationsStore.departuresToday.length} departures`"
            trend-direction="flat" />
        <StatCard title="Open Balance" :value="formatCurrency(openBalance)" icon="i-lucide-wallet"
            :trend="`${foliosStore.openFolios.length} open folios`"
            trend-direction="flat" />
    </div>

    <!-- ── Charts Row ──────────────────────────────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6">
        <UCard variant="subtle" class="shadow-sm">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h3 class="text-base font-semibold">Room Status</h3>
                    <p class="text-xs text-muted mt-0.5">Current room status breakdown</p>
                </div>
                <UBadge variant="soft" color="primary">Live</UBadge>
            </div>
            <div class="h-[260px] w-full flex items-center justify-center">
                <Doughnut v-if="roomsStore.rooms.length > 0" :data="roomStatusData" :options="doughnutOptions" />
                <p v-else class="text-sm text-muted">No room data. Deploy demo data to see chart.</p>
            </div>
        </UCard>

        <UCard variant="subtle" class="shadow-sm">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h3 class="text-base font-semibold">Reservations by Status</h3>
                    <p class="text-xs text-muted mt-0.5">Current booking status distribution</p>
                </div>
                <UBadge variant="soft" color="primary">Live</UBadge>
            </div>
            <div class="h-[260px] w-full">
                <Bar v-if="reservationsStore.reservations.length > 0" :data="reservationStatusData" :options="defaultOptions" />
                <p v-else class="text-sm text-muted flex items-center justify-center h-full">No reservation data. Deploy demo data to see chart.</p>
            </div>
        </UCard>
    </div>

    <!-- ── Quick Info Panels ───────────────────────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6">
        <!-- Today's Departures -->
        <UCard variant="subtle" class="shadow-sm">
            <div class="flex items-center gap-2 mb-4">
                <UIcon name="i-lucide-log-out" class="size-5 text-primary" />
                <h3 class="text-base font-semibold">Today's Departures</h3>
                <UBadge variant="soft" :color="departuresList.length > 0 ? 'warning' : 'neutral'" class="ml-auto">
                    {{ departuresList.length }}
                </UBadge>
            </div>
            <div v-if="departuresList.length > 0" class="space-y-3">
                <div v-for="dep in departuresList" :key="dep.bookingRef"
                    class="flex items-center justify-between py-2 px-3 rounded-lg bg-elevated/50">
                    <div>
                        <div class="text-sm font-medium">{{ dep.guestName }}</div>
                        <div class="text-xs text-muted">{{ dep.bookingRef }}</div>
                    </div>
                    <UBadge variant="subtle" color="neutral">Room {{ dep.roomNumber }}</UBadge>
                </div>
            </div>
            <div v-else class="text-sm text-muted py-6 text-center">No departures scheduled for today.</div>
        </UCard>

        <!-- Housekeeping Summary -->
        <UCard variant="subtle" class="shadow-sm">
            <div class="flex items-center gap-2 mb-4">
                <UIcon name="i-lucide-spray-can" class="size-5 text-primary" />
                <h3 class="text-base font-semibold">Housekeeping Summary</h3>
                <UBadge variant="soft" :color="hkSummary.pending > 0 ? 'warning' : 'success'" class="ml-auto">
                    {{ housekeepingStore.tasks.length }} tasks
                </UBadge>
            </div>
            <div class="grid grid-cols-3 gap-3">
                <div class="text-center py-4 rounded-lg bg-elevated/50">
                    <div class="text-2xl font-bold text-warning-500">{{ hkSummary.pending }}</div>
                    <div class="text-xs text-muted mt-1">Pending</div>
                </div>
                <div class="text-center py-4 rounded-lg bg-elevated/50">
                    <div class="text-2xl font-bold text-primary">{{ hkSummary.inProgress }}</div>
                    <div class="text-xs text-muted mt-1">In Progress</div>
                </div>
                <div class="text-center py-4 rounded-lg bg-elevated/50">
                    <div class="text-2xl font-bold text-success-500">{{ hkSummary.completed }}</div>
                    <div class="text-xs text-muted mt-1">Completed</div>
                </div>
            </div>
        </UCard>
    </div>
    </template>
</template>