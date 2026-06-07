// ============================================================================
// Composable: useDevSettings
// ============================================================================
// Stores developer settings such as showDemoFab and seederCount.

export const useDevSettings = () => {
    const showDemoFab = useCookie('dev_show_demo_fab', { default: () => false })
    const seederCount = useCookie('dev_seeder_count', { default: () => 10 })
    const primaryColor = useCookie<string>('dev_primary_color')
    const neutralColor = useCookie<string>('dev_neutral_color')

    return {
        showDemoFab,
        seederCount,
        primaryColor,
        neutralColor
    }
}
