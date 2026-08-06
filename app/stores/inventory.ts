// ============================================================================
// Store: Inventory
// ============================================================================
// Manages hotel consumables inventory, stock levels, and usage logs.

import { defineStore } from 'pinia'
import type { InventoryItem, ConsumableLog } from '~/types'

const ITEMS_KEY = 'presidio-inventory-items'
const LOGS_KEY = 'presidio-inventory-logs'

export const useInventoryStore = defineStore('inventory', () => {
    const items = ref<InventoryItem[]>([])
    const logs = ref<ConsumableLog[]>([])
    const isHydrated = ref(false)

    // ============================================================================
    // Persistence
    // ============================================================================

    const persist = () => {
        if (import.meta.client) {
            localStorage.setItem(ITEMS_KEY, JSON.stringify(items.value))
            localStorage.setItem(LOGS_KEY, JSON.stringify(logs.value))
        }
    }

    const seed = (generatedItems?: any[], generatedLogs?: any[]) => {
        if (generatedItems && generatedItems.length > 0) {
            items.value = generatedItems as InventoryItem[]
        } else {
            items.value = [
                { id: 1, name: 'Coca Cola 320ml', category: 'Mini Bar', price: 100, stockCount: 15, maxStockCount: 30 },
                { id: 2, name: 'Pringles Sour Cream 107g', category: 'Mini Bar', price: 150, stockCount: 10, maxStockCount: 20 },
                { id: 3, name: 'Bottled Water 500ml', category: 'Mini Bar', price: 50, stockCount: 25, maxStockCount: 50 },
                { id: 4, name: 'San Miguel Beer 330ml', category: 'Mini Bar', price: 180, stockCount: 8, maxStockCount: 20 },
                { id: 5, name: 'Dental Kit', category: 'Amenities', price: 60, stockCount: 35, maxStockCount: 100 },
                { id: 6, name: 'Slippers (Pair)', category: 'Amenities', price: 80, stockCount: 20, maxStockCount: 50 }
            ]
        }

        if (generatedLogs && generatedLogs.length > 0) {
            logs.value = generatedLogs as ConsumableLog[]
        } else {
            const now = new Date()
            logs.value = [
                { id: 1, roomId: 101, itemId: 1, quantity: 2, loggedBy: 'Housekeeping', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString() },
                { id: 2, roomId: 105, itemId: 3, quantity: 1, loggedBy: 'Housekeeping', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString() },
                { id: 3, roomId: 202, itemId: 5, quantity: 1, loggedBy: 'Front Desk', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString() },
                { id: 4, roomId: 304, itemId: 2, quantity: 1, loggedBy: 'Housekeeping', timestamp: new Date(now.getTime() - 1000 * 60 * 30).toISOString() }
            ]
        }

        persist()
    }

    const hydrate = () => {
        if (import.meta.server || isHydrated.value) return
        const storedItems = localStorage.getItem(ITEMS_KEY)
        const storedLogs = localStorage.getItem(LOGS_KEY)
        
        if (storedItems) items.value = JSON.parse(storedItems)
        if (storedLogs) logs.value = JSON.parse(storedLogs)

        isHydrated.value = true
    }

    // ============================================================================
    // Actions
    // ============================================================================

    const logUsage = (roomId: number, itemId: number, quantity: number, loggedBy: string) => {
        const item = items.value.find(i => i.id === itemId)
        if (!item) return false

        if (item.stockCount < quantity) return false

        // Deduct stock
        item.stockCount -= quantity

        // Log usage
        const newId = logs.value.length > 0 ? Math.max(...logs.value.map(l => l.id)) + 1 : 1
        const logEntry: ConsumableLog = {
            id: newId,
            roomId,
            itemId,
            quantity,
            loggedBy,
            timestamp: new Date().toISOString()
        }
        logs.value.unshift(logEntry)
        persist()
        return true
    }

    const restockItem = (itemId: number, quantity: number) => {
        const item = items.value.find(i => i.id === itemId)
        if (item) {
            item.stockCount = Math.min(item.stockCount + quantity, item.maxStockCount)
            persist()
        }
    }

    const addInventoryItem = (data: Omit<InventoryItem, 'id'>) => {
        const newId = items.value.length > 0 ? Math.max(...items.value.map(i => i.id)) + 1 : 1
        const newItem: InventoryItem = { id: newId, ...data }
        items.value.push(newItem)
        persist()
        return newItem
    }

    const updateInventoryItem = (id: number, data: Partial<Omit<InventoryItem, 'id'>>) => {
        const item = items.value.find(i => i.id === id)
        if (item) {
            Object.assign(item, data)
            persist()
        }
    }

    const deleteInventoryItem = (id: number) => {
        items.value = items.value.filter(i => i.id !== id)
        persist()
    }

    const clear = () => {
        items.value = []
        logs.value = []
        if (import.meta.client) {
            localStorage.removeItem(ITEMS_KEY)
            localStorage.removeItem(LOGS_KEY)
        }
    }

    return {
        items,
        logs,
        hydrate,
        seed,
        clear,
        logUsage,
        restockItem,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem
    }
})
