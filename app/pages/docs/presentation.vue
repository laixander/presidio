<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

definePageMeta({
    layout: false,
    title: 'Presentation'
})

// ============================================================================
// State
// ============================================================================
const currentSlide = ref(0)

// ============================================================================
// Slide Data
// ============================================================================
interface Slide {
    id: string
    badge: string
    badgeIcon: string
    title: string
    subtitle?: string
    gradient: string
    accentColor: string
    content: SlideContent
}

type SlideContent =
    | { type: 'hero'; tagline: string; highlights: { icon: string; label: string; value: string }[] }
    | { type: 'features'; items: { icon: string; title: string; description: string; color: string }[] }
    | { type: 'workflow'; steps: { icon: string; title: string; description: string; role: string }[] }
    | { type: 'architecture'; layers: { icon: string; title: string; items: string[]; color: string }[] }
    | { type: 'stats'; metrics: { icon: string; label: string; value: string; description: string; color: string }[] }
    | { type: 'roles'; roles: { icon: string; name: string; permissions: string[]; color: string }[] }
    | { type: 'tech'; categories: { icon: string; title: string; items: { name: string; description: string }[]; color: string }[] }
    | { type: 'closing'; bullets: { icon: string; text: string }[]; cta: string }

const slides: Slide[] = [
    // Slide 1: Title / Hero
    {
        id: 'hero',
        badge: 'Enterprise Demo',
        badgeIcon: 'i-lucide-airplay',
        title: 'Presidio Hotel PMS',
        subtitle: 'A centralized property management system uniting Administration, Front Desk, Billing, and Housekeeping.',
        gradient: 'from-primary-500/10 via-transparent to-emerald-500/10',
        accentColor: 'primary',
        content: {
            type: 'hero',
            tagline: 'From Reservation → Check-In → Billing → Room Cleaning — completely streamlined.',
            highlights: [
                { icon: 'i-lucide-building-2', label: 'Core Departments', value: '4' },
                { icon: 'i-lucide-users', label: 'User Roles', value: '4' },
                { icon: 'i-lucide-bot', label: 'Simulation Engine', value: '100% Auto' },
                { icon: 'i-lucide-layout-dashboard', label: 'Dashboards', value: 'Unified' }
            ]
        }
    },
    // Slide 2: Platform Architecture
    {
        id: 'architecture',
        badge: 'System Design',
        badgeIcon: 'i-lucide-blocks',
        title: 'Layered Architecture',
        subtitle: 'A modern, reactive architecture using Vue 3 Composition API, Pinia stores, and dynamic mock data.',
        gradient: 'from-violet-500/10 via-transparent to-blue-500/10',
        accentColor: 'secondary',
        content: {
            type: 'architecture',
            layers: [
                {
                    icon: 'i-lucide-layout-dashboard',
                    title: 'Presentation Layer',
                    items: ['Nuxt 3 & Vue 3', 'Nuxt UI Component Library', 'Interactive Dashboards', 'Chart.js Visualizations'],
                    color: 'primary'
                },
                {
                    icon: 'i-lucide-cpu',
                    title: 'Application Logic',
                    items: ['Role-Based Access Control', 'Simulation Engine Orchestration', 'Lifecycle State Machines (Check-in/out)'],
                    color: 'warning'
                },
                {
                    icon: 'i-lucide-database',
                    title: 'Domain Stores & State',
                    items: ['Pinia Stores (Rooms, Guests, Reservations, Folios)', 'Real-time Cross-Module Reactivity', 'Procedural Data Seeder'],
                    color: 'success'
                }
            ]
        }
    },
    // Slide 3: Core Workflow
    {
        id: 'workflow',
        badge: 'Operations',
        badgeIcon: 'i-lucide-git-branch',
        title: 'End-to-End Guest Journey',
        subtitle: 'A seamless workflow connecting Front Desk operations to Billing and Housekeeping processes.',
        gradient: 'from-amber-500/10 via-transparent to-orange-500/10',
        accentColor: 'warning',
        content: {
            type: 'workflow',
            steps: [
                { icon: 'i-lucide-calendar-search', title: 'Reservation', description: 'Front Desk searches availability, books a room, and links a guest profile.', role: 'Front Desk' },
                { icon: 'i-lucide-key', title: 'Check-In', description: 'Guest arrives. Room is assigned, status updates to Occupied, and a Folio is opened.', role: 'Front Desk' },
                { icon: 'i-lucide-shopping-cart', title: 'In-House Stay', description: 'Guest incurs charges (Room Service, Minibar). Items are posted to the active Folio.', role: 'Billing' },
                { icon: 'i-lucide-credit-card', title: 'Check-Out & Settle', description: 'Payments are applied, balance reaches zero, and the Folio is closed.', role: 'Billing' },
                { icon: 'i-lucide-spray-can', title: 'Room Turnover', description: 'Room marked Dirty. Task assigned to staff, cleaned, and marked Inspected.', role: 'Housekeeping' },
                { icon: 'i-lucide-bed-double', title: 'Ready', description: 'The room is back to Vacant & Clean, ready for the next booking.', role: 'System' }
            ]
        }
    },
    // Slide 4: Simulation Engine
    {
        id: 'simulation-engine',
        badge: 'Automation',
        badgeIcon: 'i-lucide-bot',
        title: 'The Simulation Engine',
        subtitle: 'A fully automated, background event generator mimicking real-world hotel operations under load.',
        gradient: 'from-emerald-500/10 via-transparent to-teal-500/10',
        accentColor: 'success',
        content: {
            type: 'features',
            items: [
                { icon: 'i-lucide-sliders-horizontal', title: 'Configurable Weights', description: 'Adjust probabilities for Bookings, Check-ins, Check-outs, and Cleaning events on the fly.', color: 'primary' },
                { icon: 'i-lucide-play', title: 'Transport Controls', description: 'Start, Pause, Step, or Reset the entire operational simulation at any time.', color: 'warning' },
                { icon: 'i-lucide-terminal', title: 'Live Activity Logs', description: 'A real-time scrolling feed of all system actions (e.g. "Booking PRS-10022 Created").', color: 'success' },
                { icon: 'i-lucide-zap', title: 'Store Reactivity', description: 'Engine dispatches directly to Pinia stores, instantly updating UI dashboards across the app.', color: 'error' }
            ]
        }
    },
    // Slide 5: Role-Based Access Control
    {
        id: 'rbac',
        badge: 'Security',
        badgeIcon: 'i-lucide-lock',
        title: 'Role-Based Access Control',
        subtitle: 'Four distinct personas with tailored navigation and module access limits.',
        gradient: 'from-red-500/10 via-transparent to-pink-500/10',
        accentColor: 'error',
        content: {
            type: 'roles',
            roles: [
                { icon: 'i-lucide-shield-alert', name: 'Administrator', permissions: ['KPI Dashboard', 'Manage Users & Roles', 'System Settings', 'Simulation Control'], color: 'purple' },
                { icon: 'i-lucide-concierge-bell', name: 'Front Desk', permissions: ['Front Desk Dashboard', 'Search Availability', 'Manage Reservations', 'Guest Check-In / Out'], color: 'blue' },
                { icon: 'i-lucide-receipt', name: 'Billing Officer', permissions: ['Open Folios Dashboard', 'Post Manual Charges', 'Process Payments', 'Settle Folios'], color: 'emerald' },
                { icon: 'i-lucide-spray-can', name: 'Housekeeping', permissions: ['Housekeeping Dashboard', 'Room Status Grid', 'Task Queue', 'Maintenance Flags'], color: 'amber' }
            ]
        }
    },
    // Slide 6: Admin & Configuration
    {
        id: 'admin-config',
        badge: 'Configuration',
        badgeIcon: 'i-lucide-settings',
        title: 'Global Configuration',
        subtitle: 'Administrative tooling for deep property configuration and reporting.',
        gradient: 'from-blue-500/10 via-transparent to-indigo-500/10',
        accentColor: 'primary',
        content: {
            type: 'features',
            items: [
                { icon: 'i-lucide-users', title: 'User Management', description: 'Create and assign roles (Front Desk, Housekeeping) to hotel staff members.', color: 'secondary' },
                { icon: 'i-lucide-building', title: 'Room Types & Settings', description: 'Define Room Types (e.g., Suite, Standard) and base rates dynamically.', color: 'warning' },
                { icon: 'i-lucide-bar-chart-3', title: 'Analytics Dashboard', description: 'Visual KPI reports for Revenue, Occupancy, and Department performance.', color: 'primary' },
                { icon: 'i-lucide-database-backup', title: 'Procedural Seeding', description: 'Generate robust mock datasets instantly to populate the system for testing.', color: 'error' }
            ]
        }
    },
    // Slide 7: Tech Stack
    {
        id: 'tech-stack',
        badge: 'Technology',
        badgeIcon: 'i-lucide-code-2',
        title: 'Technology Stack',
        subtitle: 'Built with modern web standards and a cutting-edge developer experience.',
        gradient: 'from-cyan-500/10 via-transparent to-sky-500/10',
        accentColor: 'primary',
        content: {
            type: 'tech',
            categories: [
                {
                    icon: 'i-lucide-layout-template',
                    title: 'Frontend Framework',
                    items: [
                        { name: 'Nuxt 3', description: 'Full-stack Vue framework with powerful auto-imports and file-based routing' },
                        { name: 'Vue 3', description: 'Composition API with <script setup> for efficient component logic' },
                        { name: 'TypeScript', description: 'Strict typing for robust domain models (Rooms, Guests, Reservations)' }
                    ],
                    color: 'success'
                },
                {
                    icon: 'i-lucide-palette',
                    title: 'UI & Design',
                    items: [
                        { name: 'Nuxt UI v4', description: 'Comprehensive component library providing tables, modals, and badges' },
                        { name: 'Chart.js', description: 'Data visualization for KPI dashboards and revenue analytics' },
                        { name: 'Tailwind CSS', description: 'Utility-first styling with comprehensive dark mode support' }
                    ],
                    color: 'primary'
                },
                {
                    icon: 'i-lucide-database',
                    title: 'State & Tooling',
                    items: [
                        { name: 'Pinia', description: 'Centralized state management powering real-time cross-module updates' },
                        { name: 'VueUse', description: 'Essential Vue composition utilities for interactions' },
                        { name: 'Bun', description: 'Lightning-fast JavaScript runtime and package manager' }
                    ],
                    color: 'warning'
                }
            ]
        }
    },
    // Slide 8: Key Metrics
    {
        id: 'metrics',
        badge: 'By the Numbers',
        badgeIcon: 'i-lucide-hash',
        title: 'Platform at a Glance',
        subtitle: 'The scope and scale of the system measured by its composable parts.',
        gradient: 'from-fuchsia-500/10 via-transparent to-purple-500/10',
        accentColor: 'secondary',
        content: {
            type: 'stats',
            metrics: [
                { icon: 'i-lucide-layout-dashboard', label: 'Pages Built', value: '18+', description: 'Specialized module pages', color: 'primary' },
                { icon: 'i-lucide-component', label: 'Components', value: '25+', description: 'Reusable UI pieces', color: 'secondary' },
                { icon: 'i-lucide-users', label: 'Personas', value: '4', description: 'Distinct operational roles', color: 'warning' },
                { icon: 'i-lucide-database', label: 'Stores', value: '7', description: 'Pinia state stores', color: 'success' },
                { icon: 'i-lucide-bot', label: 'Sim Events', value: '∞', description: 'Auto-generated actions', color: 'error' },
                { icon: 'i-lucide-zap', label: 'Load Time', value: '<1s', description: 'Instant SPA navigation', color: 'primary' }
            ]
        }
    },
    // Slide 9: Closing
    {
        id: 'closing',
        badge: 'Summary',
        badgeIcon: 'i-lucide-sparkles',
        title: 'Ready for Operations',
        subtitle: 'A complete, automated platform showcasing modern hotel management capabilities.',
        gradient: 'from-primary-500/10 via-emerald-500/5 to-amber-500/10',
        accentColor: 'primary',
        content: {
            type: 'closing',
            bullets: [
                { icon: 'i-lucide-check-circle', text: 'Unified platform for Front Desk, Billing, and Housekeeping' },
                { icon: 'i-lucide-check-circle', text: 'Real-time reactive state updates across all module dashboards' },
                { icon: 'i-lucide-check-circle', text: 'Powerful Simulation Engine for generating dynamic operational load' },
                { icon: 'i-lucide-check-circle', text: 'Role-Based Access Control ensuring strict data security' },
                { icon: 'i-lucide-check-circle', text: 'Modern Tech Stack leveraging Nuxt 3, Vue 3, and Pinia' },
                { icon: 'i-lucide-check-circle', text: 'Procedural seeder for instant, rich mock data environments' }
            ],
            cta: 'Thank you!'
        }
    }
]

const totalSlides = computed(() => slides.length)
const activeSlide = computed(() => slides[currentSlide.value]!)
const progress = computed(() => ((currentSlide.value + 1) / totalSlides.value) * 100)

// ============================================================================
// Navigation
// ============================================================================
function nextSlide() {
    if (currentSlide.value >= totalSlides.value - 1) return
    currentSlide.value++
}

function prevSlide() {
    if (currentSlide.value <= 0) return
    currentSlide.value--
}

function goToSlide(index: number) {
    if (index === currentSlide.value) return
    currentSlide.value = index
}

// ============================================================================
// Keyboard Navigation
// ============================================================================
function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        nextSlide()
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prevSlide()
    } else if (e.key === 'Home') {
        e.preventDefault()
        goToSlide(0)
    } else if (e.key === 'End') {
        e.preventDefault()
        goToSlide(totalSlides.value - 1)
    }
}

onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
    <div class="h-screen w-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950 flex flex-col select-none">

        <div class="group relative z-50 shrink-0">
            <!-- Invisible hit area to trigger hover -->
            <div class="absolute top-0 left-0 right-0 h-16 z-30" />
            
            <!-- ── Top Bar ─────────────────────────────────────────────────── -->
            <div class="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-6 border-b border-neutral-200/50 dark:border-neutral-800/50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md transition-all duration-300 -translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 z-50">
                <div class="flex items-center gap-3">
                    <UIcon name="i-lucide-airplay" class="size-6 text-primary" />
                    <span class="font-bold text-neutral-900 dark:text-white">Presidio<span class="text-primary">PMS</span></span>
                    <UBadge label="Presentation" variant="soft" class="ml-1" />
                </div>
                <div class="flex items-center gap-4 relative z-50">
                    <span class="text-xs font-mono text-neutral-400">{{ currentSlide + 1 }} / {{ totalSlides }}</span>
                    <UColorModeButton color="neutral" size="xs" class="cursor-pointer pointer-events-auto" />
                </div>
            </div>

            <!-- ── Progress Bar ────────────────────────────────────────────── -->
            <div class="relative z-30 h-1 bg-neutral-200 dark:bg-neutral-800 transition-transform duration-300 group-hover:translate-y-12">
                <div class="h-full bg-gradient-to-r from-primary-500 to-emerald-500 transition-all duration-500 ease-out" :style="{ width: progress + '%' }" />
            </div>
        </div>

        <!-- ── Main Slide Content ──────────────────────────────────────── -->
        <div class="flex-1 relative overflow-hidden">
            <!-- Background Gradient -->
            <div class="absolute inset-0 transition-all duration-700" :class="`bg-gradient-to-br ${activeSlide.gradient}`" />
            <div class="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-3xl -z-0 animate-pulse" />
            
            <!-- Grid Background -->
            <div class="absolute top-0 left-0 w-[800px] h-[800px] pointer-events-none z-0
                bg-[linear-gradient(to_right,#80808025_1px,transparent_1px),linear-gradient(to_bottom,#80808025_1px,transparent_1px)]
                bg-[size:40px_40px]
                [mask-image:radial-gradient(circle_at_top_left,black_10%,transparent_70%)]" />

            <!-- Slide Wrapper -->
            <div class="relative h-full flex items-center justify-center px-6 sm:px-12 z-10">
                <Transition name="slide-fade" mode="out-in">
                <div :key="currentSlide" class="w-full max-w-6xl">
                    <!-- Slide Header -->
                    <div class="mb-8">
                        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20 mb-4">
                            <UIcon :name="activeSlide.badgeIcon" class="size-3.5" />
                            <span>{{ activeSlide.badge }}</span>
                        </div>
                        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white mb-3">
                            {{ activeSlide.title }}
                        </h2>
                        <p v-if="activeSlide.subtitle" class="text-base sm:text-lg text-neutral-500 dark:text-neutral-400 max-w-3xl leading-relaxed">
                            {{ activeSlide.subtitle }}
                        </p>
                    </div>

                    <!-- ── Content: Hero ──────────────────────────────── -->
                    <template v-if="activeSlide.content.type === 'hero'">
                        <p class="text-sm text-neutral-600 dark:text-neutral-300 mb-8 italic">{{ (activeSlide.content as any).tagline }}</p>
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div v-for="h in (activeSlide.content as any).highlights" :key="h.label"
                                class="p-4 sm:p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm text-center hover:shadow-md hover:-translate-y-0.5 transition-all">
                                <UIcon :name="h.icon" class="size-7 text-primary mb-2 mx-auto" />
                                <div class="text-2xl font-extrabold text-neutral-900 dark:text-white">{{ h.value }}</div>
                                <div class="text-sm text-neutral-500 mt-1">{{ h.label }}</div>
                            </div>
                        </div>
                    </template>

                    <!-- ── Content: Features Grid ────────────────────── -->
                    <template v-if="activeSlide.content.type === 'features'">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div v-for="item in (activeSlide.content as any).items" :key="item.title"
                                class="p-4 sm:p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                                <div class="flex items-center gap-3 mb-3">
                                    <div class="size-10 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
                                        <UIcon :name="item.icon" class="size-5 text-primary" />
                                    </div>
                                    <h4 class="font-bold text-neutral-900 dark:text-white">{{ item.title }}</h4>
                                </div>
                                <p class="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{{ item.description }}</p>
                            </div>
                        </div>
                    </template>

                    <!-- ── Content: Workflow Steps ────────────────────── -->
                    <template v-if="activeSlide.content.type === 'workflow'">
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div v-for="(step, idx) in (activeSlide.content as any).steps" :key="step.title"
                                class="relative p-4 sm:p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                                <div class="absolute top-3 right-3 size-6 rounded-full bg-primary-500/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                    {{ Number(idx) + 1 }}
                                </div>
                                <UIcon :name="step.icon" class="size-6 text-primary mb-2" />
                                <h4 class="font-bold text-neutral-900 dark:text-white mb-1">{{ step.title }}</h4>
                                <p class="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-2">{{ step.description }}</p>
                                <UBadge :label="step.role" variant="subtle" color="primary" size="sm" />
                            </div>
                        </div>
                    </template>

                    <!-- ── Content: Architecture Layers ───────────────── -->
                    <template v-if="activeSlide.content.type === 'architecture'">
                        <div class="space-y-4">
                            <div v-for="layer in (activeSlide.content as any).layers" :key="layer.title"
                                class="p-4 sm:p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm hover:shadow-md transition-all">
                                <div class="flex items-center gap-3 mb-3">
                                    <div class="size-10 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
                                        <UIcon :name="layer.icon" class="size-5 text-primary" />
                                    </div>
                                    <h4 class="font-bold text-neutral-900 dark:text-white">{{ layer.title }}</h4>
                                </div>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-13">
                                    <div v-for="item in layer.items" :key="item" class="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                        <div class="size-1.5 rounded-full bg-primary shrink-0" />
                                        <span>{{ item }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>

                    <!-- ── Content: Stats ─────────────────────────────── -->
                    <template v-if="activeSlide.content.type === 'stats'">
                        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div v-for="metric in (activeSlide.content as any).metrics" :key="metric.label"
                                class="p-4 sm:p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm text-center hover:shadow-md hover:-translate-y-0.5 transition-all">
                                <UIcon :name="metric.icon" class="size-7 text-primary mb-2 mx-auto" />
                                <div class="text-3xl font-extrabold">{{ metric.value }}</div>
                                <div class="text-sm font-semibold mt-1">{{ metric.label }}</div>
                                <div class="text-xs text-dimmed mt-0.5">{{ metric.description }}</div>
                            </div>
                        </div>
                    </template>

                    <!-- ── Content: Roles ─────────────────────────────── -->
                    <template v-if="activeSlide.content.type === 'roles'">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div v-for="role in (activeSlide.content as any).roles" :key="role.name"
                                class="p-4 sm:p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                                <div class="flex items-center gap-2 mb-3">
                                    <UIcon :name="role.icon" class="size-5 text-primary" />
                                    <h4 class="font-bold text-neutral-900 dark:text-white">{{ role.name }}</h4>
                                </div>
                                <div class="space-y-1">
                                    <div v-for="perm in role.permissions" :key="perm" class="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                                        <UIcon name="i-lucide-check" class="size-3 text-emerald-500 shrink-0" />
                                        <span>{{ perm }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>

                    <!-- ── Content: Tech Stack ────────────────────────── -->
                    <template v-if="activeSlide.content.type === 'tech'">
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div v-for="cat in (activeSlide.content as any).categories" :key="cat.title"
                                class="p-4 sm:p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm">
                                <div class="flex items-center gap-2 mb-4">
                                    <UIcon :name="cat.icon" class="size-5 text-primary" />
                                    <h4 class="font-bold text-neutral-900 dark:text-white">{{ cat.title }}</h4>
                                </div>
                                <div class="space-y-3">
                                    <div v-for="item in cat.items" :key="item.name">
                                        <div class="text-sm font-semibold text-neutral-900 dark:text-white">{{ item.name }}</div>
                                        <div class="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{{ item.description }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>

                    <!-- ── Content: Closing ───────────────────────────── -->
                    <template v-if="activeSlide.content.type === 'closing'">
                        <div class="max-w-2xl">
                            <div class="space-y-3 mb-8">
                                <div v-for="bullet in (activeSlide.content as any).bullets" :key="bullet.text"
                                    class="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                                    <UIcon :name="bullet.icon" class="size-5 text-emerald-500 shrink-0" />
                                    <span>{{ bullet.text }}</span>
                                </div>
                            </div>
                            <p class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-emerald-500">
                                {{ (activeSlide.content as any).cta }}
                            </p>
                        </div>
                    </template>
                </div>
                </Transition>
            </div>
        </div>

        <!-- ── Bottom Navigation ───────────────────────────────────────── -->
        <div class="shrink-0 h-16 flex items-center justify-between px-6 border-t border-neutral-200/50 dark:border-neutral-800/50 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md z-20">
            <!-- Slide Dots -->
            <div class="flex items-center gap-1.5">
                <button v-for="(slide, idx) in slides" :key="slide.id" @click="goToSlide(idx)"
                    class="group relative cursor-pointer"
                    :aria-label="`Go to slide ${idx + 1}: ${slide.title}`">
                    <div class="h-2 rounded-full transition-all duration-300"
                        :class="idx === currentSlide ? 'w-8 bg-primary-500' : 'w-2 bg-neutral-300 dark:bg-neutral-700 group-hover:bg-neutral-400 dark:group-hover:bg-neutral-600'" />
                </button>
            </div>

            <!-- Nav Buttons -->
            <div class="flex items-center gap-2">
                <UButton icon="i-lucide-chevron-left" color="neutral" variant="ghost" size="sm"
                    :disabled="currentSlide === 0" @click="prevSlide" />
                <span class="text-xs text-neutral-500 w-12 text-center font-mono">{{ currentSlide + 1 }}/{{ totalSlides }}</span>
                <UButton icon="i-lucide-chevron-right" color="neutral" variant="ghost" size="sm"
                    :disabled="currentSlide === totalSlides - 1" @click="nextSlide" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.slide-fade-enter-active {
    transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-fade-leave-active {
    transition: opacity 0.2s cubic-bezier(0.4, 0, 1, 1), transform 0.2s cubic-bezier(0.4, 0, 1, 1);
}
.slide-fade-enter-from {
    opacity: 0;
    transform: translateY(12px);
}
.slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}
</style>