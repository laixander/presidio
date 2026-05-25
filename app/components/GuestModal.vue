<script setup lang="ts">
import { reactive, watch, useTemplateRef } from 'vue'
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Guest } from '~/types'

interface Props {
    title?: string
    guest?: Guest
}

const props = withDefaults(defineProps<Props>(), {
    title: 'Guest Details'
})

const emit = defineEmits<{
    (e: 'submit', guest: Omit<Guest, 'id'>): void
    (e: 'cancel'): void
}>()

const isOpen = defineModel<boolean>('open', { default: false })
const formRef = useTemplateRef('form')

const schema = z.object({
    firstName: z.string({ message: 'First name is required' }).min(1, 'First name is required'),
    lastName: z.string({ message: 'Last name is required' }).min(1, 'Last name is required'),
    email: z.string().email('Invalid email address').or(z.literal('')),
    phone: z.string(),
    company: z.string(),
    isVip: z.boolean()
})

type Schema = z.output<typeof schema>

const form = reactive({
    firstName: props.guest?.firstName || '',
    lastName: props.guest?.lastName || '',
    email: props.guest?.email || '',
    phone: props.guest?.phone || '',
    company: props.guest?.company || '',
    isVip: props.guest?.isVip || false
})

watch(() => props.guest, (newVal) => {
    if (newVal) {
        form.firstName = newVal.firstName
        form.lastName = newVal.lastName
        form.email = newVal.email || ''
        form.phone = newVal.phone || ''
        form.company = newVal.company || ''
        form.isVip = newVal.isVip
    } else {
        resetForm()
    }
}, { deep: true, immediate: true })

function onSubmit(event: FormSubmitEvent<Schema>) {
    emit('submit', {
        firstName: event.data.firstName,
        lastName: event.data.lastName,
        email: event.data.email || '',
        phone: event.data.phone || '',
        company: event.data.company || null,
        isVip: event.data.isVip
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
    form.firstName = ''
    form.lastName = ''
    form.email = ''
    form.phone = ''
    form.company = ''
    form.isVip = false
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
                    <p class="text-muted text-sm">{{ guest ? 'Update guest profile details.' : 'Create a new guest profile.' }}</p>
                </div>

                <!-- Form -->
                <UForm ref="form" :state="form" :schema="schema" class="flex flex-col gap-4" @submit="onSubmit">
                    <div class="grid grid-cols-2 gap-4">
                        <UFormField label="First Name" name="firstName">
                            <UInput v-model="form.firstName" placeholder="John" class="w-full" />
                        </UFormField>
                        <UFormField label="Last Name" name="lastName">
                            <UInput v-model="form.lastName" placeholder="Doe" class="w-full" />
                        </UFormField>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <UFormField label="Email" name="email">
                            <UInput v-model="form.email" type="email" placeholder="john@example.com" icon="i-lucide-mail" class="w-full" />
                        </UFormField>
                        <UFormField label="Phone" name="phone">
                            <UInput v-model="form.phone" placeholder="+1 234 567 8900" icon="i-lucide-phone" class="w-full" />
                        </UFormField>
                    </div>

                    <UFormField label="Company" name="company">
                        <UInput v-model="form.company" placeholder="Acme Corp" icon="i-lucide-building" class="w-full" />
                    </UFormField>

                    <UFormField name="isVip">
                        <UCheckbox v-model="form.isVip" label="Mark as VIP Guest" color="primary" />
                    </UFormField>

                    <!-- Actions -->
                    <div class="flex justify-end gap-2 pt-2">
                        <UButton label="Cancel" color="neutral" variant="ghost" @click="onCancel" />
                        <UButton type="submit" :label="guest ? 'Save Changes' : 'Add Guest'" color="primary"
                            :icon="guest ? 'i-lucide-save' : 'i-lucide-plus'" />
                    </div>
                </UForm>
            </div>

            <!-- Close Button -->
            <UButton icon="i-lucide-x" color="neutral" variant="ghost" class="absolute top-2 right-2" @click="close" />
        </template>
    </UModal>
</template>
