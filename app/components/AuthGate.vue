<script setup lang="ts">
defineProps<{
    title: string
    description?: string
    icon?: string
}>()
</script>

<template>
    <div class="flex flex-col items-center justify-center h-[60vh] flex-1 gap-4 text-center p-6">
        <UIcon :name="icon || 'i-lucide-shield-alert'" class="w-16 h-16 text-warning-500" />
        <h2 class="text-2xl font-bold text-neutral-900 dark:text-white">{{ title }}</h2>
        <p v-if="description" class="text-neutral-500 max-w-md">
            {{ description }}
        </p>
        <slot />
    </div>
</template>
