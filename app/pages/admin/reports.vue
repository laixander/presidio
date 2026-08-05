<script setup lang="ts">
import { computed, ref } from 'vue'
import { Line, Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement)

definePageMeta({
    title: 'Reports & Analytics',
    layout: 'dashboard'
})

const authStore = useDemoAuth()
const isAuthorized = computed(() => authStore.currentRole.value === 'Administrator')

const foliosStore = useFoliosStore()
const reservationsStore = useReservationsStore()
const roomsStore = useRoomsStore()
const toast = useAppToast()
const appLogger = useAppLogger()
const events = useEvents()

const isDrawerOpen = ref(false)

events.on('viewReportsLogs', () => {
    isDrawerOpen.value = true
})

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val)
}

// --- Date Range Filter ---
type DateRange = { label: string, value: number | string }
const dateRanges: DateRange[] = [
    { label: 'Last 7 Days', value: 7 },
    { label: 'Last 30 Days', value: 30 },
    { label: 'Year to Date', value: 'ytd' },
    { label: 'All Time', value: 0 }
]
const selectedDateRange = ref<DateRange>(dateRanges[0]!)

const isDateInRange = (dateStr: string) => {
    if (selectedDateRange.value.value === 0) return true
    const date = new Date(dateStr)
    const now = new Date()
    if (selectedDateRange.value.value === 'ytd') {
        return date.getFullYear() === now.getFullYear() && date <= now
    }
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays >= 0 && diffDays <= (selectedDateRange.value.value as number)
}

// --- KPIs ---
const filteredCharges = computed(() => foliosStore.charges.filter(c => c.postedAt && isDateInRange(c.postedAt)))
const filteredReservations = computed(() => reservationsStore.reservations.filter(r => isDateInRange(r.checkInDate)))

const totalRevenue = computed(() => filteredCharges.value.reduce((sum, c) => sum + c.total, 0))
const totalBookings = computed(() => filteredReservations.value.length)

const averageOccupancy = computed(() => {
    if (selectedDateRange.value.value === 0 || selectedDateRange.value.value === 'ytd') return roomsStore.occupancyRate
    const days = selectedDateRange.value.value as number
    const totalRooms = roomsStore.rooms.length
    if (totalRooms === 0) return 0
    
    let occupiedNights = 0
    filteredReservations.value.forEach(r => {
        if (r.status === 'Cancelled') return
        const checkIn = new Date(r.checkInDate).getTime()
        const checkOut = new Date(r.checkOutDate).getTime()
        const nights = Math.max(1, Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24)))
        occupiedNights += nights
    })
    
    const rate = (occupiedNights / (totalRooms * days)) * 100
    return Math.min(100, Math.round(rate))
})

const { defaultOptions, lineDataset, palette } = useChart()

// --- Revenue Trend Chart ---
const chartData = computed(() => {
    const days = typeof selectedDateRange.value.value === 'number' && selectedDateRange.value.value > 0 ? selectedDateRange.value.value : 7
    const pointsToDisplay = Math.min(days, 30) // Cap display at 30 points for readability
    
    const labels: string[] = []
    const data: number[] = Array(pointsToDisplay).fill(0)
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = pointsToDisplay - 1; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    }

    filteredCharges.value.forEach(charge => {
        if (!charge.postedAt) return
        const chargeDate = new Date(charge.postedAt)
        chargeDate.setHours(0, 0, 0, 0)
        
        const diffTime = today.getTime() - chargeDate.getTime()
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays >= 0 && diffDays < pointsToDisplay) {
            const index = (pointsToDisplay - 1) - diffDays
            data[index] = (data[index] ?? 0) + charge.total
        }
    })

    return {
        labels,
        datasets: [
            lineDataset({
                label: 'Revenue (PHP)',
                borderColor: palette.orange.solid,
                backgroundColor: palette.orange.soft,
                data
            })
        ]
    }
})

const chartOptions = computed(() => defaultOptions)

// --- Revenue Breakdown Chart ---
const revenueBreakdownData = computed(() => {
    const categories = ['Room Charge', 'Mini Bar', 'Restaurant', 'Laundry', 'Misc']
    const data = categories.map(cat => {
        return filteredCharges.value.filter(c => c.type === cat).reduce((sum, c) => sum + c.total, 0)
    })
    
    return {
        labels: categories,
        datasets: [{
            data,
            backgroundColor: [palette.blue.solid, palette.orange.solid, palette.green.solid, palette.violet.solid, palette.teal.solid],
            hoverOffset: 4,
            borderWidth: 0
        }]
    }
})

const doughnutOptions = computed(() => ({
    ...defaultOptions,
    cutout: '70%',
    plugins: { 
        ...defaultOptions.plugins, 
        legend: { display: true, position: 'right' as const, labels: { color: '#888', boxWidth: 12,
        boxHeight: 12,
        padding: 16, } } 
    },
    scales: { x: { display: false }, y: { display: false } }
}))

// --- Room Type Performance ---
const roomTypePerformance = computed(() => {
    return roomsStore.roomTypes.map(rt => {
        const res = filteredReservations.value.filter(r => r.roomTypeId === rt.id && r.status !== 'Cancelled')
        const bookings = res.length
        
        let revenue = 0
        res.forEach(r => {
            const folio = foliosStore.folios.find(f => f.reservationId === r.id)
            if (folio) {
                const charges = foliosStore.charges.filter(c => c.folioId === folio.id)
                revenue += charges.reduce((sum, c) => sum + c.total, 0)
            }
        })
        
        return {
            id: rt.id,
            name: rt.name,
            bookings,
            revenue
        }
    }).sort((a, b) => b.revenue - a.revenue)
})

const performanceColumns = [
    { accessorKey: 'name', header: 'Room Type' },
    { accessorKey: 'bookings', header: 'Bookings' },
    { accessorKey: 'revenue', header: 'Revenue Generated' }
]

// --- Export CSV ---
const exportCSV = () => {
    const rows = [
        ['Report Generated', new Date().toLocaleString()],
        ['Date Range', selectedDateRange.value.label],
        [],
        ['Room Type Performance'],
        ['Room Type', 'Bookings', 'Revenue (PHP)']
    ]
    
    roomTypePerformance.value.forEach(rt => {
        rows.push([rt.name, rt.bookings.toString(), rt.revenue.toString()])
    })
    
    rows.push([])
    rows.push(['Recent Transactions'])
    rows.push(['Date', 'Description', 'Category', 'Amount (PHP)'] )
    
    const sortedCharges = [...filteredCharges.value].sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
    sortedCharges.forEach(c => {
        rows.push([
            new Date(c.postedAt).toLocaleDateString(),
            c.description,
            c.type,
            c.total.toString()
        ])
    })
    
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n")
        
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `presidio_report_${new Date().getTime()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    appLogger.logReportExported('CSV')
    toast.success(`Report Exported`, `The analytics report has been downloaded as CSV.`)
}
</script>

<template>
    <AuthGate v-if="!isAuthorized" title="Access Denied" description="You must be an Administrator to access Reports." icon="i-lucide-lock" />

    <div v-else class="w-full mx-auto space-y-6">
        <UPageCard title="Reports & Analytics"
            description="View revenue trends, booking statistics, and operational performance."
            variant="naked" orientation="horizontal">
            <div class="flex items-center justify-end w-full gap-4">
                <USelectMenu v-model="selectedDateRange" :items="dateRanges" class="w-48" />
                <UButton icon="i-lucide-download" color="success" variant="soft" @click="exportCSV">Export CSV</UButton>
            </div>
        </UPageCard>

        <ClientOnly>
            <Teleport to="#header-actions-teleport">
                <UButton icon="i-lucide-history" color="neutral" variant="soft" @click="events.emit('viewReportsLogs')">
                    Recent Activity
                </UButton>
            </Teleport>
        </ClientOnly>

        <!-- KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UCard variant="subtle" class="shadow-sm">
                <div class="flex items-center gap-3">
                    <div class="p-3 bg-primary/10 rounded-lg text-primary">
                        <UIcon name="i-lucide-trending-up" class="w-6 h-6 flex shrink-0" />
                    </div>
                    <div>
                        <p class="text-sm text-muted">Revenue ({{ selectedDateRange.label }})</p>
                        <p class="text-2xl font-bold">{{ formatCurrency(totalRevenue) }}</p>
                    </div>
                </div>
            </UCard>
            <UCard variant="subtle" class="shadow-sm">
                <div class="flex items-center gap-3">
                    <div class="p-3 bg-primary/10 rounded-lg text-primary">
                        <UIcon name="i-lucide-calendar-check" class="w-6 h-6 flex shrink-0" />
                    </div>
                    <div>
                        <p class="text-sm text-muted">Bookings</p>
                        <p class="text-2xl font-bold">{{ totalBookings }} stays</p>
                    </div>
                </div>
            </UCard>
            <UCard variant="subtle" class="shadow-sm">
                <div class="flex items-center gap-3">
                    <div class="p-3 bg-primary/10 rounded-lg text-primary">
                        <UIcon name="i-lucide-building" class="w-6 h-6 flex shrink-0" />
                    </div>
                    <div>
                        <p class="text-sm text-muted">Average Occupancy</p>
                        <p class="text-2xl font-bold">{{ averageOccupancy }}%</p>
                    </div>
                </div>
            </UCard>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Revenue Trend Chart -->
            <UCard variant="subtle" class="shadow-sm lg:col-span-2">
                <template #header>
                    <h3 class="text-lg font-semibold">Revenue Trend</h3>
                </template>
                <div class="h-80 w-full flex items-center justify-center">
                    <Line v-if="totalRevenue > 0" :data="chartData" :options="chartOptions" />
                    <div v-else class="text-muted text-sm italic">No revenue data for this period.</div>
                </div>
            </UCard>
            
            <!-- Revenue Breakdown Chart -->
            <UCard variant="subtle" class="shadow-sm">
                <template #header>
                    <h3 class="text-lg font-semibold">Revenue Breakdown</h3>
                </template>
                <div class="h-80 w-full flex items-center justify-center relative">
                    <Doughnut v-if="totalRevenue > 0" :data="revenueBreakdownData" :options="doughnutOptions" />
                    <div v-else class="text-muted text-sm italic">No revenue data for this period.</div>
                    
                    <div v-if="totalRevenue > 0" class="absolute inset-0 flex items-center justify-center pointer-events-none -ml-[110px]">
                        <div class="text-center">
                            <div class="text-xs text-muted uppercase">Total</div>
                            <div class="font-bold text-lg">{{ new Intl.NumberFormat('en-PH', { notation: 'compact', compactDisplay: 'short' }).format(totalRevenue) }}</div>
                        </div>
                    </div>
                </div>
            </UCard>
        </div>
        
        <!-- Room Type Performance Table -->
        <UCard variant="subtle" class="shadow-sm" :ui="{ body: 'p-0 sm:p-0' }">
            <template #header>
                <h3 class="text-lg font-semibold">Room Type Performance</h3>
            </template>
            <UTable :data="roomTypePerformance" :columns="performanceColumns" class="w-full">
                <template #revenue-cell="{ row }">
                    <span class="font-medium">{{ formatCurrency(row.original.revenue) }}</span>
                </template>
                <template #bookings-cell="{ row }">
                    <UBadge color="neutral" variant="soft">{{ row.original.bookings }}</UBadge>
                </template>
                <template #empty>
                    <div class="p-6 text-center text-muted">No data available for this period.</div>
                </template>
            </UTable>
        </UCard>

        <LogsDrawer v-model:open="isDrawerOpen" namespace="reports" />
    </div>
</template>
