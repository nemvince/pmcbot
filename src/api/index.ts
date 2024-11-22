import express, { type Express } from 'express';
import { config } from '@/utils/config';
import router from './router';
import path from 'path';
import { fileURLToPath } from 'url';
import adze from 'adze';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const logger = new adze({ showTimestamp: true }).namespace('API').seal();

export class APIServer {
  private app: Express;

  constructor() {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(router());

    app.use('/static', express.static(path.join(__dirname, config.staticFilesPath)));

    this.app = app;
  }

  public start() {
    this.app.listen(config.server.port, () => {
      logger.info(`Listening on port ${config.server.port}`);
    });
  }
}

export const app = new APIServer();