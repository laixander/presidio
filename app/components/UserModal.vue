<script setup lang="ts">
import { ref, watch } from 'vue'
import { UModal, UCard, UForm, UFormField, UInput, USelect, UButton, UCheckbox } from '#components'
import type { StaffUser, SystemRole } from '~/types'

const props = defineProps<{
    user?: StaffUser
    title: string
    onSubmit: (user: Omit<StaffUser, 'id'>) => void
}>()

const emit = defineEmits(['close'])

const isOpen = ref(true)

const roleOptions = [
    { label: 'Administrator', value: 'Administrator' },
    { label: 'Front Desk', value: 'Front Desk' },
    { label: 'Billing', value: 'Billing' },
    { label: 'Housekeeping', value: 'Housekeeping' }
]

const state = ref({
    name: props.user?.name || '',
    email: props.user?.email || '',
    password: props.user?.password || '',
    role: props.user?.role || 'Front Desk',
    isActive: props.user?.isActive ?? true
})

watch(isOpen, (val) => {
    if (!val) {
        setTimeout(() => emit('close'), 200)
    }
})

const submit = () => {
    props.onSubmit({
        name: state.value.name,
        email: state.value.email,
        password: state.value.password,
        role: state.value.role as SystemRole,
        isActive: state.value.isActive
    })
    isOpen.value = false
}
</script>

<template>
    <UModal v-model="isOpen">
        <template #content="{ close }">
            <div class="flex flex-col gap-6 p-4 sm:p-6">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold">{{ title }}</h3>
                <UButton color="neutral" variant="ghost" icon="i-lucide-x" @click="close" />
            </div>
            
            <UForm :state="state" @submit="submit" class="space-y-4">
                <UFormField label="Full Name" required>
                    <UInput v-model="state.name" placeholder="John Doe" class="w-full" />
                </UFormField>
                
                <UFormField label="Email" required>
                    <UInput v-model="state.email" type="email" placeholder="john@presidio.com" class="w-full" />
                </UFormField>
                
                <UFormField label="Password" required>
                    <UInput v-model="state.password" type="password" placeholder="Enter password" class="w-full" />
                </UFormField>
                
                <UFormField label="Role" required>
                    <USelect v-model="state.role" :items="roleOptions" class="w-full" />
                </UFormField>
                
                <UFormField>
                    <UCheckbox v-model="state.isActive" label="Account is active" />
                </UFormField>
                
                <div class="flex justify-end gap-2 pt-4 border-t border-default mt-6">
                    <UButton color="neutral" variant="ghost" @click="isOpen = false">Cancel</UButton>
                    <UButton type="submit" color="primary">Save User</UButton>
                </div>
            </UForm>
        </div>
        </template>
    </UModal>
</template>
