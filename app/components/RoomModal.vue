<script setup lang="ts">
// ============================================================================
// Imports
// ============================================================================
import { reactive, watch, useTemplateRef } from 'vue'
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Room } from '~/types'

// ============================================================================
// Component Definition
// ============================================================================
interface Props {
    title?: string
    room?: Room
}

const props = withDefaults(defineProps<Props>(), {
    title: 'Room Details'
})

const emit = defineEmits<{
    (e: 'submit', room: Omit<Room, 'id'>): void
    (e: 'cancel'): void
}>()

// ============================================================================
// State
// ============================================================================
const isOpen = defineModel<boolean>('open', { default: false })
const roomsStore = useRoomsStore()
const formRef = useTemplateRef('form')

const roomTypeOptions = computed(() =>
    roomsStore.roomTypes.map(rt => ({ label: rt.name, value: rt.id }))
)

const occupancyOptions = ['Vacant', 'Occupied']
const cleanOptions = ['Clean', 'Dirty', 'Pickup', 'Inspected']
const conditionOptions = ['Normal', 'Maintenance']

const schema = z.object({
    number: z.string({ message: 'Room number is required' }).min(1, 'Room number is required'),
    floor: z.coerce.number({ message: 'Floor is required' }).min(1, 'Floor must be at least 1'),
    roomTypeId: z.coerce.number({ message: 'Room type is required' }).min(1, 'Select a room type'),
    rateOverride: z.coerce.number().nullable().optional(),
    occupancyStatus: z.enum(['Vacant', 'Occupied'], { message: 'Select occupancy status' }),
    cleanStatus: z.enum(['Clean', 'Dirty', 'Pickup', 'Inspected'], { message: 'Select clean status' }),
    condition: z.enum(['Normal', 'Maintenance'], { message: 'Select condition' })
})

type Schema = z.output<typeof schema>

const form = reactive({
    number: props.room?.number || '',
    floor: props.room?.floor || 1,
    roomTypeId: props.room?.roomTypeId || 0,
    rateOverride: props.room?.rateOverride ?? null as number | null,
    occupancyStatus: props.room?.occupancyStatus || 'Vacant',
    cleanStatus: props.room?.cleanStatus || 'Clean',
    condition: props.room?.condition || 'Normal'
})

// Sync form with props when room changes
watch(() => props.room, (newVal) => {
    if (newVal) {
        form.number = newVal.number
        form.floor = newVal.floor
        form.roomTypeId = newVal.roomTypeId
        form.rateOverride = newVal.rateOverride
        form.occupancyStatus = newVal.occupancyStatus
        form.cleanStatus = newVal.cleanStatus
        form.condition = newVal.condition
    } else {
        resetForm()
    }
}, { deep: true, immediate: true })

// ============================================================================
// Methods
// ============================================================================

function onSubmit(event: FormSubmitEvent<Schema>) {
    emit('submit', {
        number: event.data.number,
        floor: event.data.floor,
        roomTypeId: event.data.roomTypeId,
        rateOverride: event.data.rateOverride ?? null,
        occupancyStatus: event.data.occupancyStatus,
        cleanStatus: event.data.cleanStatus,
        condition: event.data.condition
    })
    resetForm()
    isOpen.value = false
}

function onCancel() {
    resetForm()
    isOpen.value = false
    emit('cancel')
}

function resetForm() {
    form.number = ''
    form.floor = 1
    form.roomTypeId = 0
    form.rateOverride = null
    form.occupancyStatus = 'Vacant'
    form.cleanStatus = 'Clean'
    form.condition = 'Normal'
    formRef.value?.clear()
}
</script>

<template>
    <UModal v-model:open="isOpen" :ui="{ content: 'w-full sm:max-w-md' }">
        <template #content="{ close }">
            <div class="flex flex-col gap-6 p-4 sm:p-6">
                <!-- Header -->
                <div class="flex flex-col gap-1">
                    <h3 class="text-lg font-semibold">{{ title }}</h3>
                    <p class="text-muted text-sm">{{ room ? 'Update the details for this room.' : 'Fill in the details for the new room.' }}</p>
                </div>

                <!-- Form -->
                <UForm ref="form" :state="form" :schema="schema" class="flex flex-col gap-4" @submit="onSubmit">
                    <div class="grid grid-cols-2 gap-4">
                        <UFormField label="Room Number" name="number">
                            <UInput v-model="form.number" placeholder="101" icon="i-lucide-hash" class="w-full" />
                        </UFormField>

                        <UFormField label="Floor" name="floor">
                            <UInput v-model.number="form.floor" type="number" placeholder="1" icon="i-lucide-layers" class="w-full" />
                        </UFormField>
                    </div>

                    <UFormField label="Room Type" name="roomTypeId">
                        <USelect v-model.number="form.roomTypeId" :items="roomTypeOptions" value-key="value" icon="i-lucide-bed-double" class="w-full" />
                    </UFormField>

                    <UFormField label="Rate Override (₱)" name="rateOverride" hint="Leave empty to use base rate">
                        <UInput v-model.number="form.rateOverride" type="number" placeholder="Base rate" icon="i-lucide-banknote" class="w-full" />
                    </UFormField>

                    <div class="grid grid-cols-2 gap-4">
                        <UFormField label="Occupancy" name="occupancyStatus">
                            <USelect v-model="form.occupancyStatus" :items="occupancyOptions" icon="i-lucide-door-open" class="w-full" />
                        </UFormField>

                        <UFormField label="Clean Status" name="cleanStatus">
                            <USelect v-model="form.cleanStatus" :items="cleanOptions" icon="i-lucide-sparkles" class="w-full" />
                        </UFormField>
                    </div>

                    <UFormField label="Condition" name="condition">
                        <USelect v-model="form.condition" :items="conditionOptions" icon="i-lucide-wrench" class="w-full" />
                    </UFormField>

                    <!-- Actions -->
                    <div class="flex justify-end gap-2 pt-2">
                        <UButton label="Cancel" color="neutral" variant="ghost" @click="onCancel" />
                        <UButton type="submit" :label="room ? 'Save Changes' : 'Add Room'" color="primary"
                            :icon="room ? 'i-lucide-save' : 'i-lucide-plus'" />
                    </div>
                </UForm>
            </div>

            <!-- Close Button -->
            <UButton icon="i-lucide-x" color="neutral" variant="ghost" class="absolute top-2 right-2" @click="close" />
        </template>
    </UModal>
</template>
