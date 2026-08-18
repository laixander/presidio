import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTrainingStore = defineStore('training', () => {
    const activeSessionId = ref<string | null>(null)
    const role = ref<'Teacher' | 'Student' | null>(null)
    const connectionStatus = ref<'Disconnected' | 'Connecting' | 'Connected'>('Disconnected')

    const isTrainingActive = computed(() => activeSessionId.value !== null)

    const joinSession = (sessionId: string, userRole: 'Teacher' | 'Student') => {
        activeSessionId.value = sessionId
        role.value = userRole
        // In a real app, this would also connect to the SSE/WebSocket
    }

    const leaveSession = () => {
        activeSessionId.value = null
        role.value = null
        connectionStatus.value = 'Disconnected'
    }

    return {
        activeSessionId,
        role,
        connectionStatus,
        isTrainingActive,
        joinSession,
        leaveSession
    }
})
