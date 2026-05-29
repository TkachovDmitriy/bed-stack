import type { ServerWebSocket } from 'bun'

const connections = new Map<string, ServerWebSocket<unknown>>()

export const wsRegistry = {
  add(id: string, ws: ServerWebSocket<unknown>): void {
    connections.set(id, ws)
  },

  remove(id: string): void {
    connections.delete(id)
  },

  send(id: string, data: unknown): void {
    connections.get(id)?.send(JSON.stringify(data))
  },

  broadcast(data: unknown): void {
    const payload = JSON.stringify(data)
    for (const ws of connections.values()) {
      ws.send(payload)
    }
  },
}
