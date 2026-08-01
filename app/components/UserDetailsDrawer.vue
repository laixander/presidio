<script setup lang="ts">
import { computed } from 'vue'
import type { StaffUser } from '~/types'
import StatusBadge from '~/components/StatusBadge.vue'

const props = defineProps<{
    user: StaffUser | null
}>()

const emit = defineEmits<{
    (e: 'edit', user: StaffUser): void
    (e: 'delete', user: StaffUser): void
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
}
</script>

<template>
    <UDrawer v-model:open="isOpen" direction="right" inset class="min-w-[500px]">
        <template #header>
            <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-4">
                    <div class="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                        {{ user ? getInitials(user.name) : '?' }}
                    </div>
                    <div>
                        <div class="text-xl font-bold flex items-center gap-2">
                            {{ user?.name }}
                        </div>
                        <div class="text-sm text-muted">{{ user?.email }}</div>
                    </div>
                </div>
            </div>
        </template>

        <template #body v-if="user">
            <div class="flex flex-col gap-6 mt-4">
                
                <!-- Quick Actions -->
                <div class="flex flex-wrap items-center gap-3 bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl border border-default">
                    <div class="text-sm font-semibold text-muted mr-auto flex items-center gap-2">
                        <UIcon name="i-lucide-zap" class="size-4" />
                        Quick Actions
                    </div>
                    
                    <UButton 
                        label="Edit User" 
                        icon="i-lucide-pencil" 
                        color="neutral" 
                        variant="soft"
                        @click="emit('edit', user)" 
                    />
                    
                    <UButton 
                        label="Delete User" 
                        icon="i-lucide-trash" 
                        color="error" 
                        variant="soft"
                        @click="emit('delete', user)" 
                    />
                </div>

                <!-- Status & Role -->
                <div class="space-y-4">
                    <h3 class="text-sm font-bold text-muted uppercase tracking-wider">Access & Role</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <UCard variant="subtle" :ui="{ body: 'sm:p-4' }" class="shadow-sm">
                            <div class="text-sm text-dimmed">System Role</div>
                            <div class="flex items-center gap-2 mt-2">
                                <StatusBadge :status="user.role" />
                            </div>
                        </UCard>
                        <UCard variant="subtle" :ui="{ body: 'sm:p-4' }" class="shadow-sm">
                            <div class="text-sm text-dimmed">Account Status</div>
                            <div class="flex items-center gap-2 mt-2">
                                <StatusBadge :status="user.isActive ? 'Active' : 'Inactive'" />
                            </div>
                        </UCard>
                    </div>
                </div>

                <!-- Account Metadata -->
                <div class="space-y-4">
                    <h3 class="text-sm font-bold text-muted uppercase tracking-wider">Account Information</h3>
                    <UCard variant="subtle" :ui="{ body: 'sm:p-0 overflow-hidden text-sm' }" class="shadow-sm">
                        <div class="flex justify-between p-3 border-b border-default">
                            <span class="text-dimmed">User ID</span>
                            <span class="font-medium font-mono">{{ user.id }}</span>
                        </div>
                        <div class="flex justify-between p-3 border-b border-default">
                            <span class="text-dimmed">Date Created</span>
                            <span class="font-medium" :class="user.createdAt ? '' : 'text-muted'">
                                {{ user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A' }}
                            </span>
                        </div>
                        <div class="flex justify-between p-3">
                            <span class="text-dimmed">Last Edited</span>
                            <span class="font-medium" :class="user.updatedAt ? '' : 'text-muted'">
                                {{ user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A' }}
                            </span>
                        </div>
                    </UCard>
                </div>

            </div>
        </template>
        
        <template #body v-else>
            <div class="flex flex-col items-center justify-center py-12 text-muted">
                <UIcon name="i-lucide-user-x" class="w-12 h-12 mb-4 opacity-50" />
                <p>No user selected.</p>
            </div>
        </template>
    </UDrawer>
</template>
