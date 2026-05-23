// ============================================================================
// Utility: Table Helpers
// ============================================================================
import { h } from 'vue'
import { UButton } from '#components'

/**
 * Returns a sortable header component for Nuxt UI Table
 * @param label The text to display in the header
 */
export const getSortableHeader = (label: string) => {
    return ({ column }: any) => {
        const isSorted = column.getIsSorted()

        return h(UButton, {
            color: 'neutral',
            variant: 'ghost',
            label,
            icon: isSorted
                ? isSorted === 'asc'
                    ? 'i-lucide-arrow-up-narrow-wide'
                    : 'i-lucide-arrow-down-wide-narrow'
                : 'i-lucide-arrow-up-down',
            class: '-mx-2.5',
            onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
        })
    }
}
