<script setup lang="ts">
// ============================================================================
// Page Configuration
// ============================================================================
definePageMeta({
    layout: 'agent',
    title: 'AI Rules',
    isTable: false
})

// ============================================================================
// State & Data
// ============================================================================

const principles = [
    {
        title: '1. Reuse Before Creating',
        content: 'Always search for existing components before creating new ones. Check for tables, forms, modals, drawers, cards, tabs, filters, buttons, alerts, charts, loaders, empty states. If an existing component solves 70–80% of the requirement: reuse it, extend it if necessary, and avoid rebuilding from scratch.'
    },
    {
        title: '2. Build Through Composition',
        content: 'New modules should be assembled using existing building blocks. For example, a User Management Module should be composed from a page layout, search filters, data table, create modal, edit modal, and detail drawer. Do not build monolithic modules.'
    },
    {
        title: '3. Maintain Design Consistency',
        content: 'Follow existing spacing, typography, colors, shadows, border radius, button styles, input patterns, and navigation structures. Never introduce inconsistent UI styling.'
    },
    {
        title: '4. Follow Existing Folder Architecture',
        content: 'Always place files in their correct locations (components, pages, composables, stores, services, types, utils). Do not create random folders unless necessary.'
    },
    {
        title: '5. Follow Existing State Management Patterns',
        content: 'Reuse existing patterns for API calls, stores, caching, loading states, error handling, and optimistic updates. Do not introduce new state patterns unless required.'
    }
]

const reuseRules = [
    {
        label: 'Tables',
        icon: 'i-lucide-table',
        content: 'Use existing table components for list pages, admin records, reporting pages, and transaction lists. Common table features: sorting, pagination, search, bulk actions, export, row actions. Do not build raw tables manually.'
    },
    {
        label: 'Forms',
        icon: 'i-lucide-form-input',
        content: 'Use existing form systems for create, edit, onboarding, settings, and profile updates. Reuse validation logic, dynamic fields, form layouts, and multi-step forms.'
    },
    {
        label: 'Modals',
        icon: 'i-lucide-square-dashed-bottom',
        content: 'Use modals for quick create, quick edit, confirmations, and alerts. Avoid using modals for large workflows; use full pages instead.'
    },
    {
        label: 'Drawers / Slideovers',
        icon: 'i-lucide-panel-right',
        content: 'Use drawers for record details, quick edits, and contextual information.'
    },
    {
        label: 'Dashboard Components',
        icon: 'i-lucide-layout-dashboard',
        content: 'Reuse existing KPI cards, charts, analytics widgets, and recent activity sections.'
    },
    {
        label: 'Empty States',
        icon: 'i-lucide-ghost',
        content: 'Always handle no records, no search results, and onboarding empty states.'
    }
]

const steps = [
    {
        title: 'Step 1: Understand requirement',
        description: 'Identify business goal, users, workflows, CRUD needs, and reporting needs.'
    },
    {
        title: 'Step 2: Search existing references',
        description: 'Find reusable components, reusable layouts, and reusable workflows.'
    },
    {
        title: 'Step 3: Compose solution',
        description: 'Build using reusable UI, reusable business logic, and reusable API layers.'
    },
    {
        title: 'Step 4: Extend only when necessary',
        description: 'Create new components only if existing ones cannot support the requirement.'
    }
]

const qualityRules = [
    { title: 'Modular', icon: 'i-lucide-box' },
    { title: 'Maintainable', icon: 'i-lucide-wrench' },
    { title: 'Readable', icon: 'i-lucide-book-open' },
    { title: 'Scalable', icon: 'i-lucide-trending-up' },
    { title: 'Typed (TS)', icon: 'i-lucide-code-2' },
    { title: 'Reusable', icon: 'i-lucide-refresh-cw' }
]

const requiredStates = [
    { label: 'Loading', icon: 'i-lucide-loader-2' },
    { label: 'Success', icon: 'i-lucide-check-circle' },
    { label: 'Empty', icon: 'i-lucide-ghost' },
    { label: 'Error', icon: 'i-lucide-alert-circle' },
    { label: 'Permissions', icon: 'i-lucide-lock' }
]

const namingRules = [
    { label: 'Components', content: 'Use PascalCase: UserTable.vue, UserForm.vue, UserModal.vue' },
    { label: 'Composables', content: 'Use camelCase with "use" prefix: useUsers.ts' },
    { label: 'Services', content: 'Use dot notation: user.service.ts' }
]

const commentRules = [
    { label: 'Section Headers', content: 'Use block comments for major sections: // === Header ===' },
    { label: 'JSDoc Patterns', content: 'Use JSDoc for composables and complex utility functions.' },
    { label: 'Intent focus', content: 'Explain "why" something is done, not just "what" the code does.' },
    { label: 'Action Tags', content: 'Use TODO: for future work and FIXME: for known issues.' }
]

const performanceRules = [
    'Prefer lazy loading for heavy components',
    'Implement pagination for all data lists',
    'Use memoization (computed) for heavy logic',
    'Batch API calls and use efficient query patterns',
    'Avoid unnecessary heavy rendering in loops'
]

const demoSystemPatterns = [
    {
        title: 'Dev FAB (Demo Control Center)',
        content: 'The floating action button provides tools for seeding demo data, resetting the system, and quick navigation. It uses a draggable implementation for flexible UI testing.',
        icon: 'i-lucide-database'
    },
    {
        title: 'Handover Persistence Pattern',
        content: 'Composables use useState backed by localStorage. This abstracts the data layer, allowing for realistic demo persistence while being "handover ready" for a real backend swap.',
        icon: 'i-lucide-hard-drive'
    },
    {
        title: 'Data Seeding',
        content: 'Use useDemoSeeder to populate initial states. Every module should provide a "Deploy Demo Data" trigger to allow immediate visual testing of UI components.',
        icon: 'i-lucide-database-zap'
    }
]

const utilityPatterns = [
    {
        title: 'Toast System',
        content: 'Use useAppToast() for standardized notifications. Avoid raw useToast() to ensure consistent primary/error styling and icons.',
        icon: 'i-lucide-bell'
    },
    {
        title: 'Icon System',
        content: 'Use Iconify patterns: i-lucide-* for generic UI icons and i-simple-icons-* for brand logos.',
        icon: 'i-lucide-component'
    }
]
</script>

<template>
    <UContainer class="max-w-4xl flex flex-col gap-8 md:gap-12">
        <UPageCard title="AI System Rules"
            description="This project contains reusable UI components, layouts, modules, and functional patterns that must be reused whenever possible. The AI agent should treat this codebase as a structured system—not a blank canvas."
            variant="naked" class="mb-4">
            <template #footer>
                <div class="flex gap-4 text-sm text-neutral-500">
                    <div class="flex items-center gap-1">
                        <UIcon name="i-lucide-check-circle-2" class="text-primary" />
                        Inspect components
                    </div>
                    <div class="flex items-center gap-1">
                        <UIcon name="i-lucide-check-circle-2" class="text-primary" />
                        Inspect layouts
                    </div>
                    <div class="flex items-center gap-1">
                        <UIcon name="i-lucide-check-circle-2" class="text-primary" />
                        Maintain consistency
                    </div>
                </div>
            </template>
        </UPageCard>

        <!-- Core Principles -->
        <section>
            <div class="flex items-center gap-2 mb-4">
                <UIcon name="i-lucide-zap" class="size-6 text-primary" />
                <h2 class="text-2xl font-bold">Core AI Principles</h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UCard v-for="item in principles" :key="item.title" :ui="{ body: 'p-5' }">
                    <template #header>
                        <h3 class="font-semibold">{{ item.title }}</h3>
                    </template>
                    <p class="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {{ item.content }}
                    </p>
                </UCard>
            </div>
        </section>

        <USeparator />

        <!-- Codebase Patterns -->
        <section>
            <div class="flex items-center gap-2 mb-4">
                <UIcon name="i-lucide-cpu" class="size-6 text-primary" />
                <h2 class="text-2xl font-bold">Codebase Specific Patterns</h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <UCard :ui="{ body: 'p-4' }">
                    <template #header>
                        <div class="flex items-center gap-2">
                            <UIcon name="i-lucide-settings-2" class="text-primary" />
                            <h3 class="font-semibold text-sm">Page Metadata</h3>
                        </div>
                    </template>
                    <p class="text-xs text-neutral-500">
                        Use <code class="text-primary">definePageMeta</code> for <code class="text-primary">title</code>
                        and
                        <code class="text-primary">headerActions</code>. Actions automatically render in the layout
                        header.
                    </p>
                </UCard>
                <UCard :ui="{ body: 'p-4' }">
                    <template #header>
                        <div class="flex items-center gap-2">
                            <UIcon name="i-lucide-layers" class="text-primary" />
                            <h3 class="font-semibold text-sm">Overlay System</h3>
                        </div>
                    </template>
                    <p class="text-xs text-neutral-500">
                        Use <code class="text-primary">useOverlay()</code> to manage modals and drawers programmatically
                        instead
                        of complex local state.
                    </p>
                </UCard>
                <UCard :ui="{ body: 'p-4' }">
                    <template #header>
                        <div class="flex items-center gap-2">
                            <UIcon name="i-lucide-radio" class="text-primary" />
                            <h3 class="font-semibold text-sm">Event Bus</h3>
                        </div>
                    </template>
                    <p class="text-xs text-neutral-500">
                        Use <code class="text-primary">useEvents()</code> for cross-component communication, especially
                        between
                        layout header actions and pages.
                    </p>
                </UCard>
            </div>
        </section>

        <USeparator />

        <!-- Demo System -->
        <section>
            <div class="flex items-center gap-2 mb-4">
                <UIcon name="i-lucide-flask-conical" class="size-6 text-primary" />
                <h2 class="text-2xl font-bold">Demo & Data System</h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <UCard v-for="pattern in demoSystemPatterns" :key="pattern.title" :ui="{ body: 'p-4' }">
                    <template #header>
                        <div class="flex items-center gap-2">
                            <UIcon :name="pattern.icon" class="text-primary" />
                            <h3 class="font-semibold text-sm">{{ pattern.title }}</h3>
                        </div>
                    </template>
                    <p class="text-xs text-neutral-500 leading-relaxed">
                        {{ pattern.content }}
                    </p>
                </UCard>
            </div>
        </section>

        <USeparator />

        <!-- Utilities -->
        <section>
            <div class="flex items-center gap-2 mb-4">
                <UIcon name="i-lucide-hammer" class="size-6 text-primary" />
                <h2 class="text-2xl font-bold">Utilities & Assets</h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UCard v-for="util in utilityPatterns" :key="util.title" :ui="{ body: 'p-4' }">
                    <template #header>
                        <div class="flex items-center gap-2">
                            <UIcon :name="util.icon" class="text-primary" />
                            <h3 class="font-semibold text-sm">{{ util.title }}</h3>
                        </div>
                    </template>
                    <p class="text-xs text-neutral-500 leading-relaxed">
                        {{ util.content }}
                    </p>
                </UCard>
            </div>
        </section>

        <USeparator />

        <!-- UI Reuse Rules -->
        <section>
            <div class="flex items-center gap-2 mb-4">
                <UIcon name="i-lucide-blocks" class="size-6 text-primary" />
                <h2 class="text-2xl font-bold">UI Reuse Rules</h2>
            </div>
            <UAccordion :items="reuseRules" multiple>
                <template #content="{ item }">
                    <p class="text-sm text-neutral-600 dark:text-neutral-400 px-4 pb-4">
                        {{ item.content }}
                    </p>
                </template>
            </UAccordion>
        </section>

        <USeparator />

        <!-- Required States -->
        <section>
            <div class="flex items-center gap-2 mb-4">
                <UIcon name="i-lucide-list-checks" class="size-6 text-primary" />
                <h2 class="text-2xl font-bold">Required Module States</h2>
            </div>
            <div class="flex flex-wrap gap-4">
                <UBadge v-for="state in requiredStates" :key="state.label" color="neutral" variant="subtle"
                    class="flex gap-2 py-2 px-3">
                    <UIcon :name="state.icon" class="size-4" />
                    {{ state.label }}
                </UBadge>
            </div>
        </section>

        <USeparator />

        <!-- Module Generation -->
        <section>
            <div class="flex items-center gap-2 mb-4">
                <UIcon name="i-lucide-factory" class="size-6 text-primary" />
                <h2 class="text-2xl font-bold">Module Generation Rules</h2>
            </div>
            <div class="flex flex-col">
                <div v-for="(step, index) in steps" :key="index" class="flex gap-4">
                    <div class="flex flex-col items-center">
                        <div
                            class="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                            {{ index + 1 }}
                        </div>
                        <div v-if="index !== steps.length - 1"
                            class="w-px flex-1 bg-primary-200 dark:bg-primary-800 my-1">
                        </div>
                    </div>
                    <div class="pb-12">
                        <h3 class="font-semibold mb-1">{{ step.title }}</h3>
                        <p class="text-sm text-neutral-600 dark:text-neutral-400">{{ step.description }}</p>
                    </div>
                </div>
            </div>
        </section>

        <USeparator />

        <!-- Code Style Section -->
        <section>
            <div class="flex items-center gap-2 mb-4">
                <UIcon name="i-lucide-pencil-line" class="size-6 text-primary" />
                <h2 class="text-2xl font-bold">Code Style & Comments</h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Naming Rules -->
                <div>
                    <h3 class="text-sm font-semibold mb-3 flex items-center gap-2">
                        <UIcon name="i-lucide-tag" class="text-primary" />
                        Naming Conventions
                    </h3>
                    <div class="space-y-3">
                        <div v-for="rule in namingRules" :key="rule.label"
                            class="p-3 rounded-lg border border-default bg-neutral-50 dark:bg-neutral-900">
                            <span class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{{ rule.label
                            }}</span>
                            <p class="text-xs mt-1 font-medium">{{ rule.content }}</p>
                        </div>
                    </div>
                </div>

                <!-- Comment Rules -->
                <div>
                    <h3 class="text-sm font-semibold mb-3 flex items-center gap-2">
                        <UIcon name="i-lucide-message-square-quote" class="text-primary" />
                        Comment Standards
                    </h3>
                    <div class="space-y-3">
                        <div v-for="rule in commentRules" :key="rule.label"
                            class="p-3 rounded-lg border border-default bg-neutral-50 dark:bg-neutral-900">
                            <span class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{{ rule.label
                            }}</span>
                            <p class="text-xs mt-1 font-medium">{{ rule.content }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <USeparator />

        <!-- Performance Rules -->
        <section>
            <div class="flex items-center gap-2 mb-4">
                <UIcon name="i-lucide-gauge" class="size-6 text-primary" />
                <h2 class="text-2xl font-bold">Performance</h2>
            </div>
            <ul class="space-y-3">
                <li v-for="rule in performanceRules" :key="rule"
                    class="flex gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <UIcon name="i-lucide-check" class="text-primary shrink-0 mt-0.5" />
                    {{ rule }}
                </li>
            </ul>
        </section>

        <USeparator />

        <!-- Code Quality -->
        <section>
            <div class="flex items-center gap-2 mb-4">
                <UIcon name="i-lucide-shield-check" class="size-6 text-primary" />
                <h2 class="text-2xl font-bold">Code Quality Rules</h2>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                <div v-for="rule in qualityRules" :key="rule.title"
                    class="flex flex-col items-center gap-2 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-default">
                    <UIcon :name="rule.icon" class="size-6 text-primary" />
                    <span class="text-xs font-medium">{{ rule.title }}</span>
                </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <!-- Prohibited Behavior -->
                <UAlert icon="i-lucide-shield-alert" color="error" variant="soft" title="Prohibited AI Behavior"
                    description="Do NOT redesign working systems, duplicate components, ignore architecture, introduce random dependencies, or create inconsistent UI patterns." />
                <!-- Final Decision -->
                <UAlert icon="i-lucide-info" color="primary" variant="subtle" title="Final Decision Framework"
                    description="Before generating anything, ask: Does this already exist? Can this be reused? Can this be extended? Is a new component truly necessary? If reusable components exist: USE THEM FIRST." />
            </div>
        </section>
    </UContainer>
</template>
