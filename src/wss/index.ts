import WebSocket from 'ws';

import { config } from '@/utils/config';

export class WSSServer {
  private wss: WebSocket.Server;

  constructor() {
    this.wss = new WebSocket.Server({ port: config.server.wsPort, path: '/ws' });
  }

  public sendMessage(message: string) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  public start() {
    console.log(`WebSocket server listening on port ${config.server.wsPort}`);
    this.wss.on('connection', (ws) => {
      ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
      });
    });
  }
}

export const wss = new WSSServer();