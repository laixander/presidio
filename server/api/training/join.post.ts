import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { sessionId, role } = body

    if (!sessionId) {
        return { success: false, error: 'Session ID is required' }
    }

    // Just ensure the session set exists
    getSessionClients(sessionId)

    return { 
        success: true, 
        sessionId, 
        role,
        message: role === 'Teacher' ? 'Session created/joined as Teacher' : 'Joined session as Student'
    }
})
