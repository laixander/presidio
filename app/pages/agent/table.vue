<script setup lang="ts">
// ============================================================================
// Imports
// ============================================================================
import { h, ref, reactive, useTemplateRef } from 'vue'
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import { useOverlay } from '#imports'
import { UButton, UBadge, UDropdownMenu } from '#components'

// Components (shared, generic)
import ConfirmationModal from '~/components/ConfirmationModal.vue'

// ============================================================================
// Page Configuration
// ============================================================================
definePageMeta({
    layout: 'agent',
    title: 'Table',
    isTable: true,
    headerActions: [
        { label: 'History',           icon: 'i-lucide-history',      event: 'viewTableLogs',  variant: 'soft'    },
        // { label: 'Deploy Demo Data',  icon: 'i-lucide-database-zap', event: 'deployDemoData', variant: 'soft'    },
        { label: 'Add Item',          icon: 'i-lucide-plus',         event: 'addItem',        color: 'primary'   }
    ]
})

// ============================================================================
// Generic Item Type (self-contained, not tied to the real app's data layer)
// ============================================================================
interface Item {
    id: number
    name: string
    category: string
    status: 'Active' | 'Inactive'
    priority: 'High' | 'Medium' | 'Low'
}

// ============================================================================
// Sample Data
// ============================================================================
const SAMPLE_ITEMS: Item[] = [
    { id:  1, name: 'Alpha Project',        category: 'Engineering', status: 'Active',   priority: 'High'   },
    { id:  2, name: 'Beta Campaign',        category: 'Marketing',   status: 'Active',   priority: 'Medium' },
    { id:  3, name: 'Gamma Report',         category: 'Finance',     status: 'Inactive', priority: 'Low'    },
    { id:  4, name: 'Delta Initiative',     category: 'Operations',  status: 'Active',   priority: 'High'   },
    { id:  5, name: 'Epsilon Task',         category: 'Engineering', status: 'Inactive', priority: 'Medium' },
    { id:  6, name: 'Zeta Pipeline',        category: 'Finance',     status: 'Active',   priority: 'Low'    },
    { id:  7, name: 'Eta Research',         category: 'Marketing',   status: 'Active',   priority: 'High'   },
    { id:  8, name: 'Theta Module',         category: 'Operations',  status: 'Inactive', priority: 'Medium' },
    { id:  9, name: 'Iota Framework',       category: 'Engineering', status: 'Active',   priority: 'High'   },
    { id: 10, name: 'Kappa Dashboard',      category: 'Marketing',   status: 'Active',   priority: 'Medium' },
    { id: 11, name: 'Lambda Audit',         category: 'Finance',     status: 'Inactive', priority: 'High'   },
    { id: 12, name: 'Mu Workflow',          category: 'Operations',  status: 'Active',   priority: 'Low'    },
    { id: 13, name: 'Nu Integration',       category: 'Engineering', status: 'Active',   priority: 'Medium' },
    { id: 14, name: 'Xi Analytics',         category: 'Marketing',   status: 'Inactive', priority: 'Low'    },
    { id: 15, name: 'Omicron Budget',       category: 'Finance',     status: 'Active',   priority: 'High'   },
    { id: 16, name: 'Pi Scheduler',         category: 'Operations',  status: 'Active',   priority: 'Medium' },
    { id: 17, name: 'Rho API Gateway',      category: 'Engineering', status: 'Inactive', priority: 'High'   },
    { id: 18, name: 'Sigma Growth Plan',    category: 'Marketing',   status: 'Active',   priority: 'Low'    },
    { id: 19, name: 'Tau Reconciliation',   category: 'Finance',     status: 'Active',   priority: 'Medium' },
    { id: 20, name: 'Upsilon Deployment',   category: 'Operations',  status: 'Active',   priority: 'High'   },
]

// ============================================================================
// Composables & State
// ============================================================================
const events  = useEvents()
const overlay = useOverlay()
const logger  = useLogger('table-reference')
const toast   = useAppToast()

// Modals
const confirmModal = overlay.create(ConfirmationModal)

// Local Data State (self-contained, no external store)
const items       = ref<Item[]>([])
const nextId      = ref(SAMPLE_ITEMS.length + 1)
const isDeploying = ref(false)

// Drawer & Add-form State
const isDrawerOpen = ref(false)
const isAddOpen    = ref(false)

const CATEGORIES = ['Engineering', 'Marketing', 'Finance', 'Operations']
const PRIORITIES: Item['priority'][] = ['High', 'Medium', 'Low']

const addForm = reactive<Omit<Item, 'id'>>({
    name:     '',
    category: 'Engineering',
    status:   'Active',
    priority: 'Medium',
})

function resetAddForm() {
    addForm.name     = ''
    addForm.category = 'Engineering'
    addForm.status   = 'Active'
    addForm.priority = 'Medium'
}

// Edit Form State
const isEditOpen  = ref(false)
const editTarget  = ref<Item | null>(null)
const editForm    = reactive<Omit<Item, 'id'>>({
    name:     '',
    category: 'Engineering',
    status:   'Active',
    priority: 'Medium',
})

// ============================================================================
// Event Listeners
// ============================================================================
events.on('addItem', () => {
    isAddOpen.value = true
})
events.on('viewTableLogs', () => {
    isDrawerOpen.value = true
})
events.on('deployDemoData', () => {
    handleDeployDemoData()
})

// ============================================================================
// Methods
// ============================================================================

/**
 * Deploy Demo Data
 * Replaces the current list with the full sample dataset.
 */
async function handleDeployDemoData() {
    if (isDeploying.value) return
    isDeploying.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    items.value = [...SAMPLE_ITEMS]
    nextId.value = SAMPLE_ITEMS.length + 1
    logger.addLog('Deployed demo data (20 items)', 'Seeded', 'success')
    toast.success('Demo Data Deployed', '20 sample items have been loaded into the table.')
    isDeploying.value = false
}

/**
 * Reset Table
 * Clears all items from the table.
 */
function handleResetTable() {
    confirmModal.open({
        title:        'Reset Table',
        description:  'This will clear all items from the table. This action cannot be undone.',
        confirmLabel: 'Reset',
        confirmColor: 'error',
        onConfirm:    () => {
            items.value = []
            nextId.value = SAMPLE_ITEMS.length + 1
            logger.addLog('Table reset — all items cleared', 'Reset', 'warn')
            toast.success('Table Reset', 'All items have been cleared.')
        }
    })
}

/**
 * Handle Add Item
 * Adds a new generic item to the local list.
 */
function handleAddItem() {
    const newItem: Item = { id: nextId.value++, ...addForm }
    items.value = [newItem, ...items.value]
    logger.addLog(`Added item: ${newItem.name}`, 'Created', 'success')
    resetAddForm()
    isAddOpen.value = false
}

/**
 * Handle Edit Item
 * Opens the inline edit modal pre-filled with the item's data.
 */
function handleEditItem(item: Item) {
    editTarget.value    = item
    editForm.name       = item.name
    editForm.category   = item.category
    editForm.status     = item.status
    editForm.priority   = item.priority
    isEditOpen.value    = true
}

/**
 * Confirm & save edit changes.
 */
function confirmEdit() {
    confirmModal.open({
        title:        'Save Changes',
        description:  `Save changes to "${editForm.name}"?`,
        confirmLabel: 'Save Changes',
        confirmColor: 'warning',
        onConfirm:    () => {
            if (!editTarget.value) return
            const idx = items.value.findIndex(i => i.id === editTarget.value!.id)
            if (idx !== -1) {
                items.value = items.value.map((i, index) =>
                    index === idx ? { ...i, ...editForm } : i
                )
            }
            logger.addLog(`Updated item: ${editForm.name}`, 'Updated', 'warn')
            isEditOpen.value = false
            editTarget.value = null
        }
    })
}

/**
 * Handle Delete Item
 * Opens a confirmation modal before removing an item.
 */
function handleDeleteItem(item: Item) {
    confirmModal.open({
        title:        'Delete Item',
        description:  `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
        confirmLabel: 'Delete',
        confirmColor: 'error',
        onConfirm:    () => {
            items.value = items.value.filter(i => i.id !== item.id)
            logger.addLog(`Deleted item: ${item.name}`, 'Deleted', 'error')
        }
    })
}

/**
 * Handle Toggle Status
 * Opens a confirmation modal before toggling an item's active state.
 */
function handleToggleStatus(item: Item) {
    const isActivating = item.status === 'Inactive'
    const newStatus: Item['status'] = isActivating ? 'Active' : 'Inactive'

    confirmModal.open({
        title:        `${isActivating ? 'Activate' : 'Deactivate'} Item`,
        description:  `Are you sure you want to ${isActivating ? 'activate' : 'deactivate'} "${item.name}"?`,
        confirmLabel: isActivating ? 'Activate' : 'Deactivate',
        confirmColor: isActivating ? 'success' : 'warning',
        onConfirm:    () => {
            items.value = items.value.map(i =>
                i.id === item.id ? { ...i, status: newStatus } : i
            )
            logger.addLog(
                `${isActivating ? 'Activated' : 'Deactivated'} item: ${item.name}`,
                isActivating ? 'Activated' : 'Deactivated',
                'info'
            )
        }
    })
}

// ============================================================================
// Table Configuration
// ============================================================================

/**
 * Column Definitions
 */
const columns: TableColumn<Item>[] = [
    {
        accessorKey: 'id',
        header: getSortableHeader('ID'),
        cell: ({ row }) => `${row.getValue('id')}`
    },
    {
        accessorKey: 'name',
        header: getSortableHeader('Name'),
        cell: ({ row }) => `${row.getValue('name')}`,
    },
    {
        accessorKey: 'category',
        header: getSortableHeader('Category'),
        cell: ({ row }) => `${row.getValue('category')}`
    },
    {
        accessorKey: 'priority',
        header: getSortableHeader('Priority'),
        cell: ({ row }) => {
            const priority = row.getValue('priority') as string
            const color = priority === 'High' ? 'error' : priority === 'Medium' ? 'warning' : 'neutral'

            return h(UBadge, {
                label:   priority,
                color,
                variant: 'subtle'
            })
        }
    },
    {
        accessorKey: 'status',
        header: getSortableHeader('Status'),
        cell: ({ row }) => {
            const status = row.getValue('status') as string
            const color  = status === 'Active' ? 'success' : 'neutral'

            return h(UBadge, {
                label:   status,
                color,
                variant: 'subtle'
            })
        }
    },
    {
        id: 'actions',
        meta: {
            class: {
                td: 'text-right'
            }
        },
        cell: ({ row }) => {
            const items_menu: DropdownMenuItem[][] = [
                [
                    {
                        label:    row.original.status === 'Active' ? 'Deactivate' : 'Activate',
                        icon:     row.original.status === 'Active' ? 'i-lucide-pause-circle' : 'i-lucide-play-circle',
                        onSelect: () => handleToggleStatus(row.original)
                    },
                    {
                        label:    'Edit',
                        icon:     'i-lucide-edit',
                        onSelect: () => handleEditItem(row.original)
                    }
                ],
                [
                    {
                        label:    'Delete',
                        icon:     'i-lucide-trash',
                        color:    'error',
                        onSelect: () => handleDeleteItem(row.original)
                    }
                ]
            ]

            return h(UDropdownMenu, {
                items:   items_menu,
                content: { align: 'end' },
                size:    'sm'
            }, {
                default: () => h(UButton, {
                    icon:    'i-lucide-ellipsis-vertical',
                    color:   'neutral',
                    variant: 'ghost',
                    size:    'sm'
                })
            })
        }
    }
]

const table           = useTemplateRef('table')
const globalFilter    = ref('')
const columnVisibility = ref({ id: false })
</script>

<template>
    <UPageCard title="Table & CRUD"
        description="A self-contained reference for AI agents demonstrating table layout, sorting, filtering, row actions, and modal-based CRUD workflows."
        variant="naked" orientation="horizontal" class="border-b border-default rounded-none p-4 sm:p-6">
        <div class="flex justify-end gap-2 flex-1">
            <UButton v-if="items.length > 0" label="Reset" icon="i-lucide-trash-2" color="error"
                variant="soft" size="sm" @click="handleResetTable" />
            <TableGlobalFilter v-model="globalFilter" />
            <TableColumnToggle :table="table" />
        </div>
    </UPageCard>

    <UTable sticky ref="table" :data="items" :columns="columns"
        v-model:column-visibility="columnVisibility" v-model:global-filter="globalFilter"
        :ui="{ th: 'sm:px-6', td: 'sm:px-6' }" class="flex-1 scrollbar">
        <template #empty>
            <Empty title="No items found"
                description="Deploy the sample dataset to populate the table, or add your first item manually."
                icon="i-lucide-inbox">
                <template #action>
                    <div class="flex gap-2">
                        <UButton label="Deploy Demo Data" icon="i-lucide-database-zap" color="primary"
                            size="lg" :loading="isDeploying" @click="handleDeployDemoData" />
                        <UButton label="Add Item" icon="i-lucide-plus" color="neutral"
                            variant="soft" size="lg" @click="events.emit('addItem')" />
                    </div>
                </template>
            </Empty>
        </template>
    </UTable>

    <!-- ================================================================ -->
    <!-- Add Item Modal                                                    -->
    <!-- ================================================================ -->
    <UModal v-model:open="isAddOpen" :ui="{ content: 'w-full sm:max-w-md' }">
        <template #content="{ close }">
            <div class="flex flex-col gap-6 p-4 sm:p-6">
                <div class="flex flex-col gap-1">
                    <h3 class="text-lg font-semibold">Add Item</h3>
                    <p class="text-muted text-sm">Fill in the details for the new item.</p>
                </div>

                <div class="flex flex-col gap-4">
                    <UFormField label="Name" name="name">
                        <UInput v-model="addForm.name" placeholder="e.g. Alpha Project" icon="i-lucide-tag"
                            class="w-full" />
                    </UFormField>

                    <UFormField label="Category" name="category">
                        <USelect v-model="addForm.category" :items="CATEGORIES" icon="i-lucide-folder"
                            class="w-full" />
                    </UFormField>

                    <UFormField label="Priority" name="priority">
                        <USelect v-model="addForm.priority" :items="PRIORITIES" icon="i-lucide-flag"
                            class="w-full" />
                    </UFormField>

                    <UFormField label="Status" name="status">
                        <USelect v-model="addForm.status" :items="['Active', 'Inactive']"
                            icon="i-lucide-activity" class="w-full" />
                    </UFormField>
                </div>

                <div class="flex justify-end gap-2 pt-2">
                    <UButton label="Cancel" color="neutral" variant="ghost"
                        @click="resetAddForm(); isAddOpen = false" />
                    <UButton label="Add Item" icon="i-lucide-plus" color="primary"
                        :disabled="!addForm.name.trim()" @click="handleAddItem" />
                </div>
            </div>

            <UButton icon="i-lucide-x" color="neutral" variant="ghost" class="absolute top-2 right-2"
                @click="close" />
        </template>
    </UModal>

    <!-- ================================================================ -->
    <!-- Edit Item Modal                                                   -->
    <!-- ================================================================ -->
    <UModal v-model:open="isEditOpen" :ui="{ content: 'w-full sm:max-w-md' }">
        <template #content="{ close }">
            <div class="flex flex-col gap-6 p-4 sm:p-6">
                <div class="flex flex-col gap-1">
                    <h3 class="text-lg font-semibold">Edit Item</h3>
                    <p class="text-muted text-sm">Update the details for this item.</p>
                </div>

                <div class="flex flex-col gap-4">
                    <UFormField label="Name" name="name">
                        <UInput v-model="editForm.name" placeholder="e.g. Alpha Project" icon="i-lucide-tag"
                            class="w-full" />
                    </UFormField>

                    <UFormField label="Category" name="category">
                        <USelect v-model="editForm.category" :items="CATEGORIES" icon="i-lucide-folder"
                            class="w-full" />
                    </UFormField>

                    <UFormField label="Priority" name="priority">
                        <USelect v-model="editForm.priority" :items="PRIORITIES" icon="i-lucide-flag"
                            class="w-full" />
                    </UFormField>

                    <UFormField label="Status" name="status">
                        <USelect v-model="editForm.status" :items="['Active', 'Inactive']"
                            icon="i-lucide-activity" class="w-full" />
                    </UFormField>
                </div>

                <div class="flex justify-end gap-2 pt-2">
                    <UButton label="Cancel" color="neutral" variant="ghost"
                        @click="isEditOpen = false; editTarget = null" />
                    <UButton label="Save Changes" icon="i-lucide-save" color="primary"
                        :disabled="!editForm.name.trim()" @click="confirmEdit" />
                </div>
            </div>

            <UButton icon="i-lucide-x" color="neutral" variant="ghost" class="absolute top-2 right-2"
                @click="close" />
        </template>
    </UModal>

    <!-- ================================================================ -->
    <!-- Logs Drawer                                                       -->
    <!-- ================================================================ -->
    <LogsDrawer v-model:open="isDrawerOpen" namespace="table-reference" />
</template>