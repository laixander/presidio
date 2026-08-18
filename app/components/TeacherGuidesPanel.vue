<script setup lang="ts">
const trainingSync = useTrainingSync()

const triggerHighlight = (selector: string, label: string) => {
    trainingSync.broadcast({
        type: 'HIGHLIGHT',
        payload: { selector }
    })
    useLogger('training').addLog(`Broadcasted highlight for: ${label}`, 'Teacher', 'info')
}

const clearHighlight = () => {
    trainingSync.broadcast({ type: 'CLEAR_HIGHLIGHT' })
    useLogger('training').addLog('Broadcasted clear highlight', 'Teacher', 'info')
}
</script>

<template>
    <UCard variant="subtle" class="shadow-sm">
        <template #header>
            <h3 class="font-bold flex items-center gap-2">
                <UIcon name="i-lucide-mouse-pointer-click" class="text-primary" />
                Guided Highlights
            </h3>
        </template>
        <div class="space-y-4">
            <p class="text-sm text-neutral-500">
                Trigger these highlights to guide students to specific UI elements on their screen.
            </p>
            <div class="flex flex-wrap gap-2">
                <UButton size="sm" color="primary" variant="soft" @click="triggerHighlight('[data-guide=\'nav-frontdesk\']', 'Front Desk Navigation')">
                    Highlight Front Desk Tab
                </UButton>
                <UButton size="sm" color="primary" variant="soft" @click="triggerHighlight('[data-guide=\'btn-checkin\']', 'Check-In Button')">
                    Highlight Check-In Button
                </UButton>
                <UButton size="sm" color="primary" variant="soft" @click="triggerHighlight('[data-guide=\'nav-housekeeping\']', 'Housekeeping Navigation')">
                    Highlight Housekeeping Tab
                </UButton>
            </div>
            <UButton size="sm" color="neutral" variant="outline" @click="clearHighlight" class="w-full justify-center mt-4">
                Clear All Highlights
            </UButton>
        </div>
    </UCard>
</template>
