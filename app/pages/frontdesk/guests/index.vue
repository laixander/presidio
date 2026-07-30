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
import GuestDetailsDrawer from '~/components/GuestDetailsDrawer.vue'
import { useRouter } from 'vue-router'

// ============================================================================
// Page Configuration
// ============================================================================
definePageMeta({
    title: 'Guests',
    layout: 'dashboard',
    isTable: true,
    // headerActions: [
    //     { label: 'Add Guest', icon: 'i-lucide-plus', event: 'addGuest', color: 'primary' }
    // ]
})

// ============================================================================
// Composables & State
// ============================================================================
const guestsStore = useGuestsStore()
const events = useEvents()
const overlay = useOverlay()
const appLogger = useAppLogger()
const toast   = useAppToast()
const router  = useRouter()

const guestModal   = overlay.create(GuestModal)
const confirmModal = overlay.create(ConfirmationModal)

const isAddGuestOpen = ref(false)
const isDrawerOpen = ref(false)
const isDetailsDrawerOpen = ref(false)
const selectedGuest = ref<Guest | null>(null)

// ============================================================================
// Event Listeners
// ============================================================================
events.on('addGuest', () => {
    isAddGuestOpen.value = true
})

events.on('viewGuestLogs', () => {
    isDrawerOpen.value = true
})

// ============================================================================
// Methods
// ============================================================================

async function handleAddGuest(guestData: Omit<Guest, 'id'>) {
    guestsStore.addGuest(guestData)
    appLogger.logGuestAdded(`${guestData.firstName} ${guestData.lastName}`)
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
                    appLogger.logGuestUpdated(`${guestData.firstName} ${guestData.lastName}`)
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
            appLogger.logGuestDeleted(`${guest.firstName} ${guest.lastName}`)
            toast.success('Guest Deleted', `${guest.firstName} ${guest.lastName} has been removed from the directory.`)
        }
    })
}

// ============================================================================
// Table Configuration
// ============================================================================

const handleViewDetails = (guest: Guest) => {
    selectedGuest.value = guest
    isDetailsDrawerOpen.value = true
}

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
    }
]

const table = useTemplateRef('table')
const globalFilter = ref('')
const columnVisibility = ref({
    id: false
})
const viewMode = ref<'list' | 'card'>('list')
const authStore = useDemoAuth()

const filteredGuests = computed(() => {
    if (!globalFilter.value) return guestsStore.guests
    const search = globalFilter.value.toLowerCase()
    return guestsStore.guests.filter(guest => {
        return (
            guest.firstName.toLowerCase().includes(search) ||
            guest.lastName.toLowerCase().includes(search) ||
            (guest.email && guest.email.toLowerCase().includes(search)) ||
            (guest.phone && guest.phone.toLowerCase().includes(search)) ||
            (guest.company && guest.company.toLowerCase().includes(search))
        )
    })
})

const isAuthorized = computed(() => ['Administrator', 'Front Desk'].includes(authStore.currentRole.value ?? ''))
</script>

<template>
    <AuthGate v-if="!isAuthorized" title="Access Denied" description="You must be Front Desk staff or an Administrator to access the Guest Directory." icon="i-lucide-lock" />

    <template v-else>
        <UPageCard title="Guest Directory"
            description="Manage guest profiles, history, and VIP statuses."
            variant="naked" orientation="horizontal" class="border-b border-default rounded-none p-4 sm:p-6">
            <div class="flex justify-end gap-2 flex-1">
                <TableGlobalFilter v-model="globalFilter" placeholder="Search guests..." />
                <TableColumnToggle v-if="viewMode === 'list'" :table="table" />
                <UTabs :items="[{ icon: 'i-lucide-grid-3x3', value: 'card' }, { icon: 'i-lucide-list', value: 'list' }]"
                    v-model="viewMode" :content="false" size="xs" />
            </div>
        </UPageCard>

        <ClientOnly>
            <Teleport to="#header-actions-teleport">
                <UButton icon="i-lucide-history" color="neutral" variant="soft" @click="events.emit('viewGuestLogs')">
                    Recent Activity
                </UButton>
                <UButton icon="i-lucide-plus" color="primary" @click="events.emit('addGuest')">
                    Add Guest
                </UButton>
            </Teleport>
        </ClientOnly>

        <UTable v-if="viewMode === 'list'" sticky ref="table" :data="guestsStore.guests" :columns="columns"
            :loading="guestsStore.isLoading" v-model:column-visibility="columnVisibility"
            v-model:global-filter="globalFilter" :ui="{ th: 'sm:px-6', td: 'sm:px-6 cursor-pointer', tr: { base: 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer' } }" class="flex-1 scrollbar" @select="(e, row) => handleViewDetails(row.original)">
            <template #empty>
                <Empty :loading="guestsStore.isLoading" title="No guests found"
                    description="There are currently no guests to display. Add a new guest to get started."
                    icon="i-lucide-users" loading-title="Loading Guests"
                    loading-description="Please wait while we fetch the guest directory.">
                    <template #action>
                        <UButton label="Add First Guest" icon="i-lucide-plus" color="primary" size="lg"
                            @click="events.emit('addGuest')" />
                    </template>
                </Empty>
            </template>
        </UTable>

        <!-- Card grid view -->
        <div v-else class="flex-1 overflow-y-auto scrollbar p-4 sm:p-6">
            <Empty v-if="!guestsStore.isLoading && !filteredGuests.length"
                title="No guests found"
                description="There are currently no guests to display. Add a new guest to get started."
                icon="i-lucide-users">
                <template #action>
                    <UButton label="Add First Guest" icon="i-lucide-plus" color="primary" size="lg"
                        @click="events.emit('addGuest')" />
                </template>
            </Empty>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <UCard v-for="guest in filteredGuests" :key="guest.id" variant="subtle"
                    class="hover:ring-2 hover:ring-primary transition-all duration-200 shadow-sm cursor-pointer"
                    @click="handleViewDetails(guest)">
                    <template #header>
                        <div class="flex items-start justify-between">
                            <div class="flex items-center gap-3">
                                <GuestAvatar :guest="guest" size="md" />
                                <div>
                                    <h3 class="text-lg font-bold">{{ guestsStore.getFullName(guest) }}</h3>
                                    <p class="text-xs text-muted">{{ guest.company || 'No Company' }}</p>
                                </div>
                            </div>
                        </div>
                    </template>

                    <div class="*:py-2 *:first:pt-0 *:last:pb-0 *:flex *:items-center *:justify-between text-sm divide-y divide-default">
                        <div>
                            <span class="text-muted">VIP Status</span>
                            <UBadge v-if="guest.isVip" label="VIP" color="warning" variant="subtle" size="sm" />
                            <span v-else class="text-default">Standard</span>
                        </div>
                        <div>
                            <span class="text-muted">Email</span>
                            <span class="truncate max-w-[150px]" :title="guest.email">{{ guest.email || 'N/A' }}</span>
                        </div>
                        <div>
                            <span class="text-muted">Phone</span>
                            <span>{{ guest.phone || 'N/A' }}</span>
                        </div>
                    </div>
                </UCard>
            </div>
        </div>

        <GuestModal v-model:open="isAddGuestOpen" @submit="handleAddGuest" />

        <GuestDetailsDrawer 
            v-model:open="isDetailsDrawerOpen" 
            :guest="selectedGuest" 
            @view-profile="(g) => router.push(`/frontdesk/guests/${g.id}`)"
            @edit="handleEditGuest" 
            @delete="handleDeleteGuest" 
        />

        <LogsDrawer v-model:open="isDrawerOpen" namespace="guests" />
    </template>
</template>
