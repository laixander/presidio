<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

definePageMeta({
    layout: false,
    title: 'Roadmap'
})

const isScrolled = ref(false)

onMounted(() => {
    const handleScroll = () => {
        isScrolled.value = window.scrollY > 120
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    onUnmounted(() => {
        window.removeEventListener('scroll', handleScroll)
    })
})

import { implementationDocs } from '@/utils/docsData';
import { walkthroughDocs } from '@/utils/docsData';

const activeTab = ref('implementations');

</script>
<template>
    <!-- ── Static Banner Header (Standard Flow) ─────────────────────── -->
    <div 
        class="relative border-b border-default py-8 overflow-hidden min-h-[33vh] flex flex-col justify-center transition-all duration-500 ease-in-out"
        :class="isScrolled ? 'opacity-0 -translate-y-8 pointer-events-none' : 'opacity-100 translate-y-0'"
    >
        <UContainer class="relative">
            <div class="absolute -top-18 right-4">
                <UColorModeButton color="primary" />
            </div>
            <UBadge label="Implementation" icon="i-lucide-construction" variant="subtle" color="primary" size="lg" class="rounded-full px-3 py-1.5 w-fit" />
            <div class="flex flex-col gap-3 mt-6">
                <h1 class="text-3xl sm:text-5xl text-pretty font-bold text-highlighted">
                    Implementation and <span class="text-primary-600 dark:text-primary-400">Walkthrough</span>
                </h1>
                <p class="text-lg text-pretty text-primary-600 dark:text-primary-700 font-light">
                    Let's take a look at what we've built.
                </p>
            </div>
        </UContainer>
        <BackgroundGrid bg-color="bg-primary-50 dark:bg-primary-950/50" />
    </div>

    <!-- ── Fixed Mini-Navbar (Slides in smoothly on scroll, zero layout shift) ── -->
    <div 
        class="fixed top-0 left-0 right-0 z-40 border-b border-default bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md shadow-sm transition-all duration-300 ease-in-out"
        :class="isScrolled ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'"
    >
        <UContainer class="py-3 flex items-center justify-between">
            <h1 class="text-lg font-bold text-highlighted leading-none">
                Implementation and <span class="text-primary-600 dark:text-primary-400">Walkthrough</span>
            </h1>
            <div class="flex items-center gap-3">
                <UColorModeButton color="primary" class="cursor-pointer hover:scale-105 transition-transform" />
            </div>
        </UContainer>
    </div>

    <UContainer class="py-12">
        
        <div class="flex gap-4 border-b border-default mb-8 pb-4">
            <UButton :variant="activeTab === 'implementations' ? 'solid' : 'ghost'" color="primary" @click="activeTab = 'implementations'" icon="i-lucide-file-cog">Implementation Plans</UButton>
            <UButton :variant="activeTab === 'walkthroughs' ? 'solid' : 'ghost'" color="primary" @click="activeTab = 'walkthroughs'" icon="i-lucide-footprints">Walkthroughs</UButton>
        </div>

        <div v-if="activeTab === 'implementations'" class="space-y-6">
            <UAccordion :items="implementationDocs" color="primary" variant="soft" size="xl">
                <template #content="{ item }">
                    <div class="prose prose-sm dark:prose-invert max-w-none bg-muted p-6 rounded-xl border border-default mb-6" v-html="item.content"></div>
                </template>
            </UAccordion>
        </div>

        <div v-if="activeTab === 'walkthroughs'" class="space-y-6">
            <UAccordion :items="walkthroughDocs" color="primary" variant="soft" size="xl">
                <template #content="{ item }">
                    <div class="prose prose-sm dark:prose-invert max-w-none bg-muted p-6 rounded-xl border border-default mb-6" v-html="item.content"></div>
                </template>
            </UAccordion>
        </div>

    </UContainer>
</template>