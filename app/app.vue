<script setup>
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
</script>

<template>
    <UApp>
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </UApp>
    <DemoFab />
</template>
