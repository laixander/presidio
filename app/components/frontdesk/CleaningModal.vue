<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
    modelValue: boolean
    roomId: number | null
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
}>()

const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

const housekeepingStore = useHousekeepingStore()
const toast = useAppToast()

const taskType = ref('Cleaning')
const taskOptions = ['Cleaning', 'Turn-down', 'Maintenance']

const confirmTask = () => {
    if (!props.roomId) return

    housekeepingStore.addTask({
        roomId: props.roomId,
        assignedTo: null,
        taskType: taskType.value as any,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        completedAt: null
    })

    toast.success('Task Created', `A ${taskType.value} task has been requested for this room.`)
    emit('success')
    isOpen.value = false
}
</script>

<template>
    <UModal v-model:open="isOpen">
        <template #header>
            <div class="flex items-center justify-between w-full">
                <h3 class="text-base font-semibold leading-6 flex items-center gap-2">
                    <UIcon name="i-lucide-sparkles" class="text-primary" /> Request Service
                </h3>
                <UButton color="neutral" variant="ghost" icon="i-lucide-x" class="-my-1" @click="isOpen = false" />
            </div>
        </template>

        <template #body>
            <div class="space-y-4">
                <UFormField label="Task Type" name="taskType">
                    <USelect v-model="taskType" :items="taskOptions" class="w-full" />
                </UFormField>

                <p class="text-sm text-muted">This will dispatch a task to the Housekeeping dashboard.</p>
            </div>
        </template>

        <template #footer>
            <div class="flex justify-end gap-3 w-full">
                <UButton label="Cancel" color="neutral" variant="ghost" @click="isOpen = false" />
                <UButton label="Request Task" color="primary" @click="confirmTask" />
            </div>
        </template>
    </UModal>
</template>
