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

const transportBtnUi = { base: 'px-6 py-3 rounded-xl w-32 justify-center', leadingIcon: 'size-4', label: 'uppercase text-sm font-bold' }
</script>

<template>
    <AuthGate v-if="!isAuthorized" title="Access Denied" description="You must be an Administrator to access the Simulation Engine." icon="i-lucide-lock" />

    <div v-else class="w-full max-w-(--ui-container) mx-auto space-y-6">
        <UPageCard title="Engine Control"
            description="Control the automated background simulation engine."
            variant="naked" orientation="horizontal" />
        <ClientOnly>
            <Teleport to="#header-actions-teleport">
                <UButton label="View Logs" icon="i-lucide-activity" color="neutral" variant="outline" to="/admin/simulation-logs" />
            </Teleport>
        </ClientOnly>
                
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <UCard variant="subtle" :ui="{ body: 'p-4 sm:p-5' }" class="shadow-sm">
                <div class="text-sm text-muted font-semibold uppercase tracking-wider mb-2">State</div>
                <div class="text-3xl font-black font-mono flex items-center gap-3" :class="getStatusColor(sim.state.value)">
                    <UIcon v-if="sim.state.value === 'Running'" name="i-lucide-loader-2" class="animate-spin" />
                    <UIcon v-else-if="sim.state.value === 'Paused'" name="i-lucide-pause-circle" />
                    <UIcon v-else name="i-lucide-stop-circle" />
                    {{ sim.state.value }}
                </div>
            </UCard>
            <UCard variant="subtle" :ui="{ body: 'p-4 sm:p-5' }" class="shadow-sm">
                <div class="text-sm text-muted font-semibold uppercase tracking-wider mb-2">Engine Ticks</div>
                <div class="text-3xl font-black font-mono text-neutral-900 dark:text-white">
                    {{ sim.tickCount.value }}
                </div>
            </UCard>
            <UCard variant="subtle" :ui="{ body: 'p-4 sm:p-5' }" class="shadow-sm">
                <div class="text-sm text-muted font-semibold uppercase tracking-wider mb-2">Events Generated</div>
                <div class="text-3xl font-black font-mono text-primary-600 dark:text-primary-400">
                    {{ sim.eventsGenerated.value }}
                </div>
            </UCard>
        </div>

        <!-- Transport Controls -->
        <UCard variant="solid" :ui="{ body: 'flex items-center h-full relative z-10' }" class="flex-1 bg-gradient-to-br from-neutral-900 to-neutral-950 overflow-hidden relative shadow-xl shadow-primary/10 ring-1 ring-primary-500/30">
            <!-- Premium ambient glow effects -->
            <div class="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/20 blur-[64px] rounded-full pointer-events-none"></div>
            <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-primary-600/10 blur-[64px] rounded-full pointer-events-none"></div>
            
            <div class="flex flex-wrap items-center justify-center gap-2 flex-1">
                <UFieldGroup>
                    <UButton 
                        icon="i-lucide-rotate-ccw" 
                        label="Reset"
                        color="neutral" 
                        variant="soft" 
                        @click="sim.reset" 
                        :ui="transportBtnUi"
                    />
                    <UButton 
                        v-if="!sim.isRunning.value"
                        icon="i-lucide-play" 
                        label="Start"
                        color="primary" 
                        @click="sim.start" 
                        :ui="transportBtnUi"
                    />
                    <UButton 
                        v-else
                        icon="i-lucide-pause" 
                        label="PAUSE"
                        color="warning" 
                        @click="sim.pause" 
                        :ui="transportBtnUi"
                    />
                    <UButton 
                        icon="i-lucide-step-forward" 
                        label="Step"
                        color="primary" 
                        variant="soft" 
                        :disabled="sim.isRunning.value"
                        @click="sim.step" 
                        :ui="transportBtnUi"
                    />
                </UFieldGroup>
            </div>
        </UCard>

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
</template>
