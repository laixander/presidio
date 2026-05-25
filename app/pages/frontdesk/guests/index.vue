<script setup lang="ts">
// ============================================================================
// Imports
// ============================================================================
import { h, ref, useTemplateRef } from 'vue'
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import { useOverlay } from '#imports'
import { UButton, UDropdownMenu, UIcon } from '#components'

import type { Guest } from '~/types'
import GuestAvatar from '~/components/GuestAvatar.vue'
import GuestModal from '~/components/GuestModal.vue'
import ConfirmationModal from '~/components/ConfirmationModal.vue'

// ============================================================================
// Page Configuration
// ============================================================================
definePageMeta({
    title: 'Guests',
    layout: 'dashboard',
    isTable: true,
    headerActions: [
        { label: 'Add Guest', icon: 'i-lucide-plus', event: 'addGuest', color: 'primary' }
    ]
})

// ============================================================================
// Composables & State
// ============================================================================
const guestsStore = useGuestsStore()
const events = useEvents()
const overlay = useOverlay()
const logger  = useLogger('guests')
const toast   = useAppToast()

const guestModal   = overlay.create(GuestModal)
const confirmModal = overlay.create(ConfirmationModal)

const isAddGuestOpen = ref(false)

// ============================================================================
// Event Listeners
// ============================================================================
events.on('addGuest', () => {
    isAddGuestOpen.value = true
})

// ============================================================================
// Methods
// ============================================================================

async function handleAddGuest(guestData: Omit<Guest, 'id'>) {
    guestsStore.addGuest(guestData)
    logger.addLog(`Added guest: ${guestData.firstName} ${guestData.lastName}`, 'Created', 'success')
    toast.success('Guest Added', `${guestData.firstName} ${guestData.lastName} has been added to the directory.`)
    isAddGuestOpen.value = false
}

function handleEditGuest(guest: Guest) {
    guestModal.open({
        guest,
        title: 'Edit Guest Profile',
        onSubmit: async (guestData: Omit<Guest, 'id'>) => {
            confirmModal.open({
                title: 'Confirm Changes',
                description: `Are you sure you want to save changes to ${guest.firstName} ${guest.lastName}'s profile?`,
                confirmLabel: 'Save Changes',
                confirmColor: 'warning',
                onConfirm: () => {
                    guestsStore.updateGuest(guest.id, guestData)
                    logger.addLog(`Updated guest: ${guestData.firstName} ${guestData.lastName}`, 'Updated', 'warn')
                    toast.success('Guest Updated', `${guestData.firstName} ${guestData.lastName}'s profile has been updated.`)
                }
            })
        }
    })
}

function handleDeleteGuest(guest: Guest) {
    confirmModal.open({
        title: 'Delete Guest Profile',
        description: `Are you sure you want to delete ${guest.firstName} ${guest.lastName}? This action cannot be undone.`,
        confirmLabel: 'Delete',
        confirmColor: 'error',
        onConfirm: () => {
            guestsStore.deleteGuest(guest.id)
            logger.addLog(`Deleted guest: ${guest.firstName} ${guest.lastName}`, 'Deleted', 'error')
            toast.success('Guest Deleted', `${guest.firstName} ${guest.lastName} has been removed from the directory.`)
        }
    })
}

// ============================================================================
// Table Configuration
// ============================================================================

const columns: TableColumn<Guest>[] = [
    {
        accessorKey: 'id',
        header: getSortableHeader('ID'),
        cell: ({ row }) => `${row.getValue('id')}`
    },
    {
        id: 'name',
        header: getSortableHeader('Name'),
        accessorFn: (row) => guestsStore.getFullName(row),
        cell: ({ row }) => {
            return h(GuestAvatar, {
                guest: row.original,
                showDetails: true,
                size: 'sm'
            })
        }
    },
    {
        id: 'contact',
        header: 'Contact',
        cell: ({ row }) => {
            const email = row.original.email
            const phone = row.original.phone
            if (!email && !phone) return h('span', { class: 'text-muted italic' }, 'N/A')
            
            return h('div', { class: 'flex flex-col text-sm' }, [
                email ? h('div', { class: 'flex items-center gap-1.5' }, [
                    h(UIcon, { name: 'i-lucide-mail', class: 'w-3 h-3 text-muted' }),
                    h('span', {}, email)
                ]) : null,
                phone ? h('div', { class: 'flex items-center gap-1.5 mt-0.5' }, [
                    h(UIcon, { name: 'i-lucide-phone', class: 'w-3 h-3 text-muted' }),
                    h('span', {}, phone)
                ]) : null
            ])
        }
    },
    {
        accessorKey: 'company',
        header: getSortableHeader('Company'),
        cell: ({ row }) => {
            const company = row.getValue('company') as string
            return company ? company : h('span', { class: 'text-muted italic' }, 'None')
        }
    },
    {
        id: 'actions',
        meta: { class: { td: 'text-right' } },
        cell: ({ row }) => {
            const items: DropdownMenuItem[][] = [
                [
                    {
                        label: 'Edit Profile',
                        icon: 'i-lucide-edit',
                        onSelect: () => handleEditGuest(row.original)
                    }
                ],
                [
                    {
                        label: 'Delete',
                        icon: 'i-lucide-trash',
                        color: 'error',
                        onSelect: () => handleDeleteGuest(row.original)
                    }
                ]
            ]

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
const columnVisibility = ref({
    id: false
})
</script>

<template>
    <UPageCard title="Guest Directory"
        description="Manage guest profiles, history, and VIP statuses."
        variant="naked" orientation="horizontal" class="border-b border-default rounded-none p-4 sm:p-6">
        <div class="flex justify-end gap-2 flex-1">
            <TableGlobalFilter v-model="globalFilter" placeholder="Search guests..." />
            <TableColumnToggle :table="table" />
        </div>
    </UPageCard>

    <UTable sticky ref="table" :data="guestsStore.guests" :columns="columns"
        :loading="guestsStore.isLoading" v-model:column-visibility="columnVisibility"
        v-model:global-filter="globalFilter" :ui="{ th: 'sm:px-6', td: 'sm:px-6' }" class="flex-1 scrollbar">
        <template #empty>
            <Empty :loading="guestsStore.isLoading" title="No guests found"
                description="Your guest directory is empty. Click 'Add Guest' to create a new profile."
                icon="i-lucide-users" loading-title="Loading Guests"
                loading-description="Please wait while we fetch the guest directory.">
                <template #action>
                    <UButton label="Add First Guest" icon="i-lucide-plus" color="primary" size="lg"
                        @click="events.emit('addGuest')" />
                </template>
            </Empty>
        </template>
    </UTable>

    <GuestModal v-model:open="isAddGuestOpen" @submit="handleAddGuest" />
</template>
