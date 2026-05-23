import { useEventBus } from '@vueuse/core'

export const useEvents = () => {
    const bus = useEventBus<string>('app-events')

    const emit = (event: string, payload?: any) => bus.emit(event, payload)
    const on = (event: string, callback: (payload?: any) => void) => {
        return bus.on((e, payload) => {
            if (e === event) callback(payload)
        })
    }

    return { emit, on }
}
