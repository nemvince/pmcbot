import adze from "adze";
import { app } from "./api";
import { client } from "./discord";
import { wss } from "./wss";

const logger = new adze({ showTimestamp: true }).namespace("PMCBot").seal();

class PMCBot {
  private apiServer: typeof app;
  private discordBot: typeof client;

  constructor() {
    this.apiServer = app;
    this.discordBot = client;
  }

  public async start() {
    try {
      await this.discordBot.start();
      this.apiServer.start();
      wss.start();

      this.setupGracefulShutdown();
    } catch (error) {
      logger.error(error);
    }
  }

  private setupGracefulShutdown() {
    process.on("SIGINT", async () => {
      logger.warn("Shutting down...");
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      logger.warn("Shutting down...");
      process.exit(0);
    });
  }
}

const bot = new PMCBot();
bot.start();