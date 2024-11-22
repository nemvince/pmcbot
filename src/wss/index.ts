import WebSocket from 'ws';
import { config } from '@/utils/config';
import adze from 'adze';

export const logger = new adze({ showTimestamp: true }).namespace('WSS').seal();

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
    this.wss.on('connection', (ws) => {
      logger.log('Client connected');
      ws.on('message', (message) => {
        logger.log('Received message:', message);
      });
    });

    logger.info(`Listening on port ${config.server.wsPort}`);
  }
}

export const wss = new WSSServer();