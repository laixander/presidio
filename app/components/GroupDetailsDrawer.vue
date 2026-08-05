<script setup lang="ts">
import { computed, ref, reactive, h } from 'vue'
import { UBadge, UButton, USelect, USelectMenu, UTooltip, UIcon } from '#components'
import type { TableColumn } from '@nuxt/ui'
import type { GroupReservation, RoomBlock, Reservation, Guest } from '~/types'
import StatusBadge from '~/components/StatusBadge.vue'
import GuestAvatar from '~/components/GuestAvatar.vue'
import GroupModal from '~/components/GroupModal.vue'

const props = defineProps<{
    group: GroupReservation | null
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const guestsStore = useGuestsStore()
const router = useRouter()
const groupsStore = useGroupsStore()
const roomsStore = useRoomsStore()
const reservationsStore = useReservationsStore()
const toast = useAppToast()

const contactName = computed(() => {
    if (!props.group) return ''
    if (props.group.contactGuestId) {
        const g = guestsStore.getById(props.group.contactGuestId)
        return g ? guestsStore.getFullName(g) : 'Unknown Guest'
    }
    return props.group.contactPerson || 'N/A'
})

const contactNumber = computed(() => {
    if (!props.group) return ''
    if (props.group.contactGuestId) {
        const g = guestsStore.getById(props.group.contactGuestId)
        return g ? g.phone : 'N/A'
    }
    return props.group.contactNumber || 'N/A'
})

const contactGuest = computed(() => {
    if (!props.group || !props.group.contactGuestId) return undefined
    return guestsStore.getById(props.group.contactGuestId)
})

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

const nights = computed(() => {
    if (!props.group) return 0
    const msPerDay = 1000 * 60 * 60 * 24
    return Math.max(1, Math.round((new Date(props.group.checkOutDate).getTime() - new Date(props.group.checkInDate).getTime()) / msPerDay))
})

const emit = defineEmits<{
    (e: 'cancelGroup', id: number): void
}>()

const isEditModalOpen = ref(false)
function onEditSubmit(data: Partial<GroupReservation>) {
    if (!props.group) return
    groupsStore.updateGroup(props.group.id, data)
    toast.success('Group Updated', 'The group details have been updated successfully.')
}

const isCheckInModalOpen = ref(false)
const reservationToCheckIn = ref<number | undefined>(undefined)

const openCheckIn = (id: number) => {
    reservationToCheckIn.value = id
    isCheckInModalOpen.value = true
}

const isGuestDetailsDrawerOpen = ref(false)
const selectedGuest = ref<Guest | null>(null)

const openGuestDetails = (guest: Guest) => {
    selectedGuest.value = guest
    isGuestDetailsDrawerOpen.value = true
}

// ============================================================================
// Reservations & Blocks Logic
// ============================================================================
const blocks = computed(() => props.group ? groupsStore.getBlocksForGroup(props.group.id) : [])
const unreservedBlocksCount = computed(() => blocks.value.filter(b => b.status === 'Blocked').length)

const reserveBlocks = () => {
    if (unreservedBlocksCount.value > 0 && props.group) {
        groupsStore.reserveBlockedRooms(props.group.id)
        toast.success('Rooms Reserved', `${unreservedBlocksCount.value} rooms have been reserved for the group.`)
    }
}

const groupReservations = computed(() => props.group ? reservationsStore.reservations.filter(r => r.groupId === props.group?.id) : [])

const reservationColumns: TableColumn<Reservation>[] = [
    {
        id: 'guest',
        header: 'Guest Name',
        cell: ({ row }) => {
            const guestId = reservationsStore.getPrimaryGuestId(row.original)
            const guest = guestId ? guestsStore.getById(guestId) : undefined
            return guest ? h(GuestAvatar, { guest, size: 'sm', showDetails: true }) : h('span', { class: 'text-muted italic' }, 'Unassigned')
        }
    },
    {
        id: 'roomType',
        header: 'Room Style',
        cell: ({ row }) => {
            const rt = roomsStore.roomTypes.find(r => r.id === row.original.roomTypeId)
            return h('span', { class: 'font-medium' }, rt ? rt.name : 'Unknown')
        }
    },
    {
        id: 'room',
        header: 'Room',
        cell: ({ row }) => {
            if (!row.original.roomId) return h('span', { class: 'text-muted italic text-xs' }, 'Unassigned')
            const room = roomsStore.rooms.find(r => r.id === row.original.roomId)
            return h(UBadge, { variant: 'subtle', color: 'neutral' }, () => room ? room.number : '?')
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
            if (row.original.status === 'Pending' || row.original.status === 'Confirmed') {
                return h(UButton, {
                    label: 'Check-In',
                    icon: 'i-lucide-log-in',
                    size: 'xs',
                    color: 'primary',
                    onClick: () => openCheckIn(row.original.id)
                })
            }
            if (row.original.status === 'In-House') {
                 return h('span', { class: 'text-xs text-success-600 font-medium' }, 'Checked In')
            }
            if (row.original.status === 'Done') {
                 return h('span', { class: 'text-xs text-neutral-500 font-medium' }, 'Checked Out')
            }
            return null
        }
    }
]
</script>

<template>
    <UDrawer v-model:open="isOpen" direction="right" inset class="min-w-[900px]">
        <template #header>
            <div class="flex items-center justify-between w-full">
                <div>
                    <div v-if="group" class="text-2xl font-bold flex items-center gap-2">
                        {{ group.groupName }}
                        <StatusBadge :status="group.status" />
                        <span class="text-sm font-mono text-muted bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">{{ group.bookingRef }}</span>
                    </div>
                    <div v-else class="text-2xl font-bold flex items-center gap-2">
                        Loading...
                    </div>
                </div>
            </div>
        </template>

        <template #body v-if="group">
            <div class="flex flex-col gap-6 mt-2 pb-6">
                <!-- Quick Actions -->
                <div class="flex flex-wrap items-center gap-3 bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl border border-default">
                    <div class="text-sm font-semibold text-muted mr-auto flex items-center gap-2">
                        <UIcon name="i-lucide-zap" class="size-4" />
                        Quick Actions
                    </div>
                    
                    <UButton 
                        label="Edit Details" 
                        icon="i-lucide-pencil" 
                        color="neutral" 
                        variant="soft"
                        @click="isEditModalOpen = true" 
                    />
                    
                    <UButton 
                        v-if="group.status !== 'Cancelled' && group.status !== 'Done'"
                        label="Cancel Group" 
                        icon="i-lucide-x-circle" 
                        color="error" 
                        variant="soft"
                        @click="emit('cancelGroup', group.id)" 
                    />
                </div>

                <!-- Inline Info Section (Contact Info + Stay Details) -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Contact Info -->
                    <UCard variant="subtle" class="shadow-sm">
                        <template #header>
                            <div class="flex items-center gap-2 font-semibold">
                                <UIcon name="i-lucide-user" class="text-primary size-5" />
                                Contact Information
                            </div>
                        </template>
                        <div class="space-y-4">
                            <div class="flex items-start gap-4">
                                <ULink v-if="contactGuest" @click="openGuestDetails(contactGuest)" class="block hover:opacity-80 transition-opacity cursor-pointer">
                                    <GuestAvatar :guest="contactGuest" size="lg" />
                                </ULink>
                                <div v-else class="size-12 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                                    <UIcon name="i-lucide-users" class="size-6 text-neutral-500" />
                                </div>

                                <div class="space-y-2">
                                    <div>
                                        <div class="font-bold text-lg flex items-center gap-2">
                                            {{ contactName }}
                                        </div>
                                        <div class="text-sm text-muted">{{ contactNumber }}</div>
                                    </div>
                                    <div class="flex gap-2 mt-2" v-if="contactGuest">
                                        <UBadge v-if="contactGuest.isVip" color="warning" variant="subtle" icon="i-lucide-crown">VIP</UBadge>
                                        <UBadge v-if="contactGuest.company" color="neutral" variant="subtle" icon="i-lucide-building">{{ contactGuest.company }}</UBadge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </UCard>

                    <!-- Stay Info -->
                    <UCard variant="subtle" class="shadow-sm">
                        <template #header>
                            <div class="flex items-center gap-2 font-semibold">
                                <UIcon name="i-lucide-calendar" class="text-primary size-5" />
                                Stay Details
                            </div>
                        </template>
                        <div class="space-y-4">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <div class="text-sm text-muted mb-1">Check-In</div>
                                    <div class="font-medium">{{ formatDate(group.checkInDate) }}</div>
                                </div>
                                <div>
                                    <div class="text-sm text-muted mb-1">Check-Out</div>
                                    <div class="font-medium">{{ formatDate(group.checkOutDate) }}</div>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4 pt-4 border-t border-default">
                                <div>
                                    <div class="text-sm text-muted mb-1">Duration</div>
                                    <div class="font-medium">{{ nights }} Night{{ nights > 1 ? 's' : '' }}</div>
                                </div>
                                <div>
                                    <div class="text-sm text-muted mb-1">Guests</div>
                                    <div class="font-medium">{{ group.totalGuests }}</div>
                                </div>
                            </div>
                        </div>
                    </UCard>
                </div>
                
                <!-- Reservations List -->
                <UCard variant="subtle" class="shadow-sm" :ui="{ body: 'p-0 sm:p-0' }">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2 font-semibold">
                                <UIcon name="i-lucide-calendar-check" class="text-primary size-5" />
                                Reservations
                            </div>
                            <UButton v-if="unreservedBlocksCount > 0" 
                                label="Reserve Pending Blocks" 
                                icon="i-lucide-calendar-check"
                                color="success"
                                size="sm"
                                @click="reserveBlocks" />
                        </div>
                    </template>
                    
                    <UTable :data="groupReservations" :columns="reservationColumns" class="scrollbar">
                        <template #empty>
                            <div class="text-sm text-muted py-8 text-center flex flex-col items-center gap-2">
                                <UIcon name="i-lucide-calendar-x" class="size-8 text-neutral-300" />
                                No reservations under this group.
                            </div>
                        </template>
                    </UTable>
                </UCard>
                
                <GroupModal v-if="group" v-model:open="isEditModalOpen" :group="group" @submit="onEditSubmit" />
                <CheckInModal v-model:open="isCheckInModalOpen" :reservation-id="reservationToCheckIn" />
            </div>
        </template>
        
        <template #body v-else>
            <div class="flex flex-col items-center justify-center py-12 text-muted">
                <UIcon name="i-lucide-calendar" class="w-12 h-12 mb-4 opacity-50" />
                <p>No group reservation selected.</p>
            </div>
        </template>
    </UDrawer>
    <GuestDetailsDrawer 
        v-model:open="isGuestDetailsDrawerOpen" 
        :guest="selectedGuest" 
        :hide-actions="true"
        @view-profile="(g) => { router.push(`/frontdesk/guests/${g.id}`); isGuestDetailsDrawerOpen = false; isOpen = false }"
    />
</template>
