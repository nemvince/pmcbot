import express, { type Express } from 'express';
import { config } from '@/utils/config';
import router from './router';

export class APIServer {
  private app: Express;

  constructor() {
    this.app = express();
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    this.app.use(router());
  }

  public start() {
    this.app.listen(config.server.port, () => {
      console.log(`API server listening on port ${config.server.port}`);
    });
  }
}

export const app = new APIServer();