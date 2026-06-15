<script setup lang="ts">
/**
 * ============================================================================
 * Page: Group Reservations Directory (/frontdesk/groups)
 * ============================================================================
 * This page acts as the central hub for all group bookings.
 */
import { h, ref, useTemplateRef, computed } from 'vue'
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import { UButton, UDropdownMenu } from '#components'

import type { GroupReservation } from '~/types'
import StatusBadge from '~/components/StatusBadge.vue'

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
    <AuthGate v-if="!isAuthorized" title="Access Denied" description="You must be Front Desk staff or an Administrator to access Group Bookings." icon="i-lucide-lock" />

    <template v-else>
        <UPageCard title="Group Bookings"
            description="Manage corporate bookings, events, and room blocks."
            variant="naked" orientation="horizontal" class="border-b border-default rounded-none p-4 sm:p-6">
            <div class="flex justify-end gap-2 flex-1">
                <TableGlobalFilter v-model="globalFilter" placeholder="Search groups..." />
                <TableColumnToggle :table="table" />
            </div>
        </UPageCard>

        <ClientOnly>
            <Teleport to="#header-actions-teleport">
                <UButton icon="i-lucide-plus" color="primary" @click="events.emit('newGroupBooking')">New Group</UButton>
            </Teleport>
        </ClientOnly>

        <UTable sticky ref="table" :data="groupsStore.groups" :columns="columns"
            :loading="groupsStore.isLoading" v-model:column-visibility="columnVisibility"
            v-model:global-filter="globalFilter" :ui="{ th: 'sm:px-6', td: 'sm:px-6' }" class="flex-1 scrollbar">
            <template #empty>
                <Empty :loading="groupsStore.isLoading" title="No group bookings found"
                    description="There are currently no group reservations to display."
                    icon="i-lucide-library" loading-title="Loading Group Bookings"
                    loading-description="Please wait while we fetch the group bookings.">
                    <template #action>
                        <UButton label="Create Group Booking" icon="i-lucide-plus" color="primary" size="lg"
                            @click="router.push('/frontdesk/groups/new')" />
                    </template>
                </Empty>
            </template>
        </UTable>
    </template>
</template>
