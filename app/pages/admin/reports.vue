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

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val)
}

const totalRevenue = computed(() => foliosStore.totalRevenue)
const totalBookings = computed(() => reservationsStore.totalBookings)
const averageOccupancy = computed(() => roomsStore.occupancyRate)

// Mock revenue data for the past 7 days
const chartData = computed(() => {
    return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Revenue (PHP)',
                backgroundColor: '#E5A100',
                borderColor: '#E5A100',
                data: [12000, 19000, 15000, 22000, 30000, 45000, 38000]
            }
        ]
    }
})

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false
}

const exportReport = (format: string) => {
    toast.success(`Report Exported`, `The analytics report has been generated in ${format} format.`)
}
</script>

<template>
    <AuthGate v-if="!isAuthorized" title="Access Denied" description="You must be an Administrator to access Reports." icon="i-lucide-lock" />

    <template v-else>
        <UPageCard title="Reports & Analytics"
            description="View revenue trends, booking statistics, and operational performance."
            variant="naked" orientation="horizontal" class="border-b border-default rounded-none p-4 sm:p-6">
            <div class="flex justify-end gap-2 flex-1">
                <UButton icon="i-lucide-file-text" color="neutral" variant="soft" @click="exportReport('PDF')">Export PDF</UButton>
                <UButton icon="i-lucide-sheet" color="neutral" variant="soft" @click="exportReport('Excel')">Export Excel</UButton>
            </div>
        </UPageCard>

        <div class="p-4 sm:p-6 space-y-6 max-w-7xl">
            <!-- KPI Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <UCard class="shadow-sm">
                    <div class="flex items-center gap-3">
                        <div class="p-3 bg-primary/10 rounded-lg text-primary">
                            <UIcon name="i-lucide-trending-up" class="w-6 h-6" />
                        </div>
                        <div>
                            <p class="text-sm text-muted">Total Revenue (YTD)</p>
                            <p class="text-2xl font-bold">{{ formatCurrency(totalRevenue) }}</p>
                        </div>
                    </div>
                </UCard>
                <UCard class="shadow-sm">
                    <div class="flex items-center gap-3">
                        <div class="p-3 bg-primary/10 rounded-lg text-primary">
                            <UIcon name="i-lucide-calendar-check" class="w-6 h-6" />
                        </div>
                        <div>
                            <p class="text-sm text-muted">Total Bookings</p>
                            <p class="text-2xl font-bold">{{ totalBookings }} stays</p>
                        </div>
                    </div>
                </UCard>
                <UCard class="shadow-sm">
                    <div class="flex items-center gap-3">
                        <div class="p-3 bg-primary/10 rounded-lg text-primary">
                            <UIcon name="i-lucide-building" class="w-6 h-6" />
                        </div>
                        <div>
                            <p class="text-sm text-muted">Average Occupancy</p>
                            <p class="text-2xl font-bold">{{ averageOccupancy }}%</p>
                        </div>
                    </div>
                </UCard>
            </div>

            <!-- Chart -->
            <UCard class="shadow-sm">
                <template #header>
                    <h3 class="text-lg font-semibold">Revenue Trend (Last 7 Days)</h3>
                </template>
                <div class="h-80 w-full">
                    <Line :data="chartData" :options="chartOptions" />
                </div>
            </UCard>
        </div>
    </template>
</template>
