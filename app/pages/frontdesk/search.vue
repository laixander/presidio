<script setup lang="ts">
/**
 * ============================================================================
 * Page: Search Availability (/frontdesk/search)
 * ============================================================================
 * This page acts as the entry point for walk-in bookings and phone reservations.
 * It allows the front desk agent to check if a specific room type is available 
 * for a requested set of dates.
 */
import { ref, computed } from 'vue'

definePageMeta({
    title: 'Search Availability',
    layout: 'dashboard'
})

const roomsStore = useRoomsStore()
const reservationsStore = useReservationsStore()
const router = useRouter()

const checkIn = ref('')
const checkOut = ref('')
const guestsCount = ref(1)
const hasSearched = ref(false)

const handleSearch = () => {
    if (!checkIn.value || !checkOut.value) return
    hasSearched.value = true
}

const availableRoomTypes = computed(() => {
    if (!hasSearched.value) return []
    
    // In a real PMS, availability requires checking every reservation to see if dates overlap.
    // For this MVP frontend simulation, we simplify the logic: we assume a room type 
    // is available if we have at least one room of that type in the inventory 
    // and its max occupancy is sufficient.
    
    return roomsStore.roomTypes.map(rt => {
        // Find rooms of this type
        const roomsOfType = roomsStore.rooms.filter(r => r.roomTypeId === rt.id)
        
        // Simple mock availability: Assume available if there are rooms of this type 
        // and maxOccupancy is sufficient.
        const isAvailable = roomsOfType.length > 0 && rt.maxOccupancy >= guestsCount.value
        
        // Calculate total price based on base rate and nights
        const msPerDay = 1000 * 60 * 60 * 24
        const nights = (checkIn.value && checkOut.value) 
            ? Math.max(1, Math.round((new Date(checkOut.value).getTime() - new Date(checkIn.value).getTime()) / msPerDay))
            : 1
            
        return {
            ...rt,
            isAvailable,
            totalPrice: rt.baseRate * nights,
            nights,
            availableCount: roomsOfType.length
        }
    }).filter(rt => rt.isAvailable)
})

const bookRoomType = (roomTypeId: number) => {
    router.push({
        path: '/frontdesk/bookings/new',
        query: {
            checkIn: checkIn.value,
            checkOut: checkOut.value,
            roomTypeId
        }
    })
}
</script>

<template>
    <div class="max-w-4xl mx-auto py-6 px-4 sm:px-6">
        <div class="mb-8">
            <h1 class="text-2xl font-bold">Search Availability</h1>
            <p class="text-muted">Find available rooms for upcoming dates.</p>
        </div>

        <!-- Search Form -->
        <UCard class="mb-8">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <UFormField label="Check-In Date" name="checkIn">
                    <UInput v-model="checkIn" type="date" icon="i-lucide-calendar-days" class="w-full" />
                </UFormField>
                <UFormField label="Check-Out Date" name="checkOut">
                    <UInput v-model="checkOut" type="date" icon="i-lucide-calendar-days" class="w-full" />
                </UFormField>
                <UFormField label="Guests" name="guestsCount">
                    <UInput v-model.number="guestsCount" type="number" min="1" max="10" icon="i-lucide-users" class="w-full" />
                </UFormField>
                <div>
                    <UButton label="Search Availability" icon="i-lucide-search" color="primary" block @click="handleSearch" :disabled="!checkIn || !checkOut" />
                </div>
            </div>
        </UCard>

        <!-- Search Results -->
        <div v-if="hasSearched">
            <h2 class="text-lg font-semibold mb-4">Available Room Types</h2>
            
            <div v-if="availableRoomTypes.length > 0" class="space-y-4">
                <UCard v-for="rt in availableRoomTypes" :key="rt.id" class="overflow-hidden">
                    <div class="flex flex-col sm:flex-row gap-6">
                        <!-- Image placeholder -->
                        <div class="w-full sm:w-48 h-32 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center flex-shrink-0">
                            <UIcon name="i-lucide-bed-double" class="size-8 text-neutral-400" />
                        </div>
                        
                        <!-- Details -->
                        <div class="flex-1 flex flex-col justify-between">
                            <div>
                                <div class="flex items-start justify-between">
                                    <h3 class="text-lg font-bold">{{ rt.name }}</h3>
                                    <div class="text-right">
                                        <div class="text-lg font-bold text-primary">₱{{ rt.totalPrice.toLocaleString() }}</div>
                                        <div class="text-xs text-muted">for {{ rt.nights }} night(s)</div>
                                    </div>
                                </div>
                                <div class="flex items-center gap-4 mt-2 text-sm text-muted">
                                    <div class="flex items-center gap-1">
                                        <UIcon name="i-lucide-users" class="size-4" />
                                        Max {{ rt.maxOccupancy }} Guests
                                    </div>
                                    <div class="flex items-center gap-1">
                                        <UIcon name="i-lucide-door-open" class="size-4" />
                                        {{ rt.availableCount }} rooms total
                                    </div>
                                </div>
                            </div>
                            
                            <div class="flex justify-end mt-4">
                                <UButton label="Book Now" color="primary" @click="bookRoomType(rt.id)" />
                            </div>
                        </div>
                    </div>
                </UCard>
            </div>
            
            <UCard v-else class="text-center py-12">
                <UIcon name="i-lucide-calendar-x" class="size-12 text-muted mb-4 mx-auto" />
                <h3 class="text-lg font-medium">No Availability</h3>
                <p class="text-muted mt-1">There are no rooms available for the selected dates or guest count.</p>
            </UCard>
        </div>
    </div>
</template>
