<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

definePageMeta({
    layout: false,
    title: 'User Manual'
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

const items = [
    { label: 'Administrator', icon: 'i-lucide-shield-alert', slot: 'admin' },
    { label: 'Front Desk', icon: 'i-lucide-concierge-bell', slot: 'frontdesk' },
    { label: 'Billing Officer', icon: 'i-lucide-receipt', slot: 'billing' },
    { label: 'Housekeeping', icon: 'i-lucide-spray-can', slot: 'housekeeping' },
    { label: 'Simulation & Training', icon: 'i-lucide-bot', slot: 'simulation' }
]
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
            <UBadge label="User Manual" icon="i-lucide-user" variant="subtle" color="primary" size="lg" class="rounded-full px-3 py-1.5 w-fit" />
            <div class="flex flex-col gap-3 mt-6">
                <h1 class="text-3xl sm:text-5xl text-pretty font-bold text-highlighted">
                    Role-Based <span class="text-primary-600 dark:text-primary-400">Instructions</span>
                </h1>
                <p class="text-lg text-pretty text-primary-600 dark:text-primary-700 font-light">
                    Comprehensive step-by-step instructions for utilizing the Presidio Hotel Property Management System.
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
                User <span class="text-primary-600 dark:text-primary-400">Manual</span>
            </h1>
            <div class="flex items-center gap-3">
                <UColorModeButton color="primary" class="cursor-pointer hover:scale-105 transition-transform" />
            </div>
        </UContainer>
    </div>

    <!-- ── Manual Content ─────────────────────────────────────────────────── -->
    <UContainer class="py-12">
        <UTabs :items="items" orientation="vertical" variant="link" class="w-full" :ui="{ root: 'items-start sm:gap-6 md:gap-12', list: 'gap-1 sticky top-20 h-fit' }">
            
            <!-- ADMIN -->
            <template #admin>
                <div class="space-y-6 animate-fade-in w-full">
                    <div class="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4 mb-6">
                        <div class="size-12 rounded-2xl flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary">
                            <UIcon name="i-lucide-shield-alert" class="size-8 text-primary" />
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold text-neutral-900 dark:text-white">Administrator</h3>
                            <p class="text-sm text-neutral-500">Global configurations, KPI tracking, and employee management.</p>
                        </div>
                    </div>

                    <UCard variant="subtle">
                        <template #header>
                            <h4 class="font-bold flex items-center gap-2"><UIcon name="i-lucide-bar-chart-3" class="text-primary size-5"/> Monitoring Property KPIs</h4>
                        </template>
                        <ol class="space-y-4 list-decimal list-outside ml-4 text-sm text-neutral-700 dark:text-neutral-300">
                            <li class="pl-2">Navigate to <UBadge variant="soft">Admin</UBadge> &gt; <UBadge variant="soft">Dashboard</UBadge> in the sidebar.</li>
                            <li class="pl-2">View real-time metrics including Occupancy Rate, Revenue, RevPAR, and ADR.</li>
                            <li class="pl-2">Use the interactive charts to analyze performance trends across different room types.</li>
                        </ol>
                    </UCard>

                    <UCard variant="subtle">
                        <template #header>
                            <h4 class="font-bold flex items-center gap-2"><UIcon name="i-lucide-users" class="text-primary size-5"/> Employee Management</h4>
                        </template>
                        <ol class="space-y-4 list-decimal list-outside ml-4 text-sm text-neutral-700 dark:text-neutral-300">
                            <li class="pl-2">Navigate to <UBadge variant="soft">Admin</UBadge> &gt; <UBadge variant="soft">Employee Directory</UBadge>.</li>
                            <li class="pl-2">Add new staff members or edit existing profiles.</li>
                            <li class="pl-2">Assign appropriate system roles (Front Desk, Housekeeping, Billing) to control access via the Role-Based Access Control matrix.</li>
                        </ol>
                    </UCard>
                </div>
            </template>

            <!-- FRONT DESK -->
            <template #frontdesk>
                <div class="space-y-6 animate-fade-in w-full">
                    <div class="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4 mb-6">
                        <div class="size-12 rounded-2xl flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary">
                            <UIcon name="i-lucide-concierge-bell" class="size-8 text-primary" />
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold text-neutral-900 dark:text-white">Front Desk Operations</h3>
                            <p class="text-sm text-neutral-500">Managing reservations, guest check-ins, and room availability.</p>
                        </div>
                    </div>

                    <UCard variant="subtle">
                        <template #header>
                            <h4 class="font-bold flex items-center gap-2"><UIcon name="i-lucide-calendar-search" class="text-primary size-5"/> Creating a Reservation</h4>
                        </template>
                        <ol class="space-y-4 list-decimal list-outside ml-4 text-sm text-neutral-700 dark:text-neutral-300">
                            <li class="pl-2">Navigate to <UBadge variant="soft">Front Desk</UBadge> &gt; <UBadge variant="soft">Reservations</UBadge>.</li>
                            <li class="pl-2">Click <UButton size="xs" icon="i-lucide-plus" class="pointer-events-none align-middle mx-1">New Booking</UButton> to open the creation modal.</li>
                            <li class="pl-2">Select the desired room type, dates, and assign an existing or new guest profile.</li>
                            <li class="pl-2">Confirm the booking. The system will automatically allocate a room based on availability.</li>
                        </ol>
                    </UCard>

                    <UCard variant="subtle">
                        <template #header>
                            <h4 class="font-bold flex items-center gap-2"><UIcon name="i-lucide-key" class="text-primary size-5"/> Guest Check-In & Check-Out</h4>
                        </template>
                        <ol class="space-y-4 list-decimal list-outside ml-4 text-sm text-neutral-700 dark:text-neutral-300">
                            <li class="pl-2">Navigate to the <UBadge variant="soft">Front Desk Dashboard</UBadge> to view Arrivals and Departures for the day.</li>
                            <li class="pl-2">Locate the guest in the Arrivals list and click <UButton size="xs" color="primary" class="pointer-events-none align-middle mx-1">Check-In</UButton>.</li>
                            <li class="pl-2">The system updates the room status to <UBadge variant="subtle" color="primary">Occupied</UBadge> and immediately opens an active Folio for billing.</li>
                            <li class="pl-2">To check-out a guest, their folio balance must be zero. Once settled by Billing, click <UButton size="xs" color="error" class="pointer-events-none align-middle mx-1">Check-Out</UButton> to depart the guest and trigger a Housekeeping turnover task.</li>
                        </ol>
                        <UAlert title="Cross-Department Workflow" description="Checking out a guest automatically notifies Housekeeping that the room requires cleaning." icon="i-lucide-arrow-right-left" color="info" variant="soft" class="mt-6" />
                    </UCard>
                </div>
            </template>

            <!-- BILLING -->
            <template #billing>
                <div class="space-y-6 animate-fade-in w-full">
                    <div class="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4 mb-6">
                        <div class="size-12 rounded-2xl flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary">
                            <UIcon name="i-lucide-receipt" class="size-8 text-primary" />
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold text-neutral-900 dark:text-white">Billing Officer</h3>
                            <p class="text-sm text-neutral-500">Posting charges, managing folios, and processing guest payments.</p>
                        </div>
                    </div>

                    <UCard variant="subtle">
                        <template #header>
                            <h4 class="font-bold flex items-center gap-2"><UIcon name="i-lucide-shopping-cart" class="text-primary size-5"/> Posting Manual Charges</h4>
                        </template>
                        <ol class="space-y-4 list-decimal list-outside ml-4 text-sm text-neutral-700 dark:text-neutral-300">
                            <li class="pl-2">Navigate to <UBadge variant="soft">Billing</UBadge> &gt; <UBadge variant="soft">Open Folios</UBadge>.</li>
                            <li class="pl-2">Select the folio for an in-house guest.</li>
                            <li class="pl-2">Use the <strong>Post Charge</strong> action to add incidental fees (e.g., Room Service, Minibar, Spa).</li>
                            <li class="pl-2">The folio balance updates immediately.</li>
                        </ol>
                    </UCard>

                    <UCard variant="subtle">
                        <template #header>
                            <h4 class="font-bold flex items-center gap-2"><UIcon name="i-lucide-credit-card" class="text-primary size-5"/> Processing Payments</h4>
                        </template>
                        <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                            Folios must be fully settled (balance of 0) before the Front Desk can complete the check-out process.
                        </p>
                        <ol class="space-y-4 list-decimal list-outside ml-4 text-sm text-neutral-700 dark:text-neutral-300">
                            <li class="pl-2">Inside a guest's Folio, click <UButton size="xs" color="success" class="pointer-events-none align-middle mx-1">Receive Payment</UButton>.</li>
                            <li class="pl-2">Enter the payment method (Credit Card, Cash) and the amount to settle the outstanding balance.</li>
                            <li class="pl-2">Once the balance reaches zero, the Folio can be closed, allowing the guest to depart.</li>
                        </ol>
                    </UCard>
                </div>
            </template>
            
            <!-- HOUSEKEEPING -->
            <template #housekeeping>
                <div class="space-y-6 animate-fade-in w-full">
                    <div class="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4 mb-6">
                        <div class="size-12 rounded-2xl flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary">
                            <UIcon name="i-lucide-spray-can" class="size-8 text-primary" />
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold text-neutral-900 dark:text-white">Housekeeping</h3>
                            <p class="text-sm text-neutral-500">Managing room cleanliness and turnover operations.</p>
                        </div>
                    </div>

                    <UCard variant="subtle">
                        <template #header>
                            <h4 class="font-bold flex items-center gap-2"><UIcon name="i-lucide-bed-double" class="text-primary size-5"/> Room Turnover Workflow</h4>
                        </template>
                        <ol class="space-y-4 list-decimal list-outside ml-4 text-sm text-neutral-700 dark:text-neutral-300">
                            <li class="pl-2">Navigate to the <UBadge variant="soft">Housekeeping Dashboard</UBadge>.</li>
                            <li class="pl-2">The system automatically flags rooms as <UBadge variant="subtle" color="error">Dirty</UBadge> the moment a guest checks out.</li>
                            <li class="pl-2">Assign staff to a dirty room and change its status to <UBadge variant="subtle" color="warning">Cleaning</UBadge>.</li>
                            <li class="pl-2">Once cleaning is finished, mark the room as <UBadge variant="subtle" color="primary">Clean</UBadge>.</li>
                            <li class="pl-2">A supervisor must review the room and mark it as <UBadge variant="subtle" color="success">Inspected</UBadge>. Only inspected rooms can be assigned to new arrivals by the Front Desk.</li>
                        </ol>
                    </UCard>
                </div>
            </template>

            <!-- SIMULATION -->
            <template #simulation>
                <div class="space-y-6 animate-fade-in w-full">
                    <div class="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4 mb-6">
                        <div class="size-12 rounded-2xl flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary">
                            <UIcon name="i-lucide-bot" class="size-8 text-primary" />
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold text-neutral-900 dark:text-white">Simulation & Training Engine</h3>
                            <p class="text-sm text-neutral-500">Automated event generation and synchronized multi-client training sessions.</p>
                        </div>
                    </div>

                    <UCard variant="subtle">
                        <template #header>
                            <h4 class="font-bold flex items-center gap-2"><UIcon name="i-lucide-play" class="text-primary size-5"/> Running a Training Session (Teacher)</h4>
                        </template>
                        <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                            Teachers can run live, interactive hotel simulations that synchronize in real-time with connected student sessions.
                        </p>
                        <ol class="space-y-4 list-decimal list-outside ml-4 text-sm text-neutral-700 dark:text-neutral-300">
                            <li class="pl-2">Navigate to <UBadge variant="soft">Admin</UBadge> &gt; <UBadge variant="soft">Engine Control</UBadge>.</li>
                            <li class="pl-2">Click to create a new training session. The system will generate a unique Session ID.</li>
                            <li class="pl-2">Share this Session ID with your students.</li>
                            <li class="pl-2">Use the Transport Controls (<strong>Start</strong>, <strong>Pause</strong>, <strong>Step</strong>) to run the simulation. The events will be broadcasted to all connected students.</li>
                            <li class="pl-2">Use the <strong>Teacher Guides Panel</strong> to explicitly highlight UI elements (like the "Check-In" button) on student screens.</li>
                        </ol>
                    </UCard>

                    <UCard variant="subtle">
                        <template #header>
                            <h4 class="font-bold flex items-center gap-2"><UIcon name="i-lucide-users" class="text-primary size-5"/> Joining a Training Session (Student)</h4>
                        </template>
                        <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                            Students can join a live simulation. Their local data is instantly sandboxed to preserve the main system data.
                        </p>
                        <ol class="space-y-4 list-decimal list-outside ml-4 text-sm text-neutral-700 dark:text-neutral-300">
                            <li class="pl-2">Navigate to the <UBadge variant="soft">Training Join Portal</UBadge> at <code>/training/join</code>.</li>
                            <li class="pl-2">Enter your Name and the Session ID provided by your teacher.</li>
                            <li class="pl-2">Your application state will be swapped to a clean slate, and you will see a persistent Training Mode banner.</li>
                            <li class="pl-2">As the teacher runs the simulation or highlights UI elements, your browser will sync in real-time via SSE.</li>
                        </ol>
                        <UAlert title="Data Segregation" description="While in an active training session, your local Pinia stores use a dynamically prefixed storage key. Your main hotel data is completely isolated and safe." icon="i-lucide-shield-check" color="success" variant="soft" class="mt-6" />
                    </UCard>
                </div>
            </template>
        </UTabs>
    </UContainer>
</template>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
