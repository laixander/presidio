<script setup>
const { showDemoFab, primaryColor, neutralColor } = useDevSettings()
const appConfig = useAppConfig()

if (primaryColor.value) {
    appConfig.ui.colors.primary = primaryColor.value
}
if (neutralColor.value) {
    appConfig.ui.colors.neutral = neutralColor.value
}

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en',
    class: 'scrollbar'
  }
})

const title = 'Presidio — Hotel Property Management System'
const description = 'A role-based, SaaS hotel management platform centralizing operations across Administration, Front Desk, Billing, and Housekeeping departments with an integrated operational simulation engine.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80',
  twitterCard: 'summary_large_image'
})

const open = ref(true)

// FAB demo (remove in production)
const route = useRoute()
const isDevMode = computed(() => {
    if (import.meta.server) return false
    if (route.query.nodev !== undefined) {
        sessionStorage.removeItem('devMode')
        return false
    }
    if (route.query.dev !== undefined) {
        sessionStorage.setItem('devMode', '1')
        return true
    }
    return sessionStorage.getItem('devMode') === '1'
})
</script>

<template>
    <UApp>
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </UApp>
    <DemoFab v-if="showDemoFab" />
    <DevToolModal v-if="isDevMode" v-model:open="open" />
</template>
