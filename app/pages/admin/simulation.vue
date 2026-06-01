<script setup lang="ts">
/**
 * ============================================================================
 * Page: Simulation Control Panel (/admin/simulation)
 * ============================================================================
 * Dashboard to control the automated background simulation engine.
 */
import { computed } from 'vue'

definePageMeta({
    title: 'Simulation Engine',
    layout: 'dashboard'
})

const sim = useSimulation()
const loggerStore = useLogger('simulation') // Access the raw logs

const totalWeight = computed(() => 
    sim.weights.value.booking + 
    sim.weights.value.checkIn + 
    sim.weights.value.charge + 
    sim.weights.value.checkOut + 
    sim.weights.value.housekeeping
)

const formatPercent = (val: number) => {
    if (totalWeight.value === 0) return '0%'
    return Math.round((val / totalWeight.value) * 100) + '%'
}

const getStatusColor = (state: string) => {
    switch(state) {
        case 'Running': return 'text-success-600 dark:text-success-400'
        case 'Paused': return 'text-warning-600 dark:text-warning-400'
        default: return 'text-neutral-500'
    }
}

const authStore = useDemoAuth()
const isAuthorized = computed(() => authStore.currentRole.value === 'Administrator')
</script>

<template>
    <AuthGate v-if="!isAuthorized" title="Access Denied" description="You must be an Administrator to access the Simulation Engine." icon="i-lucide-lock" />

    <template v-else>
        <div class="flex-1 flex flex-col h-full space-y-6 max-w-7xl mx-auto w-full">
            
            <div class="p-4 sm:p-6 border border-default bg-neutral-50 dark:bg-neutral-900 rounded-xl">
                <div class="flex justify-between items-center mb-6">
                    <h1 class="text-2xl font-bold flex items-center gap-3">
                        <UIcon name="i-lucide-cpu" class="text-primary" />
                        Engine Control
                    </h1>
                    <UButton label="View Logs" icon="i-lucide-activity" color="neutral" variant="outline" to="/admin/simulation-logs" />
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <UCard :ui="{ body: 'p-4 sm:p-5' }" class="shadow-sm">
                        <div class="text-sm text-muted font-semibold uppercase tracking-wider mb-2">State</div>
                        <div class="text-3xl font-black font-mono flex items-center gap-3" :class="getStatusColor(sim.state.value)">
                            <UIcon v-if="sim.state.value === 'Running'" name="i-lucide-loader-2" class="animate-spin" />
                            <UIcon v-else-if="sim.state.value === 'Paused'" name="i-lucide-pause-circle" />
                            <UIcon v-else name="i-lucide-stop-circle" />
                            {{ sim.state.value }}
                        </div>
                    </UCard>
                    <UCard :ui="{ body: 'p-4 sm:p-5' }" class="shadow-sm">
                        <div class="text-sm text-muted font-semibold uppercase tracking-wider mb-2">Engine Ticks</div>
                        <div class="text-3xl font-black font-mono text-neutral-900 dark:text-white">
                            {{ sim.tickCount.value }}
                        </div>
                    </UCard>
                    <UCard :ui="{ body: 'p-4 sm:p-5' }" class="shadow-sm">
                        <div class="text-sm text-muted font-semibold uppercase tracking-wider mb-2">Events Generated</div>
                        <div class="text-3xl font-black font-mono text-primary-600 dark:text-primary-400">
                            {{ sim.eventsGenerated.value }}
                        </div>
                    </UCard>
                </div>

                <!-- Transport Controls -->
                <div class="flex flex-wrap items-center justify-center gap-2 py-8 border-y border-default">
                    <UButton 
                        icon="i-lucide-rotate-ccw" 
                        label="Reset" 
                        size="lg"
                        color="neutral" 
                        variant="soft" 
                        @click="sim.reset" 
                    />
                    <UButton 
                        v-if="!sim.isRunning.value"
                        icon="i-lucide-play" 
                        label="START" 
                        size="lg"
                        color="success" 
                        @click="sim.start" 
                    />
                    <UButton 
                        v-else
                        icon="i-lucide-pause" 
                        label="PAUSE" 
                        size="lg"
                        color="warning" 
                        @click="sim.pause" 
                    />
                    <UButton 
                        icon="i-lucide-step-forward" 
                        label="Step" 
                        size="lg"
                        color="primary" 
                        variant="soft" 
                        :disabled="sim.isRunning.value"
                        @click="sim.step" 
                    />
                </div>

                <!-- Configuration -->
                <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Speed -->
                    <div>
                        <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                            <UIcon name="i-lucide-gauge" class="text-primary" />
                            Engine Speed
                        </h3>
                        <UCard variant="subtle" class="shadow-sm">
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-semibold">Tick Interval</span>
                                <span class="font-mono text-primary">{{ sim.speedMs.value }} ms</span>
                            </div>
                            <USlider 
                                v-model="sim.speedMs.value" 
                                :min="500" 
                                :max="10000" 
                                :step="500"
                                @change="sim.setSpeed(sim.speedMs.value)"
                                size="xs"
                            />
                            <div class="flex justify-between text-xs text-muted mt-2">
                                <span>Fast (500ms)</span>
                                <span>Slow (10s)</span>
                            </div>
                        </UCard>
                    </div>

                    <!-- Event Weights -->
                    <div>
                        <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                            <UIcon name="i-lucide-sliders-horizontal" class="text-primary" />
                            Event Probability Matrix
                        </h3>
                        <UCard variant="subtle" :ui="{ body: 'space-y-6' }" class="shadow-sm">
                            
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span class="font-semibold text-primary">New Bookings</span>
                                    <span class="font-mono">{{ formatPercent(sim.weights.value.booking) }}</span>
                                </div>
                                <USlider v-model="sim.weights.value.booking" :min="0" :max="100" size="xs" />
                            </div>
                            
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span class="font-semibold text-success">Check-Ins</span>
                                    <span class="font-mono">{{ formatPercent(sim.weights.value.checkIn) }}</span>
                                </div>
                                <USlider v-model="sim.weights.value.checkIn" :min="0" :max="100" size="xs" />
                            </div>
                            
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span class="font-semibold text-warning">Room Charges</span>
                                    <span class="font-mono">{{ formatPercent(sim.weights.value.charge) }}</span>
                                </div>
                                <USlider v-model="sim.weights.value.charge" :min="0" :max="100" size="xs" />
                            </div>
                            
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span class="font-semibold text-error">Check-Outs</span>
                                    <span class="font-mono">{{ formatPercent(sim.weights.value.checkOut) }}</span>
                                </div>
                                <USlider v-model="sim.weights.value.checkOut" :min="0" :max="100" size="xs" />
                            </div>

                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span class="font-semibold text-neutral-600 dark:text-neutral-400">Housekeeping</span>
                                    <span class="font-mono">{{ formatPercent(sim.weights.value.housekeeping) }}</span>
                                </div>
                                <USlider v-model="sim.weights.value.housekeeping" :min="0" :max="100" size="xs" />
                            </div>

                        </UCard>
                    </div>
                </div>
            </div>
        </div>
    </template>
</template>
