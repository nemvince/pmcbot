interface Config {
  discord: {
    appId: string;
    botToken: string;
    guildId: string;
  },
  microsoft: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    tenantId: string;
    scopes: string;
  }
  server: {
    port: number;
    wsPort: number;
  }
  staticFilesPath: string;
}

// from .json
import configJson from '../../config.json';

export const config: Config = configJson;