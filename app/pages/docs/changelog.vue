<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

definePageMeta({
    layout: false,
    title: 'Changelog'
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

interface ChangelogEntry {
    date: string
    version: string
    title: string
    description: string
    changes: {
        type: 'feature' | 'fix' | 'refactor' | 'chore'
        text: string
    }[]
}

const changelogs: ChangelogEntry[] = [
    {
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        version: 'v1.0.0',
        title: 'Full System Completion',
        description: 'Completed all operational modules for the Presidio PMS, including a powerful automated simulation engine to demonstrate system capabilities under load.',
        changes: [
            { type: 'feature', text: 'Built Front Desk Module: Guest directory, unified Reservations list, and an interactive Reservation Details page.' },
            { type: 'feature', text: 'Built Billing Module: Folios split-ledger layout, Charge/Payment modals, and dynamic header actions.' },
            { type: 'feature', text: 'Built Housekeeping Module: Visual Room Status grid, smart Room Cards, and task assignment queue.' },
            { type: 'feature', text: 'Built Simulation Engine: Fully automated background event generator for bookings, check-ins, charges, check-outs, and room cleaning.' },
            { type: 'feature', text: 'Added Engine Control Panel with transport controls, tick speed adjustments, and event probability sliders.' },
            { type: 'feature', text: 'Added real-time Simulation Activity Logs feed.' },
            { type: 'refactor', text: 'Implemented Vue Teleport for dynamic header actions across module detail pages.' }
        ]
    },
    {
        date: 'May 24, 2026',
        version: 'v0.1.0',
        title: 'Core Modules & Dashboard',
        description: 'Full implementation of the hotel operations dashboard, room management module, data stores, and reusable component library.',
        changes: [
            { type: 'feature', text: 'Built Dashboard page with KPI stat cards (Occupancy Rate, In-House Guests, Arrivals Today, Open Balance).' },
            { type: 'feature', text: 'Integrated Chart.js via vue-chartjs — added Doughnut (Room Status) and Bar (Reservation Status) charts with theme-aware palettes.' },
            { type: 'feature', text: 'Added Today\'s Departures and Housekeeping Summary quick-info panels to the dashboard.' },
            { type: 'feature', text: 'Implemented Room Management page with full CRUD — sortable data table, inline status badges, and rate overrides.' },
            { type: 'feature', text: 'Created RoomModal and ConfirmationModal overlay components for add / edit / delete workflows.' },
            { type: 'feature', text: 'Built 5 Pinia stores (Rooms, Guests, Reservations, Folios, Housekeeping) with computed getters and demo seeder.' },
            { type: 'feature', text: 'Added useChart composable with shared palette, dataset factories, and dark-mode–responsive chart options.' },
            { type: 'feature', text: 'Created useAppToast, useAppLogger, useEvents, and useDemoSeeder composables.' },
            { type: 'feature', text: 'Built reusable StatCard, Empty, TableGlobalFilter, TableColumnToggle, and LogsDrawer components.' },
            { type: 'feature', text: 'Implemented collapsible sidebar layout with dynamic page titles and header action buttons from route meta.' },
            { type: 'feature', text: 'Added UserMenu component with role display and avatar.' },
            { type: 'refactor', text: 'Standardized table pages with sticky headers, global search, and column visibility toggles.' },
            { type: 'chore', text: 'Scaffolded placeholder pages for Guests, Reservations, Folios, and Housekeeping modules.' }
        ]
    }
]

function getBadgeColor(type: string) {
    switch (type) {
        case 'feature': return 'primary'
        case 'fix': return 'error'
        case 'refactor': return 'warning'
        case 'chore': return 'neutral'
        default: return 'neutral'
    }
}
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
            <UBadge label="System Updates" icon="i-lucide-file-text" variant="subtle" color="primary" size="lg" class="rounded-full px-3 py-1.5 w-fit" />
            <div class="flex flex-col gap-3 mt-6">
                <h1 class="text-3xl sm:text-5xl text-pretty font-bold text-highlighted">
                    Changelog &amp; <span class="text-primary-600 dark:text-primary-400">Release Notes</span>
                </h1>
                <p class="text-lg text-pretty text-primary-600 dark:text-primary-700 font-light">
                    Keep track of all new features, improvements, and architectural updates to the Loan Management Platform.
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
                Changelog &amp; <span class="text-primary-600 dark:text-primary-400">Release Notes</span>
            </h1>
            <div class="flex items-center gap-3">
                <UColorModeButton color="primary" class="cursor-pointer hover:scale-105 transition-transform" />
            </div>
        </UContainer>
    </div>

    <!-- ── Timeline ─────────────────────────────────────────────────── -->
    <UContainer class="py-12">
        <div v-for="(log, index) in changelogs" :key="index" class="relative pl-8 sm:pl-32 pb-6 last:pb-0">
            
            <!-- Timeline Line -->
            <div class="absolute left-[11px] sm:left-[107px] top-0 bottom-0 w-0.5 bg-neutral-200 dark:bg-neutral-800"
                :class="{ 'bottom-auto h-full': index !== changelogs.length - 1 }" />
            
            <!-- Timeline Dot -->
            <div class="absolute left-0 sm:left-24 top-2 flex items-center justify-center w-6 h-6 rounded-full bg-primary-500/20 border-2 border-primary-500 z-10">
                <div class="w-2 h-2 rounded-full bg-primary-500" />
            </div>

            <!-- Date & Version (Desktop: Left, Mobile: Top) -->
            <div class="sm:absolute sm:left-0 sm:w-20 sm:text-right sm:top-1 mb-2 sm:mb-0">
                <span class="block text-xs font-medium text-dimmed whitespace-nowrap">{{ log.date }}</span>
                <span class="block text-sm font-bold text-primary whitespace-nowrap">{{ log.version }}</span>
            </div>

            <!-- Content Card -->
            <UCard variant="subtle" class="shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <h2 class="text-xl font-bold text-neutral-900 dark:text-white mb-1">{{ log.title }}</h2>
                <p class="text-sm text-dimmed mb-6">{{ log.description }}</p>

                <div class="space-y-3">
                    <div v-for="(change, cIndex) in log.changes" :key="cIndex" 
                        class="flex items-start gap-3 text-sm">
                        <div class="shrink-0 w-20">
                            <UBadge :color="getBadgeColor(change.type)" variant="soft" class="uppercase text-[10px] font-bold pt-[5px] w-full rounded-full justify-center">
                                {{ change.type }}
                            </UBadge>
                        </div>
                        <span class="text-toned leading-relaxed">{{ change.text }}</span>
                    </div>
                </div>
            </UCard>
        </div>
    </UContainer>
</template>
