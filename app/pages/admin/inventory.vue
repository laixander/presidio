<script setup lang="ts">
import { h, ref, computed } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { UBadge, UButton, UInputNumber, UProgress } from '#components'
import type { InventoryItem } from '~/types'

definePageMeta({
    title: 'Inventory & Consumables',
    layout: 'dashboard',
    isTable: true
})

const inventoryStore = useInventoryStore()
const roomsStore = useRoomsStore()
const toast = useAppToast()

// Hydrate store on mount
onMounted(() => {
    inventoryStore.hydrate()
    roomsStore.hydrate()
})

const activeTab = ref<'items' | 'logs'>('items')

// Modal/Form States
const isModalOpen = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const selectedItem = ref<InventoryItem | null>(null)

const form = ref({
    name: '',
    category: 'Mini Bar' as 'Mini Bar' | 'Amenities' | 'Other',
    price: 0,
    stockCount: 0,
    maxStockCount: 10
})

const restockQty = ref<Record<number, number>>({})

const columns: TableColumn<InventoryItem>[] = [
    {
        accessorKey: 'name',
        header: 'Item Name',
        cell: ({ row }) => h('span', { class: 'font-medium text-neutral-900 dark:text-white' }, row.original.name)
    },
    {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => h(UBadge, {
            color: row.original.category === 'Mini Bar' ? 'primary' : 'neutral',
            variant: 'soft',
            size: 'sm'
        }, () => row.original.category)
    },
    {
        accessorKey: 'price',
        header: 'Billing Price',
        cell: ({ row }) => h('span', { class: 'font-mono font-medium text-emerald-600 dark:text-emerald-400' }, `₱${row.original.price.toFixed(2)}`)
    },
    {
        accessorKey: 'stockCount',
        header: 'Stock Level',
        cell: ({ row }) => {
            const item = row.original
            const percent = Math.min((item.stockCount / item.maxStockCount) * 100, 100)
            const isLow = item.stockCount <= 5

            return h('div', { class: 'space-y-1.5 max-w-[150px]' }, [
                h('div', { class: 'flex justify-between text-xs font-medium' }, [
                    h('span', `${item.stockCount} / ${item.maxStockCount}`),
                    isLow ? h('span', { class: 'text-rose-500 animate-pulse font-bold' }, 'Low Stock') : null
                ]),
                h(UProgress, {
                    modelValue: percent,
                    color: isLow ? 'error' : 'primary',
                    size: 'sm'
                })
            ])
        }
    },
    {
        id: 'restock',
        header: 'Quick Restock',
        cell: ({ row }) => {
            const itemId = row.original.id
            return h('div', { class: 'flex items-center gap-2' }, [
                h(UInputNumber, {
                    modelValue: restockQty.value[itemId],
                    'onUpdate:modelValue': (val: number | null) => { restockQty.value[itemId] = val ?? 0 },
                    placeholder: 'Qty',
                    size: 'xs',
                    class: 'w-24'
                }),
                h(UButton, {
                    label: 'Restock',
                    size: 'xs',
                    color: 'success',
                    variant: 'soft',
                    icon: 'i-lucide-plus',
                    onClick: () => handleRestock(itemId)
                })
            ])
        }
    },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
            const item = row.original
            return h('div', { class: 'flex justify-end gap-2' }, [
                h(UButton, {
                    icon: 'i-lucide-edit',
                    size: 'xs',
                    color: 'neutral',
                    variant: 'ghost',
                    onClick: () => openEditModal(item)
                }),
                h(UButton, {
                    icon: 'i-lucide-trash',
                    size: 'xs',
                    color: 'error',
                    variant: 'ghost',
                    onClick: () => handleDelete(item)
                })
            ])
        }
    }
]

function openAddModal() {
    modalMode.value = 'add'
    form.value = {
        name: '',
        category: 'Mini Bar',
        price: 0,
        stockCount: 0,
        maxStockCount: 10
    }
    isModalOpen.value = true
}

function openEditModal(item: InventoryItem) {
    selectedItem.value = item
    modalMode.value = 'edit'
    form.value = {
        name: item.name,
        category: item.category,
        price: item.price,
        stockCount: item.stockCount,
        maxStockCount: item.maxStockCount
    }
    isModalOpen.value = true
}

function handleSubmit() {
    if (modalMode.value === 'add') {
        inventoryStore.addInventoryItem({
            name: form.value.name,
            category: form.value.category,
            price: Number(form.value.price),
            stockCount: Number(form.value.stockCount),
            maxStockCount: Number(form.value.maxStockCount)
        })
        toast.success('Item Added', `${form.value.name} has been added to inventory.`)
    } else if (selectedItem.value) {
        inventoryStore.updateInventoryItem(selectedItem.value.id, {
            name: form.value.name,
            category: form.value.category,
            price: Number(form.value.price),
            stockCount: Number(form.value.stockCount),
            maxStockCount: Number(form.value.maxStockCount)
        })
        toast.success('Item Updated', `${form.value.name} details have been updated.`)
    }
    isModalOpen.value = false
}

function handleRestock(itemId: number) {
    const qty = Number(restockQty.value[itemId] || 0)
    if (qty <= 0) {
        toast.error('Invalid Quantity', 'Please enter a valid restocking quantity.')
        return
    }
    inventoryStore.restockItem(itemId, qty)
    const item = inventoryStore.items.find(i => i.id === itemId)
    toast.success('Item Restocked', `Restocked ${qty} units of ${item?.name || 'item'}.`)
    restockQty.value[itemId] = 0
}

function handleDelete(item: InventoryItem) {
    if (confirm(`Are you sure you want to delete ${item.name} from inventory?`)) {
        inventoryStore.deleteInventoryItem(item.id)
        toast.success('Item Deleted', `${item.name} has been deleted.`)
    }
}

// Helpers
function getRoomNumber(roomId: number) {
    const room = roomsStore.rooms.find(r => r.id === roomId)
    return room ? `Room ${room.number}` : `Room #${roomId}`
}

function getItemName(itemId: number) {
    const item = inventoryStore.items.find(i => i.id === itemId)
    return item ? item.name : `Item #${itemId}`
}

function formatTime(timestamp: string) {
    return new Date(timestamp).toLocaleString()
}
</script>

<template>
        <ClientOnly>
            <Teleport to="#header-actions-teleport">
            <UButton 
                label="New Item" 
                icon="i-lucide-plus" 
                color="primary" 
                variant="solid" 
                @click="openAddModal" 
            />
            </Teleport>
        </ClientOnly>
        <!-- Navigation Tabs -->
        <UTabs
            v-model="activeTab"
            :items="[
                { label: 'Consumable Items', value: 'items', icon: 'i-lucide-package' },
                { label: 'Usage & Charge Logs', value: 'logs', icon: 'i-lucide-history' }
            ]"
            :content="false"
            variant="link"
            class="w-full mb-[1px]"
        />

        <!-- Tabs Content -->
        <template v-if="activeTab === 'items'">
            <UTable :data="inventoryStore.items" :columns="columns" class="flex-1 scrollbar" sticky>
                <template #empty>
                    <Empty title="No items found"
                        description="There are currently no items in your inventory. Add a new item to get started."
                        icon="i-lucide-package">
                        <template #action>
                            <UButton label="Add First Item" icon="i-lucide-plus" color="primary" size="lg" @click="openAddModal" />
                        </template>
                    </Empty>
                </template>
            </UTable>
        </template>

        <template v-else>
            <Empty v-if="inventoryStore.logs.length === 0" 
                title="No usage logs" 
                description="No usage logs reported yet. Usage logs will appear here when items are consumed." 
                icon="i-lucide-history" 
            />
            <div v-else class="space-y-4 p-4 sm:p-6 overflow-y-auto scrollbar">
                <UCard 
                    v-for="log in inventoryStore.logs" 
                    :key="log.id"
                    variant="subtle"
                    :ui="{ body: 'flex justify-between items-center gap-6' }"
                    class="shadow-sm"
                >
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                            {{ log.quantity }}x
                        </div>
                        <div>
                            <p class="font-medium text-sm text-neutral-900 dark:text-white">
                                {{ getItemName(log.itemId) }} used in <span class="underline font-semibold">{{ getRoomNumber(log.roomId) }}</span>
                            </p>
                            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                Logged by: {{ log.loggedBy }}
                            </p>
                        </div>
                    </div>
                    <div class="text-right text-xs text-dimmed">
                        {{ formatTime(log.timestamp) }}
                    </div>
                </UCard>
            </div>
        </template>

        <!-- Add/Edit Modal -->
        <UModal v-model:open="isModalOpen" :title="modalMode === 'add' ? 'Add Inventory Item' : 'Edit Inventory Item'">
            <template #body>
            <div class="space-y-4">
                <UFormField label="Item Name">
                    <UInput 
                        v-model="form.name" 
                        placeholder="e.g., Coca Cola 320ml"
                        class="w-full"
                    />
                </UFormField>
                <UFormField label="Category">
                    <USelect 
                        v-model="form.category" 
                        :items="['Mini Bar', 'Amenities', 'Other']"
                        class="w-full"
                    />
                </UFormField>
                <div class="grid grid-cols-2 gap-4">
                    <UFormField label="Price (₱)">
                        <UInputNumber 
                            v-model="form.price" 
                            class="w-full"
                        />
                    </UFormField>
                    <UFormField label="Stock Count">
                        <UInputNumber 
                            v-model="form.stockCount" 
                            class="w-full"
                        />
                    </UFormField>
                </div>
                <UFormField label="Max Stock Count">
                    <UInputNumber 
                        v-model="form.maxStockCount" 
                        class="w-full"
                    />
                </UFormField>
                <div class="flex justify-end gap-2 pt-4">
                    <UButton label="Cancel" color="neutral" variant="ghost" @click="isModalOpen = false" />
                    <UButton label="Save Item" color="primary" variant="solid" @click="handleSubmit" />
                </div>
            </div>
            </template>
        </UModal>
</template>
