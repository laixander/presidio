<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { UModal, UFormField, USelect, URadioGroup, UTextarea, UButton } from '#components'
import type { TaskType } from '~/types'

const props = defineProps<{
    modelValue: boolean
    preselectedRoomId?: number
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'created'): void
}>()

const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

const housekeepingStore = useHousekeepingStore()
const roomsStore = useRoomsStore()
const usersStore = useUsersStore()
const toast = useAppToast()

const housekeepingStaff = computed(() => usersStore.users.filter(u => u.role === 'Housekeeping' && u.isActive))
const roomsList = computed(() => roomsStore.rooms.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true })).map(r => ({ label: `Room ${r.number}`, value: r.id })))
const areas = ['Lobby', 'Pool', 'Gym', 'Restaurant', 'Hallways', 'Parking', 'Elevators', 'Other']
const taskTypes: TaskType[] = ['Cleaning', 'Turn-down', 'Maintenance']

const formData = ref({
    locationType: 'Room' as 'Room' | 'Common Area',
    roomId: undefined as number | undefined,
    area: 'Lobby',
    taskType: 'Cleaning' as TaskType,
    assignedTo: undefined as number | undefined,
    notes: ''
})

// Initialize formData when the modal opens
watch(() => props.modelValue, (newVal) => {
    if (newVal) {
        if (props.preselectedRoomId) {
            formData.value.locationType = 'Room'
            formData.value.roomId = props.preselectedRoomId
        } else {
            formData.value.locationType = 'Room'
            formData.value.roomId = roomsList.value.length > 0 ? roomsList.value[0].value : undefined
        }
        formData.value.area = 'Lobby'
        formData.value.taskType = 'Cleaning'
        formData.value.assignedTo = undefined
        formData.value.notes = ''
    }
})

const handleSaveTask = () => {
    if (formData.value.locationType === 'Room' && !formData.value.roomId) {
        toast.error('Missing required field', 'Please select a room.')
        return
    }
    
    housekeepingStore.addTask({
        roomId: formData.value.locationType === 'Room' ? formData.value.roomId : null,
        area: formData.value.locationType === 'Common Area' ? formData.value.area : null,
        assignedTo: formData.value.assignedTo || null,
        taskType: formData.value.taskType,
        status: 'Pending',
        notes: formData.value.notes || undefined,
        createdAt: new Date().toISOString(),
        completedAt: null
    })
    
    toast.success('Task created', 'The housekeeping task has been added to the queue.')
    isOpen.value = false
    emit('created')
}
</script>

<template>
    <UModal v-model:open="isOpen" title="New Task" description="Create a new housekeeping task.">
        <template #body>
            <form @submit.prevent="handleSaveTask" class="space-y-4">
                <template v-if="!preselectedRoomId">
                    <UFormField label="Location Type">
                        <URadioGroup v-model="formData.locationType" :items="[{label: 'Room', value: 'Room'}, {label: 'Common Area', value: 'Common Area'}]" class="flex gap-4" orientation="horizontal" />
                    </UFormField>
                    
                    <UFormField v-if="formData.locationType === 'Room'" label="Room">
                        <USelect v-model="formData.roomId" :items="roomsList" placeholder="Select Room" class="w-full" />
                    </UFormField>
                    
                    <UFormField v-else label="Common Area">
                        <USelect v-model="formData.area" :items="areas" class="w-full" />
                    </UFormField>
                </template>

                <UFormField label="Task Type">
                    <USelect v-model="formData.taskType" :items="taskTypes" class="w-full" />
                </UFormField>

                <UFormField label="Assign To (Optional)">
                    <USelect v-model="formData.assignedTo" :items="housekeepingStaff.map(s => ({ label: s.name, value: s.id }))" placeholder="Unassigned" class="w-full" />
                </UFormField>

                <UFormField label="Notes">
                    <UTextarea v-model="formData.notes" placeholder="Any specific instructions..." class="w-full" />
                </UFormField>

                <div class="flex justify-end gap-3 mt-6">
                    <UButton label="Cancel" color="neutral" variant="ghost" @click="isOpen = false" />
                    <UButton type="submit" label="Create Task" color="primary" />
                </div>
            </form>
        </template>
    </UModal>
</template>
