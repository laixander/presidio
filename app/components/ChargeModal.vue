<script setup lang="ts">
import { reactive, watch } from 'vue'
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { ChargeType } from '~/types'

const props = defineProps<{
    folioId: number
}>()

const emit = defineEmits<{
    (e: 'submit', data: {
        folioId: number
        type: ChargeType
        description: string
        unitPrice: number
        quantity: number
        total: number
        postedAt: string
    }): void
    (e: 'cancel'): void
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const chargeTypes: ChargeType[] = ['Room Charge', 'Restaurant', 'Mini Bar', 'Laundry', 'Misc']

const schema = z.object({
    type: z.enum(['Room Charge', 'Restaurant', 'Mini Bar', 'Laundry', 'Misc']),
    description: z.string().min(1, 'Description is required'),
    unitPrice: z.number().min(0, 'Price cannot be negative'),
    quantity: z.number().min(1, 'Quantity must be at least 1')
})

type Schema = z.output<typeof schema>

const state = reactive({
    type: 'Misc' as ChargeType,
    description: '',
    unitPrice: 0,
    quantity: 1
})

watch(isOpen, (val) => {
    if (val) {
        state.type = 'Misc'
        state.description = ''
        state.unitPrice = 0
        state.quantity = 1
    }
})

const onSubmit = (event: FormSubmitEvent<Schema>) => {
    emit('submit', {
        folioId: props.folioId,
        type: event.data.type,
        description: event.data.description,
        unitPrice: event.data.unitPrice,
        quantity: event.data.quantity,
        total: event.data.unitPrice * event.data.quantity,
        postedAt: new Date().toISOString()
    })
    isOpen.value = false
}

const onCancel = () => {
    isOpen.value = false
    emit('cancel')
}
</script>

<template>
    <UModal v-model:open="isOpen" prevent-close>
        <template #header>
            <div class="flex items-center justify-between w-full">
                <h3 class="text-base font-semibold leading-6 flex items-center gap-2">
                    <UIcon name="i-lucide-receipt" class="text-primary" />
                    Post Charge
                </h3>
                <UButton color="neutral" variant="ghost" icon="i-lucide-x" class="-my-1" @click="onCancel" />
            </div>
        </template>
        <template #body>
            <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
                
                <UFormField label="Charge Type" name="type">
                    <USelect v-model="state.type" :items="chargeTypes" class="w-full" />
                </UFormField>

                <UFormField label="Description" name="description">
                    <UInput v-model="state.description" placeholder="e.g. Dinner, Coca-cola, Dry cleaning..." class="w-full" />
                </UFormField>

                <div class="grid grid-cols-2 gap-4">
                    <UFormField label="Unit Price (₱)" name="unitPrice">
                        <UInput v-model.number="state.unitPrice" type="number" min="0" step="0.01" class="w-full" />
                    </UFormField>
                    <UFormField label="Quantity" name="quantity">
                        <UInput v-model.number="state.quantity" type="number" min="1" step="1" class="w-full" />
                    </UFormField>
                </div>
                
                <div class="pt-4 mt-4 border-t border-default flex justify-between items-center font-bold">
                    <span>Total Charge:</span>
                    <span class="text-error-600 dark:text-error-400 text-lg">₱{{ (state.unitPrice * state.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}</span>
                </div>

                <div class="flex justify-end gap-3 mt-6">
                    <UButton label="Cancel" color="neutral" variant="ghost" @click="onCancel" />
                    <UButton type="submit" label="Post Charge" color="primary" />
                </div>
            </UForm>
        </template>
    </UModal>
</template>
