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
const events = useEvents()
const trainingStore = useTrainingStore()
const trainingSync = useTrainingSync()

const newSessionId = ref(`TRN-${Math.floor(Math.random() * 10000)}`)

const createSession = () => {
    trainingStore.joinSession(newSessionId.value, 'Teacher')
    trainingSync.connect()
    useLogger('training').addLog(`Created training session: ${newSessionId.value}`, 'System', 'success')
}

const endSession = () => {
    trainingSync.disconnect()
    trainingStore.leaveSession()
    sim.reset()
}

const isDrawerOpen = ref(false)

events.on('viewSimulationLogs', () => {
    isDrawerOpen.value = true
})

// Wrap transport controls to broadcast
const handleStart = () => {
    sim.start()
    trainingSync.broadcast({ type: 'START' })
}
const handlePause = () => {
    sim.pause()
    trainingSync.broadcast({ type: 'PAUSE' })
}
const handleReset = () => {
    sim.reset()
    trainingSync.broadcast({ type: 'RESET' })
}
const handleStep = () => {
    sim.step()
    trainingSync.broadcast({ type: 'STEP' })
}
const handleSpeedChange = () => {
    const ms = sim.speedMs.value
    sim.setSpeed(ms)
    trainingSync.broadcast({ type: 'SET_SPEED', payload: { speedMs: ms } })
}

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

    <div v-else class="w-full max-w-4xl mx-auto space-y-6">
        <UPageCard title="Engine Control"
            description="Control the automated background simulation engine."
            variant="naked" orientation="horizontal">
            <div class="flex items-center justify-end w-full">
                <UButton label="View Logs" trailing-icon="i-lucide-arrow-right" color="neutral" variant="soft" class="w-fit" to="/admin/simulation-logs" />
            </div>
        </UPageCard>
        
        <ClientOnly>
            <Teleport to="#header-actions-teleport">
                <UButton icon="i-lucide-history" color="neutral" variant="soft" @click="events.emit('viewSimulationLogs')">
                    Recent Activity
                </UButton>
            </Teleport>
        </ClientOnly>

        <!-- Training Session Panel -->
        <UCard variant="subtle" class="mb-8 border-primary-500/30 border">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-lg font-bold flex items-center gap-2">
                        <UIcon name="i-lucide-presentation" class="text-primary" />
                        Training Session
                    </h3>
                    <p class="text-sm text-neutral-500 mt-1">
                        {{ trainingStore.isTrainingActive ? `Active Session: ${trainingStore.activeSessionId}` : 'Create a session to sync simulation state with students.' }}
                    </p>
                </div>
                <div class="flex items-center gap-3">
                    <template v-if="!trainingStore.isTrainingActive">
                        <UInput v-model="newSessionId" placeholder="Session ID" />
                        <UButton color="primary" @click="createSession">Create Session</UButton>
                    </template>
                    <template v-else>
                        <UBadge color="success" variant="soft">Connected (Teacher)</UBadge>
                        <UButton color="error" variant="soft" @click="endSession">End Session</UButton>
                    </template>
                </div>
            </div>
        </UCard>
                
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
        <UCard
            :ui="{ body: 'flex items-center h-full relative z-10 py-8' }"
            :class="[
                'flex-1 overflow-hidden relative transition-all duration-700',
                sim.isRunning.value
                    ? [
                        // Light mode: crisp white base with a cool primary tint
                        'bg-gradient-to-br from-white via-primary-50/60 to-slate-50',
                        // Dark mode: deep cockpit dark with primary warmth
                        'dark:bg-gradient-to-br dark:from-neutral-950 dark:via-neutral-900/95 dark:to-neutral-950',
                        // Ring & shadow
                        'ring-2 ring-primary-500/40 shadow-2xl shadow-primary-500/20'
                    ]
                    : 'shadow-sm'
            ]"
        >
            <!-- Premium ambient glow effects (active when running) -->
            <Transition name="glow-fade">
                <div v-if="sim.isRunning.value" class="pointer-events-none absolute inset-0 overflow-hidden">
                    <!-- Top-right orb: primary -->
                    <div class="absolute -top-16 -right-16 w-72 h-72 rounded-full blur-[80px] animate-pulse
                        bg-primary-400/30 dark:bg-primary-500/35"></div>
                    <!-- Bottom-left orb: violet accent -->
                    <div class="absolute -bottom-16 -left-16 w-72 h-72 rounded-full blur-[80px] animate-pulse [animation-delay:1.2s]
                        bg-violet-400/20 dark:bg-primary-600/25"></div>
                    <!-- Center orb: subtle core glow -->
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full blur-[60px]
                        bg-primary-300/15 dark:bg-primary-400/15"></div>
                    <!-- Animated border ping -->
                    <div class="absolute inset-0 rounded-[inherit] ring-2 ring-primary-400/25 animate-ping [animation-duration:2.5s]"></div>
                </div>
            </Transition>
            
            <div class="flex flex-wrap items-center justify-center gap-2 flex-1">
                <UButton 
                    icon="i-lucide-rotate-ccw" 
                    label="Reset"
                    color="neutral" 
                    variant="outline" 
                    @click="handleReset" 
                    :ui="transportBtnUi"
                />
                <UButton 
                    v-if="!sim.isRunning.value"
                    icon="i-lucide-play" 
                    label="Start"
                    color="primary" 
                    @click="handleStart" 
                    :ui="transportBtnUi"
                />
                <UButton 
                    v-else
                    icon="i-lucide-pause" 
                    label="PAUSE"
                    color="warning" 
                    @click="handlePause" 
                    :ui="transportBtnUi"
                />
                <UButton 
                    icon="i-lucide-step-forward" 
                    label="Step"
                    color="primary" 
                    variant="soft" 
                    :disabled="sim.isRunning.value"
                    @click="handleStep" 
                    :ui="transportBtnUi"
                />
            </div>
        </UCard>


        <!-- Configuration & Guides -->
        <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="space-y-8">
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
                            @change="handleSpeedChange"
                            size="xs"
                        />
                        <div class="flex justify-between text-xs text-muted mt-2">
                            <span>Fast (500ms)</span>
                            <span>Slow (10s)</span>
                        </div>
                    </UCard>
                </div>
                
                <!-- Teacher Guides (Only show if session is active) -->
                <TeacherGuidesPanel v-if="trainingStore.isTrainingActive" />
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

        <LogsDrawer v-model:open="isDrawerOpen" namespace="simulation-actions" />
    </div>
</template>

<style scoped>
.glow-fade-enter-active,
.glow-fade-leave-active {
    transition: opacity 0.6s ease;
}
.glow-fade-enter-from,
.glow-fade-leave-to {
    opacity: 0;
}
</style>
