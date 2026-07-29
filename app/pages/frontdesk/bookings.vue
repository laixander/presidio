<script setup lang="ts">
const authStore = useDemoAuth()
const isAuthorized = computed(() => ['Administrator', 'Front Desk'].includes(authStore.currentRole.value ?? ''))

const bookings = [
    {
        label: 'Individual Bookings',
        icon: 'i-lucide-user',
        to: '/frontdesk/bookings',
        exact: true
    },
    {
        label: 'Group Blocks',
        icon: 'i-lucide-users',
        to: '/frontdesk/bookings/groups'
    }
]
</script>

<template>
    <AuthGate v-if="!isAuthorized" title="Access Denied"
        description="You must be Front Desk staff or an Administrator to access Reservations." icon="i-lucide-lock" />

    <template v-else>
        <UNavigationMenu :items="bookings" highlight :ui="{ link: 'after:h-[2px]' }" class="border-b border-default px-4" />
        <NuxtPage />
    </template>
</template>
