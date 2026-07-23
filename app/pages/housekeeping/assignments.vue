<script setup lang="ts">
import { h, ref, computed } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { UButton, UBadge, UModal, UFormField, USelect, UInput } from '#components'
import type { StaffAssignment, CommonArea, StaffShift, StaffUser } from '~/types'

definePageMeta({
    title: 'Staff Assignments',
    layout: 'dashboard',
    isTable: true,
    headerActions: [
        { label: 'New Assignment', icon: 'i-lucide-plus', event: 'openAssignmentModal', color: 'primary', variant: 'solid' }
    ]
})

const events = useEvents()
const housekeepingStore = useHousekeepingStore()
const usersStore = useUsersStore()
const toast = useAppToast()

// Form state
const isModalOpen = ref(false)
const formData = ref({
    userId: undefined as number | undefined,
    area: 'Lobby' as CommonArea,
    shift: 'Morning' as StaffShift,
    date: new Date().toISOString().split('T')[0] as string
})

events.on('openAssignmentModal', () => {
    isModalOpen.value = true
    formData.value = {
        userId: undefined,
        area: 'Lobby',
        shift: 'Morning',
        date: new Date().toISOString().split('T')[0] as string
    }
})

const housekeepingStaff = computed(() => usersStore.users.filter((u: StaffUser) => u.role === 'Housekeeping' && u.isActive))

const areas: CommonArea[] = ['Lobby', 'Pool', 'Gym', 'Restaurant', 'Hallways', 'Parking', 'Elevators', 'Other']
const shifts: StaffShift[] = ['Morning', 'Afternoon', 'Night']

const handleSave = () => {
    if (!formData.value.userId) {
        toast.error('Missing required field', 'Please select a staff member.')
        return
    }
    housekeepingStore.addAssignment({
        userId: formData.value.userId,
        area: formData.value.area,
        shift: formData.value.shift,
        date: formData.value.date
    })
    toast.success('Assignment created', 'The staff assignment has been saved.')
    isModalOpen.value = false
}

const handleDelete = (id: number) => {
    housekeepingStore.removeAssignment(id)
    toast.success('Assignment removed', 'The staff assignment has been deleted.')
}

const columns: TableColumn<StaffAssignment>[] = [
    {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => h('span', { class: 'text-sm text-muted' }, `#${row.original.id}`)
    },
    {
        id: 'staff',
        header: 'Staff Member',
        cell: ({ row }) => {
            const user = usersStore.users.find((u: StaffUser) => u.id === row.original.userId)
            return h('span', { class: 'font-medium' }, user ? user.name : 'Unknown User')
        }
    },
    {
        accessorKey: 'area',
        header: 'Area',
        cell: ({ row }) => h('span', { class: 'font-semibold text-primary' }, row.original.area)
    },
    {
        accessorKey: 'shift',
        header: 'Shift',
        cell: ({ row }) => {
            const colors: Record<string, 'primary' | 'warning' | 'neutral'> = { Morning: 'primary', Afternoon: 'warning', Night: 'neutral' }
            return h(UBadge, { color: colors[row.original.shift] || 'neutral', variant: 'subtle', size: 'sm' }, () => row.original.shift)
        }
    },
    {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => h('span', { class: 'text-sm' }, row.original.date)
    },
    {
        id: 'actions',
        meta: { class: { td: 'text-right' } },
        cell: ({ row }) => {
            return h(UButton, {
                icon: 'i-lucide-trash-2',
                color: 'error',
                variant: 'ghost',
                size: 'sm',
                onClick: () => handleDelete(row.original.id)
            })
        }
    }
]

const authStore = useDemoAuth()
const isAuthorized = computed(() => ['Administrator', 'Housekeeping'].includes(authStore.currentRole.value ?? ''))
</script>

<template>
    <AuthGate v-if="!isAuthorized" title="Access Denied" description="You must be Housekeeping staff or an Administrator to access Staff Assignments." icon="i-lucide-lock" />

    <template v-else>
        <div class="flex-1 flex flex-col h-full">
            <div class="p-4 sm:p-6 border-b border-default shrink-0">
                <h1 class="text-2xl font-bold mb-2">Staff Assignments</h1>
                <p class="text-muted">Manage cleaners assigned to specific common areas.</p>
            </div>
            
            <UTable 
                sticky 
                :data="housekeepingStore.assignments" 
                :columns="columns"
                :ui="{ th: 'sm:px-6', td: 'sm:px-6' }" 
                class="flex-1 overflow-y-auto scrollbar"
            >
                <template #empty>
                    <Empty 
                        title="No assignments found"
                        description="There are currently no staff assignments for common areas."
                        icon="i-lucide-users-round" 
                    />
                </template>
            </UTable>
        </div>

        <UModal v-model:open="isModalOpen" title="New Assignment" description="Assign a cleaner to a common area.">
            <template #body>
                <form @submit.prevent="handleSave" class="space-y-4">
                    <UFormField label="Staff Member">
                        <USelect v-model="formData.userId" :items="housekeepingStaff.map(s => ({ label: s.name, value: s.id }))" placeholder="Select Staff" class="w-full" />
                    </UFormField>
                    
                    <UFormField label="Common Area">
                        <USelect v-model="formData.area" :items="areas" class="w-full" />
                    </UFormField>
                    
                    <UFormField label="Shift">
                        <USelect v-model="formData.shift" :items="shifts" class="w-full" />
                    </UFormField>
                    
                    <UFormField label="Date">
                        <UInput v-model="formData.date" type="date" class="w-full" />
                    </UFormField>

                    <div class="flex justify-end gap-3 mt-6">
                        <UButton label="Cancel" color="neutral" variant="ghost" @click="isModalOpen = false" />
                        <UButton type="submit" label="Save Assignment" color="primary" />
                    </div>
                </form>
            </template>
        </UModal>
    </template>
</template>
