// ============================================================================
// Composable: useDemoSeeder
// ============================================================================
// Procedurally generates and seeds ALL application data for demo purposes.
// Uses @faker-js/faker to generate realistic data based on the seederCount.

import { faker } from '@faker-js/faker'

export const useDemoSeeder = () => {
    // Legacy composable (agent table reference)
    const { setUsers, clear: clearUsers } = useUsers()

    // Presidio Pinia stores
    const usersStore = useUsersStore()
    const roomsStore = useRoomsStore()
    const guestsStore = useGuestsStore()
    const reservationsStore = useReservationsStore()
    const foliosStore = useFoliosStore()
    const housekeepingStore = useHousekeepingStore()
    const settingsStore = useSettingsStore()
    const groupsStore = useGroupsStore()

    /**
     * Procedurally generate and seed all stores with mock data.
     */
    const seedAll = async () => {
        const { seederCount } = useDevSettings()
        const count = seederCount.value || 10

        // 1. Staff Users
        const systemRoles = ['Administrator', 'Front Desk', 'Billing', 'Housekeeping'] as const
        const staffCount = Math.max(12, Math.floor(count * 1.2))
        const generatedStaffUsers = Array.from({ length: staffCount }, (_, i) => ({
            id: i + 1,
            name: faker.person.fullName(),
            email: faker.internet.email(),
            password: 'password123',
            role: faker.helpers.arrayElement(systemRoles),
            isActive: true
        }))
        // Ensure at least one of each role exists so that login always works
        systemRoles.forEach((role, i) => {
            if (generatedStaffUsers[i]) {
                generatedStaffUsers[i].role = role
                generatedStaffUsers[i].password = `${role.toLowerCase().replace(/\s/g, '')}123`
            }
        })

        // 2. Guests
        const generatedGuests = Array.from({ length: count * 3 }, (_, i) => ({
            id: i + 1,
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            phone: faker.phone.number({ style: 'national' }),
            isVip: faker.datatype.boolean({ probability: 0.2 }),
            company: faker.datatype.boolean() ? faker.company.name() : null
        }))

        // 3. Rooms & Room Types
        const generatedRoomTypes = [
            { id: 1, name: 'Standard', baseRate: 2500, maxOccupancy: 2 },
            { id: 2, name: 'Deluxe', baseRate: 4200, maxOccupancy: 2 },
            { id: 3, name: 'Family', baseRate: 5800, maxOccupancy: 4 },
            { id: 4, name: 'Executive Suite', baseRate: 8500, maxOccupancy: 2 }
        ]
        const occupancyStatuses = ['Vacant', 'Occupied'] as const
        const cleanStatuses = ['Clean', 'Dirty', 'Pickup', 'Inspected'] as const
        const roomConditions = ['Normal', 'Maintenance'] as const

        const generatedRooms = Array.from({ length: count }, (_, i) => {
            const floor = Math.floor(i / 10) + 1
            const roomNum = String((i % 10) + 1).padStart(2, '0')
            return {
                id: i + 1,
                number: `${floor}${roomNum}`,
                floor: floor,
                roomTypeId: faker.number.int({ min: 1, max: 4 }),
                rateOverride: null,
                occupancyStatus: faker.helpers.arrayElement(occupancyStatuses),
                cleanStatus: faker.helpers.arrayElement(cleanStatuses),
                condition: 'Normal'
            }
        })

        // 4. Reservations
        const reservationStatuses = ['Pending', 'Confirmed', 'In-House', 'Done', 'Cancelled'] as const
        const bookingSources = ['Walk-in', 'Phone', 'OTA', 'Corporate'] as const
        const resCount = Math.max(1, Math.floor(count * 0.8)) // roughly 80% occupancy equivalent

        const generatedReservations = Array.from({ length: resCount }, (_, i) => {
            const guest = faker.helpers.arrayElement(generatedGuests)
            const room = faker.helpers.arrayElement(generatedRooms)
            return {
                id: i + 1,
                bookingRef: `PRS-100${i + 1}`,
                guests: [{ guestId: guest.id, isPrimary: true }],
                roomTypeId: room.roomTypeId,
                roomId: faker.datatype.boolean({ probability: 0.8 }) ? room.id : null,
                checkInDate: faker.date.recent({ days: 10 }).toISOString().split('T')[0],
                checkOutDate: faker.date.soon({ days: 10 }).toISOString().split('T')[0],
                status: faker.helpers.arrayElement(reservationStatuses),
                source: faker.helpers.arrayElement(bookingSources)
            }
        })

        // 5. Folios, Charges, Payments
        const folioStatuses = ['Open', 'Closed', 'Settled'] as const
        const chargeTypes = ['Room Charge', 'Mini Bar', 'Restaurant', 'Laundry', 'Misc'] as const
        const paymentMethods = ['Cash', 'Credit Card', 'Bank Transfer'] as const

        const generatedFolios: any[] = []
        const generatedCharges: any[] = []
        const generatedPayments: any[] = []

        let chargeId = 1
        let paymentId = 1

        generatedReservations.forEach((res, index) => {
            const folioId = index + 1
            const balance = faker.number.int({ min: 1000, max: 20000 })

            generatedFolios.push({
                id: folioId,
                folioNumber: `FOL-00${folioId}`,
                guestId: res.guests.find(g => g.isPrimary)?.guestId || 0,
                reservationId: res.id,
                status: faker.helpers.arrayElement(folioStatuses),
                balance,
                openedAt: faker.date.recent().toISOString()
            })

            const numCharges = faker.number.int({ min: 1, max: 5 })
            for (let c = 0; c < numCharges; c++) {
                const quantity = faker.number.int({ min: 1, max: 3 })
                const unitPrice = faker.number.int({ min: 200, max: 5000 })
                generatedCharges.push({
                    id: chargeId++,
                    folioId,
                    description: faker.commerce.productName(),
                    type: faker.helpers.arrayElement(chargeTypes),
                    unitPrice,
                    quantity,
                    total: quantity * unitPrice,
                    postedAt: faker.date.recent().toISOString()
                })
            }

            if (faker.datatype.boolean()) {
                generatedPayments.push({
                    id: paymentId++,
                    folioId,
                    amount: faker.number.int({ min: 1000, max: balance }),
                    method: faker.helpers.arrayElement(paymentMethods),
                    paymentDate: faker.date.recent().toISOString()
                })
            }
        })

        // 6. Housekeeping Tasks & Assignments
        const taskTypes = ['Cleaning', 'Turn-down', 'Maintenance'] as const
        const taskStatuses = ['Pending', 'In Progress', 'Completed'] as const
        const taskCount = Math.max(1, Math.floor(count * 0.6))
        const housekeepingStaff = generatedStaffUsers.filter(u => u.role === 'Housekeeping')

        const generatedTasks = Array.from({ length: taskCount }, (_, i) => {
            const room = faker.helpers.arrayElement(generatedRooms)
            const staff = faker.datatype.boolean() && housekeepingStaff.length > 0 ? faker.helpers.arrayElement(housekeepingStaff) : null
            const status = faker.helpers.arrayElement(taskStatuses)
            const taskType = faker.helpers.arrayElement(taskTypes)

            if (taskType === 'Maintenance' && status !== 'Completed') {
                room.condition = 'Maintenance'
                if (room.cleanStatus === 'Clean' || room.cleanStatus === 'Inspected') {
                    room.cleanStatus = 'Pickup'
                }
            }
            let notes: string | null = null
            if (taskType === 'Maintenance') {
                const issues = [
                    'Air conditioning not cooling',
                    'Leaking sink faucet',
                    'Broken lightbulb in bathroom',
                    'TV remote not working',
                    'Door lock sticking',
                    'Wi-Fi router needs reset',
                    'Shower drain clogged',
                    'Mini-fridge not turning on'
                ]
                notes = faker.helpers.arrayElement(issues)
            } else if (faker.datatype.boolean({ probability: 0.2 })) {
                const generalNotes = [
                    'Guest requested extra towels',
                    'Please replace bath amenities',
                    'Deep cleaning needed for carpet',
                    'Spill on the bedsheets'
                ]
                notes = faker.helpers.arrayElement(generalNotes)
            }

            return {
                id: i + 1,
                roomId: room.id,
                assignedTo: staff ? staff.id : null,
                taskType: taskType,
                status: status,
                notes: notes,
                createdAt: faker.date.recent().toISOString(),
                completedAt: status === 'Completed' ? faker.date.recent().toISOString() : null
            }
        })
        
        const areas = ['Lobby', 'Pool', 'Gym', 'Restaurant', 'Hallways', 'Parking', 'Elevators', 'Other'] as const
        const shifts = ['Morning', 'Afternoon', 'Night'] as const
        const assignmentCount = Math.max(1, Math.floor(count * 0.3))
        
        const generatedAssignments = Array.from({ length: assignmentCount }, (_, i) => {
            const staff = housekeepingStaff.length > 0 ? faker.helpers.arrayElement(housekeepingStaff) : faker.helpers.arrayElement(generatedStaffUsers)
            return {
                id: i + 1,
                userId: staff.id,
                area: faker.helpers.arrayElement(areas),
                shift: faker.helpers.arrayElement(shifts),
                date: faker.date.recent({ days: 3 }).toISOString().split('T')[0]
            }
        })

        // 7. Group Bookings & Room Blocks
        const groupCount = Math.max(1, Math.floor(count / 4))
        let blockId = 1
        const generatedGroups = Array.from({ length: groupCount }, (_, i) => {
            const guest = faker.helpers.arrayElement(generatedGuests)
            const checkInDate = faker.date.recent({ days: 5 })
            const checkOutDate = faker.date.soon({ days: 10, refDate: checkInDate })
            return {
                id: i + 1,
                groupName: `${faker.company.name()} Group`,
                contactGuestId: guest.id,
                contactPerson: `${guest.firstName} ${guest.lastName}`,
                contactNumber: guest.phone,
                totalGuests: faker.number.int({ min: 5, max: 30 }),
                checkInDate: checkInDate.toISOString().split('T')[0],
                checkOutDate: checkOutDate.toISOString().split('T')[0],
                status: faker.helpers.arrayElement(reservationStatuses)
            }
        })
        
        const generatedBlocks: any[] = []
        generatedGroups.forEach(group => {
            const numBlocks = faker.number.int({ min: 1, max: 5 })
            for (let b = 0; b < numBlocks; b++) {
                const room = faker.helpers.arrayElement(generatedRooms)
                generatedBlocks.push({
                    id: blockId++,
                    groupId: group.id,
                    roomId: room.id,
                    reservationId: null,
                    status: faker.helpers.arrayElement(['Blocked', 'Reserved', 'Released'])
                })
            }
        })

        // Apply generated data to Pinia stores
        usersStore.seed(generatedStaffUsers as any[])
        roomsStore.seed(generatedRooms as any[], generatedRoomTypes as any[])
        guestsStore.seed(generatedGuests as any[])
        reservationsStore.seed(generatedReservations as any[])
        foliosStore.seed(generatedFolios as any[], generatedCharges as any[], generatedPayments as any[])
        housekeepingStore.seed(generatedTasks as any[], generatedAssignments as any[])
        groupsStore.seed(generatedGroups as any[], generatedBlocks as any[])
    }

    const resetAll = async () => {
        clearUsers(true)
        usersStore.clear()
        roomsStore.clear()
        guestsStore.clear()
        reservationsStore.clear()
        foliosStore.clear()
        housekeepingStore.clear()
        settingsStore.clear()
        groupsStore.clear()
    }

    return {
        seedAll,
        resetAll
    }
}
