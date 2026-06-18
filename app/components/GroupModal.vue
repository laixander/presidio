<script setup lang="ts">
import { reactive, watch, useTemplateRef, computed } from 'vue'
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { GroupReservation } from '~/types'

interface Props {
    group: GroupReservation
}

const props = defineProps<Props>()

const emit = defineEmits<{
    (e: 'submit', groupData: Partial<GroupReservation>): void
}>()

const isOpen = defineModel<boolean>('open', { default: false })
const formRef = useTemplateRef('form')
const guestsStore = useGuestsStore()

const guestOptions = computed(() => 
    guestsStore.guests.map(g => ({
        label: `${g.firstName} ${g.lastName} ${g.email ? `(${g.email})` : ''}`,
        value: g.id
    }))
)

const schema = z.object({
    groupName: z.string().min(1, 'Group Name is required'),
    contactType: z.enum(['existing', 'new']),
    contactGuestId: z.number().optional(),
    contactPerson: z.string().optional(),
    contactNumber: z.string().optional(),
    totalGuests: z.number().min(1, 'Must have at least 1 guest'),
    checkInDate: z.string().min(1, 'Check-in date is required'),
    checkOutDate: z.string().min(1, 'Check-out date is required')
}).refine(data => {
    if (data.contactType === 'existing') {
        return !!data.contactGuestId && data.contactGuestId > 0;
    } else {
        return !!data.contactPerson && data.contactPerson.trim().length > 0;
    }
}, {
    message: "Contact information is required based on the selected type.",
    path: ["contactPerson"]
})

type Schema = z.output<typeof schema>

const form = reactive({
    groupName: '',
    contactType: 'existing' as 'existing' | 'new',
    contactGuestId: 0,
    contactPerson: '',
    contactNumber: '',
    totalGuests: 1,
    checkInDate: '',
    checkOutDate: ''
})

watch(() => props.group, (newVal) => {
    if (newVal) {
        form.groupName = newVal.groupName
        form.contactType = newVal.contactGuestId ? 'existing' : 'new'
        form.contactGuestId = newVal.contactGuestId || 0
        form.contactPerson = newVal.contactPerson || ''
        form.contactNumber = newVal.contactNumber || ''
        form.totalGuests = newVal.totalGuests
        form.checkInDate = newVal.checkInDate
        form.checkOutDate = newVal.checkOutDate
    }
}, { deep: true, immediate: true })

function onSubmit(event: FormSubmitEvent<Schema>) {
    emit('submit', {
        groupName: event.data.groupName,
        contactGuestId: event.data.contactType === 'existing' ? event.data.contactGuestId : undefined,
        contactPerson: event.data.contactType === 'new' ? event.data.contactPerson : undefined,
        contactNumber: event.data.contactType === 'new' ? event.data.contactNumber : undefined,
        totalGuests: event.data.totalGuests,
        checkInDate: event.data.checkInDate,
        checkOutDate: event.data.checkOutDate
    })
    isOpen.value = false
}

function onCancel() {
    isOpen.value = false
}
</script>

<template>
    <UModal v-model:open="isOpen" :ui="{ content: 'w-full sm:max-w-xl' }">
        <template #content="{ close }">
            <div class="flex flex-col gap-6 p-4 sm:p-6">
                <!-- Header -->
                <div class="flex flex-col gap-1">
                    <h3 class="text-lg font-semibold">Edit Group Details</h3>
                    <p class="text-muted text-sm">Update group booking information.</p>
                </div>

                <!-- Form -->
                <UForm ref="form" :state="form" :schema="schema" class="flex flex-col gap-4" @submit="onSubmit">
                    <UFormField label="Group Name" name="groupName">
                        <UInput v-model="form.groupName" class="w-full" />
                    </UFormField>

                    <div class="grid grid-cols-2 gap-4">
                        <UFormField label="Check-In Date" name="checkInDate">
                            <UInput type="date" v-model="form.checkInDate" icon="i-lucide-calendar-days" class="w-full" />
                        </UFormField>
                        <UFormField label="Check-Out Date" name="checkOutDate">
                            <UInput type="date" v-model="form.checkOutDate" icon="i-lucide-calendar-days" class="w-full" />
                        </UFormField>
                    </div>

                    <UFormField label="Total Guests" name="totalGuests">
                        <UInput type="number" v-model.number="form.totalGuests" class="w-full" />
                    </UFormField>

                    <div class="flex gap-4 mb-2 mt-4">
                        <URadioGroup v-model="form.contactType" :items="[{label: 'Enter Contact Details', value: 'new'}, {label: 'Select Existing Guest', value: 'existing'}]" orientation="horizontal" />
                    </div>

                    <template v-if="form.contactType === 'existing'">
                        <UFormField label="Select Guest" name="contactGuestId">
                            <USelect v-model.number="form.contactGuestId" :items="guestOptions" placeholder="Search or select a guest..." class="w-full" />
                        </UFormField>
                    </template>
                    <template v-else>
                        <div class="grid grid-cols-2 gap-4">
                            <UFormField label="Contact Person" name="contactPerson">
                                <UInput v-model="form.contactPerson" placeholder="e.g. Rose Jaworski" class="w-full" />
                            </UFormField>
                            <UFormField label="Contact Number" name="contactNumber">
                                <UInput v-model="form.contactNumber" placeholder="e.g. 09138272819" class="w-full" />
                            </UFormField>
                        </div>
                    </template>

                    <!-- Actions -->
                    <div class="flex justify-end gap-2 pt-4">
                        <UButton label="Cancel" color="neutral" variant="ghost" @click="onCancel" />
                        <UButton type="submit" label="Save Changes" color="primary" icon="i-lucide-save" />
                    </div>
                </UForm>
            </div>

            <!-- Close Button -->
            <UButton icon="i-lucide-x" color="neutral" variant="ghost" class="absolute top-2 right-2" @click="close" />
        </template>
    </UModal>
</template>
