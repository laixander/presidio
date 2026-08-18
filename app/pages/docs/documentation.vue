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
    { slot: 'overview', label: 'Overview & Users', icon: 'i-lucide-book-open' },
    { slot: 'modules', label: 'Functional Modules', icon: 'i-lucide-layers' },
    { slot: 'workflows', label: 'Flows & Integrations', icon: 'i-lucide-git-commit' },
    { slot: 'technical', label: 'Architecture & Data', icon: 'i-lucide-cpu' },
    { slot: 'design', label: 'Design System', icon: 'i-lucide-palette' }
]

const modulesData = [
  {
    id: 1,
    title: 'Administrator Module',
    icon: 'i-lucide-shield-alert',
    color: 'purple',
    desc: 'Centralized dashboard for managers to oversee the entire property operations, manage users, and configure settings.',
    features: [
      'Dashboard with KPIs (Occupancy, Revenue, In-House Guests)',
      'User Management with Role-Based Access Control',
      'Room Type & General Settings Configuration',
      'Simulation Engine Control Panel'
    ],
    examples: ['KPI Dashboard', 'User Manager', 'System Settings', 'Simulation Config']
  },
  {
    id: 2,
    title: 'Front Desk Module',
    icon: 'i-lucide-concierge-bell',
    color: 'blue',
    desc: 'The operational heart for guest-facing activities including reservations, check-ins, and check-outs.',
    features: [
      'Interactive Room Availability Search',
      'Create and manage Guest Reservations',
      'Guest Check-In and Check-Out workflows',
      'Comprehensive Guest Profiles and History'
    ],
    validations: [
      'Room availability conflict checks',
      'Required guest profile fields',
      'VIP status recognition'
    ]
  },
  {
    id: 3,
    title: 'Billing (Cashier) Module',
    icon: 'i-lucide-receipt',
    color: 'emerald',
    desc: 'Comprehensive folio management system handling charges, payments, and settlements.',
    features: [
      'Open Folios Dashboard for quick monitoring',
      'Add manual charges (Room Service, Mini Bar, etc.)',
      'Apply payments across multiple methods',
      'Generate Invoices and Settle Folios'
    ],
    models: ['Split Ledger Layout', 'Charge Categorization', 'Outstanding Balance Tracking']
  },
  {
    id: 4,
    title: 'Housekeeping Module',
    icon: 'i-lucide-spray-can',
    color: 'amber',
    desc: 'Real-time room status tracking and task assignment for cleaning staff.',
    features: [
      'Visual Room Status Grid (Clean/Dirty/Inspected)',
      'Incoming Task Management',
      'Quick status updates and maintenance flags',
      'Automated triggers from Front Desk actions'
    ],
    flow: 'Guest Check-Out ➔ Room Marked Dirty ➔ Task Assigned ➔ Cleaned ➔ Inspected'
  },
  {
    id: 5,
    title: 'Simulation & Training Engine',
    icon: 'i-lucide-bot',
    color: 'pink',
    desc: 'A powerful automated engine that generates realistic hotel events and facilitates synchronized, multi-client training sessions.',
    features: [
      'Auto-generation of Bookings, Check-ins, and Check-outs',
      'Real-time synchronized training broadcasts (Teacher/Student)',
      'Dynamic data sandboxing for isolated student environments',
      'Teacher-guided UI highlighting and overlays'
    ],
    channels: [
      { name: 'Simulation Logs', desc: 'Real-time feed of all engine-generated events and state changes.' },
      { name: 'Training Sync (SSE)', desc: 'Server-Sent Events streaming commands to connected student clients.' }
    ]
  }
]

const userJourney = [
  { title: 'Search & Booking', desc: 'Guest inquires about dates. Front Desk searches availability and creates a Reservation.' },
  { title: 'Arrival & Check-In', desc: 'Guest arrives. Front Desk locates the booking, assigns a specific Room, and checks the guest in. A Folio is automatically opened.' },
  { title: 'In-House Stay', desc: 'Guest utilizes hotel services. Charges (e.g., Mini Bar, Restaurant) are posted to the Folio via the Billing Module.' },
  { title: 'Departure & Settlement', desc: 'Guest requests check-out. Billing reviews the Folio, applies final Payments, and settles the balance to zero.' },
  { title: 'Room Turnover', desc: 'Upon check-out, the system marks the Room as Dirty. Housekeeping receives a task, cleans the room, and updates status to Inspected.' },
  { title: 'Ready for Next Guest', desc: 'Room is now Vacant & Clean, available for the next Front Desk assignment.' }
]

const integrations = [
  { name: 'Pinia Stores', key: 'State Management', action: 'Centralized, reactive state for Rooms, Guests, Reservations, Folios, and Users replacing a traditional database for the frontend MVP.' },
  { name: 'Chart.js', key: 'vue-chartjs', action: 'Renders dynamic Doughnut and Bar charts in the Admin Dashboard for Occupancy and Revenue metrics.' },
  { name: 'Simulation Engine', key: 'Background Tasks', action: 'Internal engine that dispatches actions to Pinia stores to simulate live hotel activity automatically.' }
]

const integrationColumns = [
  { accessorKey: 'name', header: 'Internal Subsystem' },
  { accessorKey: 'key', header: 'Technology / Module' },
  { accessorKey: 'action', header: 'Functional Role' }
]

const architectureLayers = [
  { name: 'Presentation Layer', desc: 'Nuxt 3, Vue 3, Nuxt UI v4. Responsible for rendering the interactive dashboard, modules, and real-time state visualization.', icon: 'i-lucide-layout', color: 'blue' },
  { name: 'Application Logic', desc: 'Pinia Stores & Vue Composables. Manages client state, RBAC authentication, and orchestrates domain actions.', icon: 'i-lucide-cpu', color: 'emerald' },
  { name: 'Domain Services', desc: 'Core business rules. Contains the Simulation Engine and Lifecycle orchestrators (Check-in/Check-out flows).', icon: 'i-lucide-briefcase', color: 'amber' },
  { name: 'Persistence Mock', desc: 'Local mock data generation (useDemoSeeder) and dynamic procedural data seeding for rapid frontend development.', icon: 'i-lucide-database', color: 'purple' }
]

const dataModels = [
  { entity: 'User', fields: ['id', 'name', 'email', 'password', 'role'], relation: 'System Accounts (RBAC)' },
  { entity: 'Guest', fields: ['id', 'firstName', 'lastName', 'email', 'phone', 'isVip', 'company'], relation: 'Core Entity' },
  { entity: 'Room', fields: ['id', 'number', 'floor', 'roomTypeId', 'occupancyStatus', 'cleanStatus', 'condition'], relation: 'Belongs to RoomType' },
  { entity: 'Reservation', fields: ['id', 'bookingRef', 'guestId', 'roomId', 'checkInDate', 'checkOutDate', 'status'], relation: 'Links Guest & Room' },
  { entity: 'Folio', fields: ['id', 'folioNumber', 'guestId', 'reservationId', 'status', 'balance'], relation: 'Billing Ledger' },
  { entity: 'Charge', fields: ['id', 'folioId', 'description', 'type', 'unitPrice', 'quantity', 'total'], relation: 'Belongs to Folio' },
  { entity: 'Payment', fields: ['id', 'folioId', 'amount', 'method', 'paymentDate'], relation: 'Belongs to Folio' },
  { entity: 'HousekeepingTask', fields: ['id', 'roomId', 'assignedTo', 'taskType', 'status'], relation: 'Operational Task' }
]

const personas = [
  {
    role: 'Administrator',
    icon: 'i-lucide-shield',
    color: 'purple',
    label: 'Platform Manager',
    tasks: [
      'Oversee property KPIs',
      'Manage users and roles',
      'Configure system settings'
    ]
  },
  {
    role: 'Front Desk',
    icon: 'i-lucide-user',
    color: 'blue',
    label: 'Guest Operations',
    tasks: [
      'Manage reservations',
      'Perform check-ins and check-outs',
      'Update guest profiles'
    ]
  },
  {
    role: 'Billing Officer',
    icon: 'i-lucide-receipt',
    color: 'emerald',
    label: 'Cashier',
    tasks: [
      'Monitor open folios',
      'Post charges and payments',
      'Settle accounts and generate invoices'
    ]
  },
  {
    role: 'Housekeeping',
    icon: 'i-lucide-spray-can',
    color: 'amber',
    label: 'Operations Staff',
    tasks: [
      'Monitor room cleaning queue',
      'Update room status',
      'Flag rooms for maintenance'
    ]
  },
  {
    role: 'Teacher / Trainer',
    icon: 'i-lucide-graduation-cap',
    color: 'pink',
    label: 'Education',
    tasks: [
      'Create and manage training sessions',
      'Broadcast simulation events to students',
      'Trigger guided UI highlights'
    ]
  }
] as any
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
            <UBadge label="Documentation" icon="i-lucide-book" variant="subtle" color="primary" size="lg" class="rounded-full px-3 py-1.5 w-fit" />
            <div class="flex flex-col gap-3 mt-6">
                <h1 class="text-3xl sm:text-5xl text-pretty font-bold text-highlighted">
                    Platform <span class="text-primary-600 dark:text-primary-400">Documentation</span>
                </h1>
                <p class="text-lg text-pretty text-primary-600 dark:text-primary-700 font-light">
                    A comprehensive hotel property management system centralizing Administration, Front Desk, Billing, and Housekeeping into one unified platform.
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
                Platform <span class="text-primary-600 dark:text-primary-400">Documentation</span>
            </h1>
            <div class="flex items-center gap-3">
                <UColorModeButton color="primary" class="cursor-pointer hover:scale-105 transition-transform" />
            </div>
        </UContainer>
    </div>

    <!-- ── Manual Content ─────────────────────────────────────────────────── -->
    <UContainer class="py-12">
        <UTabs :items="items" orientation="vertical" variant="link" class="w-full" :ui="{ root: 'items-start sm:gap-6 md:gap-12', list: 'gap-1 sticky top-20 h-fit' }">
            
            <!-- OVERVIEW & USERS -->
            <template #overview>
                <div class="space-y-12 animate-fade-in w-full">
                    <!-- Core Purpose Card -->
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div class="lg:col-span-2 space-y-6">
                            <div class="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
                                <div class="size-12 rounded-2xl flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary">
                                    <UIcon name="i-lucide-focus" class="size-6 text-primary" />
                                </div>
                                <div>
                                    <h2 class="text-2xl font-bold text-neutral-900 dark:text-white">Core Purpose</h2>
                                    <p class="text-sm text-neutral-500">Why this platform exists and what it solves.</p>
                                </div>
                            </div>
                            <p class="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                                Presidio PMS replaces fragmented hotel software by uniting core operational departments. From booking a room to settling a folio and cleaning the suite, data flows seamlessly between roles in real-time.
                            </p>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                              <UCard variant="soft" v-for="(item, idx) in [
                                    'Centralized Data Architecture',
                                    'Role-Based Access Control',
                                    'Real-time Room Status Updates',
                                    'Integrated Billing Ledger',
                                    'Automated Simulation Engine',
                                    'Modern, Responsive UI'
                                ]" :key="idx" :ui="{ body: 'flex gap-2' }">
                                    <UIcon name="i-lucide-check-circle" class="size-5 text-primary-500 shrink-0" />
                                    <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">{{ item }}</span>
                              </UCard>
                            </div>
                        </div>

                        <!-- Business Value Stats -->
                        <UCard variant="subtle" :ui="{ body: 'flex flex-col gap-6' }" class="bg-primary/5 dark:bg-primary-950/20 ring-primary-200 dark:ring-primary-800/50 rounded-2xl h-fit">
                            <h3 class="font-bold leading-none flex items-center gap-2">
                                <UIcon name="i-lucide-trending-up" class="text-primary size-5" />
                                Business Value
                            </h3>
                            <div class="space-y-5">
                                <div>
                                    <div class="flex justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">
                                        <span>OPERATIONAL EFFICIENCY</span>
                                        <span class="text-info-600 dark:text-info-400 font-bold">+85%</span>
                                    </div>
                                    <UProgress :model-value="85" color="info" size="sm" />
                                </div>
                                <div>
                                    <div class="flex justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">
                                        <span>BILLING ACCURACY</span>
                                        <span class="text-success-600 dark:text-success-400 font-bold">100%</span>
                                    </div>
                                    <UProgress :model-value="100" color="success" size="sm" />
                                </div>
                                <div>
                                    <div class="flex justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">
                                        <span>CHECK-IN TAT REDUCTION</span>
                                        <span class="text-warning-600 dark:text-warning-400 font-bold">-70%</span>
                                    </div>
                                    <UProgress :model-value="70" color="warning" size="sm" />
                                </div>
                            </div>
                        </UCard>
                    </div>

                    <!-- Primary User Personas -->
                    <div class="space-y-6">
                        <div class="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
                            <div class="size-12 rounded-2xl flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary">
                                <UIcon name="i-lucide-users" class="size-6 text-primary" />
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-neutral-900 dark:text-white">Primary User Personas</h2>
                                <p class="text-sm text-neutral-500">Roles interacting with the system.</p>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <UCard v-for="(persona, pIdx) in personas" :key="pIdx" variant="subtle" class="shadow-sm transition-colors" :class="`hover:border-${persona.color}-500/30`">
                                <div class="p-2.5 rounded-xl w-fit mb-4" :class="`bg-${persona.color}-500/10 text-${persona.color}-500`">
                                    <UIcon :name="persona.icon" class="size-6 shrink-0 flex" />
                                </div>
                                <h3 class="font-bold text-base text-neutral-900 dark:text-white mb-2">{{ persona.role }}</h3>
                                <ul class="text-sm text-neutral-500 dark:text-neutral-400 space-y-1.5 list-disc pl-4 mb-4">
                                    <li v-for="(task, tIdx) in persona.tasks" :key="tIdx">{{ task }}</li>
                                </ul>
                                <UBadge :color="persona.color" variant="subtle" size="sm" :label="persona.label" />
                            </UCard>
                        </div>
                    </div>
                </div>
            </template>

            <!-- FUNCTIONAL MODULES -->
            <template #modules>
                <div class="space-y-6 animate-fade-in w-full">
                    <div class="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
                        <div class="size-12 rounded-2xl flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary">
                            <UIcon name="i-lucide-layers" class="size-6 text-primary" />
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold text-neutral-900 dark:text-white">Core Submodule Modules</h2>
                            <p class="text-sm text-neutral-500">Distinct engines processing different segments of hotel operations.</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <UCard v-for="mod in modulesData" :key="mod.id" variant="subtle" :ui="{ body: 'flex flex-col h-full gap-4 relative overflow-hidden' }" class="group hover:-translate-y-1 transition-transform">
                            <!-- Background color glow -->
                            <div class="absolute -top-24 -right-24 size-60 rounded-full opacity-10 group-hover:opacity-20 transition-opacity blur-3xl" :class="`bg-${mod.color}-500`" />
                            
                            <!-- Header -->
                            <div class="flex items-start gap-3">
                                <div class="p-2 rounded-xl shrink-0" :class="`bg-${mod.color}-500/10 text-${mod.color}-500`">
                                    <UIcon :name="mod.icon" class="size-6 shrink-0 flex" />
                                </div>
                                <h3 class="font-bold text-lg mt-1 transition-colors" :class="`group-hover:text-${mod.color}-500`">
                                    {{ mod.title }}
                                </h3>
                            </div>
                            
                            <p class="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                {{ mod.desc }}
                            </p>

                            <!-- Features -->
                            <div v-if="mod.features" class="space-y-1.5 mt-2">
                                <span class="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">Key Capabilities</span>
                                <div v-for="(feat, fIdx) in mod.features" :key="fIdx" class="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                                    <UIcon name="i-lucide-check" class="size-4 text-emerald-500 shrink-0 mt-0.5" />
                                    <span>{{ feat }}</span>
                                </div>
                            </div>

                            <!-- Context Data (Validations, Flows, Models, Channels) -->
                            <div class="mt-auto pt-4 flex flex-col gap-3">
                                <div v-if="mod.validations">
                                    <span class="text-[10px] font-bold text-orange-500 uppercase tracking-wider block mb-1">Validation Checks</span>
                                    <div class="flex flex-wrap gap-1.5">
                                        <UBadge v-for="val in mod.validations" :key="val" variant="soft" color="orange" size="sm">{{ val }}</UBadge>
                                    </div>
                                </div>

                                <div v-if="mod.flow">
                                    <span class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Operational Flow</span>
                                    <div class="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono text-primary-600 dark:text-primary-400 leading-relaxed break-words">
                                        {{ mod.flow }}
                                    </div>
                                </div>

                                <div v-if="mod.models">
                                    <span class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Frameworks</span>
                                    <div class="flex flex-wrap gap-1.5">
                                        <UBadge v-for="m in mod.models" :key="m" variant="soft" color="neutral" size="sm">{{ m }}</UBadge>
                                    </div>
                                </div>

                                <div v-if="mod.examples">
                                    <span class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Standard Tools</span>
                                    <div class="flex flex-wrap gap-1.5">
                                        <UBadge v-for="ex in mod.examples" :key="ex" variant="soft" color="neutral" size="sm">{{ ex }}</UBadge>
                                    </div>
                                </div>

                                <div v-if="mod.channels" class="space-y-2">
                                    <span class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Available Outlets</span>
                                    <div v-for="ch in mod.channels" :key="ch.name" class="flex flex-col gap-2 bg-white dark:bg-neutral-900 p-2 rounded-lg border border-default shadow-sm">
                                        <div class="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 shrink-0">{{ ch.name }}:</div>
                                        <div class="text-[11px] text-neutral-500 dark:text-neutral-400">{{ ch.desc }}</div>
                                    </div>
                                </div>
                            </div>
                        </UCard>
                    </div>
                </div>
            </template>

            <!-- FLOWS & INTEGRATIONS -->
            <template #workflows>
                <div class="space-y-12 animate-fade-in w-full">
                    
                  <div class="space-y-6">
                    <!-- Interactive Employee Journey -->
                      <div class="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
                        <div class="size-12 rounded-2xl flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary">
                            <UIcon name="i-lucide-activity" class="size-6 text-primary" />
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold text-neutral-900 dark:text-white">End-to-End Guest Journey</h2>
                            <p class="text-sm text-neutral-500">How a guest moves through the lifecycle of the hotel platform.</p>
                        </div>
                      </div>
                        <!-- Vertical Timeline Layout -->
                        <div class="relative pl-10 space-y-5 before:absolute before:left-[15px] before:top-6 before:bottom-16 before:w-[2px] before:bg-gradient-to-b before:from-primary-500/60 before:via-primary-300/40 before:to-primary-500/10 before:rounded-full">
                            <div v-for="(step, sIdx) in userJourney" :key="sIdx" class="relative group">
                                <!-- Outer glow ring -->
                                <div class="absolute left-[-40px] top-[17px] size-8 rounded-full bg-primary-500/10 group-hover:bg-primary-500/20 group-hover:scale-125 transition-all duration-300" />
                                <!-- Indicator Bubble -->
                                <span class="absolute left-[-35px] top-[22px] size-[22px] rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white text-[10px] font-bold flex items-center justify-center shadow-md shadow-primary-500/30 group-hover:shadow-lg group-hover:shadow-primary-500/50 transition-all duration-300 ring-2 ring-white dark:ring-neutral-800 z-10">
                                    {{ sIdx + 1 }}
                                </span>
                                <UCard variant="subtle" class="w-full group-hover:border-primary-500/30 group-hover:shadow-md group-hover:shadow-primary-500/5 transition-all duration-300">
                                    <div class="flex items-center gap-2 mb-1">
                                        <h3 class="font-bold group-hover:text-primary transition-colors duration-200">{{ step.title }}</h3>
                                        <UBadge :label="`Step ${sIdx + 1}`" variant="soft" class="opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                    </div>
                                    <p class="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{{ step.desc }}</p>
                                </UCard>
                            </div>
                        </div>
                  </div>

                  <div class="space-y-6">
                    <!-- Integration Matrix -->
                        <div class="border-b border-neutral-200 dark:border-neutral-800 pb-4">
                            <h2 class="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                                <div class="size-12 rounded-2xl flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary">
                                    <UIcon name="i-lucide-git-commit" class="size-6 text-primary" />
                                </div>
                                <div>
                                    <div>Core Ecosystem</div>
                                    <div class="text-sm text-neutral-500 font-normal">Technologies linking the operations together.</div>
                                </div>
                            </h2>
                        </div>

                        <UTable :data="integrations" :columns="integrationColumns" class="w-full ring ring-default rounded-xl shadow-sm overflow-hidden">
                            <template #name-cell="{ row }">
                                <span class="font-bold text-default whitespace-nowrap">{{ row.original.name }}</span>
                            </template>
                            <template #key-cell="{ row }">
                                <UBadge variant="soft" class="font-mono whitespace-nowrap">{{ row.original.key }}</UBadge>
                            </template>
                            <template #action-cell="{ row }">
                                <div class="leading-relaxed text-xs whitespace-normal break-words">
                                    {{ row.original.action }}
                                </div>
                            </template>
                        </UTable>
                      </div>
                  </div>
            </template>

            <!-- ARCHITECTURE & DATA -->
            <template #technical>
                <div class="space-y-12 animate-fade-in w-full">
                    
                    <!-- System Architecture Stack -->
                    <div class="space-y-6">
                        <div class="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
                            <div class="size-12 rounded-2xl flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary">
                                <UIcon name="i-lucide-layers" class="size-6 text-primary" />
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-neutral-900 dark:text-white">System Architecture Stack</h2>
                                <p class="text-sm text-neutral-500">The 4-tier design pattern separating UI concerns from core business logic.</p>
                            </div>
                        </div>

                        <div class="flex flex-col gap-4">
                            <UCard v-for="(layer, lIdx) in architectureLayers" :key="lIdx" variant="subtle" class="group transition-transform duration-300 shadow-sm relative overflow-hidden">
                                <div class="flex items-center gap-4">
                                    <div class="p-3 rounded-xl bg-gradient-to-b" :class="`from-${layer.color}-400 to-${layer.color}-600`">
                                        <UIcon :name="layer.icon" class="size-6 shrink-0 flex text-white" />
                                    </div>
                                    <div class="flex-1">
                                        <h3 class="font-bold text-lg">{{ layer.name }}</h3>
                                        <p class="text-sm text-muted">{{ layer.desc }}</p>
                                    </div>
                                </div>
                            </UCard>
                        </div>
                    </div>

                    <!-- Core Data Entities -->
                    <div class="space-y-6">
                        <div class="border-b border-neutral-200 dark:border-neutral-800 pb-4">
                            <h2 class="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                                <div class="size-12 rounded-2xl flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary">
                                    <UIcon name="i-lucide-database" class="size-6 text-primary" />
                                </div>
                                <div>
                                    <div>Core Data Entities</div>
                                    <div class="text-sm text-neutral-500 font-normal">The relational structure powering the internal state machine.</div>
                                </div>
                            </h2>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <UCard v-for="model in dataModels" :key="model.entity" :ui="{ root: 'flex flex-col', header: 'bg-muted flex items-center justify-between w-full', body: 'flex-1', footer: 'bg-muted font-mono text-center text-xs' }" class="shadow-sm">
                            <template #header>
                              <span class="font-mono font-bold text-sm text-neutral-900 dark:text-white group-hover:text-primary transition-colors">{{ model.entity }}</span>
                                    <UIcon name="i-lucide-braces" class="text-neutral-400 size-4" />
                            </template>
                                    <span class="text-xs font-dimmed uppercase tracking-wider block mb-2">Schema Fields</span>
                                    <div class="flex flex-wrap gap-1.5 mb-4">
                                      <UBadge v-for="field in model.fields" :key="field" variant="subtle" color="neutral" class="font-mono">{{ field }}</UBadge>
                                    </div>
                              <template #footer>
                                {{ model.relation }}
                              </template>
                          </UCard>
                        </div>
                    </div>

                </div>
            </template>

            <!-- DESIGN SYSTEM -->
            <template #design>
                <div class="space-y-12 animate-fade-in w-full">
                    
                    <!-- Colors -->
                    <div class="space-y-6">
                        <div class="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
                            <div class="size-12 rounded-2xl flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary">
                                <UIcon name="i-lucide-palette" class="size-6 text-primary" />
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-neutral-900 dark:text-white">Color Palette</h2>
                                <p class="text-sm text-neutral-500">Semantic colors used throughout the application.</p>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <UCard variant="subtle" :ui="{ root: 'divide-y-0', header: 'p-0 sm:p-0' }" class="shadow-sm">
                                <template #header>
                                    <div class="h-20 bg-primary-500 w-full"></div>
                                </template>
                                <h3 class="font-bold">Primary</h3>
                                <p class="text-xs text-muted mt-1">Main brand color (Amber/Gold), interactive elements, primary buttons.</p>
                            </UCard>
                            <UCard variant="subtle" :ui="{ root: 'divide-y-0', header: 'p-0 sm:p-0' }" class="shadow-sm">
                                <template #header>
                                    <div class="h-20 bg-success-500 w-full"></div>
                                </template>
                                <h3 class="font-bold">Success</h3>
                                <p class="text-xs text-muted mt-1">Active states, clean rooms, successful actions.</p>
                            </UCard>
                            <UCard variant="subtle" :ui="{ root: 'divide-y-0', header: 'p-0 sm:p-0' }" class="shadow-sm">
                                <template #header>
                                    <div class="h-20 bg-warning-500 w-full"></div>
                                </template>
                                <h3 class="font-bold">Warning</h3>
                                <p class="text-xs text-muted mt-1">Pending states, dirty rooms, required actions.</p>
                            </UCard>
                            <UCard variant="subtle" :ui="{ root: 'divide-y-0', header: 'p-0 sm:p-0' }" class="shadow-sm">
                                <template #header>
                                    <div class="h-20 bg-error-500 w-full"></div>
                                </template>
                                <h3 class="font-bold">Error</h3>
                                <p class="text-xs text-muted mt-1">Cancelled bookings, destructive actions, critical errors.</p>
                            </UCard>
                        </div>
                    </div>

                    <!-- Typography -->
                    <div class="space-y-6">
                        <div class="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
                            <div class="size-12 rounded-2xl flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary">
                                <UIcon name="i-lucide-type" class="size-6 text-primary" />
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-neutral-900 dark:text-white">Typography</h2>
                                <p class="text-sm text-neutral-500">Fonts used for the user interface.</p>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <UCard variant="subtle">
                                <div class="flex justify-between items-start mb-4">
                                    <h3 class="font-bold">Geist Sans</h3>
                                    <UBadge variant="subtle" color="neutral">Sans-serif</UBadge>
                                </div>
                                <p class="text-2xl font-sans text-neutral-900 dark:text-white mb-2">The quick brown fox jumps over the lazy dog</p>
                                <p class="text-sm text-muted">Used for all general UI elements, headings, and paragraph text.</p>
                            </UCard>
                            <UCard variant="subtle">
                                <div class="flex justify-between items-start mb-4">
                                    <h3 class="font-bold">Geist Mono</h3>
                                    <UBadge variant="subtle" color="neutral">Monospace</UBadge>
                                </div>
                                <p class="text-lg font-mono text-neutral-900 dark:text-white mb-2">import { useRoomsStore } from '~/stores'</p>
                                <p class="text-sm text-muted">Used for code snippets, booking IDs, and technical data.</p>
                            </UCard>
                        </div>
                    </div>

                    <!-- Components -->
                    <div class="space-y-6">
                        <div class="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
                            <div class="size-12 rounded-2xl flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary">
                                <UIcon name="i-lucide-component" class="size-6 text-primary" />
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-neutral-900 dark:text-white">Core UI Components</h2>
                                <p class="text-sm text-neutral-500">Standardized elements used to build views.</p>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <UCard v-for="(comp, cIdx) in [
                                { name: 'AppNavbar', desc: 'Top navigation bar with role badge and actions' },
                                { name: 'KpiCard', desc: 'Stat card displaying labels, values, and trend indicators' },
                                { name: 'StatusBadge', desc: 'Color-coded pill for booking, clean, or folio statuses' },
                                { name: 'DataTable', desc: 'Sortable, filterable table component for entity lists' },
                                { name: 'DatePicker', desc: 'Custom date selection wrapper for bookings' },
                                { name: 'GuestAvatar', desc: 'Visual representation of guests with VIP crown' },
                                { name: 'RoomBadge', desc: 'Colored circular badge displaying room numbers' },
                                { name: 'CurrencyDisplay', desc: 'Formatted Philippine Peso amounts (red for negative balances)' }
                            ]" :key="cIdx" variant="soft" class="shadow-sm">
                                <h3 class="font-bold text-sm mb-1 font-mono text-primary">{{ comp.name }}</h3>
                                <p class="text-xs text-neutral-500 dark:text-neutral-400">{{ comp.desc }}</p>
                            </UCard>
                        </div>
                    </div>
                </div>
            </template>
        </UTabs>
    </UContainer>
</template>
