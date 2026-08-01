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
import GroupModal from '~/components/GroupModal.vue'
import type { TableColumn } from '@nuxt/ui'
import type { RoomBlock, Reservation, GroupReservation } from '~/types'

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

const isEditModalOpen = ref(false)
function onEditSubmit(data: Partial<GroupReservation>) {
    if (!group.value) return
    groupsStore.updateGroup(group.value.id, data)
    toast.success('Group Updated', 'The group details have been updated successfully.')
}

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
    { label: 'Room Blocks', value: 'blocks', slot: 'blocks', icon: 'i-lucide-layout-grid' },
    { label: 'Reservations', value: 'reservations', slot: 'reservations', icon: 'i-lucide-calendar-check' }
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

const selectedGuestsToAssign = reactive<Record<number, any>>({})

const assignGuest = (reservationId: number, guestId: number) => {
    const res = reservationsStore.getById(reservationId)
    if (!res) return
    const guests = [...res.guests]
    if (!guests.some(g => g.guestId === guestId)) {
        guests.push({ guestId, isPrimary: guests.length === 0 })
        reservationsStore.updateReservation(reservationId, { guests })
        toast.success('Guest Assigned', 'The guest has been successfully assigned to the reservation.')
    }
}

const unassignGuest = (reservationId: number, guestId: number) => {
    const res = reservationsStore.getById(reservationId)
    if (!res) return
    let guests = (res.guests || []).filter(g => g.guestId !== guestId)
    if (guests.length > 0 && !guests.some(g => g.isPrimary)) {
        guests[0].isPrimary = true
    }
    reservationsStore.updateReservation(reservationId, { guests })
    toast.success('Guest Removed', 'The guest has been removed from the reservation.')
}

const setPrimaryGuest = (reservationId: number, guestId: number) => {
    const res = reservationsStore.getById(reservationId)
    if (!res) return
    const guests = res.guests.map(g => ({ ...g, isPrimary: g.guestId === guestId }))
    reservationsStore.updateReservation(reservationId, { guests })
}

</script>

<template>
    <AuthGate v-if="!isAuthorized" title="Access Denied"
        description="You must be Front Desk staff or an Administrator to view Group Booking details."
        icon="i-lucide-lock" />

    <template v-else>
        <div v-if="group" class="space-y-6">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div class="flex items-center gap-4">
                    <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost"
                        @click="router.push('/frontdesk/bookings/groups')" />
                    <div>
                        <div class="flex items-center gap-3">
                            <h1 class="text-2xl font-bold">{{ group.groupName }}</h1>
                            <span class="text-sm font-mono text-muted bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">{{ group.bookingRef }}</span>
                            <StatusBadge :status="group.status" />
                        </div>
                        <p class="text-muted text-sm mt-1">Group Booking Details</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <UButton label="Edit Details" icon="i-lucide-pencil" color="neutral" variant="soft" @click="isEditModalOpen = true" />
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div class="flex flex-col gap-6">
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
                <UCard variant="subtle" class="shadow-sm md:col-span-2">
                    <UTabs :items="items" v-model="selectedTab" class="w-full" :ui="{ root: 'sm:gap-4' }">

                        <!-- Blocks Tab -->
                        <template #blocks>
                            <div class="space-y-6">
                                <!-- Add Block Control -->
                                <UCard class="shadow-sm" :ui="{ body: 'sm:p-4' }">
                                    <UFormField label="Available Rooms">
                                        <div class="flex gap-2">
                                            <USelect v-model.number="selectedRoomToAdd" :items="availableRoomOptions"
                                                placeholder="Select a room..." class="w-full" />
                                            <UButton label="Block Room" icon="i-lucide-plus" color="primary"
                                                :disabled="!selectedRoomToAdd" @click="addBlock" />
                                        </div>
                                    </UFormField>
                                </UCard>

                                <!-- Blocks Table -->
                                <div>
                                    <div class="flex justify-between items-center mb-4">
                                        <h3 class="font-semibold">Current Room Blocks</h3>
                                        <UButton label="Reserve All Blocked Rooms" icon="i-lucide-calendar-check"
                                            color="success"
                                            :disabled="blocks.filter(b => b.status === 'Blocked').length === 0"
                                            @click="reserveBlocks" />
                                    </div>
                                    <UTable :data="blocks" :columns="blockColumns"
                                        class="ring ring-default rounded-md bg-default shadow-sm">
                                        <template #empty>
                                            <Empty title="No rooms blocked yet."
                                                description="Select a room above to add it to the block."
                                                icon="i-lucide-bed" />
                                        </template>
                                    </UTable>
                                </div>
                            </div>
                        </template>

                        <!-- Reservations Tab -->
                        <template #reservations>
                            <Empty v-if="groupReservations.length === 0" title="No reservations generated yet."
                                description="Go to the Room Blocks tab to block rooms and convert them into reservations."
                                icon="i-lucide-calendar-x" />

                            <div v-else class="space-y-4">
                                <UCard v-for="res in groupReservations" :key="res.id"
                                    :ui="{ body: 'sm:p-4 flex justify-between items-center gap-8' }" class="shadow-sm">
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

                                    <div class="flex-1 w-full space-y-2">
                                        <template v-if="res.guests && res.guests.length > 0">
                                            <div v-for="guest in res.guests" :key="guest.guestId"
                                                class="flex items-center gap-3 border border-default p-2 rounded-md bg-white dark:bg-neutral-950">
                                                <UTooltip :text="guest.isPrimary ? 'Primary Guest' : 'Set as Primary'">
                                                    <UButton icon="i-lucide-star" 
                                                        :color="guest.isPrimary ? 'primary' : 'neutral'" 
                                                        :variant="guest.isPrimary ? 'solid' : 'ghost'" 
                                                        size="xs" 
                                                        class="shrink-0 rounded-full"
                                                        @click="setPrimaryGuest(res.id, guest.guestId)" />
                                                </UTooltip>
                                                <GuestAvatar :guest="guestsStore.getById(guest.guestId)!" size="sm" />
                                                <div class="flex-1 min-w-0">
                                                    <p class="text-sm font-semibold truncate">
                                                        {{ guestsStore.getFullName(guestsStore.getById(guest.guestId)!) }}
                                                    </p>
                                                </div>
                                                <UTooltip text="Remove Guest" v-if="res.status !== 'In-House' && res.status !== 'Done' && res.status !== 'Cancelled'">
                                                    <UButton icon="i-lucide-x" color="error" variant="ghost" size="xs" @click="unassignGuest(res.id, guest.guestId)" class="shrink-0" />
                                                </UTooltip>
                                            </div>
                                        </template>
                                        <div v-if="res.status !== 'In-House' && res.status !== 'Done' && res.status !== 'Cancelled'">
                                            <USelectMenu :key="`select-${res.id}-${(res.guests || []).length}`"
                                                v-model="selectedGuestsToAssign[res.id]"
                                                :items="guestAssignmentOptions.filter(opt => !(res.guests || []).some(g => g.guestId === opt.value))" 
                                                placeholder="Assign guest..."
                                                class="w-full"
                                                @update:modelValue="(val) => { if(val) { assignGuest(res.id, Number(val.value || val)); selectedGuestsToAssign[res.id] = undefined } }" />
                                        </div>
                                    </div>

                                    <div class="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                        <UButton label="View" icon="i-lucide-eye" color="neutral" variant="soft"
                                            @click="router.push(`/frontdesk/bookings/${res.id}`)"
                                            class="flex-1 sm:flex-none" />
                                        <UButton v-if="res.status === 'Pending' || res.status === 'Confirmed'"
                                            label="Check-In" icon="i-lucide-log-in"
                                            @click="router.push(`/frontdesk/checkin?id=${res.id}`)"
                                            class="flex-1 sm:flex-none" />
                                    </div>
                                </UCard>
                            </div>
                        </template>

                    </UTabs>
                </UCard>
            </div>
        </div>

        <Empty v-else title="Group Not Found" description="The requested group booking could not be found."
            icon="i-lucide-file-question">
            <template #action>
                <UButton label="Return to Groups" color="primary" @click="router.push('/frontdesk/bookings/groups')" />
            </template>
        </Empty>

        <GroupModal v-if="group" v-model:open="isEditModalOpen" :group="group" @submit="onEditSubmit" />
    </template>
</template>
