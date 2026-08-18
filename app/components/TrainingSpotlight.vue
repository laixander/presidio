<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const events = useEvents()
const trainingStore = useTrainingStore()

const isActive = ref(false)
const targetSelector = ref('')
const targetRect = ref({ top: 0, left: 0, width: 0, height: 0 })

let resizeObserver: ResizeObserver | null = null

const updateRect = () => {
    if (!targetSelector.value) return
    const el = document.querySelector(targetSelector.value)
    if (el) {
        const rect = el.getBoundingClientRect()
        targetRect.value = {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
        }
    }
}

const handleHighlight = (selector: string) => {
    targetSelector.value = selector
    isActive.value = true
    
    // Give DOM a tick to ensure elements are present if navigation happened
    setTimeout(() => {
        updateRect()
        
        // Watch for resizes
        const el = document.querySelector(selector)
        if (el) {
            resizeObserver = new ResizeObserver(updateRect)
            resizeObserver.observe(el)
        }
    }, 100)
}

const handleClear = () => {
    isActive.value = false
    targetSelector.value = ''
    if (resizeObserver) {
        resizeObserver.disconnect()
        resizeObserver = null
    }
}

let offHighlight: (() => void) | null = null
let offClear: (() => void) | null = null

onMounted(() => {
    offHighlight = events.on('training:highlight', handleHighlight)
    offClear = events.on('training:clear_highlight', handleClear)
})

onUnmounted(() => {
    if (offHighlight) offHighlight()
    if (offClear) offClear()
    if (resizeObserver) resizeObserver.disconnect()
})
</script>

<template>
    <Teleport to="body">
        <Transition name="fade">
            <div v-if="isActive && trainingStore.isTrainingActive && targetSelector" class="fixed inset-0 z-[9999] pointer-events-none">
                <!-- Backdrop (dimming everything else) -->
                <div class="absolute inset-0 bg-neutral-900/60 dark:bg-neutral-950/70 backdrop-blur-[2px]"></div>
                
                <!-- Cutout hole for the target element -->
                <div 
                    class="absolute bg-transparent transition-all duration-500 ease-in-out pointer-events-auto"
                    :style="{
                        top: targetRect.top - 8 + 'px',
                        left: targetRect.left - 8 + 'px',
                        width: targetRect.width + 16 + 'px',
                        height: targetRect.height + 16 + 'px',
                        boxShadow: '0 0 0 9999px rgba(0,0,0,0)', /* Fallback if backdrop is an issue, but we use an overlay */
                    }"
                >
                    <!-- Animated ring around the target -->
                    <div class="absolute inset-0 rounded-xl ring-4 ring-primary-500 ring-offset-4 ring-offset-neutral-900/50 animate-pulse"></div>
                    <div class="absolute inset-0 rounded-xl bg-primary-500/10 mix-blend-overlay"></div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
