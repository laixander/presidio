// ============================================================================
// Mock Data: Guests
// ============================================================================
// Hotel guest profiles with Philippine-style names for realistic demo data.

import type { Guest } from '~/types'

export const mockGuests: Guest[] = [
    {
        id: 1,
        firstName: 'Juan',
        lastName: 'Dela Cruz',
        email: 'juan.delacruz@email.com',
        phone: '+63 917 123 4567',
        isVip: true,
        company: 'Dela Cruz Enterprises'
    },
    {
        id: 2,
        firstName: 'Maria',
        lastName: 'Santos',
        email: 'maria.santos@email.com',
        phone: '+63 918 234 5678',
        isVip: false,
        company: null
    },
    {
        id: 3,
        firstName: 'Michael',
        lastName: 'Tan',
        email: 'michael.tan@email.com',
        phone: '+63 919 345 6789',
        isVip: true,
        company: 'Tan Holdings Inc.'
    },
    {
        id: 4,
        firstName: 'Sofia',
        lastName: 'Reyes',
        email: 'sofia.reyes@email.com',
        phone: '+63 920 456 7890',
        isVip: false,
        company: null
    },
    {
        id: 5,
        firstName: 'Carlos',
        lastName: 'Garcia',
        email: 'carlos.garcia@email.com',
        phone: '+63 921 567 8901',
        isVip: false,
        company: 'Garcia & Associates'
    },
    {
        id: 6,
        firstName: 'Angela',
        lastName: 'Lim',
        email: 'angela.lim@email.com',
        phone: '+63 922 678 9012',
        isVip: false,
        company: null
    },
    {
        id: 7,
        firstName: 'Roberto',
        lastName: 'Fernandez',
        email: 'roberto.fernandez@email.com',
        phone: '+63 923 789 0123',
        isVip: false,
        company: null
    },
    {
        id: 8,
        firstName: 'Patricia',
        lastName: 'Villanueva',
        email: 'patricia.villanueva@email.com',
        phone: '+63 925 890 1234',
        isVip: true,
        company: 'Villanueva Corp'
    },
    {
        id: 9,
        firstName: 'James',
        lastName: 'Chen',
        email: 'james.chen@email.com',
        phone: '+63 926 901 2345',
        isVip: false,
        company: 'Chen International'
    },
    {
        id: 10,
        firstName: 'Isabella',
        lastName: 'Torres',
        email: 'isabella.torres@email.com',
        phone: '+63 927 012 3456',
        isVip: false,
        company: null
    }
]
