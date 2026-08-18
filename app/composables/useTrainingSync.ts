import { ref, onBeforeUnmount } from 'vue'

export const useTrainingSync = () => {
    const trainingStore = useTrainingStore()
    const simulation = useSimulation()
    const events = useEvents()
    const logger = useLogger('training')

    const eventSource = ref<EventSource | null>(null)
    const isConnected = ref(false)

    const connect = () => {
        if (!trainingStore.activeSessionId) return
        if (eventSource.value) return

        trainingStore.connectionStatus = 'Connecting'
        
        eventSource.value = new EventSource(`/training/stream?sessionId=${trainingStore.activeSessionId}`)

        eventSource.value.onopen = () => {
            isConnected.value = true
            trainingStore.connectionStatus = 'Connected'
            logger.addLog(`Connected to training stream for session ${trainingStore.activeSessionId}`, 'System', 'success')
        }

        eventSource.value.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                
                if (data.type === 'PING') return

                // If this client is the teacher, they already run the simulation locally and broadcast it.
                // However, they can also listen to their own broadcast if we want, but usually, 
                // Teacher pushes -> Student receives. So students execute commands:
                if (trainingStore.role === 'Student') {
                    handleCommand(data)
                }
            } catch (e) {
                console.error('Error parsing SSE message', e)
            }
        }

        eventSource.value.onerror = (err) => {
            console.error('SSE Error:', err)
            isConnected.value = false
            trainingStore.connectionStatus = 'Disconnected'
            // Attempt to reconnect logic could be added here
        }
    }

    const handleCommand = (command: any) => {
        logger.addLog(`Received command: ${command.type}`, 'Training', 'info')
        
        switch (command.type) {
            case 'START':
                simulation.state.value = 'Running'
                break
            case 'PAUSE':
                simulation.state.value = 'Paused'
                break
            case 'RESET':
                simulation.reset()
                break
            case 'SET_SPEED':
                if (command.payload?.speedMs) {
                    simulation.speedMs.value = command.payload.speedMs
                }
                break
            case 'EVENT':
                if (command.payload?.eventType) {
                    simulation.executeSpecificEvent(command.payload.eventType)
                }
                break
            case 'HIGHLIGHT':
                if (command.payload?.selector) {
                    events.emit('training:highlight', command.payload.selector)
                }
                break
            case 'CLEAR_HIGHLIGHT':
                events.emit('training:clear_highlight')
                break
            case 'SEED':
                // Could call a seed function to reset data to a specific state
                events.emit('training:seed')
                break
        }
    }

    const disconnect = () => {
        if (eventSource.value) {
            eventSource.value.close()
            eventSource.value = null
        }
        isConnected.value = false
        trainingStore.connectionStatus = 'Disconnected'
    }

    const broadcast = async (command: any) => {
        if (!trainingStore.activeSessionId || trainingStore.role !== 'Teacher') return
        
        await $fetch('/api/training/broadcast', {
            method: 'POST',
            body: {
                sessionId: trainingStore.activeSessionId,
                command
            }
        })
    }

    onBeforeUnmount(() => {
        disconnect()
    })

    return {
        connect,
        disconnect,
        broadcast,
        isConnected
    }
}
