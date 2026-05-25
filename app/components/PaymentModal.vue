<script setup lang="ts">
import { reactive, watch } from 'vue'
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { PaymentMethod } from '~/types'

const props = defineProps<{
    folioId: number
    balanceDue: number
}>()

const emit = defineEmits<{
    (e: 'submit', data: {
        folioId: number
        method: PaymentMethod
        amount: number
        paymentDate: string
    }): void
    (e: 'cancel'): void
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const paymentMethods: PaymentMethod[] = ['Cash', 'Credit Card', 'Bank Transfer']

const schema = z.object({
    method: z.enum(['Cash', 'Credit Card', 'Bank Transfer']),
    amount: z.number().min(0.01, 'Payment amount must be greater than zero')
})

type Schema = z.output<typeof schema>

const state = reactive({
    method: 'Credit Card' as PaymentMethod,
    amount: 0
})

watch(isOpen, (val) => {
    if (val) {
        state.method = 'Credit Card'
        state.amount = props.balanceDue > 0 ? props.balanceDue : 0
    }
})

const onSubmit = (event: FormSubmitEvent<Schema>) => {
    emit('submit', {
        folioId: props.folioId,
        method: event.data.method,
        amount: event.data.amount,
        paymentDate: new Date().toISOString()
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
                    <UIcon name="i-lucide-wallet" class="text-success" />
                    Apply Payment
                </h3>
                <UButton color="neutral" variant="ghost" icon="i-lucide-x" class="-my-1" @click="onCancel" />
            </div>
        </template>
        <template #body>
            <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
                
                <UFormField label="Payment Method" name="method">
                    <USelect v-model="state.method" :items="paymentMethods" class="w-full" />
                </UFormField>

                <UFormField label="Amount (₱)" name="amount">
                    <UInput v-model.number="state.amount" type="number" min="0.01" step="0.01" class="w-full" />
                    <template #hint>
                        <span class="text-xs text-muted">Current Balance: ₱{{ balanceDue.toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}</span>
                    </template>
                </UFormField>
                
                <div class="pt-4 mt-4 border-t border-default">
                    <div class="flex justify-between items-center text-sm mb-1">
                        <span class="text-muted">Balance Due:</span>
                        <span>₱{{ balanceDue.toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}</span>
                    </div>
                    <div class="flex justify-between items-center text-sm mb-1">
                        <span class="text-muted">Payment Amount:</span>
                        <span class="text-success-600 dark:text-success-400">- ₱{{ state.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}</span>
                    </div>
                    <div class="flex justify-between items-center font-bold mt-2 pt-2 border-t border-default">
                        <span>New Balance:</span>
                        <span :class="balanceDue - state.amount > 0 ? 'text-error-600 dark:text-error-400' : 'text-success-600 dark:text-success-400'">
                            ₱{{ (balanceDue - state.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}
                        </span>
                    </div>
                </div>

                <div class="flex justify-end gap-3 mt-6">
                    <UButton label="Cancel" color="neutral" variant="ghost" @click="onCancel" />
                    <UButton type="submit" label="Apply Payment" color="success" />
                </div>
            </UForm>
        </template>
    </UModal>
</template>
