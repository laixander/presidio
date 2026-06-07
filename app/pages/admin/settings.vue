<script setup lang="ts">
import { ref, computed } from 'vue'
import type { RoomType } from '~/types'
import ConfirmationModal from '~/components/ConfirmationModal.vue'

definePageMeta({
    title: 'Settings',
    layout: 'dashboard'
})

const authStore = useDemoAuth()
const isAuthorized = computed(() => authStore.currentRole.value === 'Administrator')

const roomsStore = useRoomsStore()
const settingsStore = useSettingsStore()
const toast = useAppToast()
const appLogger = useAppLogger()
const events = useEvents()
const overlay = useOverlay()
const confirmModal = overlay.create(ConfirmationModal)

const isDrawerOpen = ref(false)

events.on('viewSettingsLogs', () => {
    isDrawerOpen.value = true
})

const tabs = [
    { label: 'General Settings', icon: 'i-lucide-settings', slot: 'general' },
    { label: 'Room Types', icon: 'i-lucide-bed-double', slot: 'room-types' }
]

// General Settings
const generalState = ref({ ...settingsStore.settings })

const saveGeneralSettings = () => {
    confirmModal.open({
        title: 'Save Settings',
        description: 'Are you sure you want to save changes to the general settings?',
        confirmLabel: 'Save',
        onConfirm: () => {
            settingsStore.updateSettings(generalState.value)
            appLogger.logSettingsUpdated()
            toast.success('Settings Saved', 'General configuration has been updated successfully.')
        }
    })
}

// Room Types Management
const roomTypeColumns = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Room Type' },
    { accessorKey: 'maxOccupancy', header: 'Max Occupancy' },
    { accessorKey: 'baseRate', header: 'Base Rate' },
    { id: 'actions', header: '' }
]

const isRoomTypeModalOpen = ref(false)
const editingRoomType = ref<RoomType | null>(null)
const roomTypeForm = ref<Omit<RoomType, 'id'>>({
    name: '',
    maxOccupancy: 2,
    baseRate: 0
})

const openNewRoomTypeModal = () => {
    editingRoomType.value = null
    roomTypeForm.value = { name: '', maxOccupancy: 2, baseRate: 0 }
    isRoomTypeModalOpen.value = true
}

const openEditRoomTypeModal = (rt: RoomType) => {
    editingRoomType.value = rt
    roomTypeForm.value = { name: rt.name, maxOccupancy: rt.maxOccupancy, baseRate: rt.baseRate }
    isRoomTypeModalOpen.value = true
}

const saveRoomType = () => {
    confirmModal.open({
        title: editingRoomType.value ? 'Edit Room Type' : 'Create Room Type',
        description: `Are you sure you want to ${editingRoomType.value ? 'save changes to' : 'create'} ${roomTypeForm.value.name}?`,
        confirmLabel: 'Save',
        onConfirm: () => {
            if (editingRoomType.value) {
                roomsStore.updateRoomType(editingRoomType.value.id, roomTypeForm.value)
                appLogger.logRoomTypeUpdated(roomTypeForm.value.name)
                toast.success('Room Type Updated', `Successfully updated ${roomTypeForm.value.name}.`)
            } else {
                roomsStore.addRoomType(roomTypeForm.value)
                appLogger.logRoomTypeAdded(roomTypeForm.value.name)
                toast.success('Room Type Created', `Successfully created ${roomTypeForm.value.name}.`)
            }
            isRoomTypeModalOpen.value = false
        }
    })
}

const deleteRoomType = (rt: RoomType) => {
    confirmModal.open({
        title: 'Delete Room Type',
        description: `Are you sure you want to delete ${rt.name}? This action cannot be undone.`,
        confirmLabel: 'Delete',
        confirmColor: 'error',
        onConfirm: () => {
            const result = roomsStore.deleteRoomType(rt.id)
            if (result.success) {
                appLogger.logRoomTypeDeleted(rt.name)
                toast.success('Room Type Deleted', `Successfully deleted ${rt.name}.`)
            } else {
                toast.error('Deletion Failed', result.message || 'Cannot delete room type.')
            }
        }
    })
}

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val)
}
</script>

<template>
    <AuthGate v-if="!isAuthorized" title="Access Denied" description="You must be an Administrator to access System Settings." icon="i-lucide-lock" />

    <div v-else class="w-full max-w-(--ui-container) mx-auto space-y-6">
        <UPageCard title="System Settings"
            description="Configure global application preferences and manage room classifications."
            variant="naked" orientation="horizontal" />

        <ClientOnly>
            <Teleport to="#header-actions-teleport">
                <UButton icon="i-lucide-history" color="neutral" variant="soft" @click="events.emit('viewSettingsLogs')">
                    Recent Activity
                </UButton>
            </Teleport>
        </ClientOnly>

        <UTabs :items="tabs" variant="link" class="w-full">
            <!-- General Settings Tab -->
            <template #general>
                <UCard title="General Configuration" description="Manage basic hotel information." variant="subtle" class="shadow-sm mt-4 w-fit">                    
                    <UForm :state="generalState" @submit="saveGeneralSettings" class="space-y-6 max-w-xl">
                        <UFormField label="Hotel Name">
                            <UInput v-model="generalState.hotelName" class="w-full" />
                        </UFormField>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <UFormField label="Timezone">
                                <UInput v-model="generalState.timezone" disabled class="w-full" />
                            </UFormField>
                            <UFormField label="Currency">
                                <UInput v-model="generalState.currency" disabled class="w-full" />
                            </UFormField>
                        </div>
                        
                        <UFormField label="Tax Rate (%)">
                            <UInput v-model="generalState.taxRate" type="number" class="w-full" />
                        </UFormField>
                        
                        <UButton type="submit" color="primary">Save Changes</UButton>
                    </UForm>
                </UCard>
            </template>

            <!-- Room Types Tab -->
            <template #room-types>
                <UCard title="Room Types" description="Manage room classifications, capacities, and base rates." variant="subtle" :ui="{ body: 'p-0 sm:p-0' }" class="mt-4 shadow-sm">                    
                    <template #header>
                        <div class="flex justify-between items-center">
                            <div>
                                <h3 class="font-semibold">Room Types</h3>
                                <p class="text-sm text-muted">Manage room classifications, capacities, and base rates.</p>
                            </div>
                            <UButton icon="i-lucide-plus" color="primary" variant="soft" @click="openNewRoomTypeModal">
                                New Room Type
                            </UButton>
                        </div>
                    </template>
                    <UTable :data="roomsStore.roomTypes" :columns="roomTypeColumns" class="w-full">
                        <template #name-cell="{ row }">
                            <span class="font-medium">{{ row.original.name }}</span>
                        </template>
                        <template #maxOccupancy-cell="{ row }">
                            <div class="flex items-center gap-1">
                                <UIcon name="i-lucide-users" class="w-4 h-4 text-neutral-400" />
                                <span>{{ row.original.maxOccupancy }} guests</span>
                            </div>
                        </template>
                        <template #baseRate-cell="{ row }">
                            <div class="flex items-center gap-2">
                                <UInput v-model.number="row.original.baseRate" type="number" size="sm" class="w-24" />
                                <span class="text-xs text-muted">PHP / night</span>
                            </div>
                        </template>
                        <template #actions-cell="{ row }">
                            <div class="flex justify-end gap-1">
                                <UButton icon="i-lucide-edit" color="neutral" variant="ghost" size="sm" @click="openEditRoomTypeModal(row.original)" />
                                <UButton icon="i-lucide-trash" color="error" variant="ghost" size="sm" @click="deleteRoomType(row.original)" />
                            </div>
                        </template>
                    </UTable>
                    
                    <div class="p-4 border-t border-default flex justify-end">
                        <UButton color="primary" @click="toast.success('Rates Updated', 'Room type base rates have been saved.')">
                            Save Room Rates
                        </UButton>
                    </div>
                </UCard>
            </template>
        </UTabs>

        <UModal v-model:open="isRoomTypeModalOpen" :title="editingRoomType ? 'Edit Room Type' : 'New Room Type'">
            <template #body>
                <div class="space-y-4">
                    <UFormField label="Name" required>
                        <UInput v-model="roomTypeForm.name" placeholder="e.g. Deluxe Suite" class="w-full" />
                    </UFormField>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <UFormField label="Max Occupancy" required>
                            <UInputNumber v-model="roomTypeForm.maxOccupancy" :min="1" class="w-full" />
                        </UFormField>
                        <UFormField label="Base Rate (PHP)" required>
                            <UInputNumber v-model="roomTypeForm.baseRate" :min="0" :step="100" class="w-full" />
                        </UFormField>
                    </div>
                </div>
            </template>
            <template #footer>
                <div class="flex justify-end gap-2">
                    <UButton label="Cancel" color="neutral" variant="subtle" @click="isRoomTypeModalOpen = false" />
                    <UButton :label="editingRoomType ? 'Save Changes' : 'Create Room Type'" color="primary" @click="saveRoomType" />
                </div>
            </template>
        </UModal>

        <LogsDrawer v-model:open="isDrawerOpen" namespace="settings" />
    </div>
</template>
