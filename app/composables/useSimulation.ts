import { ref, computed } from 'vue'

export type SimulationState = 'Idle' | 'Running' | 'Paused'

interface SimulationWeights {
    booking: number
    checkIn: number
    checkOut: number
    charge: number
    housekeeping: number
}

// Global state so it persists across pages if desired
const state = ref<SimulationState>('Idle')
const tickCount = ref(0)
const eventsGenerated = ref(0)
const speedMs = ref(2000) // Default 2 seconds per tick
const timerId = ref<ReturnType<typeof setInterval> | null>(null)

const weights = ref<SimulationWeights>({
    booking: 20,
    checkIn: 15,
    checkOut: 15,
    charge: 30,
    housekeeping: 20
})

export const useSimulation = () => {
    const reservationsStore = useReservationsStore()
    const foliosStore = useFoliosStore()
    const housekeepingStore = useHousekeepingStore()
    const roomsStore = useRoomsStore()
    const guestsStore = useGuestsStore()
    const logger = useLogger('simulation')

    const isRunning = computed(() => state.value === 'Running')

    const start = () => {
        if (state.value === 'Running') return
        state.value = 'Running'
        logger.addLog('Simulation Engine Started', 'System', 'info')
        timerId.value = setInterval(tick, speedMs.value)
    }

    const pause = () => {
        if (state.value !== 'Running') return
        state.value = 'Paused'
        if (timerId.value) clearInterval(timerId.value)
        logger.addLog('Simulation Engine Paused', 'System', 'warn')
    }

    const stop = () => {
        state.value = 'Idle'
        if (timerId.value) clearInterval(timerId.value)
        logger.addLog('Simulation Engine Stopped', 'System', 'warn')
    }

    const reset = () => {
        stop()
        tickCount.value = 0
        eventsGenerated.value = 0
        logger.addLog('Simulation Counters Reset', 'System', 'info')
    }

    const setSpeed = (ms: number) => {
        speedMs.value = ms
        if (state.value === 'Running') {
            if (timerId.value) clearInterval(timerId.value)
            timerId.value = setInterval(tick, speedMs.value)
        }
    }

    const getRandomElement = <T>(arr: T[]): T | undefined => {
        if (arr.length === 0) return undefined
        return arr[Math.floor(Math.random() * arr.length)]
    }

    // ============================================================================
    // Event Generators
    // ============================================================================

    const generateBooking = () => {
        const guest = getRandomElement(guestsStore.guests)
        const roomType = getRandomElement(roomsStore.roomTypes)
        if (!guest || !roomType) return false

        const today = new Date()
        const checkIn = new Date(today)
        checkIn.setDate(today.getDate() + Math.floor(Math.random() * 10))
        const checkOut = new Date(checkIn)
        checkOut.setDate(checkIn.getDate() + Math.floor(Math.random() * 5) + 1)

        const res = reservationsStore.addReservation({
            guestId: guest.id,
            roomTypeId: roomType.id,
            roomId: null,
            checkInDate: checkIn.toISOString().substring(0, 10),
            checkOutDate: checkOut.toISOString().substring(0, 10),
            status: 'Pending',
            source: 'OTA'
        })
        logger.addLog(`Simulated New Booking: ${res.bookingRef} for ${guest.firstName}`, 'Booking', 'success')
        return true
    }

    const generateCheckIn = () => {
        const pending = reservationsStore.reservations.filter(r => r.status === 'Pending' || r.status === 'Confirmed')
        const res = getRandomElement(pending)
        if (!res) return false

        // Assign a room
        const availableRooms = roomsStore.rooms.filter(r => r.roomTypeId === res.roomTypeId && r.occupancyStatus === 'Vacant' && r.cleanStatus === 'Clean')
        const room = getRandomElement(availableRooms)

        if (!room) {
            logger.addLog(`Simulation Check-In Failed: No clean rooms available for ${res.bookingRef}`, 'Front Desk', 'error')
            return false
        }

        reservationsStore.updateReservation(res.id, { status: 'In-House', roomId: room.id })
        roomsStore.updateRoom(room.id, { occupancyStatus: 'Occupied' })
        foliosStore.addFolio({
            guestId: res.guestId,
            reservationId: res.id,
            status: 'Open',
            balance: 0,
            openedAt: new Date().toISOString()
        })
        logger.addLog(`Simulated Check-In: ${res.bookingRef} assigned to Room ${room.number}`, 'Front Desk', 'success')
        return true
    }

    const generateCharge = () => {
        const openFolios = foliosStore.openFolios
        const folio = getRandomElement(openFolios)
        if (!folio) return false

        const chargeTypes: import('~/types').ChargeType[] = ['Restaurant', 'Mini Bar', 'Laundry', 'Room Charge', 'Misc']
        const type = getRandomElement(chargeTypes)!
        const amounts = [150, 300, 500, 1200, 2500]
        const amount = getRandomElement(amounts)!

        foliosStore.addCharge({
            folioId: folio.id,
            type,
            description: `Simulated ${type} Charge`,
            unitPrice: amount,
            quantity: 1,
            total: amount,
            postedAt: new Date().toISOString()
        })
        logger.addLog(`Simulated Charge: ${type} for ₱${amount} to Folio ${folio.folioNumber}`, 'Charge', 'warn')
        return true
    }

    const generateCheckOut = () => {
        const inHouse = reservationsStore.reservations.filter(r => r.status === 'In-House')
        const res = getRandomElement(inHouse)
        if (!res) return false

        const folio = foliosStore.folios.find(f => f.reservationId === res.id)
        if (folio && folio.balance > 0) {
            // Auto-settle for simulation
            foliosStore.addPayment({
                folioId: folio.id,
                amount: folio.balance,
                method: 'Credit Card',
                paymentDate: new Date().toISOString()
            })
            foliosStore.settleFolio(folio.id)
        } else if (folio && folio.status === 'Open') {
            foliosStore.settleFolio(folio.id)
        }

        reservationsStore.updateReservation(res.id, { status: 'Done' })
        if (res.roomId) {
            roomsStore.updateRoom(res.roomId, { occupancyStatus: 'Vacant', cleanStatus: 'Dirty' })
        }

        logger.addLog(`Simulated Check-Out: ${res.bookingRef}`, 'Front Desk', 'success')
        return true
    }

    const generateHousekeeping = () => {
        const dirtyRooms = roomsStore.rooms.filter(r => r.cleanStatus === 'Dirty' || r.cleanStatus === 'Pickup')
        const room = getRandomElement(dirtyRooms)
        if (!room) return false

        roomsStore.updateRoom(room.id, { cleanStatus: 'Clean' })
        logger.addLog(`Simulated Housekeeping: Room ${room.number} cleaned`, 'Housekeeping', 'success')
        return true
    }

    // ============================================================================
    // Core Loop
    // ============================================================================

    const tick = () => {
        tickCount.value++
        let eventOccurred = false

        // Normalize weights
        const totalWeight = Object.values(weights.value).reduce((a, b) => a + b, 0)
        let random = Math.random() * totalWeight

        if (random < weights.value.booking) {
            eventOccurred = generateBooking()
        } else if ((random -= weights.value.booking) < weights.value.checkIn) {
            eventOccurred = generateCheckIn()
        } else if ((random -= weights.value.checkIn) < weights.value.charge) {
            eventOccurred = generateCharge()
        } else if ((random -= weights.value.charge) < weights.value.checkOut) {
            eventOccurred = generateCheckOut()
        } else {
            eventOccurred = generateHousekeeping()
        }

        if (eventOccurred) {
            eventsGenerated.value++
        }
    }

    const step = () => {
        tick()
    }

    return {
        state,
        tickCount,
        eventsGenerated,
        speedMs,
        weights,
        isRunning,
        start,
        pause,
        stop,
        reset,
        setSpeed,
        step
    }
}
