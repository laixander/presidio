<script setup lang="ts">
/**
 * ============================================================================
 * Page: Group Reservation Details (/frontdesk/groups/[id])
 * ============================================================================
 * Manages the Group -> Block -> Reserve -> Assign Guest flow.
 */
import { computed, ref, h } from 'vue'
import { UBadge, UButton, USelect } from '#components'
import StatusBadge from '~/components/StatusBadge.vue'
import GuestAvatar from '~/components/GuestAvatar.vue'
import type { TableColumn } from '@nuxt/ui'
import type { RoomBlock, Reservation } from '~/types'

definePageMeta({
    title: 'Group Booking Details',
    layout: 'dashboard'
})

const route = useRoute()
const router = useRouter()
const authStore = useDemoAuth()
const groupsStore = useGroupsStore()
const guestsStore = useGuestsStore()
const roomsStore = useRoomsStore()
const reservationsStore = useReservationsStore()
const toast = useAppToast()

const isAuthorized = computed(() => ['Administrator', 'Front Desk'].includes(authStore.currentRole.value ?? ''))

const groupId = computed(() => parseInt(route.params.id as string, 10))
const group = computed(() => groupsStore.getGroupById(groupId.value))

const contactName = computed(() => {
    if (!group.value) return ''
    if (group.value.contactGuestId) {
        const g = guestsStore.getById(group.value.contactGuestId)
        return g ? guestsStore.getFullName(g) : 'Unknown Guest'
    }
    return group.value.contactPerson || 'N/A'
})

const contactNumber = computed(() => {
    if (!group.value) return ''
    if (group.value.contactGuestId) {
        const g = guestsStore.getById(group.value.contactGuestId)
        return g ? g.phone : 'N/A'
    }
    return group.value.contactNumber || 'N/A'
})

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

const nights = computed(() => {
    if (!group.value) return 0
    const msPerDay = 1000 * 60 * 60 * 24
    return Math.max(1, Math.round((new Date(group.value.checkOutDate).getTime() - new Date(group.value.checkInDate).getTime()) / msPerDay))
})

// ============================================================================
// Tabs & State
// ============================================================================
const items = [
    { label: 'Room Blocks', value: 'blocks', icon: 'i-lucide-layout-grid' },
    { label: 'Reservations', value: 'reservations', icon: 'i-lucide-calendar-check' }
]

const selectedTab = ref('blocks')

// ============================================================================
// Blocks
// ============================================================================
const blocks = computed(() => groupsStore.getBlocksForGroup(groupId.value))
const selectedRoomToAdd = ref<number | undefined>(undefined)

const availableRoomOptions = computed(() => {
    const blockedRoomIds = blocks.value.map(b => b.roomId)
    return roomsStore.rooms
        .filter(r => !blockedRoomIds.includes(r.id)) // Only rooms not already blocked in this group
        .map(r => ({
            label: `Room ${r.number} - ${roomsStore.getRoomType(r)?.name || 'Unknown'}`,
            value: r.id
        }))
})

const addBlock = () => {
    if (selectedRoomToAdd.value) {
        groupsStore.addRoomBlock(groupId.value, selectedRoomToAdd.value)
        selectedRoomToAdd.value = undefined
        toast.success('Room Blocked', 'The room has been added to the group block.')
    }
}

const removeBlock = (blockId: number) => {
    groupsStore.removeRoomBlock(blockId)
    toast.success('Block Removed', 'The room block has been removed.')
}

const reserveBlocks = () => {
    const unreservedCount = blocks.value.filter(b => b.status === 'Blocked').length
    if (unreservedCount > 0) {
        groupsStore.reserveBlockedRooms(groupId.value)
        toast.success('Rooms Reserved', `${unreservedCount} rooms have been reserved for the group.`)
        selectedTab.value = 'reservations'
    }
}

const blockColumns: TableColumn<RoomBlock>[] = [
    {
        id: 'room',
        header: 'Room',
        cell: ({ row }) => {
            const room = roomsStore.rooms.find(r => r.id === row.original.roomId)
            return h('span', { class: 'font-medium' }, room ? room.number : 'Unknown')
        }
    },
    {
        id: 'type',
        header: 'Type',
        cell: ({ row }) => {
            const room = roomsStore.rooms.find(r => r.id === row.original.roomId)
            const type = room ? roomsStore.getRoomType(room) : null
            return h('span', { class: 'text-sm text-muted' }, type ? type.name : 'Unknown')
        }
    },
    {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => h(UBadge, { color: row.original.status === 'Blocked' ? 'warning' : 'success', variant: 'subtle' }, () => row.original.status)
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            if (row.original.status === 'Blocked') {
                return h(UButton, {
                    icon: 'i-lucide-trash-2',
                    color: 'error',
                    variant: 'ghost',
                    size: 'sm',
                    onClick: () => removeBlock(row.original.id)
                })
            }
            return null
        }
    }
]

// ============================================================================
// Reservations
// ============================================================================
const groupReservations = computed(() => reservationsStore.reservations.filter(r => r.groupId === groupId.value))

const guestAssignmentOptions = computed(() =>
    guestsStore.guests.map(g => ({
        label: guestsStore.getFullName(g),
        value: g.id
    }))
)

const assignGuest = (reservationId: number, guestId: number) => {
    reservationsStore.updateReservation(reservationId, { guestId })
    toast.success('Guest Assigned', 'The guest has been successfully assigned to the reservation.')
}

</script>

<template>
    <AuthGate v-if="!isAuthorized" title="Access Denied"
        description="You must be Front Desk staff or an Administrator to view Group Booking details."
        icon="i-lucide-lock" />

    <template v-else>
        <div v-if="group" class="space-y-6 max-w-5xl mx-auto">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div class="flex items-center gap-4">
                    <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost"
                        @click="router.push('/frontdesk/groups')" />
                    <div>
                        <div class="flex items-center gap-3">
                            <h1 class="text-2xl font-bold">{{ group.groupName }}</h1>
                            <StatusBadge :status="group.status" />
                        </div>
                        <p class="text-muted text-sm mt-1">Group Booking Details</p>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Contact Info -->
                <UCard variant="subtle" class="shadow-sm">
                    <template #header>
                        <div class="flex items-center gap-2 font-semibold text-lg">
                            <UIcon name="i-lucide-user" class="text-primary size-5" />
                            Contact Information
                        </div>
                    </template>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-muted text-sm">Contact Name</span>
                            <span class="font-medium">{{ contactName }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-muted text-sm">Contact Number</span>
                            <span class="font-medium">{{ contactNumber }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-muted text-sm">Total Guests Expected</span>
                            <span class="font-medium">{{ group.totalGuests }}</span>
                        </div>
                    </div>
                </UCard>

                <!-- Stay Info -->
                <UCard variant="subtle" class="shadow-sm">
                    <template #header>
                        <div class="flex items-center gap-2 font-semibold text-lg">
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

                        <div class="pt-4 border-t border-default">
                            <div class="text-sm text-muted mb-1">Duration</div>
                            <div class="font-medium">{{ nights }} Night{{ nights > 1 ? 's' : '' }}</div>
                        </div>
                    </div>
                </UCard>
            </div>

            <!-- Management Tabs -->
            <UCard variant="subtle" class="shadow-sm">
                <UTabs :items="items" v-model="selectedTab" class="w-full">

                    <!-- Blocks Tab -->
                    <template #item="{ item }">
                        <div v-if="item.value === 'blocks'" class="p-4 space-y-6">

                            <!-- Add Block Control -->
                            <div
                                class="flex flex-col sm:flex-row gap-4 items-end bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg border border-default">
                                <div class="flex-1">
                                    <label class="block text-sm font-medium mb-1">Add Room to Block</label>
                                    <USelect v-model.number="selectedRoomToAdd" :items="availableRoomOptions"
                                        placeholder="Select a room..." class="w-full" />
                                </div>
                                <UButton label="Block Room" icon="i-lucide-plus" color="primary"
                                    :disabled="!selectedRoomToAdd" @click="addBlock" />
                            </div>

                            <!-- Blocks Table -->
                            <div>
                                <div class="flex justify-between items-center mb-4">
                                    <h3 class="text-lg font-medium">Current Room Blocks</h3>
                                    <UButton label="Reserve All Blocked Rooms" icon="i-lucide-calendar-check"
                                        color="success"
                                        :disabled="blocks.filter(b => b.status === 'Blocked').length === 0"
                                        @click="reserveBlocks" />
                                </div>

                                <UTable :data="blocks" :columns="blockColumns" class="border border-default rounded-md">
                                    <template #empty>
                                        <div class="p-8 text-center text-muted">
                                            No rooms blocked yet. Select a room above to add it to the block.
                                        </div>
                                    </template>
                                </UTable>
                            </div>
                        </div>

                        <!-- Reservations Tab -->
                        <div v-else-if="item.value === 'reservations'" class="p-4">
                            <div v-if="groupReservations.length === 0"
                                class="p-12 text-center text-muted border border-default rounded-md bg-neutral-50 dark:bg-neutral-900">
                                <UIcon name="i-lucide-calendar-x" class="size-12 mb-4 text-neutral-400 mx-auto" />
                                <p class="text-lg">No reservations generated yet.</p>
                                <p class="text-sm mt-1">Go to the Room Blocks tab to block rooms and convert them into
                                    reservations.</p>
                            </div>

                            <div v-else class="space-y-4">
                                <div v-for="res in groupReservations" :key="res.id"
                                    class="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-4 border border-default rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                                    <div class="flex items-center gap-4">
                                        <div
                                            class="size-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold font-mono">
                                            {{roomsStore.rooms.find(r => r.id === res.roomId)?.number || '?'}}
                                        </div>
                                        <div>
                                            <div class="font-mono text-sm font-bold">{{ res.bookingRef }}</div>
                                            <div class="flex items-center gap-2 mt-1">
                                                <StatusBadge :status="res.status" />
                                            </div>
                                        </div>
                                    </div>

                                    <div class="flex-1 sm:max-w-xs w-full">
                                        <template v-if="res.guestId">
                                            <div
                                                class="flex items-center gap-3 border border-default p-2 rounded-md bg-white dark:bg-neutral-950">
                                                <GuestAvatar :guest="guestsStore.getById(res.guestId)!" size="sm" />
                                                <div class="flex-1 min-w-0">
                                                    <p class="text-sm font-semibold truncate">{{
                                                        guestsStore.getFullName(guestsStore.getById(res.guestId)!) }}
                                                    </p>
                                                </div>
                                            </div>
                                        </template>
                                        <template v-else>
                                            <USelect :items="guestAssignmentOptions" placeholder="Assign Guest..."
                                                class="w-full"
                                                @update:modelValue="(val) => assignGuest(res.id, Number(val))" />
                                        </template>
                                    </div>

                                    <div class="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                        <UButton label="View" icon="i-lucide-eye" color="neutral" variant="soft"
                                            @click="router.push(`/frontdesk/bookings/${res.id}`)"
                                            class="flex-1 sm:flex-none" />
                                        <UButton v-if="res.status === 'Pending' || res.status === 'Confirmed'"
                                            label="Check-In" icon="i-lucide-log-in" color="primary"
                                            @click="router.push(`/frontdesk/checkin?id=${res.id}`)"
                                            class="flex-1 sm:flex-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </UTabs>
            </UCard>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-20">
            <UIcon name="i-lucide-file-question" class="size-16 text-neutral-300 mb-4" />
            <h2 class="text-xl font-bold">Group Not Found</h2>
            <p class="text-muted mt-2 mb-6">The requested group booking could not be found.</p>
            <UButton label="Return to Groups" color="primary" @click="router.push('/frontdesk/groups')" />
        </div>
    </template>
</template>
