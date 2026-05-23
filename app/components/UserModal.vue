<script setup lang="ts">
// ============================================================================
// Imports
// ============================================================================
import { reactive, watch, useTemplateRef } from 'vue'
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { User } from '~/types'

// ============================================================================
// Component Definition
// ============================================================================
interface Props {
    title?: string
    user?: User
}

const props = withDefaults(defineProps<Props>(), {
    title: 'User Details'
})

const emit = defineEmits<{
    (e: 'submit', user: { name: string; email: string; role: string; status: 'Active' | 'Inactive' }): void
    (e: 'cancel'): void
}>()

// ============================================================================
// State
// ============================================================================
const isOpen = defineModel<boolean>('open', { default: false })
const roles = ['Admin', 'Editor', 'Viewer']
const formRef = useTemplateRef('form')

const schema = z.object({
    name: z.string({ message: 'Name is required' }).min(1, 'Name is required'),
    email: z.string({ message: 'Email is required' }).email('Must be a valid email address'),
    role: z.string({ message: 'Role is required' }),
    status: z.enum(['Active', 'Inactive'], { message: 'Status must be Active or Inactive' })
})

type Schema = z.output<typeof schema>

const form = reactive({
    name: props.user?.name || '',
    email: props.user?.email || '',
    role: props.user?.role || 'Viewer',
    status: props.user?.status || 'Active' as const
})

// Sync form with props when user changes
watch(() => props.user, (newVal) => {
    if (newVal) {
        form.name = newVal.name
        form.email = newVal.email
        form.role = newVal.role
        form.status = newVal.status
    } else {
        resetForm()
    }
}, { deep: true, immediate: true })

// ============================================================================
// Methods
// ============================================================================

/**
 * Handle form submission
 */
function onSubmit(event: FormSubmitEvent<Schema>) {
    emit('submit', { ...event.data })
    resetForm()
    isOpen.value = false
}

/**
 * Handle modal cancellation
 */
function onCancel() {
    resetForm()
    isOpen.value = false
    emit('cancel')
}

/**
 * Reset form fields to default state
 */
function resetForm() {
    form.name = ''
    form.email = ''
    form.role = 'Viewer'
    form.status = 'Active'
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
                    <p class="text-muted text-sm">{{ user ? 'Update the details for this user.' : 'Fill in the details for the new user.' }}</p>
                </div>

                <!-- Form Content -->
                <UForm ref="form" :state="form" :schema="schema" class="flex flex-col gap-4" @submit="onSubmit">
                    <UFormField label="Name" name="name">
                        <UInput v-model="form.name" placeholder="John Doe" icon="i-lucide-user" class="w-full" />
                    </UFormField>

                    <UFormField label="Email" name="email">
                        <UInput v-model="form.email" type="email" placeholder="john@example.com" icon="i-lucide-mail" class="w-full" />
                    </UFormField>

                    <UFormField label="Role" name="role">
                        <USelect v-model="form.role" :items="roles" icon="i-lucide-shield" class="w-full" />
                    </UFormField>

                    <UFormField label="Status" name="status">
                        <USelect v-model="form.status" :items="['Active', 'Inactive']" icon="i-lucide-activity" class="w-full" />
                    </UFormField>

                    <!-- Actions -->
                    <div class="flex justify-end gap-2 pt-2">
                        <UButton label="Cancel" color="neutral" variant="ghost" @click="onCancel" />
                        <UButton type="submit" :label="user ? 'Save Changes' : 'Add User'" color="primary" 
                            :icon="user ? 'i-lucide-save' : 'i-lucide-user-plus'" />
                    </div>
                </UForm>
            </div>

            <!-- Close Button -->
            <UButton icon="i-lucide-x" color="neutral" variant="ghost" class="absolute top-2 right-2" @click="close" />
        </template>
    </UModal>
</template>
