import type { H3Event } from 'h3'

export interface TrainingCommand {
    type: 'START' | 'PAUSE' | 'RESET' | 'SET_SPEED' | 'STEP' | 'EVENT' | 'HIGHLIGHT' | 'CLEAR_HIGHLIGHT' | 'SEED'
    payload?: any
}

// In-memory store of active training sessions
const sessions = new Map<string, Set<H3Event>>()

export const getSessionClients = (sessionId: string) => {
    if (!sessions.has(sessionId)) {
        sessions.set(sessionId, new Set())
    }
    return sessions.get(sessionId)!
}

export const broadcastToSession = (sessionId: string, command: TrainingCommand) => {
    const clients = sessions.get(sessionId)
    if (!clients) return

    const data = `data: ${JSON.stringify(command)}\n\n`
    for (const client of clients) {
        // Only write if connection is still open
        if (!client.node.res.writableEnded) {
            client.node.res.write(data)
        }
    }
}
