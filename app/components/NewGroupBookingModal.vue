<script setup lang="ts">
/**
 * ============================================================================
 * Page: Create Group Reservation (/frontdesk/groups/new)
 * ============================================================================
 * Form to create a new group booking.
 */
import { ref, reactive, computed } from 'vue'
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const isOpen = defineModel<boolean>('open', { default: false })

const router = useRouter()
const guestsStore = useGuestsStore()
const groupsStore = useGroupsStore()
const roomsStore = useRoomsStore()
const reservationsStore = useReservationsStore()
const toast = useAppToast()
const logger = useLogger('groups')

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

const statusOptions = ['Pending', 'Confirmed']

const schema = z.object({
    groupName: z.string().min(1, 'Group Name is required'),
    contactType: z.enum(['existing', 'new']),
    contactGuestId: z.number().optional(),
    contactPerson: z.string().optional(),
    contactNumber: z.string().optional(),
    totalGuests: z.number().min(1, 'Must have at least 1 guest'),
    checkInDate: z.string().min(1, 'Check-in date is required'),
    checkOutDate: z.string().min(1, 'Check-out date is required'),
    roomAssignments: z.array(z.any()).default([]),
    status: z.enum(['Pending', 'Confirmed'])
}).refine(data => {
    if (data.contactType === 'existing') {
        return !!data.contactGuestId && data.contactGuestId > 0;
    } else {
        return !!data.contactPerson && data.contactPerson.trim().length > 0;
    }
}, {
    message: "Contact information is required based on the selected type.",
    path: ["contactPerson"] // focus error on contact person if failing
})

type Schema = z.infer<typeof schema>

const state = reactive({
    groupName: '',
    contactType: 'new' as 'existing' | 'new',
    contactGuestId: 0,
    contactPerson: '',
    contactNumber: '',
    totalGuests: 1,
    checkInDate: '',
    checkOutDate: '',
    roomAssignments: [] as { roomTypeId: number | undefined, guestId: number | undefined }[],
    status: 'Confirmed' as const
})

const handleSubmit = (event: FormSubmitEvent<Schema>) => {
    const group = groupsStore.addGroup({
        groupName: event.data.groupName,
        contactGuestId: event.data.contactType === 'existing' ? event.data.contactGuestId : undefined,
        contactPerson: event.data.contactType === 'new' ? event.data.contactPerson : undefined,
        contactNumber: event.data.contactType === 'new' ? event.data.contactNumber : undefined,
        totalGuests: event.data.totalGuests,
        checkInDate: event.data.checkInDate,
        checkOutDate: event.data.checkOutDate,
        status: event.data.status
    })

    if (event.data.roomAssignments && event.data.roomAssignments.length > 0) {
        event.data.roomAssignments.forEach(assignment => {
            if (assignment.roomTypeId && assignment.guestId) {
                reservationsStore.addReservation({
                    guests: [{ guestId: assignment.guestId, isPrimary: true }],
                    groupId: group.id,
                    roomTypeId: assignment.roomTypeId,
                    roomId: null,
                    checkInDate: event.data.checkInDate,
                    checkOutDate: event.data.checkOutDate,
                    status: 'Pending',
                    source: 'Corporate'
                })
            }
        })
    }
    
    logger.addLog(`Created group booking ${group.groupName}`, 'Created', 'success')
    toast.success('Group Created', `Group booking for ${group.groupName} has been successfully created.`)
    
    isOpen.value = false
    router.push(`/frontdesk/bookings/groups/${group.id}`)
}
</script>

<template>
    <UModal v-model:open="isOpen" :ui="{ content: 'sm:max-w-3xl' }">
        <template #header>
            <div class="flex items-center gap-4">
                <div>
                    <h1 class="text-2xl font-bold">New Group Booking</h1>
                    <p class="text-muted">Create a new corporate or event block.</p>
                </div>
            </div>
        </template>
        
        <template #body>
            <UForm :schema="schema" :state="state" class="space-y-6" @submit="handleSubmit">
                
                <!-- Group Details -->
                <div class="space-y-4">
                    <h3 class="text-lg font-medium border-b border-default pb-2">1. Group Details</h3>
                    <UFormField label="Group Name" name="groupName">
                        <UInput v-model="state.groupName" placeholder="e.g. ABC Corporation Team Building" class="w-full" />
                    </UFormField>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <UFormField label="Total Guests" name="totalGuests">
                            <UInput v-model.number="state.totalGuests" type="number" min="1" class="w-full" />
                        </UFormField>
                    </div>
                </div>

                <!-- Contact Info -->
                <div class="space-y-4 pt-4">
                    <h3 class="text-lg font-medium border-b border-default pb-2">2. Contact Information</h3>
                    
                    <div class="flex gap-4 mb-4">
                        <URadioGroup v-model="state.contactType" :items="[{label: 'Enter Contact Details', value: 'new'}, {label: 'Select Existing Guest', value: 'existing'}]" orientation="horizontal" />
                    </div>

                    <template v-if="state.contactType === 'existing'">
                        <UFormField label="Select Guest" name="contactGuestId">
                            <USelect v-model.number="state.contactGuestId" :items="guestOptions" placeholder="Search or select a guest..." class="w-full" />
                        </UFormField>
                    </template>
                    <template v-else>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <UFormField label="Contact Person" name="contactPerson">
                                <UInput v-model="state.contactPerson" placeholder="e.g. Rose Jaworski" class="w-full" />
                            </UFormField>
                            <UFormField label="Contact Number" name="contactNumber">
                                <UInput v-model="state.contactNumber" placeholder="e.g. 09138272819" class="w-full" />
                            </UFormField>
                        </div>
                    </template>
                </div>

                <!-- Stay Details -->
                <div class="space-y-4 pt-4">
                    <h3 class="text-lg font-medium border-b border-default pb-2">3. Stay Details</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <UFormField label="Check-In Date" name="checkInDate">
                            <UInput v-model="state.checkInDate" type="date" icon="i-lucide-calendar-days" class="w-full" />
                        </UFormField>
                        <UFormField label="Check-Out Date" name="checkOutDate">
                            <UInput v-model="state.checkOutDate" type="date" icon="i-lucide-calendar-days" class="w-full" />
                        </UFormField>
                        
                        <div class="sm:col-span-2 mt-4 space-y-3 border-t border-default pt-4">
                            <div class="flex justify-between items-center">
                                <label class="text-sm font-medium">Room Assignments (Rooming List)</label>
                                <UButton label="Add Room" icon="i-lucide-plus" size="xs" color="neutral" variant="soft" @click="state.roomAssignments.push({roomTypeId: undefined, guestId: undefined})" />
                            </div>
                            
                            <div v-for="(assignment, idx) in state.roomAssignments" :key="idx" class="flex items-center gap-2">
                                <USelect v-model.number="assignment.roomTypeId" :items="roomTypeOptions" placeholder="Select Room Style..." class="flex-1" />
                                <USelect v-model.number="assignment.guestId" :items="guestOptions" placeholder="Select Guest..." class="flex-1" />
                                <UButton icon="i-lucide-trash-2" color="error" variant="ghost" @click="state.roomAssignments.splice(idx, 1)" />
                            </div>
                            <div v-if="state.roomAssignments.length === 0" class="text-sm text-muted italic">
                                No rooms assigned yet. Click "Add Room" to begin rooming list.
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Booking Meta -->
                <div class="space-y-4 pt-4">
                    <h3 class="text-lg font-medium border-b border-default pb-2">4. Status</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <UFormField label="Initial Status" name="status">
                            <USelect v-model="state.status" :items="statusOptions" icon="i-lucide-info" class="w-full" />
                        </UFormField>
                    </div>
                </div>

                <div class="pt-6 flex justify-end gap-3">
                    <UButton label="Cancel" color="neutral" variant="ghost" @click="isOpen = false" />
                    <UButton type="submit" label="Create Group" color="primary" size="lg" icon="i-lucide-check" />
                </div>
            </UForm>
        </template>
    </UModal>
</template>
