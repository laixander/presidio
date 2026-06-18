<script setup lang="ts">
/**
 * ============================================================================
 * Page: Group Reservations Directory (/frontdesk/groups)
 * ============================================================================
 * This page acts as the central hub for all group bookings.
 */
import { h, ref, useTemplateRef, computed } from 'vue'
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import { UButton, UDropdownMenu, UIcon } from '#components'

import type { GroupReservation } from '~/types'
import StatusBadge from '~/components/StatusBadge.vue'
import GuestAvatar from '~/components/GuestAvatar.vue'
import ConfirmationModal from '~/components/ConfirmationModal.vue'

definePageMeta({
    title: 'Group Bookings',
    layout: 'dashboard',
    isTable: true,
})

const groupsStore = useGroupsStore()
const guestsStore = useGuestsStore()
const router = useRouter()
const events = useEvents()

events.on('newGroupBooking', () => {
    router.push('/frontdesk/groups/new')
})

// ============================================================================
// Table Configuration
// ============================================================================
const columns: TableColumn<GroupReservation>[] = [
    {
        accessorKey: 'groupName',
        header: 'Group Name',
        cell: ({ row }) => h('span', { class: 'font-semibold' }, row.original.groupName)
    },
    {
        id: 'contact',
        header: 'Contact',
        cell: ({ row }) => {
            const g = row.original
            if (g.contactGuestId) {
                const guest = guestsStore.getById(g.contactGuestId)
                return h('span', { class: 'text-sm' }, guest ? guestsStore.getFullName(guest) : 'Unknown Guest')
            }
            return h('span', { class: 'text-sm' }, g.contactPerson || 'N/A')
        }
    },
    {
        accessorKey: 'totalGuests',
        header: 'Guests',
        cell: ({ row }) => h('span', { class: 'text-sm' }, row.original.totalGuests)
    },
    {
        accessorKey: 'checkInDate',
        header: 'Check-In',
        cell: ({ row }) => h('span', { class: 'text-sm' }, row.original.checkInDate)
    },
    {
        accessorKey: 'checkOutDate',
        header: 'Check-Out',
        cell: ({ row }) => h('span', { class: 'text-sm' }, row.original.checkOutDate)
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
            const res = row.original

            const group: DropdownMenuItem[] = [
                {
                    label: 'View Details',
                    icon: 'i-lucide-eye',
                    onSelect: () => router.push(`/frontdesk/groups/${res.id}`)
                }
            ]

            if (res.status !== 'Cancelled' && res.status !== 'Done') {
                group.push({
                    label: 'Cancel Group',
                    icon: 'i-lucide-x-circle',
                    color: 'error',
                    onSelect: () => {
                        groupToCancel.value = res.id
                        isCancelModalOpen.value = true
                    }
                })
            }

            const items: DropdownMenuItem[][] = [group]

            return h(UDropdownMenu, {
                items,
                content: { align: 'end' },
                size: 'sm'
            }, {
                default: () => h(UButton, {
                    icon: 'i-lucide-ellipsis-vertical',
                    color: 'neutral',
                    variant: 'ghost',
                    size: 'sm'
                })
            })
        }
    }
]

const table = useTemplateRef('table')
const globalFilter = ref('')
const columnVisibility = ref({})
const authStore = useDemoAuth()
const isAuthorized = computed(() => ['Administrator', 'Front Desk'].includes(authStore.currentRole.value ?? ''))

const toast = useAppToast()
const isCancelModalOpen = ref(false)
const groupToCancel = ref<number | null>(null)

const confirmCancel = () => {
    if (groupToCancel.value) {
        groupsStore.updateGroup(groupToCancel.value, { status: 'Cancelled' })
        const blocks = groupsStore.getBlocksForGroup(groupToCancel.value)
        blocks.forEach(b => {
            if (b.status === 'Blocked') {
                groupsStore.removeRoomBlock(b.id)
            }
        })
        toast.success('Group Cancelled', 'The group reservation and all pending blocks have been cancelled.')
        groupToCancel.value = null
    }
}

const viewMode = ref<'list' | 'card'>('list')

const filteredGroups = computed(() => {
    if (!globalFilter.value) return groupsStore.groups
    const q = globalFilter.value.toLowerCase()
    return groupsStore.groups.filter(res => {
        return res.groupName.toLowerCase().includes(q) || (res.contactPerson && res.contactPerson.toLowerCase().includes(q))
    })
})

const getContactName = (res: GroupReservation) => {
    if (res.contactGuestId) {
        const guest = guestsStore.getById(res.contactGuestId)
        return guest ? guestsStore.getFullName(guest) : 'Unknown Guest'
    }
    return res.contactPerson || 'N/A'
}
</script>

<template>
    <AuthGate v-if="!isAuthorized" title="Access Denied"
        description="You must be Front Desk staff or an Administrator to access Group Bookings." icon="i-lucide-lock" />

    <template v-else>
        <UPageCard title="Group Bookings" description="Manage corporate bookings, events, and room blocks."
            variant="naked" orientation="horizontal" class="border-b border-default rounded-none p-4 sm:p-6">
            <div class="flex justify-end gap-2 flex-1">
                <TableGlobalFilter v-model="globalFilter" placeholder="Search groups..." />
                <TableColumnToggle v-if="viewMode === 'list'" :table="table" />
                <UTabs :items="[{ icon: 'i-lucide-grid-3x3', value: 'card' }, { icon: 'i-lucide-list', value: 'list' }]"
                    v-model="viewMode" :content="false" size="xs" />
            </div>
        </UPageCard>

        <ClientOnly>
            <Teleport to="#header-actions-teleport">
                <UButton icon="i-lucide-plus" color="primary" @click="events.emit('newGroupBooking')">New Group
                </UButton>
            </Teleport>
        </ClientOnly>

        <UTable v-if="viewMode === 'list'" sticky ref="table" :data="groupsStore.groups" :columns="columns"
            :loading="groupsStore.isLoading" v-model:column-visibility="columnVisibility"
            v-model:global-filter="globalFilter" :ui="{ th: 'sm:px-6', td: 'sm:px-6' }" class="flex-1 scrollbar">
            <template #empty>
                <Empty :loading="groupsStore.isLoading" title="No group bookings found"
                    description="There are currently no group reservations to display." icon="i-lucide-library"
                    loading-title="Loading Group Bookings"
                    loading-description="Please wait while we fetch the group bookings.">
                    <template #action>
                        <UButton label="Create Group Booking" icon="i-lucide-plus" color="primary" size="lg"
                            @click="router.push('/frontdesk/groups/new')" />
                    </template>
                </Empty>
            </template>
        </UTable>

        <!-- Card Grid View -->
        <div v-else class="flex-1 overflow-y-auto scrollbar p-4 sm:p-6">
            <Empty v-if="!groupsStore.isLoading && !filteredGroups.length" title="No group bookings found"
                description="There are currently no group reservations to display." icon="i-lucide-library">
                <template #action>
                    <UButton label="Create Group Booking" icon="i-lucide-plus" color="primary" size="lg"
                        @click="router.push('/frontdesk/groups/new')" />
                </template>
            </Empty>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <UCard v-for="res in filteredGroups" :key="res.id" variant="subtle"
                    class="hover:ring-2 hover:ring-primary transition-all duration-200 shadow-sm flex flex-col h-full"
                    :ui="{ body: 'flex-1', header: 'flex items-start justify-between gap-2' }">
                    <template #header>
                        <div class="w-full overflow-hidden space-y-1">
                            <h3 class="text-sm font-bold font-mono tracking-wider truncate">
                                {{ res.groupName }}
                            </h3>
                            <StatusBadge :status="res.status" class="mt-1" />
                        </div>

                        <UDropdownMenu :items="[
                            [
                                { label: 'View Details', icon: 'i-lucide-eye', onSelect: () => router.push(`/frontdesk/groups/${res.id}`) }
                            ],
                            [
                                ...(res.status !== 'Cancelled' && res.status !== 'Done' ? [{
                                    label: 'Cancel Group', icon: 'i-lucide-x-circle', color: 'error' as const, onSelect: () => {
                                        groupToCancel = res.id; isCancelModalOpen = true
                                    }
                                }] : [])
                            ]
                        ]" :content="{ align: 'end' }" size="sm">
                            <UButton icon="i-lucide-more-vertical" color="neutral" variant="ghost" size="sm" />
                        </UDropdownMenu>
                    </template>

                    <div class="space-y-4">
                        <div class="flex items-center gap-3">
                            <GuestAvatar v-if="res.contactGuestId && guestsStore.getById(res.contactGuestId)"
                                :guest="guestsStore.getById(res.contactGuestId)!" size="sm" />
                            <div v-else
                                class="size-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                                <UIcon name="i-lucide-users" class="size-4 text-neutral-500" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-semibold truncate">{{ getContactName(res) }}</p>
                            </div>
                        </div>

                        <div
                            class="*:py-2 *:first:pt-0 *:last:pb-0 *:flex *:items-center *:justify-between text-sm divide-y divide-default">
                            <div>
                                <span class="text-muted">Check-In</span>
                                <span>{{ res.checkInDate }}</span>
                            </div>
                            <div>
                                <span class="text-muted">Check-Out</span>
                                <span>{{ res.checkOutDate }}</span>
                            </div>
                            <div>
                                <span class="text-muted">Guests</span>
                                <span>{{ res.totalGuests }}</span>
                            </div>
                        </div>
                    </div>
                </UCard>
            </div>
        </div>

        <ConfirmationModal v-model:open="isCancelModalOpen" title="Cancel Group Booking?"
            description="This will cancel the group booking and release all associated pending room blocks. Confirmed reservations will not be affected. This action cannot be undone."
            confirm-label="Yes, Cancel Group" cancel-label="No, Keep It" confirm-color="error"
            @confirm="confirmCancel" />
    </template>
</template>
