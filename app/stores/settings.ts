// ============================================================================
// Store: Settings
// ============================================================================
// Manages global application settings like hotel name, timezone, and tax rate.

import { defineStore } from 'pinia'
import { ref } from 'vue'

const SETTINGS_KEY = 'presidio-settings'

export interface AppSettings {
    hotelName: string
    timezone: string
    currency: string
    taxRate: number
}

const defaultSettings: AppSettings = {
    hotelName: 'Presidio Hotel & Resort',
    timezone: 'Asia/Manila',
    currency: 'PHP',
    taxRate: 12
}

export const useSettingsStore = defineStore('settings', () => {
    // ============================================================================
    // State
    // ============================================================================
    const settings = ref<AppSettings>({ ...defaultSettings })
    const isHydrated = ref(false)

    // ============================================================================
    // Persistence
    // ============================================================================
    const persist = () => {
        if (import.meta.client) {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings.value))
        }
    }

    const hydrate = () => {
        if (import.meta.server || isHydrated.value) return
        const stored = localStorage.getItem(SETTINGS_KEY)
        if (stored) {
            settings.value = JSON.parse(stored)
        }
        isHydrated.value = true
    }

    // ============================================================================
    // Actions
    // ============================================================================
    const updateSettings = (newSettings: Partial<AppSettings>) => {
        settings.value = { ...settings.value, ...newSettings }
        persist()
    }

    const clear = () => {
        settings.value = { ...defaultSettings }
        if (import.meta.client) {
            localStorage.removeItem(SETTINGS_KEY)
        }
    }

    return {
        // State
        settings, isHydrated,
        // Actions
        hydrate, updateSettings, clear
    }
})
