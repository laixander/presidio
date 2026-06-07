<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { TableColumn } from '@nuxt/ui'
import type { Reservation } from '~/types'

definePageMeta({
    title: 'Guest Profile',
    layout: 'dashboard'
})

const route = useRoute()
const router = useRouter()
const guestsStore = useGuestsStore()
const reservationsStore = useReservationsStore()
const authStore = useDemoAuth()

const guestId = parseInt(route.params.id as string)
const guest = computed(() => guestsStore.getById(guestId))

const isAuthorized = computed(() => ['Administrator', 'Front Desk'].includes(authStore.currentRole.value as string))

const guestReservations = computed(() => 
    reservationsStore.reservations.filter(r => r.guestId === guestId)
)

const columns: TableColumn<Reservation>[] = [
    { accessorKey: 'bookingRef', header: 'Booking Ref' },
    { accessorKey: 'checkInDate', header: 'Check-In' },
    { accessorKey: 'checkOutDate', header: 'Check-Out' },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'source', header: 'Source' }
]

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Confirmed': return 'primary'
        case 'In-House': return 'warning'
        case 'Done': return 'success'
        case 'Cancelled': return 'error'
        case 'Pending': return 'neutral'
        default: return 'neutral'
    }
}
</script>

<template>
    <AuthGate v-if="!isAuthorized" title="Access Denied" description="You must be Front Desk staff or an Administrator to view Guest Profiles." icon="i-lucide-lock" />

    <div v-else class="w-full max-w-(--ui-container) mx-auto space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div class="flex items-center gap-4">
                <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" @click="router.push('/frontdesk/guests')" />
                <div>
                    <h1 class="text-2xl font-bold flex items-center gap-3">
                        <UIcon name="i-lucide-user" class="text-primary" />
                        Guest Profile
                    </h1>
                    <p class="text-muted text-sm mt-1">View guest details and stay history.</p>
                </div>
            </div>
        </div>

        <div v-if="!guest" class="p-8 flex flex-col items-center justify-center text-center">
            <UIcon name="i-lucide-user-x" class="w-16 h-16 text-neutral-400 mb-4" />
            <h2 class="text-xl font-bold mb-2">Guest Not Found</h2>
            <p class="text-neutral-500 mb-6">The requested guest profile could not be found.</p>
            <UButton to="/frontdesk/guests" color="neutral" variant="soft" icon="i-lucide-arrow-left">Back to Directory</UButton>
        </div>

        <div v-else class="w-full flex flex-col lg:flex-row gap-6">
            <!-- Sidebar -->
            <UCard variant="subtle" :ui="{ header: 'flex flex-col items-center text-center gap-2 sm:py-6' }" class="shadow-sm w-full lg:w-1/3 h-fit">
                <template #header>
                    <GuestAvatar :guest="guest" size="xl" />
                    <h2 class="text-2xl font-bold">{{ guest.firstName }} {{ guest.lastName }}</h2>
                    <UBadge v-if="guest.isVip" color="primary" variant="soft" icon="i-lucide-crown">VIP</UBadge>
                </template>
                <div class="space-y-4">
                    <div class="flex items-start gap-3">
                        <UIcon name="i-lucide-mail" class="w-5 h-5 text-neutral-400 mt-0.5" />
                        <div>
                            <p class="text-sm font-medium">Email</p>
                            <p class="text-sm text-neutral-600 dark:text-neutral-400">{{ guest.email }}</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3">
                        <UIcon name="i-lucide-phone" class="w-5 h-5 text-neutral-400 mt-0.5" />
                        <div>
                            <p class="text-sm font-medium">Phone</p>
                            <p class="text-sm text-neutral-600 dark:text-neutral-400">{{ guest.phone }}</p>
                        </div>
                    </div>
                    <div v-if="guest.company" class="flex items-start gap-3">
                        <UIcon name="i-lucide-building" class="w-5 h-5 text-neutral-400 mt-0.5" />
                        <div>
                            <p class="text-sm font-medium">Company</p>
                            <p class="text-sm text-neutral-600 dark:text-neutral-400">{{ guest.company }}</p>
                        </div>
                    </div>
                </div>
            </UCard>

            <!-- Main Content -->
            <UCard variant="subtle" :ui="{ body: 'p-0 sm:p-0' }" class="shadow-sm w-full lg:w-2/3">
                <template #header>
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-semibold">Stay History</h3>
                        <UBadge color="neutral" variant="soft">{{ guestReservations.length }} stays</UBadge>
                    </div>
                </template>
                
                <UTable :data="guestReservations" :columns="columns" class="w-full">
                    <template #status-cell="{ row }">
                        <UBadge :color="getStatusColor(row.original.status)" variant="subtle" size="sm">
                            {{ row.original.status }}
                        </UBadge>
                    </template>
                    <template #bookingRef-cell="{ row }">
                        <ULink :to="`/frontdesk/bookings/${row.original.id}`" class="text-primary hover:underline font-medium">
                            {{ row.original.bookingRef }}
                        </ULink>
                    </template>
                    <template #empty>
                        <Empty 
                            title="No stay history" 
                            description="There are no reservations on record for this guest." 
                            icon="i-lucide-calendar-x" 
                        />
                    </template>
                </UTable>
            </UCard>
        </div>
    </div>
</template>
