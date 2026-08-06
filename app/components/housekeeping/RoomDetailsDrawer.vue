<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import type { Room, CleanStatus } from '~/types'


const props = defineProps<{
    room: Room | null
}>()

const isOpen = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{
    (e: 'new-task'): void
}>()

const roomsStore = useRoomsStore()
const housekeepingStore = useHousekeepingStore()
const inventoryStore = useInventoryStore()
const reservationsStore = useReservationsStore()
const foliosStore = useFoliosStore()
const toast = useAppToast()

const selectedRoomTasks = computed(() => {
    if (!props.room) return []
    return housekeepingStore.getTasksForRoom(props.room.id)
})

onMounted(() => {
    inventoryStore.hydrate()
    reservationsStore.hydrate()
    foliosStore.hydrate()
})

const selectedItemId = ref<number | null>(null)
const consumeQty = ref<number>(1)

const minibarItems = computed(() => {
    return inventoryStore.items
})

const activeReservation = computed(() => {
    const room = props.room
    if (!room) return null
    return reservationsStore.reservations.find(
        r => r.roomId === room.id && r.status === 'In-House'
    ) || null
})

const activeFolio = computed(() => {
    const res = activeReservation.value
    if (!res) return null
    return foliosStore.folios.find(
        f => f.reservationId === res.id && f.status === 'Open'
    ) || null
})

watch(() => inventoryStore.items, (newItems) => {
    const firstItem = newItems[0]
    if (firstItem && !selectedItemId.value) {
        selectedItemId.value = firstItem.id
    }
}, { immediate: true })

const logConsumable = () => {
    if (!props.room || !selectedItemId.value) return
    const qty = Number(consumeQty.value)
    if (qty <= 0) {
        toast.error('Invalid Quantity', 'Please select a quantity greater than zero.')
        return
    }

    const item = inventoryStore.items.find(i => i.id === selectedItemId.value)
    if (!item) return
    if (item.stockCount < qty) {
        toast.error('Out of Stock', `Only ${item.stockCount} units of ${item.name} available in inventory.`)
        return
    }

    const success = inventoryStore.logUsage(props.room.id, selectedItemId.value, qty, 'Housekeeping')
    if (!success) {
        toast.error('Error Logging', 'Failed to update inventory.')
        return
    }

    if (activeFolio.value) {
        foliosStore.addCharge({
            folioId: activeFolio.value.id,
            description: `${item.name}`,
            type: item.category === 'Mini Bar' ? 'Mini Bar' : 'Misc',
            unitPrice: item.price,
            quantity: qty,
            total: item.price * qty,
            postedAt: new Date().toISOString()
        })
        toast.success('Charged to Room Folio', `Logged ${qty}x ${item.name} and posted ₱${item.price * qty} to Folio ${activeFolio.value.folioNumber}.`)
    } else {
        toast.success('Inventory Logged', `Logged ${qty}x ${item.name} consumed (Room is Occupied but no active open Folio was found).`)
    }

    consumeQty.value = 1
}

const updateCleanStatus = (status: CleanStatus) => {
    if (!props.room) return
    roomsStore.updateRoom(props.room.id, { cleanStatus: status })
    toast.success('Room Updated', `Room ${props.room.number} marked as ${status}.`)
}

const toggleMaintenance = () => {
    if (!props.room) return
    const newCondition = props.room.condition === 'Maintenance' ? 'Normal' : 'Maintenance'
    if (newCondition === 'Maintenance') {
        const updates: Partial<Room> = { condition: 'Maintenance' }
        if (props.room.cleanStatus === 'Clean' || props.room.cleanStatus === 'Inspected') {
            updates.cleanStatus = 'Pickup'
        }
        roomsStore.updateRoom(props.room.id, updates)
        toast.error('Maintenance Alert', `Room ${props.room.number} is now on Maintenance.`)
    } else {
        roomsStore.updateRoom(props.room.id, { condition: 'Normal', cleanStatus: 'Pickup' })
        toast.success('Maintenance Resolved', `Room ${props.room.number} is back to Normal condition and needs Pickup.`)
    }
}

</script>

<template>
    <UDrawer v-model:open="isOpen" direction="right" inset class="min-w-[400px]">
        <template #header v-if="room">
            <div>
                <h2 class="text-2xl font-bold font-mono tracking-tight flex items-center gap-2">
                    Room {{ room.number }}
                </h2>
                <p class="text-muted text-sm uppercase tracking-widest mt-1">Floor {{ room.floor }}</p>
            </div>
        </template>

        <template #body v-if="room">
            <div class="space-y-8 mt-4">
                <!-- Status Section -->
                <section>
                    <h3 class="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Current Status</h3>
                    <div class="flex flex-wrap gap-2">
                        <UBadge :color="room.occupancyStatus === 'Occupied' ? 'primary' : 'neutral'" variant="soft">
                            {{ room.occupancyStatus }}
                        </UBadge>
                        <UBadge :color="room.cleanStatus === 'Clean' || room.cleanStatus === 'Inspected' ? 'success' : (room.cleanStatus === 'Pickup' ? 'warning' : 'error')" variant="soft">
                            {{ room.cleanStatus }}
                        </UBadge>
                        <UBadge v-if="room.condition === 'Maintenance'" color="error" variant="soft">
                            Maintenance
                        </UBadge>
                    </div>
                </section>

                <!-- Quick Actions Section -->
                <section>
                    <h3 class="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Quick Actions</h3>
                    <div class="grid grid-cols-2 gap-3">
                        <UButton 
                            v-if="room.cleanStatus === 'Dirty' && room.condition === 'Normal'"
                            label="Mark Clean" 
                            icon="i-lucide-sparkles" 
                            color="success" 
                            variant="soft" 
                            size="sm"
                            block
                            @click.stop="updateCleanStatus('Clean')" 
                        />
                        
                        <UButton 
                            v-else-if="room.cleanStatus === 'Pickup' && room.condition === 'Normal'"
                            label="Complete Pickup" 
                            icon="i-lucide-check-circle" 
                            color="primary" 
                            variant="soft" 
                            size="sm"
                            block
                            @click.stop="updateCleanStatus('Clean')" 
                        />
                        
                        <UButton 
                            v-else-if="room.cleanStatus === 'Clean' && room.condition === 'Normal'"
                            label="Mark Inspected" 
                            icon="i-lucide-check-square" 
                            color="success" 
                            variant="solid" 
                            size="sm"
                            block
                            @click.stop="updateCleanStatus('Inspected')" 
                        />
                        
                        <UButton 
                            v-else-if="room.cleanStatus === 'Inspected' && room.condition === 'Normal'"
                            label="Make Dirty" 
                            icon="i-lucide-alert-circle" 
                            color="purple" 
                            variant="soft" 
                            size="sm"
                            block
                            @click.stop="updateCleanStatus('Dirty')" 
                        />
                        
                        <UButton 
                            v-else-if="room.condition === 'Maintenance'"
                            label="Out of Order" 
                            icon="i-lucide-ban" 
                            color="error" 
                            variant="soft" 
                            size="sm"
                            block
                            disabled
                        />

                        <!-- Maintenance Toggle Action -->
                        <UButton 
                            v-if="room.condition === 'Normal'"
                            label="Report" 
                            icon="i-lucide-wrench" 
                            color="neutral" 
                            variant="soft" 
                            size="sm"
                            block
                            @click.stop="toggleMaintenance" 
                        />
                        <UButton 
                            v-else
                            label="Resolve" 
                            icon="i-lucide-check" 
                            color="success" 
                            variant="solid" 
                            size="sm"
                            block
                            @click.stop="toggleMaintenance" 
                        />
                    </div>
                </section>

                <!-- Consumables Section (Only for Occupied Rooms) -->
                <section v-if="room.occupancyStatus === 'Occupied'">
                    <h3 class="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Log Consumables</h3>
                    <div class="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg border border-default space-y-4">
                        <div v-if="activeFolio" class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 mb-2">
                            <UIcon name="i-lucide-check-circle" class="w-4 h-4 text-emerald-500" />
                            Active Folio: {{ activeFolio.folioNumber }}
                        </div>
                        <div v-else class="text-xs text-amber-500 font-semibold flex items-center gap-1.5 mb-2">
                            <UIcon name="i-lucide-alert-triangle" class="w-4 h-4 text-amber-500" />
                            No active open folio. Stock only mode.
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <label class="text-[10px] font-bold uppercase text-muted">Item</label>
                                <select 
                                    v-model="selectedItemId" 
                                    class="w-full px-2 py-1.5 text-xs border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800"
                                >
                                    <option v-for="item in minibarItems" :key="item.id" :value="item.id">
                                        {{ item.name }} (₱{{ item.price }}) [Stock: {{ item.stockCount }}]
                                    </option>
                                </select>
                            </div>
                            <div class="space-y-1">
                                <label class="text-[10px] font-bold uppercase text-muted">Quantity</label>
                                <div class="flex gap-2">
                                    <input 
                                        type="number" 
                                        v-model="consumeQty" 
                                        min="1" 
                                        class="w-16 px-2 py-1.5 text-xs border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800"
                                    />
                                    <UButton 
                                        label="Log" 
                                        size="xs" 
                                        color="primary" 
                                        icon="i-lucide-plus"
                                        class="flex-1"
                                        @click="logConsumable"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Tasks Section -->
                <section>
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-2">
                            <h3 class="text-sm font-semibold text-muted uppercase tracking-wider">Housekeeping Tasks</h3>
                            <UBadge color="neutral" variant="subtle" size="sm" class="font-mono">{{ selectedRoomTasks.length }}</UBadge>
                        </div>
                        <UButton size="xs" icon="i-lucide-plus" color="primary" variant="soft" @click="$emit('new-task')">New Task</UButton>
                    </div>

                    <div v-if="selectedRoomTasks.length > 0" class="space-y-3">
                        <div v-for="task in selectedRoomTasks" :key="task.id" class="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-default space-y-2">
                            <div class="flex justify-between items-start">
                                <span class="font-medium text-sm">{{ task.taskType }}</span>
                                <UBadge :color="task.status === 'Completed' ? 'success' : (task.status === 'In Progress' ? 'warning' : 'neutral')" variant="subtle" size="sm">
                                    {{ task.status }}
                                </UBadge>
                            </div>
                            <p v-if="task.notes" class="text-sm text-muted">{{ task.notes }}</p>
                            
                            <div class="flex gap-2 pt-2" v-if="task.status !== 'Completed'">
                                <UButton 
                                    v-if="task.status === 'Pending'"
                                    label="Start" 
                                    size="xs" 
                                    color="primary" 
                                    variant="soft" 
                                    icon="i-lucide-play" 
                                    @click="housekeepingStore.startTask(task)" 
                                />
                                <UButton 
                                    label="Complete" 
                                    size="xs" 
                                    color="success" 
                                    variant="soft" 
                                    icon="i-lucide-check-circle" 
                                    @click="housekeepingStore.completeTask(task)" 
                                />
                            </div>
                        </div>
                    </div>
                    <div v-else class="text-sm text-muted italic bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg text-center border border-default">
                        No tasks assigned to this room.
                    </div>
                </section>
            </div>
        </template>
        
        <template #body v-else>
            <div class="flex flex-col items-center justify-center py-12 text-muted">
                <UIcon name="i-lucide-bed-double" class="w-12 h-12 mb-4 opacity-50" />
                <p>No room selected.</p>
            </div>
        </template>
    </UDrawer>
</template>
