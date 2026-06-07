<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

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

const totalRevenue = computed(() => foliosStore.totalRevenue)
const totalBookings = computed(() => reservationsStore.totalBookings)
const averageOccupancy = computed(() => roomsStore.occupancyRate)

const { defaultOptions, lineDataset, palette } = useChart()

// Dynamic revenue data for the past 7 days
const chartData = computed(() => {
    const labels: string[] = []
    const data: number[] = [0, 0, 0, 0, 0, 0, 0]
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }))
    }

    foliosStore.charges.forEach(charge => {
        if (!charge.postedAt) return
        const chargeDate = new Date(charge.postedAt)
        chargeDate.setHours(0, 0, 0, 0)
        
        const diffTime = today.getTime() - chargeDate.getTime()
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays >= 0 && diffDays <= 6) {
            const index = 6 - diffDays
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

const exportReport = (format: string) => {
    appLogger.logReportExported(format)
    toast.success(`Report Exported`, `The analytics report has been generated in ${format} format.`)
}
</script>

<template>
    <AuthGate v-if="!isAuthorized" title="Access Denied" description="You must be an Administrator to access Reports." icon="i-lucide-lock" />

    <div v-else class="w-full max-w-(--ui-container) mx-auto space-y-6">
        <UPageCard title="Reports & Analytics"
            description="View revenue trends, booking statistics, and operational performance."
            variant="naked" orientation="horizontal">
            <div class="flex items-center justify-end w-full gap-2">
                <UButton icon="i-lucide-file-text" color="error" variant="soft" @click="exportReport('PDF')">Export PDF</UButton>
                <UButton icon="i-lucide-sheet" color="success" variant="soft" @click="exportReport('Excel')">Export Excel</UButton>
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
                        <p class="text-sm text-muted">Total Revenue (YTD)</p>
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
                        <p class="text-sm text-muted">Total Bookings</p>
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

        <!-- Chart -->
        <UCard variant="subtle" class="shadow-sm">
            <template #header>
                <h3 class="text-lg font-semibold">Revenue Trend (Last 7 Days)</h3>
            </template>
            <div class="h-80 w-full">
                <Line :data="chartData" :options="chartOptions" />
            </div>
        </UCard>
        
        <LogsDrawer v-model:open="isDrawerOpen" namespace="reports" />
    </div>
</template>
