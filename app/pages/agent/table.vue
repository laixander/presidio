<script setup lang="ts">
// ============================================================================
// Imports
// ============================================================================
import { h, ref, useTemplateRef } from 'vue'
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import { useOverlay } from '#imports'
import { UButton, UBadge, UDropdownMenu } from '#components'

// Types
import type { User } from '~/types'

// Components
import UserModal from '~/components/UserModal.vue'
import ConfirmationModal from '~/components/ConfirmationModal.vue'

// ============================================================================
// Page Configuration
// ============================================================================
definePageMeta({
    layout: 'agent',
    title: 'Table',
    isTable: true,
    headerActions: [
        { label: 'History', icon: 'i-lucide-history', event: 'viewLogs', variant: 'soft' },
        { label: 'Add User', icon: 'i-lucide-user-plus', event: 'addUser', color: 'primary' }
    ]
})

// ============================================================================
// Composables & State
// ============================================================================
// Services
const { users, addUser, updateUser, deleteUser, isPending: pending } = useUsers()
const events = useEvents()
const overlay = useOverlay()
const logger = useAppLogger()

// Modals
const userModal = overlay.create(UserModal)
const confirmModal = overlay.create(ConfirmationModal)

// Local State
const isAddUserOpen = ref(false)
const isDrawerOpen = ref(false)

// ============================================================================
// Event Listeners
// ============================================================================
// Global event listeners (e.g., triggered from header actions)
events.on('addUser', () => {
    isAddUserOpen.value = true
})
events.on('viewLogs', () => {
    isDrawerOpen.value = true
})

// ============================================================================
// Methods
// ============================================================================

/**
 * Handle Add User
 * Submits the form data from the Add User modal.
 */
async function handleAddUser(userForm: Omit<User, 'id'>) {
    await addUser(userForm)
    logger.logUserAdded(userForm.name)
    isAddUserOpen.value = false
}

/**
 * Handle Edit User
 * Opens the User Modal pre-filled with user data, then prompts for confirmation before saving.
 */
function handleEditUser(user: User) {
    userModal.open({
        user,
        title: 'Edit User',
        onSubmit: async (userForm: Omit<User, 'id'>) => {
            confirmModal.open({
                title: 'Confirm Changes',
                description: `Are you sure you want to save changes to ${userForm.name}?`,
                confirmLabel: 'Save Changes',
                confirmColor: 'warning',
                onConfirm: () => {
                    updateUser(user.id, userForm)
                    logger.logUserUpdated(userForm.name)
                }
            })
        }
    })
}

/**
 * Handle Delete User
 * Opens a confirmation modal before deleting a user.
 */
function handleDeleteUser(user: User) {
    confirmModal.open({
        title: 'Delete User',
        description: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
        confirmLabel: 'Delete',
        confirmColor: 'error',
        onConfirm: () => {
            deleteUser(user.id)
            logger.logUserDeleted(user.name)
        }
    })
}

/**
 * Handle Toggle User Status
 * Opens a confirmation modal before activating/deactivating a user.
 */
function handleToggleStatus(user: User) {
    const isActivating = user.status === 'Inactive'
    const newStatus = isActivating ? 'Active' : 'Inactive'

    confirmModal.open({
        title: `${isActivating ? 'Activate' : 'Deactivate'} User`,
        description: `Are you sure you want to ${isActivating ? 'activate' : 'deactivate'} ${user.name}?`,
        confirmLabel: isActivating ? 'Activate' : 'Deactivate',
        confirmColor: isActivating ? 'success' : 'warning',
        onConfirm: () => {
            updateUser(user.id, { status: newStatus })
            logger.logUserToggleStatus(user.name, isActivating)
        }
    })
}

// ============================================================================
// Table Configuration
// ============================================================================

/**
 * Column Definitions
 */
const columns: TableColumn<User>[] = [
    {
        accessorKey: 'id',
        header: getSortableHeader('ID'),
        cell: ({ row }) => `${row.getValue('id')}`
    },
    {
        accessorKey: 'name',
        header: getSortableHeader('Name'),
        cell: ({ row }) => `${row.getValue('name')}`,
    },
    {
        accessorKey: 'email',
        header: getSortableHeader('Email'),
        cell: ({ row }) => `${row.getValue('email')}`
    },
    {
        accessorKey: 'role',
        header: getSortableHeader('Role'),
        cell: ({ row }) => {
            const role = row.getValue('role') as string
            const badgeColor = role === 'Admin' ? 'primary' : role === 'Editor' ? 'secondary' : 'success'

            return h(UBadge, {
                label: role,
                color: badgeColor,
                variant: 'subtle'
            })
        }
    },
    {
        accessorKey: 'status',
        header: getSortableHeader('Status'),
        cell: ({ row }) => {
            const status = row.getValue('status') as string
            const badgeColor = status === 'Active' ? 'success' : 'neutral'

            return h(UBadge, {
                label: status,
                color: badgeColor,
                variant: 'subtle'
            })
        }
    },
    {
        id: 'actions',
        meta: {
            class: {
                td: 'text-right'
            }
        },
        cell: ({ row }) => {
            const items: DropdownMenuItem[][] = [
                [
                    {
                        label: row.original.status === 'Active' ? 'Deactivate' : 'Activate',
                        icon: row.original.status === 'Active' ? 'i-lucide-user-minus' : 'i-lucide-user-check',
                        onSelect: () => handleToggleStatus(row.original)
                    },
                    {
                        label: 'Edit',
                        icon: 'i-lucide-edit',
                        onSelect: () => handleEditUser(row.original)
                    }
                ],
                [
                    {
                        label: 'Delete',
                        icon: 'i-lucide-trash',
                        color: 'error',
                        onSelect: () => handleDeleteUser(row.original)
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
    <UPageCard title="Table & CRUD"
        description="A standard reference implementation for AI agents to understand CRUD patterns, data tables, and modal-based workflows within this application."
        variant="naked" orientation="horizontal" class="border-b border-default rounded-none p-4 sm:p-6">
        <div class="flex justify-end gap-2 flex-1">
            <TableGlobalFilter v-model="globalFilter" />
            <TableColumnToggle :table="table" />
        </div>
    </UPageCard>

    <UTable sticky ref="table" :data="users" :columns="columns" :loading="pending"
        v-model:column-visibility="columnVisibility" v-model:global-filter="globalFilter" :ui="{ th: 'sm:px-6', td: 'sm:px-6' }" class="flex-1 scrollbar">
        <template #empty>
            <Empty :loading="pending" title="No users found"
                description="Your user database is currently empty. Click the 'Deploy Demo Data' FAB button or add one manually."
                icon="i-lucide-users" loading-title="Retrieving User Database"
                loading-description="Please wait while we sync the latest user records from our secure vault.">
                <template #action>
                    <UButton label="Add First User" icon="i-lucide-user-plus" color="primary" size="lg"
                        @click="events.emit('addUser')" />
                </template>
            </Empty>
        </template>
    </UTable>

    <UserModal v-model:open="isAddUserOpen" @submit="handleAddUser" />

    <LogsDrawer v-model:open="isDrawerOpen" namespace="users" />
</template>