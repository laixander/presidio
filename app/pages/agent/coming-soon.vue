<script setup lang="ts">
definePageMeta({
    layout: 'agent',
    title: 'Coming Soon'
})

const toast = useToast()

const featureSections = [
    {
        title: 'Upcoming Features',
        items: [
            'Advanced reporting capabilities',
            'Real-time data synchronization',
            'Mobile app integration',
            'Automated workflows'
        ]
    },
    {
        title: 'Integration Ready',
        items: [
            'API-first architecture',
            'Third-party integrations',
            'Custom field support',
            'Role-based permissions'
        ]
    },
    {
        title: 'Enterprise Ready',
        items: [
            'SOC 2 compliance',
            'Advanced security',
            'Audit trails',
            '99.9% uptime SLA'
        ]
    }
]

function handleRequestDemo() {
    toast.add({
        title: 'Demo Requested',
        description: 'Thank you for your interest! We have registered your request for the Performance Management demo.',
        color: 'success',
        icon: 'i-lucide-circle-check'
    })
}
</script>

<template>
    <div class="py-4">
        <ComingSoon
            icon="i-lucide-construction"
            coming-soon-title="Feature Coming Soon"
            coming-soon-description="This module is currently under development. We're working hard to bring you powerful management features."
            button-text="Request Demo"
            :features="featureSections"
            @request-demo="handleRequestDemo"
        />
    </div>
</template>
