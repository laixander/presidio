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
const reservationsStore = useReservationsStore()
const roomsStore = useRoomsStore()

const guestOptions = computed(() => 
    guestsStore.guests.map(g => ({
        label: `${g.firstName} ${g.lastName} ${g.email ? `(${g.email})` : ''}`,
        value: g.id
    }))
)

const roomTypeOptions = computed(() => {
    return roomsStore.roomTypes.map(rt => ({
        label: rt.name,
        value: rt.id
    }))
})

const schema = z.object({
    groupName: z.string().min(1, 'Group Name is required'),
    contactType: z.enum(['existing', 'new']),
    contactGuestId: z.number().optional(),
    contactPerson: z.string().optional(),
    contactNumber: z.string().optional(),
    totalGuests: z.number().min(1, 'Must have at least 1 guest'),
    checkInDate: z.string().min(1, 'Check-in date is required'),
    checkOutDate: z.string().min(1, 'Check-out date is required'),
    roomAssignments: z.array(z.any()).default([])
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
    checkOutDate: '',
    roomAssignments: [] as { id?: number, roomTypeId: number | undefined, guestId: number | undefined }[]
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
        
        const existingRes = reservationsStore.reservations.filter(r => r.groupId === newVal.id)
        form.roomAssignments = existingRes.map(r => ({
            id: r.id,
            roomTypeId: r.roomTypeId,
            guestId: reservationsStore.getPrimaryGuestId(r)
        }))
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
    
    const groupId = props.group.id
    const existingResIds = reservationsStore.reservations.filter(r => r.groupId === groupId).map(r => r.id)
    const activeIds: number[] = []
    
    event.data.roomAssignments.forEach(assignment => {
        if (assignment.roomTypeId && assignment.guestId) {
            if (assignment.id) {
                activeIds.push(assignment.id)
                reservationsStore.updateReservation(assignment.id, {
                    roomTypeId: assignment.roomTypeId,
                    guests: [{ guestId: assignment.guestId, isPrimary: true }],
                    checkInDate: event.data.checkInDate,
                    checkOutDate: event.data.checkOutDate
                })
            } else {
                reservationsStore.addReservation({
                    guests: [{ guestId: assignment.guestId, isPrimary: true }],
                    groupId: groupId,
                    roomTypeId: assignment.roomTypeId,
                    roomId: null,
                    checkInDate: event.data.checkInDate,
                    checkOutDate: event.data.checkOutDate,
                    status: 'Pending',
                    source: 'Corporate'
                })
            }
        }
    })
    
    existingResIds.forEach(id => {
        if (!activeIds.includes(id)) {
            reservationsStore.deleteReservation(id)
        }
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

                    <div class="mt-4 space-y-3 border-t border-default pt-4">
                        <div class="flex justify-between items-center">
                            <label class="text-sm font-medium">Room Assignments (Rooming List)</label>
                            <UButton label="Add Room" icon="i-lucide-plus" size="xs" color="neutral" variant="soft" @click="form.roomAssignments.push({roomTypeId: undefined, guestId: undefined})" />
                        </div>
                        
                        <div v-for="(assignment, idx) in form.roomAssignments" :key="idx" class="flex items-center gap-2">
                            <USelect v-model.number="assignment.roomTypeId" :items="roomTypeOptions" placeholder="Select Room Style..." class="flex-1" />
                            <USelect v-model.number="assignment.guestId" :items="guestOptions" placeholder="Select Guest..." class="flex-1" />
                            <UButton icon="i-lucide-trash-2" color="error" variant="ghost" @click="form.roomAssignments.splice(idx, 1)" />
                        </div>
                        <div v-if="form.roomAssignments.length === 0" class="text-sm text-muted italic">
                            No rooms assigned yet. Click "Add Room" to begin rooming list.
                        </div>
                    </div>

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
