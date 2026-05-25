<script setup lang="ts">
import type { Guest } from '~/types'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
    guest?: Guest | null
    size?: 'sm' | 'md' | 'lg' | 'xl'
    showDetails?: boolean
}>(), {
    size: 'md',
    showDetails: false
})

const initials = computed(() => {
    if (!props.guest) return '?'
    const first = props.guest.firstName ? props.guest.firstName.charAt(0) : ''
    const last = props.guest.lastName ? props.guest.lastName.charAt(0) : ''
    return `${first}${last}`.toUpperCase() || '?'
})

const fullName = computed(() => {
    if (!props.guest) return 'Unknown Guest'
    return `${props.guest.firstName} ${props.guest.lastName}`
})
</script>

<template>
    <div class="flex items-center gap-3">
        <div class="relative flex-shrink-0">
            <UAvatar
                :text="initials"
                :size="size"
                :alt="fullName"
                class="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 ring-1 ring-primary-200 dark:ring-primary-800"
            />
            <div v-if="guest?.isVip" class="absolute -top-1 -right-1 bg-amber-400 text-white rounded-full p-0.5 shadow-sm ring-2 ring-white dark:ring-neutral-900 flex items-center justify-center">
                <UIcon name="i-lucide-crown" class="w-3 h-3 block" />
            </div>
        </div>
        <div v-if="showDetails" class="flex flex-col min-w-0">
            <span class="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5 truncate">
                {{ fullName }}
                <UBadge v-if="guest?.isVip" label="VIP" color="primary" variant="subtle" size="xs" class="flex-shrink-0" />
            </span>
            <span v-if="guest?.email || guest?.phone" class="text-xs text-neutral-500 truncate">
                {{ guest?.email || guest?.phone }}
            </span>
        </div>
    </div>
</template>
