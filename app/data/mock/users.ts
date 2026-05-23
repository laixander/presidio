// ============================================================================
// Mock Data: Staff Users
// ============================================================================
// One user per Presidio department role for demo/seed purposes.

import type { StaffUser } from '~/types'

export const mockStaffUsers: StaffUser[] = [
    {
        id: 1,
        name: 'Ana Mendoza',
        email: 'ana.mendoza@presidio.ph',
        password: 'admin123',
        role: 'Administrator',
        isActive: true
    },
    {
        id: 2,
        name: 'Rico Santos',
        email: 'rico.santos@presidio.ph',
        password: 'frontdesk123',
        role: 'Front Desk',
        isActive: true
    },
    {
        id: 3,
        name: 'Carmen Diaz',
        email: 'carmen.diaz@presidio.ph',
        password: 'billing123',
        role: 'Billing',
        isActive: true
    },
    {
        id: 4,
        name: 'Elena Cruz',
        email: 'elena.cruz@presidio.ph',
        password: 'housekeeping123',
        role: 'Housekeeping',
        isActive: true
    }
]
