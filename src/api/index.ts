import express, { type Express } from 'express';
import { config } from '@/utils/config';
import router from './router';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

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
      console.log(`API server listening on port ${config.server.port}`);
    });
  }
}

export const app = new APIServer();