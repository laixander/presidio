<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { SystemRole } from '~/types'

defineProps<{
    collapsed?: boolean
}>()

const colorMode = useColorMode()
const appConfig = useAppConfig()
const authStore = useDemoAuth()
const router = useRouter()

const systemRoles: SystemRole[] = ['Administrator', 'Front Desk', 'Billing', 'Housekeeping']

const colors = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose']
const neutrals = ['slate', 'gray', 'zinc', 'neutral', 'stone']

const getRoleIcon = (role: SystemRole) => {
    const icons: Record<SystemRole, string> = {
        'Administrator': 'i-lucide-shield-alert',
        'Front Desk': 'i-lucide-concierge-bell',
        'Billing': 'i-lucide-credit-card',
        'Housekeeping': 'i-lucide-spray-can'
    }
    return icons[role] || 'i-lucide-user'
}

const items = computed<DropdownMenuItem[][]>(() => [
    // Header Info
    [{
        type: 'label',
        label: authStore.currentRole.value || 'No Role',
        icon: authStore.currentRole.value ? getRoleIcon(authStore.currentRole.value) : 'i-lucide-user',
    }],
    // Role Switcher
    [{
        label: 'Switch Role',
        icon: 'i-lucide-users',
        children: systemRoles.map(role => ({
            label: role,
            icon: getRoleIcon(role),
            type: 'checkbox',
            checked: authStore.currentRole.value === role,
            onSelect: (e: Event) => {
                e.preventDefault()
                authStore.setRole(role)
            }
        }))
    }],
    // Theme options
    [{
        label: 'Theme Color',
        icon: 'i-lucide-palette',
        children: [{
            label: 'Primary',
            slot: 'chip',
            chip: appConfig.ui.colors.primary,
            content: { align: 'center', collisionPadding: 16 },
            children: colors.map(color => ({
                label: color,
                chip: color,
                slot: 'chip',
                checked: appConfig.ui.colors.primary === color,
                type: 'checkbox',
                onSelect: (e: Event) => {
                    e.preventDefault()
                    appConfig.ui.colors.primary = color
                }
            }))
        }, {
            label: 'Neutral',
            slot: 'chip',
            chip: appConfig.ui.colors.neutral === 'neutral' ? 'old-neutral' : appConfig.ui.colors.neutral,
            content: { align: 'end', collisionPadding: 16 },
            children: neutrals.map(color => ({
                label: color,
                chip: color === 'neutral' ? 'old-neutral' : color,
                slot: 'chip',
                type: 'checkbox',
                checked: appConfig.ui.colors.neutral === color,
                onSelect: (e: Event) => {
                    e.preventDefault()
                    appConfig.ui.colors.neutral = color
                }
            }))
        }]
    }, {
        label: 'Appearance',
        icon: 'i-lucide-sun-moon',
        children: [{
            label: 'Light',
            icon: 'i-lucide-sun',
            type: 'checkbox',
            checked: colorMode.value === 'light',
            onSelect(e: Event) {
                e.preventDefault()
                colorMode.preference = 'light'
            }
        }, {
            label: 'Dark',
            icon: 'i-lucide-moon',
            type: 'checkbox',
            checked: colorMode.value === 'dark',
            onUpdateChecked(checked: boolean) {
                if (checked) {
                    colorMode.preference = 'dark'
                }
            },
            onSelect(e: Event) {
                e.preventDefault()
            }
        }]
    }],
    // Options
    [{
        label: 'Show All Pages',
        icon: 'i-lucide-layout-list',
        type: 'checkbox',
        checked: authStore.showAllPages.value,
        onUpdateChecked: (checked: boolean) => {
            authStore.setShowAllPages(checked)
        },
        onSelect: (e: Event) => {
            e.preventDefault()
        }
    }],
    // Logout
    [{
        label: 'Log out',
        icon: 'i-lucide-log-out',
        onSelect: () => {
            authStore.logout()
            router.push('/')
        }
    }]
])
</script>

<template>
    <UDropdownMenu :items="items" :content="{ align: 'center', collisionPadding: 12 }"
        :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }">
        
        <UButton v-bind="{
            label: collapsed ? undefined : (authStore.currentRole.value || 'Select Role'),
            trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
        }" color="neutral" variant="ghost" block :square="collapsed" class="data-[state=open]:bg-elevated py-2.5"
            :icon="authStore.currentRole.value ? getRoleIcon(authStore.currentRole.value) : 'i-lucide-user'" 
            :ui="{ trailingIcon: 'text-dimmed' }" />

        <template #chip-leading="{ item }">
            <div class="inline-flex items-center justify-center shrink-0 size-5">
                <span class="rounded-full ring ring-bg bg-(--chip-light) dark:bg-(--chip-dark) size-2" :style="{
                    '--chip-light': `var(--color-${(item as any).chip}-500)`,
                    '--chip-dark': `var(--color-${(item as any).chip}-400)`
                }" />
            </div>
        </template>
    </UDropdownMenu>
</template>
