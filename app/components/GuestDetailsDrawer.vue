<script setup lang="ts">
import { computed, h } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Guest, Reservation } from '~/types'
import GuestAvatar from '~/components/GuestAvatar.vue'
import StatusBadge from '~/components/StatusBadge.vue'

const props = defineProps<{
    guest: Guest | null
}>()

const emit = defineEmits<{
    (e: 'view-profile', guest: Guest): void
    (e: 'edit', guest: Guest): void
    (e: 'delete', guest: Guest): void
}>()

const isOpen = defineModel<boolean>('open', { default: false })
const guestsStore = useGuestsStore()
const reservationsStore = useReservationsStore()

const guestReservations = computed(() => 
    props.guest ? reservationsStore.reservations.filter(r => r.guests?.some(g => g.guestId === props.guest!.id)) : []
)

const columns: TableColumn<Reservation>[] = [
    { accessorKey: 'bookingRef', header: 'Ref' },
    { accessorKey: 'checkInDate', header: 'Check-In' },
    { accessorKey: 'checkOutDate', header: 'Check-Out' },
    { 
        accessorKey: 'status', 
        header: 'Status',
        cell: ({ row }) => h(StatusBadge, { status: row.original.status })
    }
]
</script>

<template>
    <UDrawer v-model:open="isOpen" direction="right" inset class="min-w-[900px]">
        <template #header>
            <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-4">
                    <GuestAvatar v-if="guest" :guest="guest" size="lg" />
                    <div v-else class="size-12 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                        <UIcon name="i-lucide-user" class="size-6 text-neutral-500" />
                    </div>
                    <div>
                        <div class="text-xl font-bold flex items-center gap-2">
                            {{ guest ? guestsStore.getFullName(guest) : 'Unknown' }}
                            <UBadge v-if="guest?.isVip" label="VIP" color="warning" variant="subtle" size="sm" />
                        </div>
                        <div class="text-sm text-muted">{{ guest?.company || 'No Company' }}</div>
                    </div>
                </div>
            </div>
        </template>

        <template #body v-if="guest">
            <div class="grid grid-cols-1 gap-4">
                <!-- Quick Actions -->
                <UCard :ui="{ body: 'sm:p-4 flex flex-col lg:flex-row gap-3' }">
                    <div class="text-sm font-semibold text-muted flex items-center gap-2 w-full shadow-sm">
                        <UIcon name="i-lucide-zap" class="size-4" />
                        Quick Actions
                    </div>
                    <div class="flex gap-2">
                        <UButton 
                            block
                            label="View Full Profile" 
                            icon="i-lucide-external-link" 
                            color="primary" 
                            variant="soft"
                            @click="emit('view-profile', guest)" 
                        />

                        <UButton 
                            block
                            label="Edit Guest" 
                            icon="i-lucide-pencil" 
                            color="neutral" 
                            variant="soft"
                            @click="emit('edit', guest)" 
                        />
                        
                        <UButton 
                            block
                            label="Delete Guest" 
                            icon="i-lucide-trash" 
                            color="error" 
                            variant="soft"
                            @click="emit('delete', guest)" 
                        />
                    </div>
                </UCard>

                <!-- Left Column -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    <!-- Contact Information -->
                    <div class="space-y-4">
                        <h3 class="text-sm font-bold text-muted uppercase tracking-wider">Contact Details</h3>
                        <UCard variant="subtle" :ui="{ body: 'sm:p-0 overflow-hidden text-sm' }" class="shadow-sm">
                            <div class="flex justify-between p-3 border-b border-default">
                                <span class="text-muted flex items-center gap-2"><UIcon name="i-lucide-mail" class="w-4 h-4" /> Email</span>
                                <span class="font-medium" :class="guest.email ? '' : 'text-muted italic'">{{ guest.email || 'N/A' }}</span>
                            </div>
                            <div class="flex justify-between p-3">
                                <span class="text-muted flex items-center gap-2"><UIcon name="i-lucide-phone" class="w-4 h-4" /> Phone</span>
                                <span class="font-medium" :class="guest.phone ? '' : 'text-muted italic'">{{ guest.phone || 'N/A' }}</span>
                            </div>
                        </UCard>
                    </div>

                    <!-- Profile Information -->
                    <div class="space-y-4">
                        <h3 class="text-sm font-bold text-muted uppercase tracking-wider">Profile Info</h3>
                        <UCard variant="subtle" :ui="{ body: 'sm:p-0 overflow-hidden text-sm' }" class="shadow-sm">
                            <div class="flex justify-between p-3 border-b border-default">
                                <span class="text-muted">Guest ID</span>
                                <span class="font-medium font-mono">{{ guest.id }}</span>
                            </div>
                            <div class="flex justify-between p-3">
                                <span class="text-muted">Company</span>
                                <span class="font-medium" :class="guest.company ? '' : 'text-muted italic'">{{ guest.company || 'None' }}</span>
                            </div>
                        </UCard>
                    </div>
                </div>

                <!-- Right Column (Stay History) -->
                <div class="space-y-4">
                    <div class="flex justify-between items-center">
                        <h3 class="text-sm font-bold text-muted uppercase tracking-wider">Stay History</h3>
                        <UBadge color="neutral" variant="soft">{{ guestReservations.length }} stays</UBadge>
                    </div>
                    
                    <UCard variant="subtle" :ui="{ body: 'p-0 sm:p-0' }" class="shadow-sm">
                        <UTable :data="guestReservations" :columns="columns" class="w-full">
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
        
        <template #body v-else>
            <div class="flex flex-col items-center justify-center py-12 text-muted">
                <UIcon name="i-lucide-users" class="w-12 h-12 mb-4 opacity-50" />
                <p>No guest selected.</p>
            </div>
        </template>
    </UDrawer>
</template>
