// ============================================================================
// Plugin: Presidio Store Hydration (Client-only)
// ============================================================================
// Hydrates all Presidio Pinia stores from localStorage on app startup.

export default defineNuxtPlugin(() => {
    // Hydrate data stores from localStorage
    useRoomsStore().hydrate()
    useGuestsStore().hydrate()
    useReservationsStore().hydrate()
    useFoliosStore().hydrate()
    useHousekeepingStore().hydrate()
})
