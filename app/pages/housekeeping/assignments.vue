<script setup lang="ts">
import { h, ref, computed } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { UButton, UBadge, UModal, UFormField, USelect, UInput, URadioGroup } from '#components'
import type { StaffAssignment, CommonArea, StaffShift, StaffUser, AssignmentLocationType } from '~/types'

definePageMeta({
    title: 'Staff Assignments',
    layout: 'dashboard',
    isTable: true,
    // headerActions: [
    //     { label: 'New Assignment', icon: 'i-lucide-plus', event: 'openAssignmentModal', color: 'primary', variant: 'solid' }
    // ]
})

const events = useEvents()
const housekeepingStore = useHousekeepingStore()
const usersStore = useUsersStore()
const roomsStore = useRoomsStore()
const toast = useAppToast()

const uniqueFloors = computed(() => {
    const floors = new Set(roomsStore.rooms.map(r => r.floor))
    return Array.from(floors).sort((a, b) => a - b)
})

// Form state
const isModalOpen = ref(false)
const formData = ref({
    userId: undefined as number | undefined,
    locationType: 'Common Area' as AssignmentLocationType,
    area: 'Lobby' as CommonArea,
    floor: 1,
    shift: 'Morning' as StaffShift,
    date: new Date().toISOString().split('T')[0] as string
})

events.on('openAssignmentModal', () => {
    isModalOpen.value = true
    formData.value = {
        userId: undefined,
        locationType: 'Common Area',
        area: 'Lobby',
        floor: uniqueFloors.value.length > 0 ? uniqueFloors.value[0] : 1,
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
        locationType: formData.value.locationType,
        area: formData.value.locationType === 'Common Area' ? formData.value.area : undefined,
        floor: formData.value.locationType === 'Floor' ? formData.value.floor : undefined,
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
        id: 'location',
        header: 'Location',
        cell: ({ row }) => {
            if (row.original.locationType === 'Floor') {
                return h('span', { class: 'font-semibold text-primary' }, `Floor ${row.original.floor}`)
            }
            return h('span', { class: 'font-semibold text-primary' }, row.original.area)
        }
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
        <UPageCard title="Staff Assignments"
            description="Manage cleaners assigned to specific common areas or floors."
            variant="naked" orientation="horizontal" class="border-b border-default rounded-none p-4 sm:p-6">
        </UPageCard>
        
        <ClientOnly>
            <Teleport to="#header-actions-teleport">
                <UButton icon="i-lucide-plus" color="primary" variant="solid" @click="events.emit('openAssignmentModal')">
                    New Assignment
                </UButton>
            </Teleport>
        </ClientOnly>
            
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
                    description="There are currently no staff assignments for common areas or floors."
                    icon="i-lucide-users-round" 
                />
            </template>
        </UTable>

        <UModal v-model:open="isModalOpen" title="New Assignment" description="Assign a cleaner to a location.">
            <template #body>
                <form @submit.prevent="handleSave" class="space-y-4">
                    <UFormField label="Staff Member">
                        <USelect v-model="formData.userId" :items="housekeepingStaff.map(s => ({ label: s.name, value: s.id }))" placeholder="Select Staff" class="w-full" />
                    </UFormField>
                    
                    <UFormField label="Assignment Type">
                        <URadioGroup v-model="formData.locationType" :items="[{label: 'Common Area', value: 'Common Area'}, {label: 'Floor', value: 'Floor'}]" class="flex gap-4" orientation="horizontal" />
                    </UFormField>
                    
                    <UFormField v-if="formData.locationType === 'Common Area'" label="Common Area">
                        <USelect v-model="formData.area" :items="areas" class="w-full" />
                    </UFormField>
                    
                    <UFormField v-else label="Floor">
                        <USelect v-model="formData.floor" :items="uniqueFloors" class="w-full" />
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
