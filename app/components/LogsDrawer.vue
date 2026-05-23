<script setup lang="ts">
const props = defineProps<{
    namespace: string
}>()

const isOpen = defineModel<boolean>('open', { default: false })
const { logs, clearLogs } = useLogger(props.namespace)
</script>

<template>
    <UDrawer v-model:open="isOpen" direction="right" inset title="Application Logs"
        description="View real-time application events and status." :ui="{ container: 'sm:py-6 sm:pr-8 scrollbar' }" class="min-w-md">
        <template #header>
            <div class="flex items-center justify-between w-full gap-4">
                <div class="min-w-sm">
                    <div class="text-lg font-semibold">Application Logs</div>
                    <div class="text-sm text-muted">View real-time <span class="font-bold">{{ props.namespace.charAt(0).toUpperCase() + props.namespace.slice(1).replace(/[A-Z]/g, ' $&').trim() }}</span> events and status.</div>
                </div>
                <UButton label="Clear" icon="i-lucide-trash-2" color="error" variant="soft" size="sm"
                    @click="clearLogs" :disabled="!logs.length" />
            </div>
        </template>
        <template #body>
            <div class="flex flex-col h-full mt-6">
                <div v-if="logs.length" class="relative pl-8 space-y-6">
                    <!-- Vertical Timeline Line -->
                    <div class="absolute left-4 top-2 bottom-2 w-0.5 bg-neutral-200 dark:bg-neutral-800 rounded-full"></div>

                    <div v-for="log in logs" :key="log.id" class="relative">
                        <!-- Timeline Dot -->
                        <div class="absolute -left-[19px] top-1/2 -translate-y-1/2 size-2 rounded-full ring-5 ring-white dark:ring-neutral-900 z-10 shadow-sm"
                            :class="[
                                log.level === 'error' ? 'bg-error' :
                                    log.level === 'warn' ? 'bg-warning' :
                                        log.level === 'success' ? 'bg-success' :
                                            'bg-info'
                            ]">
                        </div>

                        <!-- Log Card -->
                        <div
                            class="flex flex-col gap-2 text-sm bg-neutral-100/50 dark:bg-neutral-800/50 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 transition-all hover:border-primary/30 dark:hover:border-primary/30 group">
                            <div class="flex items-center gap-2">
                                <UIcon
                                    :name="log.level === 'error' ? 'i-lucide-alert-circle' : log.level === 'warn' ? 'i-lucide-alert-triangle' : log.level === 'success' ? 'i-lucide-check-circle' : 'i-lucide-info'"
                                    :class="[log.level === 'error' ? 'text-error' : log.level === 'warn' ? 'text-warning' : log.level === 'success' ? 'text-success' : 'text-info', 'size-4 transition-transform group-hover:scale-110']" />
                                <span class="font-bold uppercase text-[10px] tracking-widest"
                                    :class="[log.level === 'error' ? 'text-error' : log.level === 'warn' ? 'text-warning' : log.level === 'success' ? 'text-success' : 'text-info']">
                                    {{ props.namespace }} &bull; {{ log.state }}
                                </span>
                                <span
                                    class="text-[10px] font-medium text-muted ml-auto bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.5 rounded">
                                    {{ new Date(log.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit', minute: '2-digit',
                                        second: '2-digit'
                                    }) }}
                                </span>
                            </div>
                            <span class="text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
                                {{ log.message }}
                            </span>
                        </div>
                    </div>
                </div>
                <div v-else class="flex flex-col items-center justify-center py-24 text-center">
                    <div
                        class="size-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                        <UIcon name="i-lucide-scroll-text" class="size-8 text-muted/50" />
                    </div>
                    <h3 class="font-semibold text-neutral-900 dark:text-neutral-100">No events logged</h3>
                    <p class="text-sm text-muted mt-1 px-8">Activity from your current session will appear here.</p>
                </div>
            </div>
        </template>
    </UDrawer>
</template>
