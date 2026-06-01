<script setup lang="ts">
import { h, ref, useTemplateRef, computed } from 'vue'
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import { useOverlay } from '#imports'
import { UButton, UDropdownMenu, UIcon, UBadge } from '#components'

import type { StaffUser } from '~/types'
import UserModal from '~/components/UserModal.vue'
import ConfirmationModal from '~/components/ConfirmationModal.vue'

definePageMeta({
    title: 'User Management',
    layout: 'dashboard',
    isTable: true,
    headerActions: [
        { label: 'Add User', icon: 'i-lucide-plus', event: 'addUser', color: 'primary' }
    ]
})

const usersStore = useUsersStore()
const events = useEvents()
const overlay = useOverlay()
const toast = useAppToast()
const authStore = useDemoAuth()

const isAuthorized = computed(() => authStore.currentRole.value === 'Administrator')

const userModal = overlay.create(UserModal)
const confirmModal = overlay.create(ConfirmationModal)

// ============================================================================
// Event Listeners
// ============================================================================
events.on('addUser', () => {
    userModal.open({
        title: 'Add New User',
        onSubmit: (userData: Omit<StaffUser, 'id'>) => {
            usersStore.addUser(userData)
            toast.success('User Added', `${userData.name} has been added successfully.`)
        }
    })
})

// ============================================================================
// Methods
// ============================================================================
const handleEditUser = (user: StaffUser) => {
    userModal.open({
        user,
        title: 'Edit User',
        onSubmit: (userData: Omit<StaffUser, 'id'>) => {
            usersStore.updateUser(user.id, userData)
            toast.success('User Updated', `${userData.name}'s profile has been updated.`)
        }
    })
}

const handleDeleteUser = (user: StaffUser) => {
    confirmModal.open({
        title: 'Delete User',
        description: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
        confirmLabel: 'Delete',
        confirmColor: 'error',
        onConfirm: () => {
            usersStore.deleteUser(user.id)
            toast.success('User Deleted', `${user.name} has been removed.`)
        }
    })
}

// ============================================================================
// Table Configuration
// ============================================================================
const columns: TableColumn<StaffUser>[] = [
    { accessorKey: 'id', header: 'ID' },
    {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => h('div', { class: 'font-medium' }, row.getValue('name'))
    },
    { accessorKey: 'email', header: 'Email' },
    {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => h(UBadge, { color: 'neutral', variant: 'subtle' }, () => row.getValue('role') as string)
    },
    {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => {
            const active = row.getValue('isActive') as boolean
            return h(UBadge, { color: active ? 'success' : 'error', variant: 'subtle' }, () => active ? 'Active' : 'Inactive')
        }
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const items: DropdownMenuItem[][] = [
                [
                    { label: 'Edit', icon: 'i-lucide-edit', onSelect: () => handleEditUser(row.original) }
                ],
                [
                    { label: 'Delete', icon: 'i-lucide-trash', color: 'error', onSelect: () => handleDeleteUser(row.original) }
                ]
            ]
            return h(UDropdownMenu, { items, content: { align: 'end' }, size: 'sm' }, {
                default: () => h(UButton, { icon: 'i-lucide-ellipsis-vertical', color: 'neutral', variant: 'ghost', size: 'sm' })
            })
        }
    }
]

const globalFilter = ref('')
</script>

<template>
    <AuthGate v-if="!isAuthorized" title="Access Denied" description="You must be an Administrator to manage users." icon="i-lucide-lock" />

    <template v-else>
        <UPageCard title="User Management"
            description="Manage staff accounts, roles, and system access."
            variant="naked" orientation="horizontal" class="border-b border-default rounded-none p-4 sm:p-6">
            <div class="flex justify-end gap-2 flex-1">
                <UInput v-model="globalFilter" icon="i-lucide-search" placeholder="Search users..." class="w-full sm:w-64" />
            </div>
        </UPageCard>

        <UTable :data="usersStore.users" :columns="columns" :global-filter="globalFilter" :ui="{ th: 'sm:px-6', td: 'sm:px-6' }" class="flex-1 overflow-y-auto scrollbar" />
    </template>
</template>
