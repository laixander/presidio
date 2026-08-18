import { defineEventHandler, readBody } from 'h3'
import { broadcastToSession } from '../../utils/trainingSessionStore'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { sessionId, command } = body

    if (!sessionId || !command) {
        return { success: false, error: 'Session ID and command are required' }
    }

    broadcastToSession(sessionId, command)

    return { success: true }
})
