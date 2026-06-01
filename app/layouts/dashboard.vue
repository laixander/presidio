<script setup lang="ts">
// ============================================================================
// Imports
// ============================================================================
import type { NavigationMenuItem, SidebarProps } from '@nuxt/ui'
import type { HeaderAction } from '~/types'

// ============================================================================
// Props
// ============================================================================
defineProps<Pick<SidebarProps, 'variant' | 'collapsible' | 'side'>>()

// ============================================================================
// State & Configuration
// ============================================================================
// Default variant to inset
const variant = ref<SidebarProps['variant']>('inset')

// Default collapsible to icon
const collapsible = ref<SidebarProps['collapsible']>('icon')

// Sidebar toggle state
const open = ref(true)

// ============================================================================
// Composables
// ============================================================================
const route = useRoute()
const router = useRouter()
const events = useEvents()
const authStore = useDemoAuth()

// Sidebar navigation items mapping
const allItems: NavigationMenuItem[][] = [
    [
        { type: 'label', label: 'Admin' },
        { label: 'Admin Dashboard', icon: 'i-lucide-layout-dashboard', to: '/admin' },
        { label: 'Rooms', icon: 'i-lucide-bed-double', to: '/admin/rooms' },
        { label: 'Users', icon: 'i-lucide-users-round', to: '/admin/users' },
        { label: 'Settings', icon: 'i-lucide-settings', to: '/admin/settings' },
        { label: 'Reports', icon: 'i-lucide-pie-chart', to: '/admin/reports' },
        { label: 'Engine Control', icon: 'i-lucide-cpu', to: '/admin/simulation' }
    ],
    [
        { type: 'label', label: 'Front Desk' },
        { label: 'Front Desk', icon: 'i-lucide-concierge-bell', to: '/frontdesk' },
        { label: 'Guests', icon: 'i-lucide-users', to: '/frontdesk/guests' },
        { label: 'Reservations', icon: 'i-lucide-calendar-check', to: '/frontdesk/bookings' }
    ],
    [
        { type: 'label', label: 'Billing' },
        { label: 'Folios', icon: 'i-lucide-receipt', to: '/billing' },
        { label: 'Invoices', icon: 'i-lucide-file-text', to: '/billing/invoices' }
    ],
    [
        { type: 'label', label: 'Housekeeping' },
        { label: 'Housekeeping', icon: 'i-lucide-spray-can', to: '/housekeeping' }
    ]
]

const isPageAuthorized = (role: string | null, path: string) => {
    if (role === 'Administrator') return true
    if (role === 'Front Desk' && path.startsWith('/frontdesk')) return true
    if (role === 'Billing' && path.startsWith('/billing')) return true
    if (role === 'Housekeeping' && path.startsWith('/housekeeping')) return true
    return false
}

const items = computed<NavigationMenuItem[][]>(() => {
    if (authStore.showAllPages.value) {
        return allItems
    }
    
    // Filter groups and items based on role authorization
    return allItems
        .map(group => group.filter(item => {
            if (item.type === 'label') return true // Keep label temporarily
            return isPageAuthorized(authStore.currentRole.value, item.to as string)
        }))
        .filter(group => group.length > 1) // Only keep groups that have at least one valid route (length > 1)
})

// ============================================================================
// Computed Properties
// ============================================================================

/**
 * Derive collapsed state for NavigationMenu based on the sidebar's open state
 */
const isCollapsed = computed(() => collapsible.value === 'icon' && !open.value)

/**
 * Extracts the page title dynamically from the current route's meta tags
 */
const pageTitle = computed(() => route.meta.title as string)

/**
 * Parses and normalizes the header actions defined in the route meta
 */
const headerActions = computed(() => {
    const metaActions = route.meta.headerActions as HeaderAction[]
    if (metaActions && Array.isArray(metaActions)) return metaActions

    // Fallback for single action backward compatibility
    if (route.meta.headerActionLabel) {
        return [{
            label: route.meta.headerActionLabel as string,
            icon: route.meta.headerActionIcon as string || 'i-lucide-list-checks',
            color: route.meta.headerActionColor as string,
            variant: route.meta.headerActionVariant as string,
            size: route.meta.headerActionSize as string,
            event: 'viewLogs'
        }]
    }
    return []
})
</script>

<template>
    <div class="flex flex-1 h-screen w-full" :class="[
        variant === 'inset' && 'bg-neutral-50 dark:bg-neutral-950',
        side === 'right' && 'flex-row-reverse'
    ]">
        <USidebar v-model:open="open" :variant="variant" :collapsible="collapsible" :side="side" :ui="{
            root: '[--sidebar-width-icon:4.5625rem]', container: 'h-full', header: 'px-5'
        }">
            <template #header>
                <div class="flex items-end gap-2.5">
                    <UIcon name="i-lucide-hotel" class="size-8 shrink-0 text-primary" />
                    <span v-if="!isCollapsed"
                        class="font-black text-neutral-900 dark:text-white tracking-tight">Presi<span
                            class="text-primary">dio</span></span>
                </div>
            </template>

            <UNavigationMenu :items="items" orientation="vertical" :collapsed="isCollapsed" :tooltip="{
                delayDuration: 200,
                content: { side: 'right', sideOffset: 12 },
                arrow: true,
            }"
            popover
                :ui="{
                    root: 'gap-2.5',
                    label: 'text-default uppercase tracking-widest py-2.5',
                    link: 'p-2.5',
                    list: 'space-y-0.5'
                }" />
            <template #footer>
                <UserMenu :collapsed="isCollapsed" />
                <!-- <UButton icon="i-lucide-log-out" :label="isCollapsed ? undefined : 'Logout'" color="neutral"
                    variant="ghost" block :square="isCollapsed" class="mt-1" @click="handleLogout" /> -->
            </template>

        </USidebar>

        <div
            class="flex-1 flex flex-col overflow-hidden lg:peer-data-[variant=floating]:my-4 peer-data-[variant=inset]:m-4 lg:peer-data-[variant=inset]:not-peer-data-[collapsible=offcanvas]:ms-0 peer-data-[variant=inset]:rounded-xl peer-data-[variant=inset]:shadow-sm peer-data-[variant=inset]:ring peer-data-[variant=inset]:ring-default bg-default">
            <div class="h-(--ui-header-height) shrink-0 flex items-center px-4 sm:pe-6" :class="[
                variant !== 'floating' && 'border-b border-default',
                side === 'right' && 'justify-end'
            ]">
                <UButton :icon="side === 'left' ? 'i-lucide-panel-left' : 'i-lucide-panel-right'" color="neutral"
                    variant="ghost" aria-label="Toggle sidebar" @click="open = !open" />
                <!-- setup title in page, not here -->
                <h1 class="font-bold">{{ pageTitle }}</h1>
                <div class="ml-auto flex items-center gap-2">
                    <UButton v-for="(action, index) in headerActions" :key="index" :label="action.label"
                        :icon="action.icon" :color="(action.color as any) || 'neutral'"
                        :variant="(action.variant as any) || 'solid'" :size="(action.size as any) || 'sm'"
                        @click="action.event ? events.emit(action.event) : null" />
                    
                    <!-- Dynamic teleport target for pages that need reactive header actions -->
                    <div id="header-actions-teleport" class="flex items-center gap-2"></div>
                </div>
            </div>

            <div :class="[
                'flex-1',
                route.meta.isTable ? 'flex flex-col overflow-hidden min-h-0' : 'p-4 sm:p-6 overflow-y-auto scrollbar'
            ]">
                <slot />
            </div>
        </div>
    </div>
</template>
