// ============================================================================
// Composable: useUsers
// ============================================================================
// Handover Ready Pattern: Abstracts the data fetching and persistence layer.
// To switch to a real backend, replace localStorage logic with $fetch or useAsyncData.

import type { User } from '~/types'

const STORAGE_KEY = 'demo-users'

export const useUsers = () => {
    // ============================================================================
    // State
    // ============================================================================
    const users = useState<User[]>('users', () => [])
    const isLoading = useState('users-loading', () => false)
    const isHydrated = ref(false)
    const toast = useAppToast()

    const isPending = computed(() => !isHydrated.value || isLoading.value)

    // ============================================================================
    // Internal Helpers
    // ============================================================================
    
    /**
     * Simulate network latency for realistic UX.
     */
    const simulateLoading = async (ms = 500) => {
        isLoading.value = true
        await new Promise(resolve => setTimeout(resolve, ms))
        isLoading.value = false
    }

    /**
     * Save data to reactive state and local storage.
     */
    const saveToStorage = (data: User[]) => {
        users.value = data
        if (import.meta.client) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        }
    }

    // ============================================================================
    // Initialization
    // ============================================================================
    
    /**
     * Load initial data from local storage.
     */
    const load = () => {
        if (import.meta.server) return
        const stored = localStorage.getItem(STORAGE_KEY)
        users.value = stored ? JSON.parse(stored) : []
        isHydrated.value = true
    }

    // Initialize on client mount
    if (import.meta.client && !isHydrated.value) {
        onMounted(load)
    }

    // ============================================================================
    // CRUD Operations
    // ============================================================================
    
    /**
     * Add a new user to the database.
     */
    const addUser = async (userForm: Omit<User, 'id'>) => {
        await simulateLoading()
        const newId = users.value.length > 0 ? Math.max(...users.value.map(u => u.id)) + 1 : 1
        const newUser = { id: newId, ...userForm }
        
        saveToStorage([newUser, ...users.value])
        toast.success('User added successfully', 'The new user has been created and saved.')
        return newUser
    }

    /**
     * Update an existing user in the database.
     */
    const updateUser = async (id: number, userForm: Omit<Partial<User>, 'id'>) => {
        await simulateLoading()
        const index = users.value.findIndex(u => u.id === id)
        if (index !== -1) {
            const updatedUsers = [...users.value]
            // We cast to User because we know the spread results in a complete User object
            updatedUsers[index] = { ...updatedUsers[index], ...userForm } as User
            saveToStorage(updatedUsers)
            toast.success('User updated successfully', "The user's profile information has been updated.")
        }
    }

    /**
     * Delete a user from the database.
     */
    const deleteUser = async (id: number) => {
        await simulateLoading()
        saveToStorage(users.value.filter(u => u.id !== id))
        toast.success('User deleted successfully', 'The user has been removed from the system.')
    }

    /**
     * Mass assign users (used by demo seeder).
     */
    const setUsers = (newUsers: User[]) => {
        saveToStorage(newUsers)
    }

    /**
     * Clear all users from the database.
     */
    const clear = (quiet = false) => {
        users.value = []
        localStorage.removeItem(STORAGE_KEY)
        if (!quiet) {
            toast.success('User database cleared', 'All user records have been permanently removed.')
        }
    }

    return {
        users,
        isLoading,
        isPending,
        load,
        addUser,
        updateUser,
        deleteUser,
        setUsers,
        clear
    }
}
