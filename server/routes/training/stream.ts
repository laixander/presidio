import { defineEventHandler, getQuery } from 'h3'
import { getSessionClients } from '../../utils/trainingSessionStore'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const sessionId = query.sessionId as string

    if (!sessionId) {
        event.node.res.statusCode = 400
        return 'Missing sessionId'
    }

    // Set headers for SSE
    event.node.res.setHeader('Content-Type', 'text/event-stream')
    event.node.res.setHeader('Cache-Control', 'no-cache')
    event.node.res.setHeader('Connection', 'keep-alive')
    
    // Flush headers to establish connection
    event.node.res.flushHeaders()

    const clients = getSessionClients(sessionId)
    clients.add(event)

    // Handle client disconnect
    event.node.req.on('close', () => {
        clients.delete(event)
    })

    // Send an initial ping to establish connection
    event.node.res.write('data: {"type": "PING"}\n\n')

    // Keep the connection open
    return new Promise(() => {})
})
