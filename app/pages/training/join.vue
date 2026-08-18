<script setup lang="ts">
const trainingStore = useTrainingStore()
const trainingSync = useTrainingSync()
const router = useRouter()
const toast = useToast()

const sessionId = ref('')
const isLoading = ref(false)

const joinSession = async () => {
    if (!sessionId.value) return
    isLoading.value = true

    try {
        const res = await $fetch('/api/training/join', {
            method: 'POST',
            body: {
                sessionId: sessionId.value,
                role: 'Student'
            }
        })

        if (res.success) {
            trainingStore.joinSession(sessionId.value, 'Student')

            // Re-hydrate all stores with the new namespaced key
            // For a simple demo, we can just reload the page or navigate to frontdesk
            // Since stores auto-hydrate on access, navigating to frontdesk will trigger their hydrate
            trainingSync.connect()

            toast.add({
                title: 'Joined Session',
                description: `Successfully connected to training session ${sessionId.value}.`,
                color: 'success'
            })

            router.push('/frontdesk')
        } else {
            toast.add({
                title: 'Error',
                description: (res as any).error || 'Failed to join session',
                color: 'error'
            })
        }
    } catch (e) {
        toast.add({ title: 'Error', description: 'Could not connect to server', color: 'error' })
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div class="min-h-screen bg-slate-50 dark:bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div class="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Student Training Portal
            </h2>
            <p class="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
                Enter your Session ID to join the simulation
            </p>
        </div>

        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <UCard class="shadow-xl">
                <form @submit.prevent="joinSession" class="space-y-6">
                    <UFormField label="Session ID" name="sessionId" required>
                        <UInput v-model="sessionId" placeholder="e.g. TRN-1234" icon="i-lucide-key" size="lg"
                            class="w-full" />
                    </UFormField>

                    <UButton type="submit" color="primary" class="w-full justify-center" size="lg" :loading="isLoading"
                        :disabled="!sessionId">
                        Join Session
                    </UButton>
                </form>
            </UCard>
        </div>
    </div>
</template>
