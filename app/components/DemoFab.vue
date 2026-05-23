<script setup lang="ts">
// ============================================================================
// Composables & State
// ============================================================================
const { seedAll, resetAll } = useDemoSeeder()
const { isLoading } = useUsers()
const toast = useAppToast()

// ============================================================================
// Methods
// ============================================================================

/**
 * Handle mass seeding of demo data
 */
const handleSeed = async () => {
    isLoading.value = true
    try {
        // Add a small delay for dramatic effect/perceived realism
        await new Promise(resolve => setTimeout(resolve, 1500))
        await seedAll()
        toast.success('Hotel System Populated', 'Demo data deployed: rooms, guests, reservations, folios, and housekeeping tasks.')
    } catch (e) {
        toast.error('Error', 'Failed to deploy demo data.')
    } finally {
        isLoading.value = false
    }
}

/**
 * Handle resetting of the demo system
 */
const handleReset = async () => {
    isLoading.value = true
    try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        await resetAll()
        toast.success('System Reset', 'All local data has been cleared.')
    } catch (e) {
        toast.error('Error', 'Failed to reset system.')
    } finally {
        isLoading.value = false
    }
}

// ============================================================================
// Configuration
// ============================================================================
const items = [
    [
        {
            label: 'Login',
            icon: 'i-lucide-lock',
            to: '/'
        },
        {
            label: 'Agent Kit',
            icon: 'i-lucide-bot',
            to: '/agent/ai-rules'
        },
        {
            label: 'Changelog',
            icon: 'i-lucide-clipboard',
            to: '/docs/changelog'
        },
    ],
    [
        {
            label: 'Deploy Demo Data',
            icon: 'i-lucide-database-zap',
            onSelect: handleSeed
        }
    ],
    [
        {
            label: 'Reset System',
            icon: 'i-lucide-trash-2',
            class: 'text-red-500',
            onSelect: handleReset
        }
    ]
] as any[][]

// ============================================================================
// Draggable Logic
// ============================================================================
const position = ref({ x: 24, y: 24 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const initialPosition = ref({ x: 0, y: 0 })
const hasMoved = ref(false)
const fabRef = ref<HTMLElement | null>(null)
const isOnLeftSide = ref(false)

const dropdownAlign = computed(() => isOnLeftSide.value ? 'start' : 'end')

/**
 * Detect if FAB is on the left or right half of the viewport
 */
const updateSideDetection = () => {
    if (!fabRef.value) return
    const rect = fabRef.value.getBoundingClientRect()
    const fabCenterX = rect.left + rect.width / 2
    isOnLeftSide.value = fabCenterX < window.innerWidth / 2
}

/**
 * Handle mouse down event on the FAB to start dragging
 */
const handleMouseDown = (e: MouseEvent) => {
    isDragging.value = true
    dragStart.value = { x: e.clientX, y: e.clientY }
    initialPosition.value = { ...position.value }
    hasMoved.value = false

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
}

/**
 * Update position during drag
 */
const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.value) return

    const dx = e.clientX - dragStart.value.x
    const dy = e.clientY - dragStart.value.y

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        hasMoved.value = true
    }

    position.value = {
        x: initialPosition.value.x - dx,
        y: initialPosition.value.y - dy
    }

    updateSideDetection()
}

/**
 * End drag
 */
const handleMouseUp = () => {
    isDragging.value = false
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
}

// Initialize side detection
onMounted(() => {
    nextTick(updateSideDetection)
})
</script>

<template>
    <ClientOnly>
        <div ref="fabRef" class="fixed z-[999] group select-none" :style="{
            bottom: `${position.y}px`,
            right: `${position.x}px`,
        }">
            <!-- Main FAB -->
            <UDropdownMenu :items="items" :content="{ align: dropdownAlign, side: 'top', sideOffset: 12 }"
                :ui="{ content: 'w-44' }" :prevent-close="hasMoved">
                <UButton square size="xl" color="primary" :loading="isLoading"
                    class="rounded-full hover:scale-110 active:scale-95 transition-all duration-300 ring-4 ring-primary-500/20 cursor-move"
                    :class="{ 'animate-pulse': isLoading }" @mousedown="handleMouseDown"
                    @click.capture="hasMoved ? $event.stopPropagation() : null">
                    <template #leading>
                        <UIcon v-if="!isLoading" name="i-lucide-database" class="w-6 h-6" />
                    </template>
                    <span class="sr-only">Demo Tools</span>
                </UButton>

                <template #item="{ item }">
                    <div class="flex items-center gap-2 w-full">
                        <UIcon :name="item.icon" class="w-4 h-4" :class="item.class" />
                        <span>{{ item.label }}</span>
                    </div>
                </template>
            </UDropdownMenu>

            <!-- Tooltip hint (visible on hover, auto-adjusts side) -->
            <span v-if="isOnLeftSide"
                class="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-neutral-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-neutral-800">
                Demo Control Center
            </span>
            <span v-else
                class="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-neutral-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-neutral-800">
                Demo Control Center
            </span>
        </div>
    </ClientOnly>
</template>