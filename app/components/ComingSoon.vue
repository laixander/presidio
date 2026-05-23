<script setup lang="ts">

interface FeatureSection {
    title: string
    items: string[]
}

interface Props {
    icon?: string
    comingSoonTitle?: string
    comingSoonDescription?: string
    buttonText?: string
    features?: FeatureSection[]
}

const props = withDefaults(defineProps<Props>(), {
    icon: 'i-lucide-construction',
    comingSoonTitle: 'Feature Coming Soon',
    comingSoonDescription: "This module is currently under development. We're working hard to bring you powerful new features.",
    buttonText: 'Request Demo',
    features: () => []
})

const emit = defineEmits<{
    (e: 'requestDemo'): void
}>()
</script>

<template>
    <div class="space-y-6 w-full max-w-6xl mx-auto">
        <!-- Main Hero Card -->
        <UCard variant="subtle" class="shadow-sm">
            <!-- Content Area -->
            <div class="py-16 px-6 flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
                <!-- Icon container with bounce/tilt scale on hover -->
                <div class="relative mb-6 group cursor-pointer">
                    <div class="absolute inset-0 bg-primary/10 dark:bg-primary/20 blur-xl rounded-full scale-120 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div class="relative w-16 h-16 rounded-full bg-neutral-900 dark:bg-neutral-800 flex items-center justify-center transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-6">
                        <UIcon :name="icon" class="w-7 h-7 text-white" />
                    </div>
                </div>

                <!-- Coming Soon Title -->
                <h3 class="text-xl font-bold tracking-tight mb-2">
                    {{ comingSoonTitle }}
                </h3>

                <!-- Description -->
                <p class="text-sm text-muted leading-relaxed mb-8 max-w-md text-pretty">
                    {{ comingSoonDescription }}
                </p>

                <!-- Action Button -->
                <UButton
                    size="lg"
                    color="neutral"
                    variant="outline"
                    @click="emit('requestDemo')"
                >
                    {{ buttonText }}
                </UButton>
            </div>
        </UCard>

        <!-- Features Grid -->
        <div v-if="features && features.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <UCard
                v-for="(section, idx) in features"
                :key="idx"
                variant="subtle" class="shadow-sm"
            >
                <!-- Section Title -->
                <h4 class="font-bold mb-4 tracking-tight">
                    {{ section.title }}
                </h4>

                <!-- Features list -->
                <ul class="space-y-3">
                    <li
                        v-for="(item, itemIdx) in section.items"
                        :key="itemIdx"
                        class="group flex items-start gap-2.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors duration-200"
                    >
                        <!-- Premium bullet point dot -->
                        <span class="mt-2 w-1 h-1 rounded-full bg-neutral-400 dark:bg-neutral-600 group-hover:bg-primary group-hover:scale-125 transition-all duration-200 shrink-0"></span>
                        <span class="group-hover:translate-x-0.5 transition-transform duration-200 leading-snug">
                            {{ item }}
                        </span>
                    </li>
                </ul>
            </UCard>
        </div>
    </div>
</template>
