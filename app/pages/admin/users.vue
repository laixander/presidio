<script setup lang="ts">
import { h, ref, useTemplateRef, computed } from 'vue'
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import { useOverlay } from '#imports'
import { UButton, UDropdownMenu, UIcon, UBadge } from '#components'

import type { StaffUser } from '~/types'
import UserModal from '~/components/UserModal.vue'
import ConfirmationModal from '~/components/ConfirmationModal.vue'
import StatusBadge from '~/components/StatusBadge.vue'
import UserDetailsDrawer from '~/components/UserDetailsDrawer.vue'

definePageMeta({
    title: 'User Management',
    layout: 'dashboard',
    isTable: true,
    // headerActions: [
    //     { label: 'Add User', icon: 'i-lucide-plus', event: 'addUser', color: 'primary' }
    // ]
})

const usersStore = useUsersStore()
const events = useEvents()
const overlay = useOverlay()
const toast = useAppToast()
const authStore = useDemoAuth()
const logger = useLogger('users')

const isAuthorized = computed(() => authStore.currentRole.value === 'Administrator')
const isDrawerOpen = ref(false)
const isDetailsDrawerOpen = ref(false)
const selectedUser = ref<StaffUser | null>(null)

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
            logger.addLog(`Added user: ${userData.name}`, 'Created', 'success')
            toast.success('User Added', `${userData.name} has been added successfully.`)
        }
    })
})

events.on('viewUserLogs', () => {
    isDrawerOpen.value = true
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
            logger.addLog(`Updated user: ${userData.name}`, 'Updated', 'warn')
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
            logger.addLog(`Deleted user: ${user.name}`, 'Deleted', 'error')
            toast.success('User Deleted', `${user.name} has been removed.`)
        }
    })
}

const handleViewDetails = (user: StaffUser) => {
    selectedUser.value = user
    isDetailsDrawerOpen.value = true
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
        cell: ({ row }) => h(StatusBadge, { status: row.getValue('role') as string })
    },
    {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => {
            const active = row.getValue('isActive') as boolean
            return h(StatusBadge, { status: active ? 'Active' : 'Inactive' })
        }
    }
]

const globalFilter = ref('')
const viewMode = ref<'list' | 'card'>('list')

const filteredUsers = computed(() => {
    if (!globalFilter.value) return usersStore.users
    const search = globalFilter.value.toLowerCase()
    return usersStore.users.filter(user => 
        user.name.toLowerCase().includes(search) || 
        user.email.toLowerCase().includes(search) || 
        user.role.toLowerCase().includes(search)
    )
})
</script>

<template>
    <AuthGate v-if="!isAuthorized" title="Access Denied" description="You must be an Administrator to manage users." icon="i-lucide-lock" />

    <template v-else>
        <UPageCard title="User Management"
            description="Manage staff accounts, roles, and system access."
            variant="naked" orientation="horizontal" class="border-b border-default rounded-none p-4 sm:p-6">
            <div class="flex justify-end gap-2 flex-1">
                <TableGlobalFilter v-model="globalFilter" />
                <!-- <UInput v-model="globalFilter" icon="i-lucide-search" placeholder="Search users..." class="w-full sm:w-64" /> -->
                <UTabs :items="[{ icon: 'i-lucide-grid-3x3', value: 'card' }, { icon: 'i-lucide-list', value: 'list' }]"
                v-model="viewMode" :content="false" size="xs" />
            </div>
        </UPageCard>

        <ClientOnly>
            <Teleport to="#header-actions-teleport">
                <UButton icon="i-lucide-history" color="neutral" variant="soft" @click="events.emit('viewUserLogs')">Recent Activity</UButton>
                <UButton icon="i-lucide-plus" color="primary" @click="events.emit('addUser')">Add User</UButton>
            </Teleport>
        </ClientOnly>

        <!-- List (table) view -->
        <UTable v-if="viewMode === 'list'" sticky :data="usersStore.users" :columns="columns" :loading="usersStore.isLoading" :global-filter="globalFilter" :ui="{ th: 'sm:px-6', td: 'sm:px-6 cursor-pointer', tr: 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer' }" class="flex-1 scrollbar" @select="(e, row) => handleViewDetails(row.original)">
            <template #empty>
                <Empty :loading="usersStore.isLoading" title="No users found"
                    description="There are currently no users to display. Add a new user to get started."
                    icon="i-lucide-user-cog" loading-title="Loading Users"
                    loading-description="Please wait while we fetch your user inventory.">
                    <template #action>
                        <UButton label="Add First User" icon="i-lucide-plus" color="primary" size="lg"
                            @click="events.emit('addUser')" />
                    </template>
                </Empty>
            </template>
        </UTable>

        <!-- Card grid view -->
        <div v-else class="flex-1 overflow-y-auto scrollbar p-4 sm:p-6">
            <Empty v-if="!usersStore.isLoading && !filteredUsers.length"
                title="No users found"
                description="There are currently no users to display. Add a new user to get started."
                icon="i-lucide-user-cog">
                <template #action>
                    <UButton label="Add First User" icon="i-lucide-plus" color="primary" size="lg"
                        @click="events.emit('addUser')" />
                </template>
            </Empty>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <UCard v-for="user in filteredUsers" :key="user.id" variant="subtle"
                    class="hover:ring-2 hover:ring-primary transition-all duration-200 shadow-sm cursor-pointer"
                    @click="handleViewDetails(user)">
                    <template #header>
                        <div class="flex items-start justify-between">
                            <div>
                                <h3 class="text-lg font-bold truncate pr-2">{{ user.name }}</h3>
                                <p class="text-sm text-muted truncate">{{ user.email }}</p>
                            </div>
                        </div>
                    </template>

                    <div class="*:py-2 *:first:pt-0 *:last:pb-0 *:flex *:items-center *:justify-between text-sm divide-y divide-default">
                        <div>
                            <span class="text-muted">Role</span>
                            <StatusBadge :status="user.role" />
                        </div>
                        <div>
                            <span class="text-muted">Status</span>
                            <StatusBadge :status="user.isActive ? 'Active' : 'Inactive'" />
                        </div>
                    </div>
                </UCard>
            </div>
        </div>

        <UserDetailsDrawer v-model:open="isDetailsDrawerOpen" :user="selectedUser" @edit="handleEditUser" @delete="handleDeleteUser" />
        <LogsDrawer v-model:open="isDrawerOpen" namespace="users" />
    </template>
</template>
