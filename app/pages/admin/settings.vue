<script setup lang="ts">
import { ref, computed } from 'vue'
import type { RoomType } from '~/types'

definePageMeta({
    title: 'Settings',
    layout: 'dashboard'
})

const authStore = useDemoAuth()
const isAuthorized = computed(() => authStore.currentRole.value === 'Administrator')

const roomsStore = useRoomsStore()
const toast = useAppToast()

const tabs = [
    { label: 'General Settings', icon: 'i-lucide-settings', slot: 'general' },
    { label: 'Room Types', icon: 'i-lucide-bed-double', slot: 'room-types' }
]

// Mock General Settings
const generalState = ref({
    hotelName: 'Presidio Hotel & Resort',
    timezone: 'Asia/Manila',
    currency: 'PHP',
    taxRate: 12
})

const saveGeneralSettings = () => {
    toast.success('Settings Saved', 'General configuration has been updated successfully.')
}

// Room Types Management
const roomTypeColumns = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Room Type' },
    { accessorKey: 'maxOccupancy', header: 'Max Occupancy' },
    { accessorKey: 'baseRate', header: 'Base Rate' }
]

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val)
}
</script>

<template>
    <AuthGate v-if="!isAuthorized" title="Access Denied" description="You must be an Administrator to access System Settings." icon="i-lucide-lock" />

    <template v-else>
        <UPageCard title="System Settings"
            description="Configure global application preferences and manage room classifications."
            variant="naked" orientation="horizontal" class="border-b border-default rounded-none p-4 sm:p-6" />

        <div class="p-4 sm:p-6 max-w-5xl">
            <UTabs :items="tabs" class="w-full">
                <!-- General Settings Tab -->
                <template #general>
                    <UCard class="mt-4 shadow-sm">
                        <template #header>
                            <h3 class="text-lg font-semibold">General Configuration</h3>
                            <p class="text-sm text-muted">Manage basic hotel information.</p>
                        </template>
                        
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
                    <UCard class="mt-4 shadow-sm p-0">
                        <template #header>
                            <div class="flex justify-between items-center px-4 pt-4 pb-2">
                                <div>
                                    <h3 class="text-lg font-semibold">Room Types</h3>
                                    <p class="text-sm text-muted">Manage room classifications, capacities, and base rates.</p>
                                </div>
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
                        </UTable>
                        
                        <div class="p-4 border-t border-default flex justify-end">
                            <UButton color="primary" @click="toast.success('Rates Updated', 'Room type base rates have been saved.')">
                                Save Room Rates
                            </UButton>
                        </div>
                    </UCard>
                </template>
            </UTabs>
        </div>
    </template>
</template>
